---
name: clone-prod-db
description: Clone the production database into the local dev postgres. Use when the user says "clone the prod database", "pull prod data down", "refresh my local db from prod", or asks to debug against real data.
---

# Clone the prod database

Run this and report the result. It takes under a minute; do not plan, explore, or ask
questions first.

```sh
pnpm clone-prod-db
```

That dumps `nopestradamus` from the postgres container on the prod host over SSH, drops and
recreates the local dev database, and restores the dump into it. It prints the row counts per
table at the end — relay those.

Nothing in the script writes to prod: the remote side runs `pg_dump` and nothing else.

## Variants

| Ask                              | Command                                           |
| -------------------------------- | ------------------------------------------------- |
| just fetch a dump, don't restore | `pnpm clone-prod-db --dump-only`                  |
| restore the dump already on disk | `pnpm clone-prod-db --restore-only`               |
| restore one specific dump        | `pnpm clone-prod-db --restore-only --file <path>` |

Dumps land in `.prod-dumps/` (gitignored), newest five kept. The local database is dumped to
`.prod-dumps/local-before-clone-*.sql.gz` before it is dropped, so an unwanted clone is
recoverable with `--restore-only --file` on that backup.

## When it fails

- **`no SSH key at ...`** — the prod private key is not at `./id_rsa`. Ask the user to put it
  there; it is gitignored. Don't try to find or generate one.
- **`Permission denied (publickey)`** — the key is there but not authorised on the host. Ask
  the user to check it against the prod host's `authorized_keys`. Don't retry with other keys.
- **`no running postgres container on the prod host`** — prod's compose stack is down. Say so;
  restarting prod is the user's call, not a drive-by fix.
- **`the local dev postgres never became ready`** — docker is not running locally.
  Starting it is `pnpm dev-database`.

Host, user and key path are overridable in `scripts/prod.env` (gitignored, template at
`scripts/prod.env.example`).

## Afterwards

The local database now holds real user email addresses. Don't run the cron process
(`pnpm cron`) against it without saying so first — it sends mail to whatever it finds.
