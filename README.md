# Nopestradamus

Service for long term predictions. Two processes: a Next.js app (App Router, React 19) and a Node
process running a cron job (`server-cron.ts`, run directly via type stripping, no build step).

Code layout and conventions are documented in `CLAUDE.md`.

## Development

```sh
corepack enable          # once per node install, puts pnpm on PATH
pnpm install
pnpm dev-database        # postgres in docker, exposed on 5432
pnpm dev
```

Needs node 24+ and pnpm. Everything except `/prediction/create` reads from the database, so
without a running postgres the app answers 500 — check that first if `localhost:3000` is dead.
Connection details can be overridden with `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`.

A `config.json` (see `config.example.json`) is needed for the admin console and a `privkey.pem`
(see `privkey.example.pem`) for sending mail. Neither is needed to build.

Scripts: `validate` (typecheck + lint + test, same as pre-push), `lint`, `typecheck`, `test`,
`format`, `knip`, `cron`, `dev-session`.

### On Windows, develop inside WSL2

Prod is Linux containers, so WSL keeps local and prod the same shape. Install the docker engine
into the distro (`docker.io` + `docker-compose-v2`), not Docker Desktop. Two traps:

- **Clone onto the Linux filesystem** (`~/code/nopestradamus`). Code on `/mnt/c/...` goes through
  the 9p bridge and Next's dev watcher crawls.
- **Install node inside the distro** (nvm). WSL inherits the Windows PATH, so a bare `node` may
  resolve to `/mnt/c/Program Files/nodejs/node` and put Windows binaries in a Linux
  `node_modules`. Check `which node` is not under `/mnt/c`. Don't copy `node_modules` over either.

## Admin console

`/admin` asks for the `adminPassword` from `config.json` and then keeps a signed session cookie
for a week — nothing is reachable there without it. The cookie is signed with the password
itself, so changing it in `config.json` logs out every session that was signed with the old one.
Wrong guesses lock the login form for up to five minutes, and since there is only the one
password that lockout is for everybody, you included.

`/admin/predictions` lists every prediction, private and unaccepted ones included, and each row
opens everything stored about that bet.

`pnpm dev-session` writes a gitignored `.dev-session` cookie jar holding a week-long admin
session, so `curl -b .dev-session localhost:3000/admin` reads those pages without a browser. It
is signed with `adminPassword` just like a login, so treat it like `config.json`.

## Cloning the prod database

To debug against real data:

```sh
pnpm clone-prod-db
```

It SSHes to the prod host, runs `pg_dump` inside the postgres container there, and restores the
result into the local dev postgres — dropping and recreating the local `nopestradamus` database
so nothing from the old contents survives. Nothing on the prod side is written to.

Requires the prod private key at `./id_rsa` (gitignored, and in `.dockerignore` so it never
reaches an image layer). Host, user and key path default to `root@nopestradamus.com` and
`./id_rsa`, and are overridable per-machine in `scripts/prod.env` (gitignored, template at
`scripts/prod.env.example`).

Dumps are kept in `.prod-dumps/` (gitignored), newest five. The local database is dumped to
`.prod-dumps/local-before-clone-*.sql.gz` before it is dropped, so an unwanted clone is
recoverable:

```sh
pnpm clone-prod-db --dump-only                      # fetch a dump, leave local alone
pnpm clone-prod-db --restore-only                   # restore the newest dump on disk
pnpm clone-prod-db --restore-only --file <path>     # restore one specific dump
```

The clone carries real subscriber email addresses, so don't point `pnpm cron` at it casually —
the scheduler mails whatever it finds.

The compose file pins `postgres:16`. Bumping that major needs a dump/restore of the `db` volume.

## Mail setup

Here I describe how to fix so the mail the program sends are not always marked as spam.

### SPF

SPF is some ancient security thing. It can be setup simply by adding stuff to the dns record.
For nopestradamus I added this to my DNS record, to allow mail from these IPs:
"v=spf1 ip4:138.197.184.62 ip4:93.188.3.35 include:nopestradamus.com -all"

### DKIM

DKIM is the modern cool thing, but messy to set up. I eventually just used this tool: https://dkimcore.org/tools/keys.html
But yeah, it feels a bit weird to generate private keys on some website...
Then I just added to private key to the privkey.pem file that is referenced in the project.
Then I added the following to a DNS record:
v=DKIM1;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOSKvTJpIe52Ow3ytinX5W1Mg7S10va8QY3wIhV5IY1x1woRbH+wM2Oa++3Cl60GPni7GJkIjnrusbgWTeEB3oy2q9bVbHqWfaDKsmrrdWr9QDAI+zJR1J2gwh9zowXYVC2yQFXW9UIjkB2oguFB2ZZ9c3jbbcz11//15tdqTRawIDAQAB

There is some weirdness about adding this DNS record. It belongs to the subdomain hej.\_domainkey.nopestradamus.com and when I send the mails I specify the keySelector 'hej'. I dont fully understand that. But whatever.

### validate mail setup

Finally, when you receive a mail in for example gmail you can click 'show origin' to see if SPF and DKIM was accepted.
This tool can be used to debug DKIM: https://www.dmarcanalyzer.com/dkim/dkim-check

This tool is even better, just use this: https://www.mail-tester.com
Use mail-tester and you can see that there is still some issue with reverse DNS lookup. Fix that someday, TODO.

### Program to send the mails

You need to install postfix. Check out the docker files for that stuff.

### Mail troubleshooting

`postqueue -j` is a nice command to check if the mails are not being sent.
When running locally you will most likely get `connection refused` errors. I believe this is ISPs blocking outgoing mails.

## Known issues

Deliberately left alone during the modernization, since they are behaviour changes rather than
cleanups:

- `db/database.sql` has no index on the `prediction_hash` columns that every lookup joins on.
