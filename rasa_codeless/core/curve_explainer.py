import logging
import os
from typing import Text, List, Tuple

from rasa_codeless.shared.constants import (
    DEFAULT_TENSORBOARD_LOGDIR,
    BOTSTORE_PATH,
    DEFAULT_MODEL_PATH,
)
from rasa_codeless.utils.tensorboard import TensorBoardResults

logger = logging.getLogger(__name__)


class CurveExplainer:
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

    def _(self):
        pass

    def explain(self):
        pass
