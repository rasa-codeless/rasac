from rasa_codeless.shared.exceptions.base import RASACException


class RASACIOException(RASACException):
    pass


class InvalidInitDirException(RASACIOException):
    pass


class ProjectExistsException(RASACIOException):
    pass


class YAMLFormatException(RASACIOException):
    pass


class YAMLFileWriteException(RASACIOException):
    pass


class NLUFileNotFoundException(RASACIOException):
    pass


class EvalFileNotFoundException(RASACIOException):
    pass


class InvalidFileExtensionException(RASACIOException):
    pass


class InvalidNLUDatasetException(RASACIOException):
    pass


class EmptyNLUDatasetException(RASACIOException):
    pass


class InvalidPathSpecifiedException(RASACIOException):
    pass


class ModelNotFoundException(RASACIOException):
    pass


class ModelLoadException(RASACIOException):
    pass


class FileSizeInspectingException(RASACIOException):
    pass


class InvalidEvalDatasetException(RASACIOException):
    pass


class EmptyEvalDatasetException(RASACIOException):
    pass


class ConfigFileNotFoundException(RASACIOException):
    pass
