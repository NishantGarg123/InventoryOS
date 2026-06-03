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

EXPOSE 5000

# ENTRYPOINT ["sh", "/app/entrypoint.sh"]
# CMD ["gunicorn", "run:app", "--bind", "0.0.0.0:10000"]

# No entrypoint.sh required — works even if that file was not pushed to GitHub
CMD ["sh", "-c", "python init_db.py && exec gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 2 --timeout 60 --access-logfile - --error-logfile - run:app"]
