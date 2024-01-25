# FROM node:16 as builder
# COPY . /app
# WORKDIR /app
# RUN yarn install
# RUN yarn build

FROM ubuntu:20.04

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y software-properties-common && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY ./build /app

COPY system-conf/nginx-conf/app.conf /etc/nginx/conf.d/app.conf
COPY system-conf/nginx-conf/nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/sites-enabled/default

EXPOSE 80

CMD nginx -g "daemon off;"
