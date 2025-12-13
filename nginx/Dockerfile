FROM nginx:1.27.3-alpine

# Copy both config files
COPY conf/nginx-prod.conf /etc/nginx/nginx-prod.conf
COPY conf/nginx-dev.conf  /etc/nginx/nginx-dev.conf

# Copy entrypoint script
COPY nginx-entrypoint.sh /nginx-entrypoint.sh
RUN chmod +x /nginx-entrypoint.sh

# Frontend build comes from volume, not COPY.

EXPOSE 80 443

ENTRYPOINT ["/nginx-entrypoint.sh"]
