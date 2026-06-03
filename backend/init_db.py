"""Wait for PostgreSQL and create tables once (used by Docker entrypoint)."""
import sys
import time

from sqlalchemy import inspect, text
from sqlalchemy.exc import OperationalError

from app import create_app, db

MAX_RETRIES = 30
RETRY_DELAY = 2

# SERIAL sequences SQLAlchemy creates for each table
TABLE_SEQUENCES = [
    ("products", "products_id_seq"),
    ("customers", "customers_id_seq"),
    ("orders", "orders_id_seq"),
    ("order_items", "order_items_id_seq"),
]


def _is_postgres():
    return db.engine.dialect.name == "postgresql"


def _cleanup_orphaned_sequences():
    """
    Drop leftover SERIAL sequences when CREATE TABLE failed partway
    (e.g. multiple Gunicorn workers called create_all at the same time).
    """
    for table, sequence in TABLE_SEQUENCES:
        db.session.execute(
            text(
                f"""
                DO $body$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'public'
                          AND table_name = '{table}'
                    ) THEN
                        EXECUTE 'DROP SEQUENCE IF EXISTS {sequence} CASCADE';
                    END IF;
                END
                $body$
                """
            )
        )
    db.session.commit()


def _tables_ready():
    inspector = inspect(db.engine)
    existing = set(inspector.get_table_names())
    required = {table for table, _ in TABLE_SEQUENCES}
    return required.issubset(existing)


def initialize_schema():
    if _is_postgres():
        _cleanup_orphaned_sequences()

    try:
        db.create_all()
    except Exception as exc:
        if "already exists" not in str(exc).lower():
            raise
        db.session.rollback()
        if _is_postgres():
            _cleanup_orphaned_sequences()
        db.create_all()

    if not _tables_ready():
        raise RuntimeError("Database tables were not created successfully.")


def main():
    app = create_app(init_db=False)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with app.app_context():
                db.session.execute(text("SELECT 1"))
                db.session.commit()
                initialize_schema()
            print("Database connection OK — tables ready.")
            return 0
        except OperationalError as exc:
            print(f"Waiting for database ({attempt}/{MAX_RETRIES}): {exc}")
        except Exception as exc:
            print(f"Database init error ({attempt}/{MAX_RETRIES}): {exc}")
            db.session.rollback()
        time.sleep(RETRY_DELAY)

    print("Could not initialize the database.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
