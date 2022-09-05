import logging
from typing import Dict, Text

from rasa_codeless.shared.constants import (
    InterfaceType,
    Config,
    DEFAULT_RASA_CONFIG_PATH,
    DEFAULT_PORT,
    DEFAULT_HOST_LOCAL,
    ConfigType,
)
from rasa_codeless.shared.exceptions.config import (
    InvalidInterfaceException,
)

logger = logging.getLogger(__name__)


def get_init_configs(
        rasa_config_path: Text = None,
        port: int = None,
        interface: Text = None,
) -> Dict:
    # setting default config file
    # path if not specified
    if not rasa_config_path:
        rasa_config_path = DEFAULT_RASA_CONFIG_PATH

    # interface warnings
    if not interface:
        interface = InterfaceType.NONE

    if interface not in [InterfaceType.SERVER]:
        logger.error("An invalid interface has been specified. Valid "
                     "interfaces are MAPPER, SERVER, EVALUATOR, and EXTRACTOR")
        raise InvalidInterfaceException()

    default_configs = get_default_configs(section=ConfigType.ALL)

    if rasa_config_path and interface == InterfaceType.SERVER:
        default_configs[Config.BASE_CONFIGS_KEY][Config.CONFIG_PATH_KEY] = rasa_config_path
        logger.warning("Config path specified in the config file will be ignored "
                       "since --rasa-config-path argument was set via the CLI")
    if port and interface == InterfaceType.SERVER:
        if isinstance(port, int):
            default_configs[Config.SERVER_CONFIGS_KEY][Config.PORT_KEY] = port
            logger.warning("Port specified in the config file will be ignored "
                           "since --port argument was set via the CLI")

    return default_configs


def get_default_configs(section: Text = ConfigType.ALL) -> Dict:
    default_configs = {
        "rasac_base_configs": {
            "rasa_config_path": DEFAULT_RASA_CONFIG_PATH,
        },
        "rasac_server_configs": {
            "host": DEFAULT_HOST_LOCAL,
            "port": DEFAULT_PORT,
        }
    }

    if section == ConfigType.BASE:
        return default_configs[Config.BASE_CONFIGS_KEY]
    elif section == ConfigType.SERVER:
        return default_configs[Config.SERVER_CONFIGS_KEY]
    else:
        return default_configs


