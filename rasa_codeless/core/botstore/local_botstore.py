import logging
import os
import re
import shutil
from datetime import datetime
from typing import Text, List, NoReturn, Dict, Union, Optional

import yaml as pyyaml

from rasa_codeless.shared.constants import (
    BOTSTORE_PATH,
    DEFAULT_MODEL_PATH,
    DEFAULT_TENSORBOARD_LOGDIR,
    RASA_MODEL_EXTENSIONS,
    RASA_MODEL_TIMESTAMP_PATTERN,
    DEFAULT_RASA_CONFIG_PATH,
)
from rasa_codeless.shared.exceptions.botstore import (
    BotStoreRetrieveException,
    BotStorePersistException,
    BotStoreCacheException,
    BotStoreCleanupException,
)
from rasa_codeless.shared.exceptions.core import InvalidModelException
from rasa_codeless.shared.exceptions.io import TensorboardScalarsException
from rasa_codeless.utils.io import (
    persist_model_data,
    get_valid_model_list,
    get_latest_model_name,
    get_existing_toplevel_file_list,
)
from rasa_codeless.utils.tensorboard import TensorBoardResults
from rasa_codeless.core.curve_explainer import CurveExplainer

logger = logging.getLogger(__name__)


class LocalBotStore:
    def __init__(
            self,
            botstore_path: Text = BOTSTORE_PATH,
            models_path: Text = DEFAULT_MODEL_PATH,
            logdir: Text = DEFAULT_TENSORBOARD_LOGDIR,
    ):
        self.botstore_path = botstore_path
        self.models_path = models_path
        self.logdir = logdir
        self.tensorboard_results = TensorBoardResults(logdir=logdir)
        self.curve_explainer = CurveExplainer()

    def get_models(self, latest_only: bool = False) -> Union[List, Text]:
        try:
            valid_models = get_valid_model_list(
                botstore_path=self.botstore_path,
                models_path=self.models_path
            )
            if latest_only:
                return get_latest_model_name(models_path=valid_models)
            else:
                return valid_models
        except Exception as e:
            logger.error("Exception occurred while retrieving botstore models")
            raise BotStoreRetrieveException(e)

    def persist_model(self, model_name: Text, assets: Dict = None) -> NoReturn:
        try:
            persist_model_data(
                model_name=model_name,
                botstore_path=self.botstore_path,
                assets=assets if assets else dict()
            )
        except Exception as e:
            logger.error("Exception occurred while retrieving botstore models")
            raise BotStorePersistException(e)

    def clear_cache(self) -> NoReturn:
        try:
            all_botstore_models = [
                model + RASA_MODEL_EXTENSIONS[0]
                for model in get_existing_toplevel_file_list(dir_path=self.botstore_path)
            ]
            valid_models = get_valid_model_list(
                botstore_path=self.botstore_path,
                models_path=self.models_path
            )
            invalid_model_caches = [
                re.sub(RASA_MODEL_EXTENSIONS[0], "", dir_)
                for dir_
                in list(set(all_botstore_models).difference(set(valid_models)))
            ]
            logger.debug(f"Invalid model caches found: {invalid_model_caches}")
            for cache_dir in invalid_model_caches:
                shutil.rmtree(os.path.join(self.botstore_path, cache_dir))
                logger.debug(f"Deleted invalid model cache {cache_dir}")
        except Exception as e:
            logger.error("Exception occurred while clearing botstore cache")
            raise BotStoreCacheException(e)

    def delete_model(self, model_name: Text) -> NoReturn:
        try:
            os.remove(path=os.path.join(self.models_path, model_name))
        except Exception as e:
            raise BotStoreCleanupException(e)

    def get_model_path(self, model_name: Text) -> NoReturn:
        return os.path.join(os.getcwd(), self.models_path, f"{model_name}")

    def deploy_model(self) -> NoReturn:
        raise NotImplementedError("deploy_model is not implemented")

    def model_exists(self, model_name: Text) -> bool:
        valid_models = self.get_models()
        if model_name in valid_models:
            return True
        else:
            return False

    @staticmethod
    def _sort_model_scores(scores: List) -> List:
        return sorted(
            scores,
            key=lambda x: datetime.strptime(x['model_id'], RASA_MODEL_TIMESTAMP_PATTERN), reverse=True
        )

    def _model_scores_dict(self, botstore_model: Text, curve: bool) -> Union[Dict, List]:
        try:
            test_acc = self.tensorboard_results.validation_acc(
                botstore_model=os.path.join(self.botstore_path, botstore_model)
            )[0]
            train_acc = self.tensorboard_results.training_acc(
                botstore_model=os.path.join(self.botstore_path, botstore_model)
            )[0]
            test_loss = self.tensorboard_results.validation_loss(
                botstore_model=os.path.join(self.botstore_path, botstore_model)
            )[0]
            train_loss = self.tensorboard_results.training_loss(
                botstore_model=os.path.join(self.botstore_path, botstore_model)
            )[0]
            epochs = self.tensorboard_results.generate_epoch_list(
                total_epochs=self.tensorboard_results.training_loss(
                    botstore_model=os.path.join(self.botstore_path, botstore_model)
                )[1]
            )

            if curve:
                return {
                    "model_id": botstore_model,
                    "test_acc": test_acc,
                    "train_acc": train_acc,
                    "test_loss": test_loss,
                    "train_loss": train_loss,
                    "epochs": epochs,
                }
            else:
                return {
                    "model_id": botstore_model,
                    "test_acc": test_acc[-1],
                    "train_acc": train_acc[-1],
                    "test_loss": test_loss[-1],
                    "train_loss": train_loss[-1],
                    "epochs": epochs
                }
        except TensorboardScalarsException:
            if curve:
                return {
                    "model_id": botstore_model,
                    "test_acc": "",
                    "train_acc": "",
                    "test_loss": "",
                    "train_loss": "",
                    "epochs": "",
                    "curve_insights": "",
                }
            else:
                return {
                    "model_id": botstore_model,
                    "test_acc": "",
                    "train_acc": "",
                    "test_loss": "",
                    "train_loss": "",
                    "epochs": "",
                }

    def model_performance(
            self,
            model_name: Union[Text, List] = None,
            curve: bool = True,
            sort: bool = False,
    ) -> Union[Dict, List]:
        try:
            valid_models = self.get_models()

            if isinstance(model_name, Text):
                if model_name not in valid_models:
                    raise InvalidModelException()

                return self._model_scores_dict(botstore_model=model_name, curve=curve)

            elif isinstance(model_name, List):
                model_score_list = list()
                for model in model_name:
                    if model not in valid_models:
                        raise InvalidModelException()

                    model_score_list.append(self._model_scores_dict(botstore_model=model, curve=curve))
                return model_score_list if not sort else self._sort_model_scores(model_score_list)
            else:
                all_model_score_list = list()
                for model in valid_models:
                    all_model_score_list.append(self._model_scores_dict(botstore_model=model, curve=curve))
                return all_model_score_list if not sort else self._sort_model_scores(all_model_score_list)
        except Exception as e:
            logger.error("Exception occurred while retrieving model scores")
            raise BotStoreRetrieveException(e)

    def _model_config_dict(self, botstore_model: Text) -> Union[Dict, List]:
        try:
            with open(
                    file=os.path.join(
                        self.botstore_path,
                        botstore_model.replace(RASA_MODEL_EXTENSIONS[0], ""),
                        DEFAULT_RASA_CONFIG_PATH
                    )
            ) as config_yaml:
                parsed_yaml_file = pyyaml.load(config_yaml, Loader=pyyaml.FullLoader)
            return parsed_yaml_file
        except Exception as e:
            logger.error("Exception occurred while retrieving model configs")
            raise BotStoreRetrieveException(e)

    def model_config(
            self,
            model_name: Union[Text, List] = None
    ) -> Optional[Dict]:
        try:
            valid_models = self.get_models()

            if isinstance(model_name, Text):
                if model_name not in valid_models:
                    raise InvalidModelException()

                return {
                    "config": self._model_config_dict(botstore_model=model_name)
                }
            else:
                raise NotImplementedError("model_config for list of models is not implemented")
        except Exception as e:
            logger.error("Exception occurred while retrieving model scores")
            raise BotStoreRetrieveException(e)
