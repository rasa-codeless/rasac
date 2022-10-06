# source: https://github.com/RasaHQ/rasa/blob/2.8.x/rasa/shared/nlu/training_data/loading.py

import json
import os
import logging
import typing
from typing import Callable, Any, Dict, Text, Optional
if typing.TYPE_CHECKING:
    from rasa.shared.nlu.training_data.formats.readerwriter import TrainingDataReader

from rasa.shared.nlu.training_data.formats.dialogflow import (
    DIALOGFLOW_AGENT,
    DIALOGFLOW_ENTITIES,
    DIALOGFLOW_ENTITY_ENTRIES,
    DIALOGFLOW_INTENT,
    DIALOGFLOW_INTENT_EXAMPLES,
    DIALOGFLOW_PACKAGE,
)
from rasa.shared.nlu.training_data.formats import (
    RasaYAMLReader,
    MarkdownReader,
    WitReader,
    LuisReader,
    RasaReader,
    DialogflowReader,
    NLGMarkdownReader,
)
from rasa.shared.nlu.training_data.loading import (
    LUIS,
    WIT,
    DIALOGFLOW_RELEVANT,
    RASA,
    MARKDOWN,
    MARKDOWN_NLG,
    RASA_YAML,
    UNK,
)
from rasa.shared.nlu.training_data.training_data import TrainingData
from rasa.shared.utils.io import read_file

logger = logging.getLogger(__name__)

_json_format_heuristics: Dict[Text, Callable[[Any, Text], bool]] = {
    WIT: lambda js, fn: "utterances" in js and "luis_schema_version" not in js,
    LUIS: lambda js, fn: "luis_schema_version" in js,
    RASA: lambda js, fn: "rasa_nlu_data" in js,
    DIALOGFLOW_AGENT: lambda js, fn: "supportedLanguages" in js,
    DIALOGFLOW_PACKAGE: lambda js, fn: "version" in js and len(js) == 1,
    DIALOGFLOW_INTENT: lambda js, fn: "responses" in js,
    DIALOGFLOW_ENTITIES: lambda js, fn: "isEnum" in js,
    DIALOGFLOW_INTENT_EXAMPLES: lambda js, fn: "_usersays_" in fn,
    DIALOGFLOW_ENTITY_ENTRIES: lambda js, fn: "_entries_" in fn,
}


def _reader_factory(format_: Text) -> Optional["TrainingDataReader"]:
    """Generates the appropriate reader class based on the file format."""
    reader = None
    if format_ == LUIS:
        reader = LuisReader()
    elif format_ == WIT:
        reader = WitReader()
    elif format_ in DIALOGFLOW_RELEVANT:
        reader = DialogflowReader()
    elif format_ == RASA:
        reader = RasaReader()
    elif format_ == MARKDOWN:
        reader = MarkdownReader()
    elif format_ == MARKDOWN_NLG:
        reader = NLGMarkdownReader()
    elif format_ == RASA_YAML:
        reader = RasaYAMLReader()
    return reader


def load(filename: Text, language: Optional[Text] = "en") -> Optional["TrainingData"]:
    """Loads a single training data file from disk."""
    format_ = guess_format(filename)
    if format_ == UNK:
        raise ValueError(f"Unknown data format for file '{filename}'.")

    reader = _reader_factory(format_)

    if reader:
        return reader.read(filename, language=language, fformat=format_)
    else:
        return None


def guess_format(filename: Text) -> Text:
    """Applies heuristics to guess the data format of a file.

    Args:
        filename: file whose type should be guessed

    Returns:
        Guessed file format.
    """
    guess = UNK

    if not os.path.isfile(filename):
        return guess

    try:
        content = read_file(filename)
        js = json.loads(content)
    except ValueError:
        if MarkdownReader.is_markdown_nlu_file(filename):
            guess = MARKDOWN
        elif NLGMarkdownReader.is_markdown_nlg_file(filename):
            guess = MARKDOWN_NLG
        elif RasaYAMLReader.is_yaml_nlu_file(filename):
            guess = RASA_YAML
    else:
        for file_format, format_heuristic in _json_format_heuristics.items():
            if format_heuristic(js, filename):
                guess = file_format
                break

    logger.debug(f"Training data format of '{filename}' is '{guess}'.")

    return guess
