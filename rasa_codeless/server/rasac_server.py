import logging
import os
from typing import Dict

from waitress import serve as waitress_serve

from rasa_codeless.server import create_app
from rasa_codeless.shared.constants import (
    DEFAULT_PORT,
    DEFAULT_HOST_LOCAL,
    RASAC_ASCII_LOGO,
    ServerEnv,
    Config,
)
from rasa_codeless.shared.exceptions.base import (
    RASACException,
)
from rasa_codeless.shared.exceptions.core import (
    RASACCoreException
)
from rasa_codeless.shared.exceptions.server import (
    RASACServerException,
    ServerNotFoundException, RASACQueueException,
)
from rasa_codeless.utils.training_queue import create_in_memory_training_queue

logger = logging.getLogger(__name__)


class RASACServer:
    def __init__(
            self,
            configs: Dict,
            debug_mode: bool = False,
    ):
        self.configs = configs
        self.host = configs[Config.SERVER_CONFIGS_KEY][Config.HOST_KEY] or DEFAULT_HOST_LOCAL
        self.port = configs[Config.SERVER_CONFIGS_KEY][Config.PORT_KEY] or DEFAULT_PORT
        self.rasa_config_path = configs[Config.BASE_CONFIGS_KEY][Config.CONFIG_PATH_KEY]
        self.debug_mode = debug_mode

        try:
            create_in_memory_training_queue()
            logger.info("Initialized explanation and train process queues")
        except Exception as e:
            raise RASACQueueException(e)

    def run(self) -> None:
        logger.info(f"Starting RASAC server at http://{self.host}:{self.port}/")
        try:
            configs = self.configs
            app_config = {
                "RASAC": configs,
                "APP_THEME": os.environ.get("APP_THEME") or "dark",
                "APP_ENV": os.environ.get("APP_ENV") or "prod",
            }

            if self.debug_mode:
                logger.warning("Deploying RASAC Server in development mode...")
                os.environ["APP_ENV"] = ServerEnv.DEV
                app = create_app(configs=app_config)
                app.run(
                    host=self.host,
                    port=self.port,
                    debug=self.debug_mode
                )
            else:
                logger.info("Deploying RASAC Server in production mode...")
                print(RASAC_ASCII_LOGO)
                waitress_serve(
                    create_app(configs=app_config),
                    host=self.host,
                    port=self.port
                )

                # # Run as a shell command if required
                # import subprocess
                # subprocess.run(["waitress-serve", f"--host={self.host}",
                #                 f"--port={self.port}", "rasac.server.rasac_server:run"])

        except ServerNotFoundException:
            logger.exception(f"An unknown exception occurred while invoking the RASACServer")
        except RASACCoreException:
            logger.exception(f"Core::RASACServer")
        except RASACServerException:
            logger.exception(f"Specific::RASACServer")
        except RASACException:
            logger.exception(f"Base::RASACServer")
        except KeyboardInterrupt:
            logger.info(f"Gracefully terminating RASAC Server...")
            exit()
        except OSError:
            logger.exception(f"Possible permission exception while starting the RASACServer")
        except Exception as e:
            logger.exception(f"Base::broad::RASACServer. more info: {e}")
        return
