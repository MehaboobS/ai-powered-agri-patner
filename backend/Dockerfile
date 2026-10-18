# =========================================================
# Backend Dockerfile for FastAPI + Prisma ORM
# =========================================================
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies needed for Prisma CLI, PostgreSQL, and Image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy Prisma schema and pre-generate the Prisma Python client
COPY prisma/ ./prisma/
RUN prisma generate --schema=prisma/schema.prisma

# Copy application source code
COPY . .

# Expose API port
EXPOSE 8000

# Push Prisma schema migrations to PostgreSQL on startup, then start Uvicorn ASGI server
CMD ["sh", "-c", "prisma db push --schema=prisma/schema.prisma && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
