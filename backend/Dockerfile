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

# Fix Windows CRLF if present; ensure entrypoint is executable
RUN sed -i 's/\r$//' entrypoint.sh 2>/dev/null || true \
    && chmod +x entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["sh", "/app/entrypoint.sh"]
