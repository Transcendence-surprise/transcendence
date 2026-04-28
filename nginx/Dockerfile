ARG MODSEC=true

FROM nginx:latest AS builder

ARG MODSEC

WORKDIR /opt

RUN if [ "$MODSEC" = "true" ]; then \
      apt-get update && apt-get install -y --no-install-recommends \
        git ca-certificates wget build-essential automake autoconf libtool pkgconf \
        libpcre2-dev zlib1g-dev libssl-dev libxml2-dev libyajl-dev liblmdb-dev \
        libcurl4-openssl-dev \
      && rm -rf /var/lib/apt/lists/* \
      && git clone --depth 1 --recurse-submodules --shallow-submodules \
           https://github.com/SpiderLabs/ModSecurity.git \
      && cd ModSecurity \
      && ./build.sh \
      && ./configure --prefix=/usr/local \
      && make -j"$(nproc)" \
      && make install \
      && cd /opt \
      && git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git \
      && NGINX_VERSION=$(nginx -v 2>&1 | sed 's/.*\///') \
      && wget -O nginx.tar.gz "http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" \
      && tar -xzf nginx.tar.gz \
      && cd "nginx-${NGINX_VERSION}" \
      && ./configure --with-compat --add-dynamic-module=/opt/ModSecurity-nginx \
      && make modules \
      && cp objs/ngx_http_modsecurity_module.so /opt/; \
    else \
      touch /usr/local/lib/libmodsecurity.so.placeholder \
      && touch /opt/ngx_http_modsecurity_module.so; \
    fi

FROM nginx:latest

ARG MODSEC

RUN apt-get update && apt-get install -y --no-install-recommends \
    libxml2 \
    libyajl2 \
    liblmdb0 \
    curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/lib/libmodsecurity.so* /usr/local/lib/
COPY --from=builder /opt/ngx_http_modsecurity_module.so /etc/nginx/modules/

# Copy both config files
COPY conf/nginx-prod.conf /etc/nginx/nginx-prod.conf
COPY conf/nginx-dev.conf  /etc/nginx/nginx-dev.conf

# ModSecurity config
COPY modsecurity/ /etc/nginx/modsecurity/
RUN mkdir -p /var/log/modsecurity && ldconfig

# Copy entrypoint script
COPY nginx-entrypoint.sh /nginx-entrypoint.sh
RUN chmod +x /nginx-entrypoint.sh

# Frontend build comes from volume, not COPY.

EXPOSE 80 443

ENTRYPOINT ["/nginx-entrypoint.sh"]
