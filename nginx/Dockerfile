# FROM nginx:1.27.3 AS builder

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     git \
#     ca-certificates \
#     curl \
#     wget \
#     build-essential \
#     automake \
#     autoconf \
#     libtool \
#     pkgconf \
#     libpcre3-dev \
#     libpcre2-dev \
#     zlib1g-dev \
#     libssl-dev \
#     libxml2-dev \
#     libyajl-dev \
#     liblmdb-dev \
#     libgeoip-dev \
#     libmaxminddb-dev \
#     libcurl4-openssl-dev \
#   && rm -rf /var/lib/apt/lists/*

# WORKDIR /opt

# # Build ModSecurity library
# RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity.git \
#   && cd ModSecurity \
#   && git submodule init \
#   && git submodule update \
#   && ./build.sh \
#   && ./configure --prefix=/usr/local \
#   && make -j"$(nproc)" \
#   && make install

# # Build ModSecurity-nginx connector module
# RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

# RUN wget -O nginx.tar.gz http://nginx.org/download/nginx-1.27.3.tar.gz \
#   && tar -xzf nginx.tar.gz \
#   && cd nginx-1.27.3 \
#   && ./configure --with-compat --add-dynamic-module=/opt/ModSecurity-nginx \
#   && make modules

# FROM nginx:1.27.3

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     libpcre3 \
#     libpcre2-8-0 \
#     libxml2 \
#     libyajl2 \
#     liblmdb0 \
#     libgeoip1 \
#     libmaxminddb0 \
#     libcurl4 \
#   && rm -rf /var/lib/apt/lists/*

# COPY --from=builder /usr/local/lib/libmodsecurity.so* /usr/local/lib/
# COPY --from=builder /opt/nginx-1.27.3/objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

# # Copy both config files
# COPY conf/nginx-prod.conf /etc/nginx/nginx-prod.conf
# COPY conf/nginx-dev.conf  /etc/nginx/nginx-dev.conf

# # ModSecurity config
# COPY modsecurity/ /etc/nginx/modsecurity/
# RUN mkdir -p /var/log/modsecurity && ldconfig

# # Copy entrypoint script
# COPY nginx-entrypoint.sh /nginx-entrypoint.sh
# RUN chmod +x /nginx-entrypoint.sh

# # Frontend build comes from volume, not COPY.

# EXPOSE 80 443

# ENTRYPOINT ["/nginx-entrypoint.sh"]


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
