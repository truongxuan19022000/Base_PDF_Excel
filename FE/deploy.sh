#!/bin/bash
set -e
# build image
yarn install
yarn build
docker build -t multi/mc_frontend:latest -t multi/mc_frontend:latest --file=Dockerfile .
# build container
docker stop prod_mc_frontend || echo "Warning: Error when delete old docker images"
docker rm prod_mc_frontend || echo "Warning: Error when delete old docker images"
docker images -a | grep none | awk '{print $3}' | xargs -r docker rmi

docker-compose up -d
