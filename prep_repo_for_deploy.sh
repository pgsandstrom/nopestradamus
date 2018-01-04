#!/bin/bash
set -e
set -u

git checkout .
git fetch
git rebase
chmod -R 774 *

