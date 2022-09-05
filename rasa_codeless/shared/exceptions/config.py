from rasa_codeless.shared.exceptions.base import RASACException


class RASACConfigException(RASACException):
    pass


class InvalidInterfaceException(RASACConfigException):
    pass


class InvalidConfigKeyException(RASACConfigException):
    pass
