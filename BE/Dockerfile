FROM ubuntu:20.04 AS base

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y software-properties-common && \
    add-apt-repository ppa:ondrej/php && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    nginx \
    curl \
    php7.3 \
    php7.3-fpm \
    php7.3-mysql \
    php7.3-gd \
    php7.3-xml \
    php7.3-curl \
    php7.3-mbstring \
    php-xml \
    php7.3-gd \
    php7.3-mbstring \
    php7.3-zip \
    php7.3-bcmath \
    unzip \
    && rm -rf /var/lib/apt/lists/*
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

COPY composer.json /app
COPY composer.lock /app
RUN composer install --no-interaction --no-scripts

COPY system-conf/nginx-conf/app.conf /etc/nginx/conf.d/app.conf
COPY system-conf/nginx-conf/nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/sites-enabled/default

COPY . /app

FROM base AS final

RUN chown -R www-data:www-data /app && \
    chmod -R 775 /app/storage

RUN php artisan key:generate && \
    php artisan config:clear

EXPOSE 80

CMD service php7.3-fpm start && nginx -g "daemon off;"

