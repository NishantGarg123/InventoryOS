FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Fail the image build if required files were not pushed to GitHub
RUN test -f app/db_init.py \
    && test -f app/models.py \
    && test -f app/__init__.py \
    && test -f run.py \
    && echo "All required backend files present."

EXPOSE 5000

# 1) Init DB once  2) Start API (Render sets PORT, e.g. 10000)
CMD ["sh", "-c", "python -m app.db_init && exec gunicorn --preload --bind 0.0.0.0:${PORT:-5000} --workers 2 --timeout 120 --access-logfile - --error-logfile - run:app"]
