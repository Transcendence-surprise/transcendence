#!/bin/sh
set -e

echo "Starting nginx with NODE_ENV=${NODE_ENV}"

# Select config based on NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
    cp /etc/nginx/nginx-prod.conf /etc/nginx/nginx.conf
else
    cp /etc/nginx/nginx-dev.conf /etc/nginx/nginx.conf
fi

# Test configuration
nginx -t

# Start nginx
exec nginx -g 'daemon off;'
