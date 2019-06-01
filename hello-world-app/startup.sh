#!/bin/sh
echo "Starting Nginx..."
mkdir -p /run/nginx
rm /etc/nginx/sites-enabled/default
nginx

echo "Running Admin Module..."
cd /app/admin
npm run start &

echo "Starting backend..."
cd /app/backend
npm run prod