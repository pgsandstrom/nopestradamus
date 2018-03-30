#!/bin/bash
set -e
set -u

cd "$(dirname "$0")"

npm install

rm -rf ./release
mkdir ./release

npm run prod

cp -r ./assets ./release/
cp -r ./img ./release/
cp ./index.html ./release/
#cp ./favicon.png ./release/

sed -i 's/bundle_dev.js/bundle_prod.js/' ./release/index.html

# cache busting to force reload of our bundle
TIMESTAMP=$(date +"%Y-%m-%d_%T")
sed -i "s/INSERT_CACHE_BUSTING_HERE/$TIMESTAMP/" ./release/index.html
