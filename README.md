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

One Loopia gotcha that applies to everything below: `*.nopestradamus.com` is wildcarded to Loopia's
mail cluster (194.9.94.85 and .86), so _every_ subdomain resolves whether or not a record exists.
A lookup that returns an answer is not proof your record saved — compare it against a made-up name
like `probe-xyz.nopestradamus.com` and see if you get the same thing. An explicit record does
override the wildcard.

### SPF

SPF is some ancient security thing. It can be setup simply by adding stuff to the dns record.
It lists the IPs allowed to send mail for the domain. For nopestradamus it is a TXT record on the
apex:

"v=spf1 ip4:167.99.242.238 include:spf.loopia.se -all"

167.99.242.238 is the droplet running postfix, which is what actually sends. The include covers
Loopia's outgoing servers, for anything sent by hand from webmail as @nopestradamus.com. Use the
include rather than listing those IPs — `smtp.outgoing.loopia.se` is 21 different addresses and
pinning one of them means the other 20 fail.

There must be exactly one `v=spf1` record on the apex. Two is a permerror for everything.

### DKIM

DKIM is the modern cool thing, but messy to set up. I eventually just used this tool: https://dkimcore.org/tools/keys.html
But yeah, it feels a bit weird to generate private keys on some website...
Then I just added to private key to the privkey.pem file that is referenced in the project.
Then I added the following to a DNS record:
v=DKIM1;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOSKvTJpIe52Ow3ytinX5W1Mg7S10va8QY3wIhV5IY1x1woRbH+wM2Oa++3Cl60GPni7GJkIjnrusbgWTeEB3oy2q9bVbHqWfaDKsmrrdWr9QDAI+zJR1J2gwh9zowXYVC2yQFXW9UIjkB2oguFB2ZZ9c3jbbcz11//15tdqTRawIDAQAB

There is some weirdness about adding this DNS record. It belongs to the subdomain hej.\_domainkey.nopestradamus.com and when I send the mails I specify the keySelector 'hej'. I dont fully understand that. But whatever.

### Reverse DNS

Receivers do a PTR lookup on the IP that connects to them. With no PTR, mail-tester reports
"Delivered to internal network by a host with no rDNS", which was the single biggest deduction
here.

The confusing part is that this record is **not** set at Loopia. Loopia is the registrar and hosts
the inbound mail, but the sending IP belongs to DigitalOcean, and reverse DNS is controlled by
whoever owns the IP block — `ns1.digitalocean.com` is authoritative for it. No record you add in
Loopia's editor can fix it.

DigitalOcean derives the PTR from the droplet's _name_, so the fix was renaming the droplet to
`nopestradamus.com`. The apex A record already points back at that droplet, so forward and reverse
agree, which is what receivers check. postfix already uses `myhostname = nopestradamus.com` (see
the docker files), so the HELO matches as well — no redeploy was needed.

Check it with:

```sh
python3 -c "import socket;print(socket.gethostbyaddr('167.99.242.238'))"
```

Negative DNS answers are cached for 30 minutes, so after the rename this keeps failing for a while
before it suddenly works. Don't spend mail-tester runs during that window.

If it ever comes back, check whether the droplet has IPv6 enabled: postfix will happily send over
IPv6, and that address needs its own PTR. There is no AAAA record today, so this is not currently
a problem.

### validate mail setup

Finally, when you receive a mail in for example gmail you can click 'show origin' to see if SPF and DKIM was accepted.
This tool is great for testing how correct the mail is: https://www.mail-tester.com
Every run needs a fresh test address, so grab a new one instead of reloading an old result.

### Program to send the mails

You need to install postfix. Check out the docker files for that stuff.

### Mail troubleshooting

`postqueue -j` is a nice command to check if the mails are not being sent.
When running locally you will most likely get `connection refused` errors. I believe this is ISPs blocking outgoing mails.

## Known issues

Deliberately left alone during the modernization, since they are behaviour changes rather than
cleanups:

- `db/database.sql` has no index on the `prediction_hash` columns that every lookup joins on.
