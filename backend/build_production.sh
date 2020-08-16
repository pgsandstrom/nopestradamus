#!/bin/bash
set -e
set -u

cd "$(dirname "$0")"

npm install --only=prod

rm -rf ./release
mkdir ./release

npm run build
mv dist release/dist
cp -r ./node_modules ./release/
cp pm2-prod.json ./release/pm2.json

