import logging
import os
from copy import deepcopy
from typing import List, Optional, Text, NoReturn, Union, Dict

import pandas as pd
from rasa.shared.data import get_data_files, is_nlu_file
# from rasa.shared.nlu.training_data.loading import _load
from rasa.shared.nlu.training_data.message import Message
from rasa.shared.nlu.training_data.training_data import TrainingData

from rasa_codeless.shared.nlu.rasa_nlu_loading import load
from rasa_codeless.shared.constants import (
    NLU_FALLBACK_TAG,
)
from rasa_codeless.shared.exceptions.core import NLUDataTaggingException
from rasa_codeless.shared.exceptions.io import EmptyNLUDatasetException
from rasa_codeless.utils.io import (
    get_rasa_testing_data,
    get_unique_list,
)
from rasa_codeless.utils.text_preprocessing import (
    bag_of_words,
    get_all_tokens,
)

logger = logging.getLogger(__name__)


class NLUData:
    def __init__(
            self,
            testing_data_dir: Text = None,
            from_rasa: bool = False,
    ):
        self._testing_data_dir = testing_data_dir
        self._from_rasa = from_rasa
        self._testing_data = None
        self._tagged_testing_data = None
        self._tokens = list()
        self._vocabulary = list()
        self._fingerprint = None
        self.case_sensitive = True
        self._initialize_testing_data()

    # a rasa method, extracted, to validate
    # nlu data files before loading.
    @staticmethod
    def _load_data(resource_name: Text, language: Optional[Text] = "en") -> TrainingData:
        """Load training data from disk.

        Merges them if loaded from disk and multiple files are found."""
        if not os.path.exists(resource_name):
            raise EmptyNLUDatasetException(f"File '{resource_name}' does not exist.")

        data_list = get_data_files(paths=[resource_name], filter_predicate=is_nlu_file)
        data_list = [load(f, language) for f in data_list]
        data_list = [ds for ds in data_list if ds]
        if len(data_list) == 0:
            training_data = TrainingData()
        elif len(data_list) == 1:
            training_data = data_list[0]
        else:
            training_data = data_list[0].merge(*data_list[1:])

        return training_data

    @staticmethod
    def _tag_examples(testing_data: Dict) -> List:
        logger.info(f"Tagging examples in the dataset...")

        examples = testing_data
        tagged_examples = list()
        tag = 0

        for intent, instances in examples.items():
            unique_instances = list(set(instances))
            for instance in unique_instances:
                tagged_instance = dict()
                tagged_instance['tag'] = tag
                tagged_instance['intent'] = intent
                tagged_instance['example'] = instance
                tagged_examples.append(tagged_instance)
                tag += 1

        if not tagged_examples:
            raise NLUDataTaggingException(f"Tagged dataset is empty")

        return tagged_examples

    def _initialize_testing_data(self) -> NoReturn:
        if self._from_rasa:
            logger.debug(f"Loading data using RASA Training data loading...")

            self._rasa_testing_data = self._load_data(resource_name=self._testing_data_dir)
            if not self._rasa_testing_data:
                raise EmptyNLUDatasetException("Failed to retrieve testing data")

            testing_data = dict()
            # # commented as it gives an iterable warning.
            # # utilized the next statement to avoid the warning.
            # nlu_examples = self._rasa_testing_data.nlu_examples
            nlu_examples = [example for example
                            in self._rasa_testing_data.training_examples
                            if not example.is_core_or_domain_message()]
            for message in nlu_examples:
                msg: Message = message
                if msg.data['intent'] not in testing_data:
                    testing_data[msg.data['intent']] = [msg.data['text']]
                else:
                    testing_data[msg.data['intent']].append(msg.data['text'])

            self._testing_data = testing_data

        else:
            logger.debug(f"Loading data using DIME Testing data loading...")

            self._testing_data = get_rasa_testing_data(
                testing_data_dir=self._testing_data_dir,
                case_sensitive=True,
            )

        if not self._testing_data:
            raise EmptyNLUDatasetException("Failed to retrieve testing data")

        self._tagged_testing_data = self._tag_examples(self._testing_data)

        all_instances = self.get_instances()
        dataset_vocabulary = bag_of_words(
            instances=all_instances,
            merge=True
        )
        self._vocabulary = sorted(get_unique_list(dataset_vocabulary)) if dataset_vocabulary else []
        self._vocabulary_size = len(self._vocabulary)
        self._tokens = get_all_tokens(instances=all_instances, merge=True)

        logger.info(f'Total number of intents: {self.get_intent_size()}')
        logger.info(f'Total number of data instances: {self.get_instance_size()}')
        logger.info(f'Vocabulary size: {self._vocabulary_size}')

    def get_testing_data(
            self,
            as_dataframe: bool = False,
    ) -> Union[Dict, pd.DataFrame]:
        testing_data = self._testing_data

        if as_dataframe:
            dataset = pd.DataFrame(columns=['intent', 'example'])

            for intent, examples in testing_data.items():
                for example in examples:
                    dataset_row = [intent, example]
                    dataset.loc[len(dataset)] = dataset_row

            dataset.drop_duplicates(inplace=True)
            dataset.reset_index(inplace=True)
            dataset.drop(columns=['index'], inplace=True)
            return dataset
        else:
            return testing_data

    def get_testing_data_as_rasa(self) -> Optional[List[Message]]:
        return self._rasa_testing_data.nlu_examples if self._from_rasa else []

    def get_tagged_data(
            self,
            as_dataframe: bool = False,
    ) -> Union[List, pd.DataFrame]:
        tagged_data = self._tagged_testing_data

        if as_dataframe:
            dataset = pd.DataFrame(data=tagged_data)
            dataset.drop_duplicates(inplace=True)
            dataset.reset_index(inplace=True)
            dataset.drop(columns=['index'], inplace=True)
            return dataset
        else:
            return deepcopy(tagged_data)

    def get_instances(
            self,
            intent: Text = None,
    ) -> Optional[List]:
        all_instances = list()
        if intent:
            if intent in self._testing_data:
                all_instances = self._testing_data[intent]
            else:
                logger.error("Could not find the given intent name in testing data. Please input a valid intent name.")
        else:
            for key, value in self._testing_data.items():
                all_instances += value
        return get_unique_list(all_instances)

    def get_instance_size(
            self,
            intent: Text = None,
    ) -> Optional[int]:
        filtered_instances = self.get_instances(intent=intent)
        return len(filtered_instances)

    def get_intents(self) -> Optional[List]:
        if not self._testing_data:
            return []
        intents = list(self._testing_data.keys())
        intents.append(NLU_FALLBACK_TAG)
        return intents

    def get_intent_size(self) -> Optional[int]:
        if not self._testing_data:
            return 0

        return len(self._testing_data.keys())

    def get_tokens(self) -> Optional[List]:
        return self._tokens

    def get_token_size(self) -> Optional[int]:
        return len(self._tokens)

    def get_vocabulary(self) -> Optional[List]:
        return self._vocabulary

    def get_vocabulary_size(self) -> Optional[int]:
        vocabulary = self.get_vocabulary()
        return len(vocabulary)

    def get_fingerprint(self) -> Optional[Text]:
        return self._fingerprint
