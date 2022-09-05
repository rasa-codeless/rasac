import os

# RASA CODELESS CLI
PACKAGE_NAME = "rasac"
PACKAGE_NAME_PYPI = "rasac"
PACKAGE_VERSION = "0.0.1a2"
PACKAGE_VERSION_LONG = f'RASAC Version: {PACKAGE_VERSION}'
LANGUAGES_SUPPORTED = ['en', 'si']


class InterfaceType:
    INIT = "init"
    CLI = "cli"
    SERVER = "server"
    NONE = ""
class LoggingLevel:
    NOTSET = 0
    DEBUG = 10
    INFO = 20
    WARNING = 30
    ERROR = 40
    CRITICAL = 50
    QUIET = 60
# SERVER
DEFAULT_PORT = 6069
DEFAULT_HOST_DEC = "0.0.0.0"
DEFAULT_HOST_LOCAL = "localhost"
RASAC_ASCII_LOGO = """
█▀█ ▄▀█ █▀ ▄▀█ █▀▀
█▀▄ █▀█ ▄█ █▀█ █▄▄
"""
class ServerEnv:
    STRICT_LOCAL = "strict_local"  # triggers server explanations without subprocess
    DEV = "dev"  # enables server debugging
    PROD = "prod"  # disables server debugging
class ServerConfigType:
    JSON = "json"
    NONE = "none"
# SCAFFOLD
DEFAULT_INIT_SRC_DIR_NAME = "init_dir"
DEFAULT_INIT_CACHE_DIR_NAME = ".rasac_init_"
DEFAULT_INIT_FILES_TO_EXCLUDE = ['__pycache__', '__main__.py']
DEFAULT_INIT_DEST_DIR_NAME = "./"
RASA_DIRS_IN_RASAC_INIT = ["tensorboard"]
INVALID_DIR_NAME_CHARS = ['\\', '/', '<', '>', ':', '*', '?', '|']
ALLOWED_INIT_DIR_NAMES = [".", "./", "None", "none"]


class DestinationDirType:
    RASA = "rasa"
    RASAC = "rasac"
    EMPTY = "empty"
    VALID = "valid"
    INVALID = "invalid"
# RASA
DEFAULT_RASA_CONFIG_PATH = "./config.yml"
YAML_EXTENSIONS = [".yaml", ".yml"]
DEFAULT_YAML_VERSION = "2.0"
DEFAULT_RASA_ROOT_DIR = "./"
DEFAULT_VERSION_YAML_TAG = "version"
DEFAULT_PIPELINE_YAML_TAG = "pipeline"
DEFAULT_MODEL_PATH = "./models"
MODEL_EXTENSIONS = [".tar.gz"]
RASA_288_MODEL_REGEX = "^(\\d{8})\\-(\\d{6}).tar.gz$"
# FILE IO
class FilePermission:
    READ = "r"
    WRITE = "w"
    OVERWRITE = "w+"
class Encoding:
    UTF8 = "utf8"
# TERMINAL
class TermColor:
    # source:
    # https://pkg.go.dev/github.com/whitedevops/colors
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"
    END_C = "\033[0m"
    NONE_C = ""
    DEFAULT = "\033[39m"
    BLACK = "\033[30m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    LIGHTGRAY = "\033[37m"
    DARKGRAY = "\033[90m"
    LIGHTRED = "\033[91m"
    LIGHTGREEN = "\033[92m"
    LIGHTYELLOW = "\033[93m"
    LIGHTBLUE = "\033[94m"
    LIGHTMAGENTA = "\033[95m"
    LIGHTCYAN = "\033[96m"
    WHITE = "\033[97m"
    BDEFAULT = "\033[49m"
    BBLACK = "\033[40m"
    BRED = "\033[41m"
    BGREEN = "\033[42m"
    BYELLOW = "\033[43m"
    BBLUE = "\033[44m"
    BMAGENTA = "\033[45m"
    BCYAN = "\033[46m"
    BGRAY = "\033[47m"
    BDARKGRAY = "\033[100m"
    BLIGHTRED = "\033[101m"
    BLIGHTGREEN = "\033[102m"
    BLIGHTYELLOW = "\033[103m"
    BLIGHTBLUE = "\033[104m"
    BLIGHTMAGENTA = "\033[105m"
    BLIGHTCYAN = "\033[106m"
    BWHITE = "\033[107m"
# CONFIGS
class Config:
    DEFAULT_CONFIG_PATH = "./rasac_config.yml"
    BASE_CONFIGS_KEY = "rasac_base_configs"
    SERVER_CONFIGS_KEY = "rasac_server_configs"
    CONFIG_PATH_KEY = "rasa_config_path"
    HOST_KEY = "host"
    PORT_KEY = "port"
    VALID_MAIN_KEYS = ["rasac_base_configs", "rasac_server_configs"]
    VALID_BASE_KEYS = ["config_path"]
    VALID_SERVER_KEYS = ["host", "port"]


class ConfigType:
    ALL = "all"
    BASE = "base"
    SERVER = "server"
# TENSORBOARD CONFIGS
class TensorboardDirectories:
    TRAIN = "train"
    TEST = "test"
    VALIDATION = "validation"
MODEL_ID_TAG = "model_id"
EPOCHS_TAG = "epochs"
TRAIN_ACCURACY_TAG = "train"
VALIDATION_ACCURACY_TAG = "test"
TRAIN_LOSS_TAG = "train_loss"
VALIDATION_LOSS_TAG = "test_loss"
CONFIG_TAG = "config"
DEFAULT_TENSORBOARD_LOGDIR = "./tensorboard"
TENSORBOARD_INTENT_ACCURACY_TAG = "epoch_i_acc"
TENSORBOARD_INTENT_LOSS_TAG = "epoch_t_loss"
TENSORBOARD_SIMPLE_VALUE_TAG = "simple_value"
TENSORBOARD_RESULTS_FILE_EXTENSION = "*.v2"
# TRAINING QUEUE
PROCESS_ID_NONE = -99
TRAINING_QUEUE = os.path.join("./rasac_cache", "training_queue.db")
TRAINING_QUEUE_TABLE = "training_queue"
