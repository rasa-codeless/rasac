import logging
import sqlite3
from typing import NoReturn, Text, List

from rasa_codeless.shared.constants import TRAINING_QUEUE, TRAINING_QUEUE_TABLE
from dime_xai.utils.process_queue import kill_process_tree
from rasa_codeless.shared.exceptions.server import (
    ProcessQueueException,
    ProcessQueuePushException,
    ProcessQueuePullException,
    ProcessNotExistsException,
    MetadataRetrievalException,
    ProcessQueueUpdateException,
)

logger = logging.getLogger(__name__)


def create_in_memory_training_queue() -> NoReturn:
    try:
        with sqlite3.connect(TRAINING_QUEUE) as conn:
            conn.execute(f'DROP TABLE IF EXISTS {TRAINING_QUEUE_TABLE};')
            conn.execute(f'CREATE TABLE {TRAINING_QUEUE_TABLE} '
                         f'(request_id TEXT PRIMARY KEY, '
                         f'process_id INT NOT NULL, '
                         f'ttimestamp TIMESTAMP, '
                         f'metadata TEXT NOT NULL );')
            conn.commit()
            logger.debug('In-memory training queue was initialized')
    except Exception as e:
        raise ProcessQueueException(e)


def kill_training_process_tree(process_id: int, including_parent: bool = True) -> bool:
    kill_process_tree(process_id=process_id, including_parent=including_parent)
    return True


class TrainingQueue:
    def __init__(self):
        self.training_queue = TRAINING_QUEUE

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
            raise ProcessQueuePushException(e)

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
            raise ProcessQueueUpdateException(e)

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
            raise ProcessQueueException(e)

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
            raise ProcessQueuePullException(e)

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
            raise ProcessQueueException(e)

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
            raise ProcessQueueException(e)

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
            raise ProcessQueuePullException(e)

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
            raise ProcessQueuePullException(e)

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
            raise ProcessQueueUpdateException(e)
