import logging
import sqlite3
from typing import NoReturn, Text, List

import psutil

from rasa_codeless.shared.constants import (
    TRAINING_QUEUE,
    TRAINING_QUEUE_TABLE,
)
from rasa_codeless.shared.exceptions.server import (
    TrainingQueueException,
    TrainingQueuePushException,
    TrainingQueuePullException,
    ProcessNotExistsException,
    MetadataRetrievalException,
    TrainingQueueUpdateException,
    ProcessTerminationException,
)

logger = logging.getLogger(__name__)


def create_in_memory_training_queue(data_source_path: Text = TRAINING_QUEUE) -> NoReturn:
    try:
        with sqlite3.connect(data_source_path) as conn:
            conn.execute(f'DROP TABLE IF EXISTS {TRAINING_QUEUE_TABLE};')
            conn.execute(f'CREATE TABLE {TRAINING_QUEUE_TABLE} '
                         f'(request_id TEXT PRIMARY KEY, '
                         f'process_id INT NOT NULL, '
                         f'ttimestamp TIMESTAMP, '
                         f'metadata TEXT NOT NULL );')
            conn.commit()
            logger.debug('In-memory training queue was initialized')
    except Exception as e:
        raise TrainingQueueException(e)


def kill_process_tree(process_id: int, including_parent: bool = True) -> bool:
    try:
        parent = psutil.Process(process_id)
        children = parent.children(recursive=True)
        for child in children:
            child.kill()

        # disabled to avoid already killed exception
        # gone, still_alive = psutil.wait_procs(children, timeout=5)

        if including_parent:
            parent.kill()
            parent.wait(5)
        return True
    except Exception as e:
        raise ProcessTerminationException(e)


def kill_training_process_tree(process_id: int, including_parent: bool = True) -> bool:
    kill_process_tree(process_id=process_id, including_parent=including_parent)
    return True


class TrainingQueue:
    def __init__(self, data_source_path: Text) -> NoReturn:
        if not data_source_path:
            logger.warning("No specific data source has been specified "
                           "to initialize the training queue. Falling back to "
                           "the default source path which is root")
            self.training_queue = TRAINING_QUEUE
        else:
            self.training_queue = data_source_path

    def in_memory_training_queue(self) -> Text:
        return self.training_queue

    def push(
            self,
            process_id: int,
            request_id: Text,
            timestamp: float,
            metadata: Text,
    ) -> bool:
        try:
            training_q = self.training_queue
            with sqlite3.connect(training_q) as conn:
                conn.row_factory = sqlite3.Row
                conn.execute(
                    f'INSERT INTO {TRAINING_QUEUE_TABLE} VALUES (?, ?, ?, ?)',
                    (request_id, process_id, timestamp, metadata)
                )
                conn.commit()
            return True
        except Exception as e:
            raise TrainingQueuePushException(e)

    def update_pid(
            self,
            process_id: int,
            request_id: Text,
            timestamp: float,
    ) -> bool:
        try:
            training_q = self.training_queue
            with sqlite3.connect(training_q) as conn:
                conn.row_factory = sqlite3.Row
                conn.execute(
                    f'UPDATE {TRAINING_QUEUE_TABLE} SET process_id = ?, ttimestamp = ? WHERE request_id = ?',
                    (process_id, timestamp, request_id)
                )
                conn.commit()
            return True
        except Exception as e:
            raise TrainingQueueUpdateException(e)

    def remove(
            self,
            request_id: Text
    ) -> bool:
        try:
            training_q = self.training_queue
            with sqlite3.connect(training_q) as conn:
                conn.row_factory = sqlite3.Row
                conn.execute(
                    f"DELETE FROM {TRAINING_QUEUE_TABLE} WHERE request_id = ?",
                    (request_id,)
                )
                conn.commit()
            return True
        except Exception as e:
            raise TrainingQueueException(e)

    def get_pid(
            self,
            request_id: Text
    ) -> int:
        try:
            training_q = self.training_queue
            with sqlite3.connect(training_q) as conn:
                conn.row_factory = sqlite3.Row
                process = conn.execute(
                    f"SELECT process_id FROM {TRAINING_QUEUE_TABLE} WHERE request_id = ?",
                    (request_id,)
                ).fetchone()
                conn.commit()

            if not process:
                raise ProcessNotExistsException()
            else:
                return process['process_id']
        except Exception as e:
            raise TrainingQueuePullException(e)

    def check_existence(
            self,
            request_id: Text
    ) -> bool:
        try:
            training_q = self.training_queue
            with sqlite3.connect(training_q) as conn:
                conn.row_factory = sqlite3.Row
                process_id = conn.execute(
                    f"SELECT process_id FROM {TRAINING_QUEUE_TABLE} WHERE request_id = ?",
                    (request_id,)
                ).fetchone()
                conn.commit()

            if process_id:
                return True
            else:
                return False
        except Exception as e:
            raise TrainingQueueException(e)

    def purge(
            self,
    ) -> bool:
        try:
            training_q = self.training_queue
            with sqlite3.connect(training_q) as conn:
                conn.row_factory = sqlite3.Row
                conn.execute(
                    f"DELETE FROM {TRAINING_QUEUE_TABLE}"
                )
                conn.commit()
                return True
        except Exception as e:
            raise TrainingQueueException(e)

    def inspect(
            self,
    ) -> List:
        try:
            training_q = self.training_queue
            with sqlite3.connect(training_q) as conn:
                conn.row_factory = sqlite3.Row
                current_training_queue = conn.execute(
                    f"SELECT * FROM {TRAINING_QUEUE_TABLE}"
                ).fetchall()
                conn.commit()
            return current_training_queue
        except Exception as e:
            raise TrainingQueuePullException(e)

    def get_metadata(
            self,
            request_id: Text
    ) -> Text:
        try:
            training_q = self.training_queue
            with sqlite3.connect(training_q) as conn:
                conn.row_factory = sqlite3.Row
                metadata_row = conn.execute(
                    f"SELECT metadata FROM {TRAINING_QUEUE_TABLE} WHERE request_id = ?",
                    (request_id,)
                ).fetchone()
                conn.commit()

            if not metadata_row:
                raise MetadataRetrievalException()
            else:
                return metadata_row['metadata']
        except Exception as e:
            raise TrainingQueuePullException(e)

    def update_metadata(
            self,
            request_id: Text,
            metadata: Text,
    ) -> bool:
        try:
            training_q = self.training_queue
            with sqlite3.connect(training_q) as conn:
                conn.row_factory = sqlite3.Row
                conn.execute(
                    f'UPDATE {TRAINING_QUEUE_TABLE} SET metadata = ? WHERE request_id = ?',
                    (metadata, request_id)
                )
                conn.commit()
            return True
        except Exception as e:
            raise TrainingQueueUpdateException(e)
