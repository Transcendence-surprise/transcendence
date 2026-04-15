#!/bin/sh
set -e

echo "Starting nginx with NODE_ENV=${NODE_ENV}"

if [ "$NODE_ENV" = "production" ]; then
    cp /etc/nginx/nginx-prod.conf /etc/nginx/nginx.conf
    # Blocking mode: matched requests are denied with 403
    sed -i 's/^SecRuleEngine.*/SecRuleEngine On/' /etc/nginx/modsecurity/modsecurity.conf
else
    cp /etc/nginx/nginx-dev.conf /etc/nginx/nginx.conf
    # Detection-only mode: violations are logged but never blocked
    sed -i 's/^SecRuleEngine.*/SecRuleEngine DetectionOnly/' /etc/nginx/modsecurity/modsecurity.conf
fi

nginx -t

exec nginx -g 'daemon off;'
