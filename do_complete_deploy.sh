#!/bin/bash
set -e
set -u

cd "$(dirname "$0")"

./prep_repo_for_deploy.sh

./backend/build_production.sh
mkdir -p /apps/nopestradamus/backend
sudo rsync -a ./backend/release/* /apps/nopestradamus/backend

./frontend/build_production.sh
mkdir -p /apps/nopestradamus/nextjs
sudo rsync -a ./frontend/. /apps/nopestradamus

pm2 restart nopestradamus-backend
pm2 restart nopestradamus-nextjs