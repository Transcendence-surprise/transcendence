FROM nginx:1.27-alpine

# Copy config
COPY nginx.conf /etc/nginx/nginx.conf

# Frontend build comes from volume, not COPY.

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
