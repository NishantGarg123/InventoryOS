#!/bin/sh
set -e

echo "Initializing database..."
python init_db.py

PORT="${PORT:-5000}"
echo "Starting Gunicorn on port ${PORT}..."
exec gunicorn \
  --bind "0.0.0.0:${PORT}" \
  --workers 2 \
  --timeout 60 \
  --access-logfile - \
  --error-logfile - \
  run:app
