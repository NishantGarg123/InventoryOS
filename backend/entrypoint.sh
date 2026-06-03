#!/bin/sh
# Optional local helper (Dockerfile uses CMD above; this file is not required on Render)
set -e
python init_db.py
exec gunicorn --bind "0.0.0.0:${PORT:-5000}" --workers 2 --timeout 60 run:app
