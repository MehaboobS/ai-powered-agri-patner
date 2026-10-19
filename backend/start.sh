#!/bin/sh
set -e

echo "==> Starting Bharath Krishi Backend Service..."

# 1. Attempt Prisma DB schema sync if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
    echo "==> Synchronizing Prisma schema with PostgreSQL database..."
    MAX_RETRIES=5
    RETRY_COUNT=0
    until prisma db push --schema=prisma/schema.prisma --accept-data-loss || [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; do
        RETRY_COUNT=$((RETRY_COUNT+1))
        echo "==> Database not ready yet. Retrying schema sync in 3s ($RETRY_COUNT/$MAX_RETRIES)..."
        sleep 3
    done

    if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
        echo "WARNING: prisma db push failed after $MAX_RETRIES attempts. Starting app anyway to allow container boot and health checks..."
    else
        echo "==> Prisma schema successfully synchronized with PostgreSQL database!"
    fi
else
    echo "NOTICE: DATABASE_URL not detected. Skipping db push..."
fi

# 2. Launch FastAPI with Uvicorn
PORT_TO_USE="${PORT:-8000}"
echo "==> Starting Uvicorn on 0.0.0.0:${PORT_TO_USE}..."
exec uvicorn main:app --host 0.0.0.0 --port "$PORT_TO_USE" --proxy-headers --forwarded-allow-ips='*'
