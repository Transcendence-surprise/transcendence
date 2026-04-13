# Stage 1: Build ModSecurity + nginx connector module + download OWASP CRS
FROM nginx:1.27.3 AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ca-certificates \
    wget \
    build-essential \
    automake \
    autoconf \
    libtool \
    pkgconf \
    libpcre3-dev \
    libpcre2-dev \
    zlib1g-dev \
    libssl-dev \
    libxml2-dev \
    libyajl-dev \
    liblmdb-dev \
    libcurl4-openssl-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt

# Build ModSecurity v3 library
RUN git clone --depth 1 --branch v3/master \
    https://github.com/SpiderLabs/ModSecurity.git \
  && cd ModSecurity \
  && git submodule init \
  && git submodule update \
  && ./build.sh \
  && ./configure --prefix=/usr/local \
  && make -j"$(nproc)" \
  && make install

# Build ModSecurity-nginx connector (must match runtime nginx version)
RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git \
  && wget -O nginx.tar.gz https://nginx.org/download/nginx-1.27.3.tar.gz \
  && tar -xzf nginx.tar.gz \
  && cd nginx-1.27.3 \
  && ./configure --with-compat --add-dynamic-module=/opt/ModSecurity-nginx \
  && make modules

# Download OWASP Core Rule Set v4
RUN wget -O /opt/crs.tar.gz \
    https://github.com/coreruleset/coreruleset/archive/refs/tags/v4.3.0.tar.gz \
  && tar -xzf /opt/crs.tar.gz -C /opt \
  && mv /opt/coreruleset-4.3.0 /opt/coreruleset

# Stage 2: Runtime image
FROM nginx:1.27.3

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpcre3 \
    libpcre2-8-0 \
    libxml2 \
    libyajl2 \
    liblmdb0 \
    libcurl4 \
  && rm -rf /var/lib/apt/lists/*

# ModSecurity shared library + nginx dynamic module
COPY --from=builder /usr/local/lib/libmodsecurity.so* /usr/local/lib/
COPY --from=builder /opt/nginx-1.27.3/objs/ngx_http_modsecurity_module.so \
     /etc/nginx/modules/

# OWASP CRS rules and data files
COPY --from=builder /opt/coreruleset/rules/ /etc/nginx/modsecurity/crs/rules/
COPY --from=builder /opt/coreruleset/crs-setup.conf.example \
     /etc/nginx/modsecurity/crs/crs-setup.conf

# nginx and ModSecurity configs
COPY conf/nginx-prod.conf /etc/nginx/nginx-prod.conf
COPY conf/nginx-dev.conf  /etc/nginx/nginx-dev.conf
COPY modsecurity/         /etc/nginx/modsecurity/

RUN mkdir -p /var/log/modsecurity /tmp/modsecurity && ldconfig

COPY nginx-entrypoint.sh /nginx-entrypoint.sh
RUN chmod +x /nginx-entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/nginx-entrypoint.sh"]
