import os


def _sqlite_path():
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    instance_dir = os.path.join(base, "instance")
    os.makedirs(instance_dir, exist_ok=True)
    db_file = os.path.join(instance_dir, "inventory.db")
    return "sqlite:///" + db_file.replace("\\", "/")


def _database_url():
    if os.environ.get("USE_SQLITE", "").lower() in ("1", "true", "yes"):
        return _sqlite_path()

    url = os.environ.get("DATABASE_URL")

    # Local dev: no DATABASE_URL → SQLite (no PostgreSQL install needed)
    if not url:
        return _sqlite_path()

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    if url.startswith("postgresql://") and "+psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)

    return url


class Config:
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
