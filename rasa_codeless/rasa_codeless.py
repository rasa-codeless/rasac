import argparse
import logging
import os
import sys
from typing import NoReturn, Text

from dotenv import load_dotenv

from rasa_codeless.server.rasac_server import RASACServer
from rasa_codeless.shared.constants import (
    PACKAGE_VERSION,
    LoggingLevel,
    DEFAULT_RASA_CONFIG_PATH,
    InterfaceType,
    TermColor,
    RASA_CODELESS_PROJECT_DIRS,
    LOGGING_FORMAT_STR,
    DOTENV_FILES
)
from rasa_codeless.shared.exceptions.server import RASACQueueException
from rasa_codeless.utils.config import get_init_configs
from rasa_codeless.utils.io import set_cli_color, dir_exists
from rasa_codeless.utils.rasac_logging_formatter import (
    RASACLoggingFormatter,
    MaxLevelFilter
)
from rasa_codeless.utils.scaffold import RASACInit

logger = logging.getLogger()
sys.path.insert(0, os.getcwd())
load_dotenv(os.path.join(os.getcwd(), DOTENV_FILES[0]))

formatter = RASACLoggingFormatter(format_str=LOGGING_FORMAT_STR)
logging_out = logging.StreamHandler(sys.stdout)
logging_err = logging.StreamHandler(sys.stderr)
logging_out.setFormatter(formatter)
logging_err.setFormatter(formatter)
logging_out.addFilter(MaxLevelFilter(logging.WARNING))
logging_out.setLevel(logging.DEBUG)
logging_err.setLevel(logging.WARNING)
logger.addHandler(logging_out)
logger.addHandler(logging_err)
logger.setLevel(level=logging.INFO)

# disabling unwanted tf cuda logs
# for conda environments, manually set env var
# conda env config vars set TF_CPP_MIN_LOG_LEVEL=2
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'


def create_argument_parser():
    """
    Parses the arguments passed to rasa_codeless through RASAC CLI tool.
    Returns:
        argparse.ArgumentParser()
    """
    parser = argparse.ArgumentParser(prog="rasac", description="starts RASAC CLI")
    subparsers = parser.add_subparsers(help='desired RASAC interface to run [cli/server]', dest="subparser_name")

    parser.add_argument(
        "-v",
        "--version",
        action='version',
        version=PACKAGE_VERSION,
        help="prints the RASAC version info.",
    )

    parser_server = subparsers.add_parser(
        name="server",
        help='run RASAC server, a web-based visualization tool for RASAC.'
    )
    parser_server.add_argument(
        "-p",
        "--port",
        type=int,
        help="the port to start the RASAC server at.",
    )
    parser_server.add_argument(
        "--debug",
        action="store_true",
        help="sets the RASAC logging level to debug mode from info.",
    )
    parser_server.add_argument(
        "--quiet",
        action="store_true",
        help="sets the RASAC logging level to off.",
    )

    parser_init = subparsers.add_parser(
        name="init",
        help='create init dir structure for a new mapping project.'
    )
    parser_init.add_argument(
        "--debug",
        action="store_true",
        help="sets the RASAC logging level to debug mode from info.",
    )
    parser_init.add_argument(
        "--quiet",
        action="store_true",
        help="initializes a starter RASAC project without prompting the user for a project configs.",
    )

    return parser


def _set_logging_level(level: Text = LoggingLevel.INFO) -> NoReturn:
    if level == LoggingLevel.NOTSET:
        logger.setLevel(level=logging.NOTSET)
    elif level == LoggingLevel.DEBUG:
        logger.setLevel(level=logging.DEBUG)
    elif level == LoggingLevel.INFO:
        logger.setLevel(level=logging.INFO)
    elif level == LoggingLevel.WARNING:
        logger.setLevel(level=logging.WARNING)
    elif level == LoggingLevel.ERROR:
        logger.setLevel(level=logging.ERROR)
    elif level == LoggingLevel.CRITICAL:
        logger.setLevel(level=logging.CRITICAL)
    elif level == LoggingLevel.QUIET:
        logging.disable(level=logging.CRITICAL)
    else:
        logger.setLevel(level=logging.INFO)


def run_rasac() -> NoReturn:
    """
    Runs the main RASAC CLI Interface. Invokes the relevant Interface
    from cli, server, and creates a starter RASAC project on init.
    Returns:
        no return
    """
    try:
        logger.debug("Running main RASAC CLI.")
        arg_parser = create_argument_parser()
        cmdline_args = arg_parser.parse_args()
        interface = cmdline_args.subparser_name

        # creating missing rasa codeless dirs
        for dir_ in RASA_CODELESS_PROJECT_DIRS:
            if not os.path.exists(dir_):
                os.mkdir(path=dir_)

        if not interface:
            arg_parser.print_help()
            logger.error("Please specify a valid positional arg out of \'init\' and \'server\', "
                         "to use RASAC CLI.")
            return
        if str.lower(interface) == InterfaceType.INIT:
            logger.warning("rasa init is deprecated and will be removed "
                           "in the future")

            quiet = cmdline_args.quiet
            debug_mode = cmdline_args.debug

            if debug_mode:
                _set_logging_level(level=LoggingLevel.DEBUG)
            else:
                _set_logging_level(level=LoggingLevel.INFO)

            try:
                if not quiet:
                    print(set_cli_color(
                        text_content="👋🏽 Hi there! Welcome to RASAC.",
                        color=TermColor.LIGHTGREEN)
                    )
                    dest_dir = input(set_cli_color(
                        text_content="In which directory do you want to "
                                     "initialize RASAC? [Default: Current "
                                     "Directory]: ",
                        color=TermColor.LIGHTGREEN
                    ))
                else:
                    dest_dir = "."
                if dest_dir and not dir_exists(dir_path=dest_dir):
                    logger.error("Directory name or path should be a "
                                 "valid existing directory")
                    return
                rasac_init = RASACInit()
                rasac_init.build_scaffold(dest_path=dest_dir)
            except KeyboardInterrupt:
                logger.error("Gracefully terminating RASAC init...")

        elif str.lower(interface) == InterfaceType.SERVER:
            server_port = cmdline_args.port
            debug_mode = cmdline_args.debug
            quiet_mode = cmdline_args.quiet

            if debug_mode:
                _set_logging_level(level=LoggingLevel.DEBUG)
            elif quiet_mode:
                _set_logging_level(level=LoggingLevel.QUIET)
            else:
                _set_logging_level(level=LoggingLevel.INFO)

            configs = get_init_configs(
                rasa_config_path=DEFAULT_RASA_CONFIG_PATH,
                port=server_port,
                interface=InterfaceType.SERVER,
            )

            rasac_server = RASACServer(
                configs=configs,
                debug_mode=debug_mode
            )
            rasac_server.run()

    except RASACQueueException as e:
        logger.error(f"Failed to Initialize the Training Queue. {e}")
        exit(1)
    except KeyboardInterrupt:
        logger.info(f"Gracefully terminating RASAC CLI...")


if __name__ == "__main__":
    logger.error("This script cannot be directly executed. "
                 "please use the 'RASAC' CLI instead.")
    exit(1)
