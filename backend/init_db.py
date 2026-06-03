"""Backward-compatible CLI. Prefer: python -m app.db_init"""
from app.db_init import main

if __name__ == "__main__":
    raise SystemExit(main())
