import logging
import os
import platform
import signal
import subprocess
from datetime import datetime

from flask import (
    request,
    send_file,
)
from flask_cors import cross_origin
from ruamel import yaml as yaml

from rasa_codeless.core.botstore.local_botstore import LocalBotStore
from rasa_codeless.core.training_queue import (
    TrainingQueue,
    kill_training_process_tree,
)
from rasa_codeless.server.rasac_api import blueprint
from rasa_codeless.shared.constants import (
    DEFAULT_RASA_CONFIG_PATH,
    DEFAULT_MODEL_PATH,
    DEFAULT_TENSORBOARD_LOGDIR,
    DEFAULT_DATA_PATH,
    TRAINING_QUEUE,
)
from rasa_codeless.shared.constants import (
    PROCESS_ID_NONE,
    FilePermission,
)
from rasa_codeless.shared.exceptions.server import (
    ModelTrainException,
)
from rasa_codeless.shared.exceptions.server import (
    ProcessAlreadyExistsException,
    ProcessNotExistsException,
    InvalidProcessIDException,
    ProcessTerminationException,
    InvalidRequestIDException,
)
from rasa_codeless.shared.nlu.nlu_data import NLUData
from rasa_codeless.utils.io import (
    dir_cleanup,
    dir_exists,
    create_dir,
    write_yaml_file,
    get_latest_model_name,
)

logger = logging.getLogger()
yml = yaml.YAML()
yml.indent(mapping=2, sequence=4, offset=2)
training_q = TrainingQueue(data_source_path=TRAINING_QUEUE)
botstore = LocalBotStore()


@blueprint.route("/bot/train", methods=['POST'])
@cross_origin()
def train_model():
    logger.debug("Config Update API endpoint was called")
    request_id_for_exception_handling = None

    try:
        request_data = request.get_json()
        logger.debug(f"Config update endpoint received: {request_data}")

        request_id = request_data['request_id']
        request_id_for_exception_handling = request_id
        config_content = request_data['configs']
        testing_status = request_data['testing_status'] \
            if 'testing_status' in request_data else True

        # create tensorboard logdir if not available
        # when testing status is set to true
        if testing_status and not dir_exists(DEFAULT_TENSORBOARD_LOGDIR):
            create_dir(DEFAULT_TENSORBOARD_LOGDIR)

        # clearing botstore cache
        botstore.clear_cache()

        # checking if request id is already
        # present in the process queue
        process_exists = training_q.check_existence(request_id=request_id)
        if process_exists:
            logger.exception("Model training request already exists in the Training Queue")
            raise ProcessAlreadyExistsException()

        training_q.push(
            process_id=PROCESS_ID_NONE,
            request_id=request_id,
            timestamp=datetime.now().timestamp(),
            metadata="",
        )
        logger.debug(f"Pushed training request {request_id} to training queue")

        # clean up 'tensorboard' dir
        dir_cleanup(DEFAULT_TENSORBOARD_LOGDIR)

        # overwriting the config.yml file with the
        # new pipeline and policy configurations
        write_yaml_file(
            yaml_file=DEFAULT_RASA_CONFIG_PATH,
            yaml_content=config_content,
            mode=FilePermission.WRITE_PLUS
        )

        # creating the training process
        if platform.system() == "Windows":
            sub_p = subprocess.Popen(
                "rasa train",
                shell=True,
                stderr=subprocess.PIPE,
                stdout=subprocess.PIPE,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
            )
        else:
            sub_p = subprocess.Popen(
                "rasa train",
                shell=True,
                stderr=subprocess.PIPE,
                stdout=subprocess.PIPE,
                preexec_fn=os.setsid
            )

        # saving request and process id to process queue
        process_id = sub_p.pid
        training_q.update_pid(
            process_id=process_id,
            request_id=request_id,
            timestamp=datetime.now().timestamp()
        )
        logger.debug(f"Updated training queue of {request_id} with process id {process_id}")

        # grabbing return code from the subprocess
        out, err = sub_p.communicate()
        out, err = out.decode("utf-8"), err.decode("utf-8")
        return_code = sub_p.returncode
        logger.debug(f"Stdout: {out} \nStderr: {err} \nReturn Code: {return_code}")

        if return_code != 0:
            raise ModelTrainException(
                "Training was cancelled during execution. Please "
                "check if the virtual environment is functioning."
            )

        # removing from process queue after process is executed
        training_q.remove(request_id=request_id)
        logger.debug(f"Process {process_id} under request id "
                     f"{request_id} was removed from training queue")

        # retrieving the latest model
        latest_model = get_latest_model_name(models_path=DEFAULT_MODEL_PATH)

        # persisting the model files
        botstore.persist_model(model_name=latest_model)

        return {
                   "model_list": botstore.model_performance(curve=False, sort=True),
                   "latest_model": latest_model
               }, 200
    except ModelTrainException as e:
        # removing the inserted process from the training queue
        if request_id_for_exception_handling:
            training_q.remove(request_id=request_id_for_exception_handling)

        logger.exception(f"Exception occurred while training a new model under the "
                         f"request id {request_id_for_exception_handling}. {e}")
        return {
                   "status": "error",
                   "response": "model"
               }, 200
    except Exception as e:
        # removing the inserted process from the training queue
        if request_id_for_exception_handling:
            training_q.remove(request_id=request_id_for_exception_handling)

        logger.exception(f"Exception occurred while training a new model under the "
                         f"request id {request_id_for_exception_handling}. {e}")
        return {
                   "status": "error",
                   "response": "unknown"
               }, 200


@blueprint.route("/bot/abort", methods=['POST'])
@cross_origin()
def abort_train():
    logger.debug("Training process abort API endpoint was called")
    try:
        request_data = request.get_json()
        request_id = request_data["request_id"]

        if not request_id:
            raise InvalidRequestIDException()

        # check process existence
        training_process_exists = training_q.check_existence(request_id=request_id)
        if not training_process_exists:
            logger.exception("Removing non-existing training processes is not allowed")
            raise ProcessNotExistsException()

        # retrieving process_id
        training_process_id = training_q.get_pid(request_id=request_id)
        logger.debug(f"Confirmed the existence of the process {training_process_id} "
                     f"with the request id: {request_id}")

        if platform.system() == "Windows":
            kill_training_process_tree(int(training_process_id))
        else:
            os.killpg(os.getpgid(int(training_process_id)), signal.SIGTERM)
        logger.debug(f"Removed the existing process {training_process_id} with the request id: {request_id}")

        # updating the training queue
        training_q.remove(request_id=request_id)
        logger.debug(f"Removed process from training queue. [process id: "
                     f"{training_process_id}, request id: {request_id}]")

        # clearing cached botstore models
        botstore.clear_cache()

        return {
                   "model_list": botstore.model_performance(curve=False, sort=True),
                   "latest_model": botstore.get_models(latest_only=True)
               }, 200

    except InvalidProcessIDException as e:
        logger.exception(f"Invalid process ID received. {e}")
        return {"status": "error"}, 200
    except ProcessTerminationException as e:
        logger.exception(f"Process termination error. {e}")
        return {"status": "error"}, 200
    except Exception as e:
        logger.exception(f"Unknown process termination exception {e}")
        return {"status": "error"}, 200


@blueprint.route("/botstore/models", methods=['GET'])
@cross_origin()
def botstore_models():
    try:
        return {
                   "model_list": botstore.model_performance(curve=False, sort=True),
                   "latest_model": botstore.get_models(latest_only=True)
               }, 200
    except Exception as e:
        logger.exception(f"Exception occurred while retrieving the list of models. {e}")
        return {"status": "error"}, 200


@blueprint.route("/botstore/curve/<model>", methods=['POST'])
@cross_origin()
def botstore_curves(model):
    try:
        return {
                   "curve_data": botstore.model_performance(model_name=model, curve=True)
               }, 200
    except Exception as e:
        logger.exception(f"Exception occurred while retrieving model curve data. {e}")
        return {"status": "error"}, 200


@blueprint.route("/botstore/config/<model>", methods=['POST'])
@cross_origin()
def botstore_configs(model):
    if request.method == 'POST':
        try:
            return {
                       "model_config": botstore.model_config(model_name=model)
                   }, 200
        except Exception as e:
            logger.exception(f"Exception occurred while retrieving model config data. {e}")
            return {"status": "error"}, 200


@blueprint.route("/botstore/models/<model>", methods=['GET', 'DELETE'])
@cross_origin()
def delete_model(model):
    if request.method == 'GET':
        try:
            return send_file(botstore.get_model_path(model_name=model), as_attachment=True)
        except Exception as e:
            logger.exception(f"Exception occurred while attempting to download the specified model. {e}")
            return {"status": "error"}, 200
    if request.method == 'DELETE':
        try:
            try:
                # delete model
                botstore.delete_model(model_name=model)

                # clean botstore cached model data
                botstore.clear_cache()

            except Exception as e:
                logger.exception(f"Exception occurred while deleting model {model}. {e}.")

            return {
                       "model_list": botstore.model_performance(curve=False, sort=True),
                       "latest_model": botstore.get_models(latest_only=True)
                   }, 200
        except Exception as e:
            logger.exception(f"Exception occurred while deleting the specified model. {e}")
            return {"status": "error"}, 200


@blueprint.route("/botstore/nlu", methods=['GET'])
@cross_origin()
def get_data():
    try:
        nlu_data = NLUData(testing_data_dir=DEFAULT_DATA_PATH, from_rasa=True)
        return {"nlu_data": nlu_data.get_testing_data()}, 200
    except Exception as e:
        logger.exception(f"Exception occurred while retrieving nlu data. {e}")
        return {"status": "error"}, 200
