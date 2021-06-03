#!/bin/bash
set -e
set -u

cd "$(dirname "$0")"

./prep_repo_for_deploy.sh

# TODO We have a stupid issue with releasing on a new platform
# Since backend uses shared stuff from frontend, frontend dependencies needs to be installed
# Otherwise backend deploy will fail on not finding date-fns
# This is only an issue on first deploy, because then frontend will have dependencies installed
# We currently solve this by deploying frontend first, as you can see below

./frontend/build_production.sh
mkdir -p /apps/nopestradamus/nextjs
sudo rsync -a ./frontend/. /apps/nopestradamus/nextjs

./backend/build_production.sh
mkdir -p /apps/nopestradamus/backend
sudo rsync -a ./backend/release/* /apps/nopestradamus/backend

pm2 restart nopestradamus-backend
pm2 restart nopestradamus-nextjs