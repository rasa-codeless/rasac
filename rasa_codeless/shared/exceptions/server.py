from rasa_codeless.shared.exceptions.base import RASACException


class RASACServerException(RASACException):
    pass


class ServerNotFoundException(RASACServerException):
    pass


class ModelTrainException(RASACServerException):
    pass


class InvalidDirectoryPathException(RASACServerException):
    pass


class EpochsMismatchException(RASACServerException):
    pass


class ProcessTerminationException(RASACServerException):
    pass


class InvalidProcessIDException(RASACServerException):
    pass


class ProcessQueueException(RASACServerException):
    pass


class ProcessQueuePushException(RASACServerException):
    pass


class ProcessQueueUpdateException(RASACServerException):
    pass


class ProcessQueuePullException(RASACServerException):
    pass


class ProcessAlreadyExistsException(RASACServerException):
    pass


class ProcessNotExistsException(RASACServerException):
    pass


class InvalidRequestIDException(RASACServerException):
    pass


class MetadataRetrievalException(RASACServerException):
    pass


class RASACQueueException(RASACServerException):
    pass
