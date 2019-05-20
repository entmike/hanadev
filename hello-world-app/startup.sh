#!/bin/sh
echo "Starting Servers..."
mkdir -p /run/nginx
rm /etc/nginx/sites-enabled/default
echo "Starting nginx..."
nginx
cd /app/backend
echo "Starting backend..."
npm run prod