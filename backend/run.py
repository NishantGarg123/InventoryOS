from app import create_app, db
from app.config import Config

# Gunicorn imports this module — tables are created by init_db.py in Docker
app = create_app(init_db=False)

if __name__ == "__main__":
    db_uri = Config.SQLALCHEMY_DATABASE_URI
    if db_uri.startswith("sqlite"):
        print("Database: SQLite (local dev)")
        print("  File:", db_uri.replace("sqlite:///", ""))
    else:
        print("Database: PostgreSQL")
        print("  URL:", db_uri.split("@")[-1] if "@" in db_uri else db_uri)

    with app.app_context():
        db.create_all()

    print("API: http://localhost:5000")
    print("Health: http://localhost:5000/health")
    app.run(host="0.0.0.0", port=5000, debug=True)
