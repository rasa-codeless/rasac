import fnmatch
import logging
import os
from typing import Text, List, Tuple

import tensorflow as tf

from rasa_codeless.shared.constants import (
    DEFAULT_TENSORBOARD_LOGDIR,
    TENSORBOARD_INTENT_ACCURACY_TAG,
    TENSORBOARD_INTENT_LOSS_TAG,
    TENSORBOARD_SIMPLE_VALUE_TAG,
    TENSORBOARD_RESULTS_FILE_EXTENSION,
    TensorboardDirectories,
)

logger = logging.getLogger(__name__)


class TensorBoardResults:
    def __init__(self, logdir: Text = DEFAULT_TENSORBOARD_LOGDIR):
        self.logdir = logdir

    @staticmethod
    def generate_epoch_list(total_epochs: int):
        return list(range(1, total_epochs+1))

    def _iterate_through_results(self, results_dir: Text) -> Tuple[List, int]:
        accuracy = list()
        epochs = 0

        for file in os.listdir(os.path.join(self.logdir, results_dir)):
            if fnmatch.fnmatch(file, TENSORBOARD_RESULTS_FILE_EXTENSION):
                for event in tf.compat.v1.train.summary_iterator(
                        path=os.path.join(self.logdir, results_dir, file)
                ):
                    for value in event.summary.value:
                        if value.tag == TENSORBOARD_INTENT_ACCURACY_TAG:
                            if value.HasField(TENSORBOARD_SIMPLE_VALUE_TAG):
                                accuracy.append(value.simple_value)
                                # count to get the number of epochs
                                epochs += 1

        return accuracy, epochs

    def _iterate_through_loss_results(self, results_dir: Text) -> Tuple[List, int]:
        loss = list()
        epochs = 0

        for file in os.listdir(os.path.join(self.logdir, results_dir)):
            if fnmatch.fnmatch(file, TENSORBOARD_RESULTS_FILE_EXTENSION):
                for event in tf.compat.v1.train.summary_iterator(
                        path=os.path.join(self.logdir, results_dir, file)
                ):
                    for value in event.summary.value:
                        if value.tag == TENSORBOARD_INTENT_LOSS_TAG:
                            if value.HasField(TENSORBOARD_SIMPLE_VALUE_TAG):
                                loss.append(value.simple_value)
                                # count to get the number of epochs
                                epochs += 1

        return loss, epochs

    def retrieve_training_results(self):
        return self._iterate_through_results(results_dir=TensorboardDirectories.TRAIN)

    def retrieve_validation_results(self):
        return self._iterate_through_results(results_dir=TensorboardDirectories.VALIDATION)

    def retrieve_training_loss_results(self):
        return self._iterate_through_loss_results(results_dir=TensorboardDirectories.TRAIN)

    def retrieve_validation_loss_results(self):
        return self._iterate_through_loss_results(results_dir=TensorboardDirectories.VALIDATION)
