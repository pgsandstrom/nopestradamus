#!/bin/bash
set -e
set -u

cd "$(dirname "$0")"

./prep_repo_for_deploy.sh

./backend/build_production.sh

sudo rsync -a ./backend/release/* /apps/nopestradamus/backend

./frontend//build_production.sh

sudo rsync -a ./frontend/release/* /apps/nopestradamus/frontend

pm2 restart nopestradamus-backend
