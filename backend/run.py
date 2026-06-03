from app import create_app

# Gunicorn entrypoint: gunicorn run:app
app = create_app(init_db=False)

if __name__ == "__main__":
    import os

    from app.config import Config
    from app.db_init import initialize_schema
    from app import db

    db_uri = Config.SQLALCHEMY_DATABASE_URI
    if db_uri.startswith("sqlite"):
        print("Database: SQLite (local dev)")
        print("  File:", db_uri.replace("sqlite:///", ""))
    else:
        print("Database: PostgreSQL")
        print("  URL:", db_uri.split("@")[-1] if "@" in db_uri else db_uri)

    with app.app_context():
        initialize_schema()

    port = int(os.environ.get("PORT", 5000))
    print(f"API: http://localhost:{port}")
    print(f"Health: http://localhost:{port}/health")
    app.run(host="0.0.0.0", port=port, debug=True)
