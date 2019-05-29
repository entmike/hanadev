#!/bin/sh
echo "Starting Servers..."
mkdir -p /run/nginx
rm /etc/nginx/sites-enabled/default
echo "Starting nginx..."
nginx
echo "Building HANA CDS App HDI Container..."
cd /app/cdsapp/db
npm run start
cd ..
echo "Running HANA CDS App..."
npm run start
cd /app/backend
echo "Starting backend..."
npm run prod