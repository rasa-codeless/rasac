import logging
import os
import re
import shutil
import sys
from collections import OrderedDict as OrderedDictColl
from datetime import datetime
from os import path
from pathlib import Path
from typing import (
    List,
    Optional,
    Text,
    OrderedDict,
    Dict,
    NoReturn,
    Union,
    Tuple,
)
from uuid import uuid4

from rasa.shared.data import (
    get_data_files,
    is_nlu_file,
)
from ruamel import yaml as yaml
from ruamel.yaml.comments import CommentedMap
from ruamel.yaml.error import YAMLError

from rasa_codeless.shared.constants import (
    Encoding,
    FilePermission,
    TermColor,
    DEFAULT_YAML_VERSION,
    YAML_EXTENSIONS,
    DEFAULT_INIT_DEST_DIR_NAME,
    DEFAULT_RASA_ROOT_DIR,
    DEFAULT_VERSION_YAML_TAG,
    DEFAULT_PIPELINE_YAML_TAG,
    DEFAULT_TENSORBOARD_LOGDIR,
    RASA_288_MODEL_REGEX,
    DEFAULT_MODEL_PATH,
    MODEL_EXTENSIONS,
)
from rasa_codeless.shared.exceptions.io import (
    YAMLFormatException,
    FileSizeInspectingException,
    YAMLFileWriteException,
    ModelNotFoundException,
)
from rasa_codeless.shared.exceptions.server import InvalidDirectoryPathException

logger = logging.getLogger(__name__)


def get_seetm_init_caches(
        dir_path: Text = DEFAULT_INIT_DEST_DIR_NAME,
) -> Optional[List]:
    """
   Returns all dime cache directories in a
   specified directory path

   Args:
       dir_path: path to retrieve the list of
           initial DIME cache directories and
           files

   Returns:
       list of initial DIME caching directories
       and files
   """
    return [cache_dir for cache_dir in os.listdir(dir_path)
            if str(cache_dir).startswith(".dime_init_")]


def _get_dir_file_list(
        dir_path: Text = DEFAULT_RASA_ROOT_DIR,
        file_suffixes: List = YAML_EXTENSIONS
) -> Optional[List]:
    """
   Returns the list files available in a given
   directory path and its subdirectories. able
   to check extensions if the extensions are
   provided as a list

   Args:
       dir_path: path where to read the list of directories
       file_suffixes: list of file extensions to look for. if
           not provided, the method will output all the files
           available in the given destination directory

   Returns:
       list of files available, or None
   """

    file_paths = list()

    for (dir_path, dir_names, file_names) in os.walk(dir_path):
        if file_suffixes:
            file_paths += [path.join(dir_path, file) for file in file_names if str(file).endswith(tuple(file_suffixes))]
        else:
            file_paths += [path.join(dir_path, file) for file in file_names]
    return file_paths


def get_all_existing_file_list(
        dir_path: Text = DEFAULT_RASA_ROOT_DIR,
) -> Optional[List]:
    """
   Returns all files and directories existing
   in the specified destination directory and
   subdirectories

   Args:
       dir_path: destination directory path where
           to get the list of files and directories

   Returns:
       list of files and directories available, or
           None
   """

    file_list_all = list()

    for (dir_path, dir_names, file_names) in os.walk(dir_path):
        file_list_all += [dir_ for dir_ in dir_names]
        file_list_all += [file for file in file_names]

    return file_list_all


def get_existing_toplevel_file_list(
        dir_path: Text = DEFAULT_RASA_ROOT_DIR,
        exclude: List = None
) -> Optional[List]:
    """
   Returns the list files available in a given
   directory path but not subdirectories. able
   to ignore files if the provided as a list under
   exclude argument

   Args:
       dir_path: path where to read the list of directories
       exclude: list of file names to ignore

   Returns:
       list of files available except the files mentioned in
           exclude list, or None
   """

    files = os.listdir(dir_path)
    if exclude:
        files = list(set(files).difference(set(exclude)))
    return files


def get_timestamp_str(sep: Text = "-", uuid: bool = False) -> Text:
    """
   Generates a timestamped string and attaches a unique
   ID using UUID if specified and returns it

   Args:
       sep: seperator to separate date, time and uuid
       uuid: if True, a unique UUID will be attached
           at the end of the timestamped string
           generated

   Returns:
       timestamped string
   """
    if uuid:
        return datetime.now().strftime('%Y%m%d' + sep + '%H%M%S' + sep) \
               + str(uuid4())
    else:
        return datetime.now().strftime('%Y%m%d' + sep + '%H%M%S')


def dir_exists(dir_path: Text = None) -> bool:
    """
   Checks if the specified directory path exists

   Args:
       dir_path: path of the directory to check
           the existence

   Returns:
       True if path exists, else False
   """
    return path.exists(dir_path) and path.isdir(dir_path)


def file_exists(file_path: Text = None) -> bool:
    """
   Checks if the specified file path exists

   Args:
       file_path: path of the file to check
           the existence

   Returns:
       True if path exists, else False
   """
    return path.exists(file_path) and path.isfile(file_path)


def file_size(
        file_path: Union[Text, List],
        reverse: bool = False
) -> Union[Dict, Tuple[float, Text]]:
    try:
        if isinstance(file_path, Text):
            size_in_bytes = os.path.getsize(file_path)
            if size_in_bytes >= 1000000000:
                size = size_in_bytes / 1000000000
                units = "GB"
            elif size_in_bytes >= 1000000:
                size = size_in_bytes / 1000000
                units = "MB"
            elif size_in_bytes >= 1000:
                size = size_in_bytes / 1000
                units = "KB"
            else:
                size = size_in_bytes
                units = "Bytes"
            return size, units
        else:
            if reverse:
                file_path.reverse()
            file_sizes_dict = {file: file_size(file_path=file) for file in file_path}
            return file_sizes_dict
    except Exception as e:
        raise FileSizeInspectingException(e)


def read_yaml_file(
        yaml_file: Text = None,
        encoding: Text = Encoding.UTF8,
        mode: Text = FilePermission.READ,
        yaml_version: Text = DEFAULT_YAML_VERSION,
        version_check: bool = True,
) -> Optional[OrderedDict]:
    """
   Reads the content of a specified YAML file.

   Args:
       yaml_file: YAML file to read the content from
       encoding: encoding of the specified file
       mode: read mode
       yaml_version: version of the YAML file, 2.0 is
           preferred
       version_check: True if required to check the
           version, else False

   Returns:
       YAML file content as an ordered dictionary, or
           None
   """
    if not yaml_file:
        return OrderedDictColl()

    with open(file=yaml_file, encoding=encoding, mode=mode) as file_stream:
        try:
            yaml_content = yaml.round_trip_load(file_stream, preserve_quotes=False)
        except YAMLError as e:
            raise YAMLFormatException(e)

    if not yaml_content:
        return None

    if version_check:
        if DEFAULT_VERSION_YAML_TAG not in yaml_content:
            logger.warning("The YAML file is not properly versioned. "
                           "the expected version is 2.0")
        else:
            if yaml_content[DEFAULT_VERSION_YAML_TAG] != yaml_version:
                logger.warning("The YAML file does not contain the expected "
                               "rasa YAML version. the expected version is "
                               "2.0")

    return yaml_content


def _find_yaml_collection(
        yaml_content: OrderedDict = None,
        yaml_collection_tag: Text = DEFAULT_PIPELINE_YAML_TAG,
) -> OrderedDict:
    """
   Given the content of a YAML file, finds and returns
   the specified YAML collection.

   Args:
       yaml_content: content of a YAML file as an ordered
           dictionary
       yaml_collection_tag: tag of the collection to be
           read

   Returns:
       The YAML collection extracted out of the YAML content
           as an ordered dictionary
   """
    if yaml_content is None:
        return OrderedDictColl()
    if yaml_collection_tag not in yaml_content:
        return OrderedDictColl()
    return yaml_content[yaml_collection_tag]


def get_unique_list(list_of_data: Optional[List] = None) -> Optional[List]:
    """
   Converts a given list to a list that only contains
   unique elements. Eliminates duplicate elements by
   converting to a set and back to a list.

   Args:
       list_of_data: list of elements

   Returns:
       list containing only unique elements, or None
   """

    if not list_of_data:
        return None
    return list(set(list_of_data))


def set_cli_color(text_content: Text = None, color: str = TermColor.NONE_C):
    """
   wraps inbound string instances with ASCII
   color codes and returns a colored string
   that can be printed on the terminals

   Args:
       text_content: string instance to wrap
       color: color code to be visible on
           terminals

   Returns:
       wrapped string with the specified color
           that is ready to be printed on a
           terminal
   """
    return color + str(text_content) + TermColor.END_C


def update_sys_path(path_to_add: Text) -> NoReturn:
    """
   Appends a given path to the list of system
   paths. Can utilize this method to resolve
   import conflicts if packages or modules are
   being ignored at runtime in a specific
   location

   Args:
       path_to_add: path of the directory that
           that should be added to the system
           path list

   Returns:
       no return
   """
    sys.path.insert(0, path_to_add)


def series_to_json_serializable(series: Union[Dict, List]):
    if isinstance(series, dict):
        return {k: float(v) for k, v in series.items()}
    elif isinstance(series, list):
        return [float(v) for v in series]


def nlu_data_dir_exists(dir_path: Text) -> bool:
    if not os.path.exists(dir_path):
        return False

    data_list = get_data_files(paths=[dir_path], filter_predicate=is_nlu_file)
    if len(data_list) == 0:
        return False

    return True


def write_yaml_file(
        file_path: Text = None,
        content: CommentedMap = None,
        encoding: Text = Encoding.UTF8,
        mode: Text = FilePermission.WRITE,
        preserve_quotes: bool = True,
) -> NoReturn:
    try:
        if not file_path or not content:
            raise Exception()

        with open(file_path, encoding=encoding, mode=mode) as yaml_file:
            yml = yaml.YAML()
            yml.indent(sequence=4, offset=2)
            yml.preserve_quotes = preserve_quotes
            yaml.round_trip_dump(content, yaml_file)

    except Exception as e:
        raise YAMLFileWriteException(e)


def delete_file(
        file_path: Union[Text, List]
) -> NoReturn:
    if isinstance(file_path, str):
        if file_exists(file_path):
            os.remove(path=file_path)
    else:
        for file in file_path:
            delete_file(file_path=file)


def delete_dir(
        dir_path: Union[Text, List],
        force: bool = False
) -> NoReturn:
    if isinstance(dir_path, str):
        if dir_exists(dir_path=dir_path):
            if force:
                shutil.rmtree(path=dir_path)
            else:
                os.rmdir(path=dir_path)
    else:
        for dir_ in dir_path:
            delete_dir(dir_path=dir_)


def delete_top_level_files(
        dir_path: Union[Text, List],
        ext: List = None
) -> NoReturn:
    if isinstance(dir_path, str):
        all_files = get_existing_toplevel_file_list(dir_path=dir_path)
        filtered_files = list()
        for file in all_files:
            for extension in ext:
                if str.endswith(file, extension):
                    filtered_files.append(os.path.join(dir_path, file))
                else:
                    continue
        if filtered_files:
            delete_file(file_path=filtered_files)
    else:
        for dir_ in dir_path:
            delete_top_level_files(dir_path=dir_)


def get_dir_file_list(
        dir_path: Text = DEFAULT_MODEL_PATH,
        file_suffixes: List = MODEL_EXTENSIONS
) -> Optional[List]:
    file_paths = list()

    for (dir_path, dir_names, file_names) in os.walk(dir_path):
        if file_suffixes:
            file_paths += [file
                           for file
                           in file_names
                           if str(file).endswith(tuple(file_suffixes))]
        else:
            file_paths += [file for file in file_names]
    file_paths.reverse()
    return file_paths


# get the latest model from the list of trained models
def get_latest_model_name(models_path: Text = DEFAULT_MODEL_PATH) -> Text:
    """
    finds all models available in the model dir provided and
    selects the latest model using the timestamp. if no path is
    given, it uses the rasa default model dir to collect model
    names
    """

    model_list = get_dir_file_list(
        dir_path=models_path,
        file_suffixes=['.tar.gz'],
    )
    if not model_list:
        raise ModelNotFoundException(
            f"Could not find a compatible RASA model in the "
            f"specified  location. Make sure there is a valid "
            f"RASA model in `{models_path}`"
        )

    models_dict = {
        os.path.split(model_path)[-1]:
            int(''.join(
                list(re.findall(
                    RASA_288_MODEL_REGEX,
                    os.path.split(model_path)[-1]
                )[0])))
        for model_path in model_list
        if re.findall(
            RASA_288_MODEL_REGEX,
            os.path.split(model_path)[-1]
        )
    }

    latest_model = None
    max_timestamp = 0

    for model_name, timestamp in models_dict.items():
        if timestamp > max_timestamp:
            max_timestamp = timestamp
            latest_model = model_name

    logger.debug(f"Latest model found: {latest_model}")
    return latest_model


def dir_cleanup(dir_path: Text):
    try:
        if not dir_path:
            raise Exception("Invalid directory path")

        for path_ in Path(DEFAULT_TENSORBOARD_LOGDIR).iterdir():
            if path_.is_file():
                path_.unlink()
            elif path_.is_dir():
                shutil.rmtree(path_)
    except Exception as e:
        logger.exception("Exception occurred while cleaning up the "
                     f"specified directory: `{dir_path}`")
        raise InvalidDirectoryPathException(e)
