from rasa_codeless.shared.exceptions.base import RASACException


class RASACCoreException(RASACException):
    pass


class NLUDataTaggingException(RASACException):
    pass


class InvalidModelException(RASACException):
    pass
