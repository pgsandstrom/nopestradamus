#!/bin/bash
set -e
set -u

cd "$(dirname "$0")"

npm install --only=prod --legacy-peer-deps

npm run build