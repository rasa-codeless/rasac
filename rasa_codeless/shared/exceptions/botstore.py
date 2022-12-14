from rasa_codeless.shared.exceptions.base import RASACException


class MongoDBBotStoreCredentialsException(RASACException):
    pass


class MongoDBBotStoreCollectionException(RASACException):
    pass


class MongoDBBotStoreInsertException(RASACException):
    pass


class MongoDBBotStoreUpdateException(RASACException):
    pass


class MongoDBBotSoreReadException(RASACException):
    pass


class BotStoreRetrieveException(RASACException):
    pass


class BotStorePersistException(RASACException):
    pass


class BotStoreCacheException(RASACException):
    pass


class BotStoreCleanupException(RASACException):
    pass
