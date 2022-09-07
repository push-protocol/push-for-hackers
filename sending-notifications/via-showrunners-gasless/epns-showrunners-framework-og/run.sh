#!/bin/bash
# npm install
# npm run build
# cp .env build/.env
docker-compose up &
cd build && node app.js &
# EOF
