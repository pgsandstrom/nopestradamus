#!/usr/bin/env bash
#
# Clone the production database into the local dev postgres.
#
#   scripts/clone-prod-db.sh                 dump prod, then restore it locally
#   scripts/clone-prod-db.sh --dump-only     only fetch a dump into .prod-dumps/
#   scripts/clone-prod-db.sh --restore-only  restore the newest dump already on disk
#   scripts/clone-prod-db.sh --restore-only --file .prod-dumps/<name>.sql.gz
#
# Needs an SSH key at ./id_rsa (gitignored) that logs into the prod host. Settings can be
# overridden per-machine in scripts/prod.env (gitignored, see scripts/prod.env.example).
#
# Nothing here ever writes to prod: the remote side runs pg_dump and nothing else.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

# ---- settings ---------------------------------------------------------------

# shellcheck source=/dev/null
[[ -f scripts/prod.env ]] && source scripts/prod.env

PROD_HOST="${PROD_HOST:-nopestradamus.com}"
PROD_USER="${PROD_USER:-root}"
PROD_SSH_KEY="${PROD_SSH_KEY:-$REPO/id_rsa}"
PROD_SSH_PORT="${PROD_SSH_PORT:-22}"
# Set to pin the remote container instead of auto-detecting the postgres one.
PROD_DB_CONTAINER="${PROD_DB_CONTAINER:-}"
DB_NAME="${DB_NAME:-nopestradamus}"
DB_USER="${DB_USER:-postgres}"
DUMP_DIR="${DUMP_DIR:-$REPO/.prod-dumps}"
KEEP_DUMPS="${KEEP_DUMPS:-5}"

LOCAL_COMPOSE=(docker compose -f "$REPO/docker-compose-dev.yml")

# ---- args -------------------------------------------------------------------

DO_DUMP=1
DO_RESTORE=1
DUMP_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dump-only) DO_RESTORE=0 ;;
    --restore-only) DO_DUMP=0 ;;
    --file) DUMP_FILE="$2"; shift ;;
    -h|--help) sed -n '2,14p' "${BASH_SOURCE[0]}" | sed 's/^#\s\?//'; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

step() { printf '\n\033[1m==> %s\033[0m\n' "$*" >&2; }
die() { printf '\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }

# ---- dump from prod ---------------------------------------------------------

if [[ $DO_DUMP -eq 1 ]]; then
  [[ -f "$PROD_SSH_KEY" ]] || die "no SSH key at $PROD_SSH_KEY
Put the prod private key there (it is gitignored) or set PROD_SSH_KEY in scripts/prod.env."

  # ssh refuses a key that the rest of the machine can read.
  if [[ "$(stat -c '%a' "$PROD_SSH_KEY")" != "600" ]]; then
    chmod 600 "$PROD_SSH_KEY"
  fi

  SSH=(ssh
    -i "$PROD_SSH_KEY"
    -p "$PROD_SSH_PORT"
    -o IdentitiesOnly=yes
    -o StrictHostKeyChecking=accept-new
    -o ConnectTimeout=15
    -o BatchMode=yes
    "$PROD_USER@$PROD_HOST")

  mkdir -p "$DUMP_DIR"
  DUMP_FILE="${DUMP_FILE:-$DUMP_DIR/prod-$(date +%Y%m%d-%H%M%S).sql.gz}"

  step "Dumping $DB_NAME from $PROD_USER@$PROD_HOST"

  # The remote script writes the gzipped dump to stdout and everything else to stderr, so the
  # whole transfer is one stream and the dump never lands on the prod disk. ssh joins its
  # arguments with spaces, so an unset container has to travel as the literal 'auto' rather
  # than as an empty argument that would disappear on the way.
  REMOTE_SCRIPT=$(cat <<'REMOTE'
set -euo pipefail
container="$1"; db="$2"; user="$3"

DOCKER=docker
if ! $DOCKER ps >/dev/null 2>&1; then
  DOCKER="sudo docker"
  $DOCKER ps >/dev/null 2>&1 || { echo "cannot talk to docker on the prod host" >&2; exit 1; }
fi

if [ "$container" = auto ]; then
  # The host runs several projects, each with its own postgres, so prefer the one whose
  # container name carries the database name (compose names it <project>-db-1) and only fall
  # back to "the postgres container" when there is exactly one to be unambiguous about.
  candidates=$($DOCKER ps --format '{{.ID}} {{.Image}} {{.Names}}' | awk '$2 ~ /postgres/ {print $1, $3}')
  container=$(echo "$candidates" | awk -v db="$db" '$2 ~ db {print $1; exit}')
  if [ -z "$container" ] && [ "$(echo "$candidates" | grep -c .)" = 1 ]; then
    container=$(echo "$candidates" | awk '{print $1}')
  fi
  if [ -z "$container" ]; then
    echo "no postgres container on the prod host matches '$db'. Running postgres containers:" >&2
    echo "$candidates" >&2
    echo "Set PROD_DB_CONTAINER in scripts/prod.env to pick one." >&2
    exit 1
  fi
fi

echo "remote: dumping from container $container" >&2
$DOCKER exec -i "$container" pg_dump -U "$user" -d "$db" --no-owner --no-privileges | gzip -6
REMOTE
  )

  if ! "${SSH[@]}" "bash -s -- '${PROD_DB_CONTAINER:-auto}' '$DB_NAME' '$DB_USER'" \
    >"$DUMP_FILE" <<<"$REMOTE_SCRIPT"; then
    rm -f "$DUMP_FILE"
    die "the remote dump failed (see the message above); nothing was written locally"
  fi

  gzip -t "$DUMP_FILE" 2>/dev/null || { rm -f "$DUMP_FILE"; die "the dump that came back is not valid gzip"; }
  [[ -s "$DUMP_FILE" ]] || { rm -f "$DUMP_FILE"; die "the dump that came back is empty"; }

  echo "    $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))" >&2

  # Keep the last few dumps, drop the rest.
  ls -1t "$DUMP_DIR"/prod-*.sql.gz 2>/dev/null | tail -n "+$((KEEP_DUMPS + 1))" | xargs -r rm -f
fi

if [[ $DO_RESTORE -eq 0 ]]; then
  step "Done (dump only)"
  echo "$DUMP_FILE"
  exit 0
fi

# ---- restore into the local dev postgres ------------------------------------

if [[ -z "$DUMP_FILE" ]]; then
  DUMP_FILE=$(ls -1t "$DUMP_DIR"/prod-*.sql.gz 2>/dev/null | head -1 || true)
  [[ -n "$DUMP_FILE" ]] || die "no dump in $DUMP_DIR to restore; run without --restore-only"
fi
[[ -f "$DUMP_FILE" ]] || die "no such dump: $DUMP_FILE"

step "Starting the local dev database"
"${LOCAL_COMPOSE[@]}" up -d >&2

LOCAL_DB=$("${LOCAL_COMPOSE[@]}" ps -q db)
[[ -n "$LOCAL_DB" ]] || die "the local dev postgres container is not running"

for _ in $(seq 30); do
  docker exec "$LOCAL_DB" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1 && break
  sleep 1
done
docker exec "$LOCAL_DB" pg_isready -U "$DB_USER" >/dev/null 2>&1 ||
  die "the local dev postgres never became ready"

# The restore drops the local database, so keep what is there now. It is a dev database and
# the backup is usually tiny, but it makes the drop below a recoverable mistake.
mkdir -p "$DUMP_DIR"
BACKUP="$DUMP_DIR/local-before-clone-$(date +%Y%m%d-%H%M%S).sql.gz"
step "Backing up the current local database first"
if docker exec -i "$LOCAL_DB" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-privileges 2>/dev/null |
  gzip -6 >"$BACKUP" && [[ -s "$BACKUP" ]]; then
  echo "    $BACKUP ($(du -h "$BACKUP" | cut -f1))" >&2
else
  rm -f "$BACKUP"
  echo "    nothing to back up (no local $DB_NAME yet)" >&2
fi
ls -1t "$DUMP_DIR"/local-before-clone-*.sql.gz 2>/dev/null | tail -n "+$((KEEP_DUMPS + 1))" | xargs -r rm -f

step "Restoring $(basename "$DUMP_FILE") into the local $DB_NAME"

# Recreate the database rather than restoring over it, so nothing from the old contents
# survives into the clone.
docker exec -i "$LOCAL_DB" psql -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 --quiet >/dev/null <<SQL
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
 WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
SQL

gunzip -c "$DUMP_FILE" |
  docker exec -i "$LOCAL_DB" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 --quiet >/dev/null

step "Local database now holds"
docker exec -i "$LOCAL_DB" psql -U "$DB_USER" -d "$DB_NAME" --quiet -c "
  SELECT 'mail' AS table, count(*) FROM mail
  UNION ALL SELECT 'prediction', count(*) FROM prediction
  UNION ALL SELECT 'creater', count(*) FROM creater
  UNION ALL SELECT 'participant', count(*) FROM participant;"
