import logging
import os
import platform
import signal
import subprocess
from datetime import datetime

import yaml as pyyaml
from flask import (
    jsonify,
    request,
    send_file,
)
from flask_cors import cross_origin
from ruamel import yaml as yaml

from rasa_codeless.server.rasac_api import blueprint
from rasa_codeless.shared.constants import (
    DEFAULT_RASA_CONFIG_PATH,
    DEFAULT_MODEL_PATH,
    MODEL_EXTENSIONS,
    DEFAULT_TENSORBOARD_LOGDIR,
)
from rasa_codeless.shared.exceptions.server import (
    ModelTrainException,
    EpochsMismatchException,
)
from rasa_codeless.utils.io import (
    get_dir_file_list,
    get_latest_model_name,
    dir_cleanup,
)
from rasa_codeless.utils.tensorboard import TensorBoardResults
from rasa_codeless.shared.constants import (
    PROCESS_ID_NONE,
    FilePermission,
)
from rasa_codeless.shared.exceptions.botstore import MongoDBBotStoreUpdateException

from rasa_codeless.shared.exceptions.server import (
    ProcessAlreadyExistsException,
    ProcessNotExistsException,
    InvalidProcessIDException,
    ProcessTerminationException,
    InvalidRequestIDException,
)
from rasa_codeless.utils.mongodb_botstore import KolloqeMongoDBBotStore
from rasa_codeless.utils.training_queue import (
    TrainingQueue,
    kill_training_process_tree,
)

import statistics

logger = logging.getLogger()
yml = yaml.YAML()
yml.indent(mapping=2, sequence=4, offset=2)
training_q = TrainingQueue()
bot_store = KolloqeMongoDBBotStore()
tensorboard_results = TensorBoardResults()


@blueprint.route("/config/update", methods=['POST', 'GET'])
@cross_origin()
def config_update():
    if request.method == 'POST':
        logger.debug("Config Update API endpoint was called")
        request_id_for_exception_handling = None

        try:
            request_data = request.get_json()
            logger.debug(f"Config update endpoint received: {request_data}")

            request_id = request_data['request_id']
            request_id_for_exception_handling = request_id
            config_content = request_data['configs']

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
            with open(DEFAULT_RASA_CONFIG_PATH, FilePermission.OVERWRITE) as config_file:
                yml.dump(config_content, config_file)

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

            # grabbing return code
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

            file_list = get_dir_file_list(
                dir_path=DEFAULT_MODEL_PATH,
                file_suffixes=MODEL_EXTENSIONS
            )
            latest_model = get_latest_model_name()

            # inserting train and validation data into db
            train_accuracy, train_epochs = tensorboard_results.retrieve_training_results()
            validation_accuracy, validation_epochs = tensorboard_results.retrieve_validation_results()

            train_loss, train_loss_epochs = tensorboard_results.retrieve_training_loss_results()
            validation_loss, validation_loss_epochs = tensorboard_results.retrieve_validation_loss_results()

            if train_epochs != validation_epochs:
                raise EpochsMismatchException()

            if train_loss_epochs != validation_loss_epochs:
                raise EpochsMismatchException()

            number_of_epochs = tensorboard_results.generate_epoch_list(train_epochs)

            with open(file=DEFAULT_RASA_CONFIG_PATH) as config_yaml:
                parsed_yaml_file = pyyaml.load(config_yaml, Loader=pyyaml.FullLoader)

            # inspecting the parsed config.yml
            logger.debug(f"Config YAML: {parsed_yaml_file}, type={type(parsed_yaml_file)}")

            # update model tensorboard and config data
            bot_store.update_tensorboard_record(
                model_id=latest_model,
                epochs=number_of_epochs,
                train_accuracy=train_accuracy,
                validation_accuracy=validation_accuracy,
                train_loss=train_loss,
                validation_loss=validation_loss,
                upsert=True
            )
            bot_store.update_config_record(
                model_id=latest_model,
                config=parsed_yaml_file,
                upsert=True
            )

            return {
                       "Model List": file_list,
                       "Latest Model": latest_model
                   }, 200
        except ModelTrainException as e:
            # removing the inserted process from the training queue
            if request_id_for_exception_handling:
                training_q.remove(request_id=request_id_for_exception_handling)
            logger.exception(f"Exception occurred while training a new model under the "
                         f"request id {request_id_for_exception_handling}. {e}")
            return {"status": "error", "response": "model"}, 200
        except MongoDBBotStoreUpdateException as e:
            # removing the inserted process from the training queue
            if request_id_for_exception_handling:
                training_q.remove(request_id=request_id_for_exception_handling)
            logger.exception(f"Exception occurred while training a new model under the "
                         f"request id {request_id_for_exception_handling}. {e}")
            return {"status": "error", "response": "config"}, 200
        except Exception as e:
            # removing the inserted process from the training queue
            if request_id_for_exception_handling:
                training_q.remove(request_id=request_id_for_exception_handling)
            logger.exception(f"Exception occurred while training a new model under the "
                         f"request id {request_id_for_exception_handling}. {e}")
            return {"status": "error", "response": "unknown"}, 200
    else:
        try:
            file_list = get_dir_file_list()
            latest_model = get_latest_model_name()

            # initialising array to insert objects with model name, train and test accuracy
            models_with_accuracy = []

            # get curve data of all the models
            all_model_curve_data = bot_store.get_all_model_curve_data(bson_output=True)

            # append model name, last train and test datapoint to initialised array
            for element in all_model_curve_data:

                # checking whether the model exists in the local folder
                exist_count = file_list.count(element["model_id"])

                # if file exists in local folder remove it from the list (since it has been added to the array already)
                if exist_count > 0:
                    models_with_accuracy.append([{
                        "model_id": element["model_id"],
                        "test_acc": element["test"][-1],
                        "train_acc": element["train"][-1]
                    }])

                    model_index = file_list.index(element["model_id"])
                    file_list.pop(model_index)

            # append to the array the models that are in the local folder but does not have data-points saved in the db
            while file_list:
                models_with_accuracy.append([{
                    "model_id": file_list.pop(0),
                    "test_acc": "",
                    "train_acc": ""
                }])

            # sort the models by datetime
            sorted_models_with_accuracy = sorted(
                models_with_accuracy,
                key=lambda x: datetime.strptime(x[0]['model_id'], '%Y%m%d-%H%M%S.tar.gz'), reverse=True
            )

            return {
                       "Model List": sorted_models_with_accuracy,
                       "Latest Model": latest_model
                   }, 200
        except Exception as e:
            logger.exception(f"Exception occurred while retrieving the list of models. {e}")
            return {"status": "error"}, 200


@blueprint.route("/config/abort", methods=['POST'])
@cross_origin()
def abort_train():
    if request.method == 'POST':
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

            file_list = get_dir_file_list()
            latest_model = get_latest_model_name()
            return {"Model List": file_list, "Latest Model": latest_model}, 200

        except InvalidProcessIDException as e:
            logger.exception(f"Invalid process ID received. {e}")
            return {"status": "error"}, 200
        except ProcessTerminationException as e:
            logger.exception(f"Process termination error. {e}")
            return {"status": "error"}, 200
        except Exception as e:
            logger.exception(f"Unknown process termination exception {e}")
            return {"status": "error"}, 200


@blueprint.route("/model/curve/<model>", methods=['POST'])
@cross_origin()
def get_curve_data_points(model):
    if request.method == 'POST':
        try:
            model_curve_data = bot_store.get_model_curve_data(model_id=model, bson_output=True)
            return {"Model Curve Data Points": model_curve_data}, 200
        except Exception as e:
            logger.exception(f"Exception occurred while retrieving model curve data. {e}")
            return {"status": "error"}, 200


@blueprint.route("/model/config/<model>", methods=['POST'])
@cross_origin()
def get_model_config(model):
    if request.method == 'POST':
        try:
            model_config_data = bot_store.get_model_config_data(model_id=model, bson_output=True)
            return {"Model Config": model_config_data}, 200
        except Exception as e:
            logger.exception(f"Exception occurred while retrieving model config data. {e}")
            return jsonify({"status": "error"}), 200


@blueprint.route("/model/all", methods=['GET'])
@cross_origin()
def get_model_all():
    if request.method == 'GET':
        try:
            all_config_data = bot_store.get_all_model_config_data(bson_output=True)
            return {"Models": all_config_data}, 200
        except Exception as e:
            logger.exception(f"Exception occurred while retrieving all config data. {e}")
            return {"status": "error"}, 200


@blueprint.route("/intent/stats", methods=['GET'])
@cross_origin()
def get_intent_count():
    if request.method == 'GET':
        try:

            print('BEFORE COUNT')
            count = 0

            temp_dict = {}
            final_dict = {}

            for file in os.listdir('../kolloqe_bot/data/nlu/'):
                file_path = os.path.join('../kolloqe_bot/data/nlu/', file)

                print(file)

                with open(file_path, 'r', encoding="utf8") as stream:
                    try:
                        loaded_yml = yaml.safe_load(stream)

                        if loaded_yml is not None:
                            for key, value in loaded_yml.items():
                                if key == 'nlu':
                                    for val in value:
                                        # print(val["intent"])
                                        # print(val["examples"])
                                        # print(val["examples"].count('- '))
                                        temp_dict[val["intent"]]=val["examples"].count('- ')

                            final_dict.update(temp_dict)

                        else:
                            print('variable is None')

                    except yaml.YAMLError as exc:
                        print(exc)

                # a_yaml_file = open(file_path, encoding="utf8")
                # parsed_yaml_file = pyyaml.load(a_yaml_file, Loader=pyyaml.FullLoader)

                # print(parsed_yaml_file)
                count += 1
            print('NO OF FILES IN NLU')
            print(count)
            print('FINAL DICT')
            print(final_dict)

            mean = statistics.mean(final_dict.values())
            print('MEAN VAL : ', round(mean))

            max_key = max(final_dict, key=final_dict.get)
            print("Maximum Key:", max_key, " | Max Value : ", final_dict[max_key])

            min_key = min(final_dict, key=final_dict.get)
            print("Minimum Key:", min_key, " | Min Value : ", final_dict[min_key])

            return {
                       "Min Key": min_key,
                       "Min Value": final_dict[min_key],
                       "Max Key": max_key,
                       "Max Value": final_dict[max_key],
                       "Mean": round(mean),
                       "Intent Stats": final_dict,
                       "Intent Len": len(final_dict.keys())
                   }, 200
        except Exception as e:
            print('EXCEPTION OCCURED')
            logger.exception(f"Exception occurred while retrieving all config data. {e}")
            return {"status": "error"}, 200


@blueprint.route("/model/<name>", methods=['DELETE'])
@cross_origin()
def delete_model(name):
    if request.method == 'DELETE':
        try:
            try:
                os.remove(f"./models/{name}")
            except Exception as e:
                logger.exception(f"Exception occurred while deleting model {name}. {e}.")

            file_list = get_dir_file_list()
            logger.debug(f"Retrieved models: {file_list}")

            latest_model = get_latest_model_name()
            logger.debug(f"Latest model found: {latest_model}")

            # initialising array to insert objects with model name, train and test accuracy
            models_with_accuracy = []

            # get curve data of all the models
            all_model_curve_data = bot_store.get_all_model_curve_data(bson_output=True)

            # append model name, last train and test datapoint to initialised array
            for element in all_model_curve_data:

                # checking whether the model exists in the local folder
                exist_count = file_list.count(element["model_id"])

                # if file exists in local folder remove it from the list (since it has been added to the array already)
                if exist_count > 0:
                    models_with_accuracy.append([{
                        "model_id": element["model_id"],
                        "test_acc": element["test"][-1],
                        "train_acc": element["train"][-1]
                    }])

                    model_index = file_list.index(element["model_id"])
                    file_list.pop(model_index)

            # append to the array the models that are in the local folder but does not have data-points saved in the db
            while file_list:
                models_with_accuracy.append([{
                    "model_id": file_list.pop(0),
                    "test_acc": "",
                    "train_acc": ""
                }])

            # sort the models by datetime
            sorted_models_with_accuracy = sorted(
                models_with_accuracy,
                key=lambda x: datetime.strptime(x[0]['model_id'], '%Y%m%d-%H%M%S.tar.gz'), reverse=True
            )

            return {
                       "Model List": sorted_models_with_accuracy,
                       "Latest Model": latest_model
                   }, 200
        except Exception as e:
            logger.exception(f"Exception occurred while deleting the specified model. {e}")
            return {"status": "error"}, 200


@blueprint.route('/download/<name>', methods=['GET'])
@cross_origin()
def download_file(name):
    try:
        path_ = f"models/{name}"
        return send_file(path_, as_attachment=True)
    except Exception as e:
        logger.exception(f"Exception occurred while attempting to download the specified model. {e}")
        return {"status": "error"}, 200


# @blueprint.route("/intent", methods=['POST'])
# @cross_origin()
# def intent_insert():
#     if request.method == 'POST':
#         try:
#             academic_performance_yaml_file = open(PATH_PERFORMANCE_YML, encoding="utf8")
#             context_based_yaml_file = open(PATH_CONTEXT_BASED_YML, encoding="utf8")
#             degrees_yaml_file = open(PATH_DEGREE_YML, encoding="utf8")
#             exams_yaml_file = open(PATH_EXAMS_YML, encoding="utf8")
#             general_yaml_file = open(PATH_GENERAL_YML, encoding="utf8")
#             internships_yaml_file = open(PATH_INTERNSHIPS_YML, encoding="utf8")
#             issues_yaml_file = open(PATH_ISSUES_YML, encoding="utf8")
#             modules_yaml_file = open(PATH_MODULES_YML, encoding="utf8")
#             nlu_yaml_file = open(PATH_NLU_YML, encoding="utf8")
#             out_of_scope_yaml_file = open(PATH_OUT_OF_SCOPE_YML, encoding="utf8")
#             research_yaml_file = open(PATH_RESEARCH_YML, encoding="utf8")
#             support_yaml_file = open(PATH_SUPPORT_YML, encoding="utf8")
#
#             parsed_academic_performance_yaml_file = pyyaml.load(academic_performance_yaml_file,
#                                                                 Loader=pyyaml.FullLoader)
#             parsed_context_based_yaml_file = pyyaml.load(context_based_yaml_file, Loader=pyyaml.FullLoader)
#             parsed_degrees_yaml_file = pyyaml.load(degrees_yaml_file, Loader=pyyaml.FullLoader)
#             parsed_exams_yaml_file = pyyaml.load(exams_yaml_file, Loader=pyyaml.FullLoader)
#             parsed_general_yaml_file = pyyaml.load(general_yaml_file, Loader=pyyaml.FullLoader)
#             parsed_internships_yaml_file = pyyaml.load(internships_yaml_file, Loader=pyyaml.FullLoader)
#             parsed_issues_yaml_file = pyyaml.load(issues_yaml_file, Loader=pyyaml.FullLoader)
#             parsed_modules_yaml_file = pyyaml.load(modules_yaml_file, Loader=pyyaml.FullLoader)
#             parsed_nlu_yaml_file = pyyaml.load(nlu_yaml_file, Loader=pyyaml.FullLoader)
#             parsed_out_of_scope_yaml_file = pyyaml.load(out_of_scope_yaml_file, Loader=pyyaml.FullLoader)
#             parsed_research_yaml_file = pyyaml.load(research_yaml_file, Loader=pyyaml.FullLoader)
#             parsed_support_yaml_file = pyyaml.load(support_yaml_file, Loader=pyyaml.FullLoader)
#
#             # cur = col.find({'model_id': latestModel})
#             # results = list(cur)
#
#             # Checking the cursor is empty or not
#             # if len(results) == 0:
#             try:
#                 res1 = col_intent.insert_one({
#                     'intent_file': "academic_performance",
#                     'intents': parsed_academic_performance_yaml_file
#                 })
#                 res2 = col_intent.insert_one({
#                     'intent_file': "context_based",
#                     'intents': parsed_context_based_yaml_file
#                 })
#                 res3 = col_intent.insert_one({
#                     'intent_file': "degrees",
#                     'intents': parsed_degrees_yaml_file
#                 })
#                 res4 = col_intent.insert_one({
#                     'intent_file': "exams",
#                     'intents': parsed_exams_yaml_file
#                 })
#                 res5 = col_intent.insert_one({
#                     'intent_file': "general",
#                     'intents': parsed_general_yaml_file
#                 })
#                 res6 = col_intent.insert_one({
#                     'intent_file': "internships",
#                     'intents': parsed_internships_yaml_file
#                 })
#                 res7 = col_intent.insert_one({
#                     'intent_file': "issues",
#                     'intents': parsed_issues_yaml_file
#                 })
#                 res8 = col_intent.insert_one({
#                     'intent_file': "modules",
#                     'intents': parsed_modules_yaml_file
#                 })
#                 res9 = col_intent.insert_one({
#                     'intent_file': "nlu",
#                     'intents': parsed_nlu_yaml_file
#                 })
#                 res10 = col_intent.insert_one({
#                     'intent_file': "out_of_scope",
#                     'intents': parsed_out_of_scope_yaml_file
#                 })
#                 res11 = col_intent.insert_one({
#                     'intent_file': "research",
#                     'intents': parsed_research_yaml_file
#                 })
#                 res12 = col_intent.insert_one({
#                     'intent_file': "support",
#                     'intents': parsed_support_yaml_file
#                 })
#
#             except Exception as e:
#                 print("ERROR OCCURRED WHILE INSERTING DATA TO DB")
#                 print(e)
#                 return jsonify({"status": "error"})
#             # else:
#             #     print("Cursor is Not Empty")
#             #     print("Do Stuff Here")
#
#             return jsonify({"Intents added successfully"})
#         except Exception as e:
#             print("ERROR OCCURED INSERTING DATA")
#             print(e)
#             return jsonify({"status": "error"})


# @blueprint.route("/intent", methods=['GET'])
# @cross_origin()
# def get_intents():
#     if request.method == 'GET':
#         try:
#             cur = col_intent.find()
#             return jsonify({"Intents": dumps(cur)})
#         except Exception as e:
#             return jsonify({"status": "error"})
