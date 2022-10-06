import logging
import os
from typing import Text, List, NoReturn

from bson import json_util
import pymongo

from rasa_codeless.shared.constants import (
    MODEL_ID_TAG,
    EPOCHS_TAG,
    TRAIN_ACCURACY_TAG,
    VALIDATION_ACCURACY_TAG,
    TRAIN_LOSS_TAG,
    VALIDATION_LOSS_TAG,
    CONFIG_TAG,
)
from rasa_codeless.shared.exceptions.botstore import (
    MongoDBBotStoreCredentialsException,
    MongoDBBotStoreCollectionException,
    MongoDBBotStoreInsertException,
    MongoDBBotStoreUpdateException,
    MongoDBBotSoreReadException,
)

logger = logging.getLogger(__name__)


class MongoDBBotStore:
    def __init__(self):
        try:
            self.cluster_url = f"mongodb+srv://{os.environ.get('MONGODB_USERNAME')}:" \
                               f"{os.environ.get('MONGODB_PASSWORD')}@sandbox.up5hn." \
                               f"mongodb.net/{os.environ.get('MONGODB_BOTSTORE_INSTANCE')}"

            self.instance = os.environ.get('MONGODB_BOTSTORE_INSTANCE')
            self.tensorboard_collection = os.environ.get('MONGODB_COLLECTION_TENSORBOARD')
            self.configuration_collection = os.environ.get('MONGODB_COLLECTION_CONFIGURATION')
            self.intent_collection = os.environ.get('MONGODB_COLLECTION_INTENT')
            self.process_collection = os.environ.get('MONGODB_COLLECTION_PROCESS')

        except Exception as e:
            logger.error(f'Could not retrieve mongoDB credentials. {e}')
            raise MongoDBBotStoreCredentialsException(e)

    def get_collection(self, collection: Text) -> pymongo.collection.Collection:
        try:
            client = pymongo.MongoClient(self.cluster_url, maxPoolSize=50, connect=False)
            db = pymongo.database.Database(client, self.instance)
            coll = pymongo.collection.Collection(db, collection)
            return coll
        except Exception as e:
            logger.error("Exception occurred while obtaining the BotStore collection")
            raise MongoDBBotStoreCollectionException(e)

    def check_model_existence(self, model_name: Text) -> bool:
        collection = self.get_collection(self.configuration_collection)
        cur = collection.find({MODEL_ID_TAG: model_name})
        list_cur = list(cur)
        if len(list_cur) == 0:
            return False
        else:
            return True

    def insert_tensorboard_record(
            self,
            model_id: Text,
            epochs: int,
            train_accuracy: List,
            validation_accuracy: List
    ) -> NoReturn:
        try:
            collection = self.get_collection(self.tensorboard_collection)
            collection.insert_one(
                {
                    'model_id': model_id,
                    'epochs': epochs,
                    'train': train_accuracy,
                    'test': validation_accuracy
                })
        except Exception as e:
            logger.error(f"Exception occurred while pushing tensorboard record to BotStore. {e}")
            raise MongoDBBotStoreInsertException()

    def insert_config_record(
            self,
            model_id: Text,
            config: int,
    ) -> NoReturn:
        try:
            collection = self.get_collection(self.configuration_collection)
            collection.insert_one(
                {
                    'model_id': model_id,
                    'config': config,
                })
        except Exception as e:
            logger.error(f"Exception occurred while pushing configuration record to BotStore. {e}")
            raise MongoDBBotStoreInsertException()

    def update_tensorboard_record(
            self,
            model_id: Text,
            epochs: int,
            train_accuracy: List,
            validation_accuracy: List,
            train_loss: List,
            validation_loss: List,
            upsert: bool = False
    ) -> NoReturn:
        try:
            collection = self.get_collection(self.tensorboard_collection)
            query_ = {MODEL_ID_TAG: model_id}
            values_ = {
                '$set': {
                    EPOCHS_TAG: epochs,
                    TRAIN_ACCURACY_TAG: train_accuracy,
                    VALIDATION_ACCURACY_TAG: validation_accuracy,
                    TRAIN_LOSS_TAG: train_loss,
                    VALIDATION_LOSS_TAG: validation_loss
                }
            }
            collection.update_one(query_, values_, upsert=upsert)
        except Exception as e:
            logger.error(f"Exception occurred while updating tensorboard record in BotStore. {e}")
            raise MongoDBBotStoreUpdateException()

    def update_config_record(
            self,
            model_id: Text,
            config: int,
            upsert: bool = False
    ) -> NoReturn:
        try:
            collection = self.get_collection(self.configuration_collection)
            query_ = {MODEL_ID_TAG: model_id}
            values_ = {'$set': {CONFIG_TAG: config}}
            collection.update_one(query_, values_, upsert=upsert)
        except Exception as e:
            logger.error(f"Exception occurred while updating configuration record in BotStore. {e}")
            raise MongoDBBotStoreUpdateException()

    def get_model_curve_data(self, model_id: Text, bson_output: bool = True):
        try:
            collection = self.get_collection(self.tensorboard_collection)
            query_ = {'model_id': model_id}
            curve_data = collection.find_one(query_)
            if bson_output:
                return json_util.dumps(curve_data)
            else:
                return curve_data
        except Exception as e:
            logger.error(f"Exception occurred while retrieving model curve data. {e}")
            raise MongoDBBotSoreReadException()

    # testing - getting all curve data - start
    def get_all_model_curve_data(self, bson_output: bool = True):
        try:
            collection = self.get_collection(self.tensorboard_collection)
            curve_data = collection.find()
            # if bson_output:
            #     return json_util.dumps(curve_data)
            # else:
            return curve_data
        except Exception as e:
            logger.error(f"Exception occurred while retrieving model curve data. {e}")
            raise MongoDBBotSoreReadException()

    # testing - getting all curve data - end
    def get_model_config_data(self, model_id: Text, bson_output: bool = True):
        try:
            collection = self.get_collection(self.configuration_collection)
            query_ = {'model_id': model_id}
            config_data = collection.find_one(query_)
            if bson_output:
                return json_util.dumps(config_data)
            else:
                return config_data
        except Exception as e:
            logger.error(f"Exception occurred while retrieving model config data. {e}")
            raise MongoDBBotSoreReadException()

    def get_all_model_config_data(self, bson_output: bool = True):
        try:
            collection = self.get_collection(self.configuration_collection)
            config_data = collection.find()
            if bson_output:
                return json_util.dumps(config_data)
            else:
                return config_data
        except Exception as e:
            logger.error(f"Exception occurred while retrieving all model config data. {e}")
            raise MongoDBBotSoreReadException()
