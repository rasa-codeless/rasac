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
    TensorboardMetrics,
    RASA_MODEL_EXTENSIONS,
)
from rasa_codeless.shared.exceptions.io import (
    InvalidTensorboardMetricException,
    TensorboardScalarsException,
)

logger = logging.getLogger(__name__)


class TensorBoardResults:
    def __init__(self, logdir: Text = DEFAULT_TENSORBOARD_LOGDIR):
        self.logdir = logdir

    @staticmethod
    def generate_epoch_list(total_epochs: int):
        return list(range(1, total_epochs+1))

    def _iterate_through_results(
            self,
            results_dir: Text,
            metric: Text,
            botstore_model: Text = ""
    ) -> Tuple[List, int]:
        score = list()
        epochs = 0
        botstore_model = "" if not botstore_model else botstore_model

        # replace model extension
        botstore_model = botstore_model.replace(RASA_MODEL_EXTENSIONS[0], "")

        try:
            if metric == TensorboardMetrics.ACCURACY:
                tag = TENSORBOARD_INTENT_ACCURACY_TAG
            elif metric == TensorboardMetrics.LOSS:
                tag = TENSORBOARD_INTENT_LOSS_TAG
            else:
                raise InvalidTensorboardMetricException()

            for file in os.listdir(os.path.join(botstore_model, self.logdir, results_dir)):
                if fnmatch.fnmatch(file, TENSORBOARD_RESULTS_FILE_EXTENSION):
                    for event in tf.compat.v1.train.summary_iterator(
                            path=os.path.join(botstore_model, self.logdir, results_dir, file)
                    ):
                        for value in event.summary.value:
                            if value.tag == tag:
                                if value.HasField(TENSORBOARD_SIMPLE_VALUE_TAG):
                                    score.append(value.simple_value)
                                    # count to get the number of epochs
                                    epochs += 1

            return score, epochs
        except Exception as e:
            logger.debug(f"Exception occurred while iterating through tensorboard scalars. {e}")
            raise TensorboardScalarsException(e)

    def training_acc(self, botstore_model: Text = ""):
        return self._iterate_through_results(
            results_dir=TensorboardDirectories.TRAIN,
            metric=TensorboardMetrics.ACCURACY,
            botstore_model=botstore_model
        )

    def validation_acc(self, botstore_model: Text = ""):
        return self._iterate_through_results(
            results_dir=TensorboardDirectories.VALIDATION,
            metric=TensorboardMetrics.ACCURACY,
            botstore_model=botstore_model
        )

    def training_loss(self, botstore_model: Text = ""):
        return self._iterate_through_results(
            results_dir=TensorboardDirectories.TRAIN,
            metric=TensorboardMetrics.LOSS,
            botstore_model=botstore_model
        )

    def validation_loss(self, botstore_model: Text = ""):
        return self._iterate_through_results(
            results_dir=TensorboardDirectories.VALIDATION,
            metric=TensorboardMetrics.LOSS,
            botstore_model=botstore_model
        )
