#!/bin/bash
set -e
# build image
docker build -t multi/mc_backend:latest -t multi/mc_backend:latest --file=Dockerfile .
# build container
docker stop prod_mc_backend || echo "Warning: Error when delete old docker images"
docker rm prod_mc_backend || echo "Warning: Error when delete old docker images"

docker-compose up -d

docker images -a | grep none | awk '{print $3}' | xargs -r docker rmi

docker exec prod_mc_backend bash -c "echo yes | php artisan migrate"

docker exec prod_mc_backend chmod 777 /var/run/php/php7.3-fpm.sock
docker exec prod_mc_backend php artisan storage:link || echo "Link already"
docker exec prod_mc_backend php artisan l5-swagger:generate
