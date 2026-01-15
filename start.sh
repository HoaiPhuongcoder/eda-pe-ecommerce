#!/bin/sh
set -e

# Đợi Postgres sẵn sàng
echo "Waiting for database..."
until nc -z postgres 5432; do
  echo "Database postgres is unavailable - sleeping"
  sleep 1
done

echo "Connection to postgres succeeded!"
echo "Database is up - running migrations..."

# In ra để kiểm tra (che mật khẩu trong production)
echo "DATABASE_URL is set: ${DATABASE_URL:+yes}"

# Chạy migration
npx prisma migrate deploy

echo "Running seeds..."
npx prisma db seed 

echo "Starting application..."
exec node dist/main