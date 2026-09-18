# Nopestradamus

Service for long term predictions. Two processes: a Next.js app (App Router, React 19) and a Node
process running a cron job (`server-cron.ts`, run directly via type stripping, no build step).

Code layout and conventions are documented in `CLAUDE.md`.

## Development

```sh
corepack enable          # once per node install, puts pnpm on PATH
pnpm install
pnpm dev-database        # postgres in docker on 5432, then applies the migrations
pnpm dev
```

Every page reads from the database, so without a running postgres the app answers 500 — check
that first if `localhost:3000` is dead. `/prediction/create` is the one exception, and only for a
visitor with no session cookie, since the header looks one up when there is one.
Connection details can be overridden with `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`.

A `config.json` (see `config.example.json`) is needed for the admin console and a `privkey.pem`
(see `privkey.example.pem`) for sending mail. Neither is needed to build.

### On Windows, develop inside WSL2

Prod is Linux containers, so WSL keeps local and prod the same shape. Install the docker engine
into the distro (`docker.io` + `docker-compose-v2`), not Docker Desktop. Two traps:

- **Clone onto the Linux filesystem** (`~/code/nopestradamus`). Code on `/mnt/c/...` goes through
  the 9p bridge and Next's dev watcher crawls.
- **Install node inside the distro** (nvm). WSL inherits the Windows PATH, so a bare `node` may
  resolve to `/mnt/c/Program Files/nodejs/node` and put Windows binaries in a Linux
  `node_modules`. Check `which node` is not under `/mnt/c`. Don't copy `node_modules` over either.

## Database migrations

The schema lives in `db/migrations/*.sql` and is applied by `db/migrate.ts` beside them. It is a small
Flyway: a `schema_migration` table records every file that has run together with a checksum of
its contents, and only the files missing from that table are applied.

```sh
pnpm migrate             # apply anything pending to the dev database
```

In production it is the one-shot `migrate` compose service. The frontend and cron services wait
for it with `service_completed_successfully`, so `pnpm release` stops on a failed migration
instead of starting app code against a schema it does not know.

To add one, drop a `NNN-what-it-does.sql` next to the others and run `pnpm migrate`. A few things
are worth knowing before you do:

- **An applied migration is frozen.** Editing one changes its checksum, and the next run refuses
  rather than leaving this machine and production quietly disagreeing about what ran. Add another
  file instead.
- **The whole run is one transaction.** Postgres can roll back DDL, so a failure anywhere undoes
  every pending file and leaves the database on the last version that worked completely — there
  is no half-migrated state to repair by hand. The cost is that a statement which cannot run
  inside a transaction (`CREATE INDEX CONCURRENTLY`, say) needs its own arrangement.
- **`001-initial-schema.sql` uses `CREATE TABLE IF NOT EXISTS` and later ones should not.** It has
  to agree with a production database that already had those tables before any of this existed,
  so it is written to no-op there and to build the schema on an empty database. Everywhere else a
  migration that silently does nothing is a bug.
- Deleting a migration that has already run is an error, not an undo. There are no down
  migrations: reversing something is a new migration.

Before this, `db/database.sql` was mounted into the postgres container's
`/docker-entrypoint-initdb.d`. That only ever runs against an empty data directory, so it could
not touch the live database — the mount is gone and that file is now `001-initial-schema.sql`.

## Logging in

There are no passwords and no accounts to create. A prediction's creater and each of its
participants get a link mailed to them holding a secret hash, and that link is the login:

```
https://nopestradamus.com/prediction/PREDICTION-HASH#ROLE-HASH
```

The role hash sits in the **fragment**, which browsers never put on the wire. It reaches the
server exactly once, as the argument of the `logInWithHashAction` server action that
`components/session-negotiator.tsx` fires on load — so the secret stays out of access logs, out
of the `Referer` header of every link the page goes on to load, and out of whatever scanner the
recipient's mail provider points at the link. The action trades it for a row in the `session`
table, hands back a cookie holding that row's hash, and the fragment is wiped from the address
bar before the visitor can copy or bookmark it.

The identity a session carries is a mail address, not a prediction. What you may do on a given
prediction is decided by looking that address up against its creater and participant rows, so one
link logs you in everywhere that address appears — which is what the eventual login form and
"your bets" page will need. The flip side is worth stating plainly: a leaked link now exposes
every prediction that address is part of, not just the one it points at. Presenting a second link
simply replaces the session, so following someone else's link does not need a log out first.

Sessions last a month. Expiry is enforced on read, and the hourly cron job deletes the dead rows
afterwards. Logging out deletes the row, so the cookie cannot be replayed.

### Why there is a cover over the page while that happens

The server cannot see the fragment, so the HTML it sends for a secret link is the prediction as a
_stranger_ sees it — no accept buttons, "Not logged in" in the header. That is already painted by
the time React has hydrated and the login has come back, and the creater of a bet should never be
shown their own bet as an outsider, however briefly.

So `components/login-cover.tsx` covers the whole viewport, and the inline script in the root
layout raises it from `<head>` — synchronously, while the browser is still parsing, which is the
only moment early enough to beat the first paint. It is plain CSS keyed off a `data-logging-in`
attribute on `<html>`, because it has to work in the window before any JavaScript bundle exists.

`session-negotiator.tsx` is what lowers it again, and only on a real answer: a failed login takes
the cover down and says so in the header, and a successful one keeps it up through
`window.location.reload()`. The reload is deliberate — `router.refresh()` gives no signal for
"the right page has painted now", and taking the cover down a moment early is the exact flash all
of this exists to prevent. The script also lifts the cover itself after ten seconds, so a visitor
whose JavaScript never arrives is not left staring at it.

### The old links still work

Every mail sent before this used `/prediction/HASH/ROLE/ROLEHASH`, with the secret in the path.
A prediction's end mail can be years away and nothing is recallable, so that route still exists —
as a 307 to the new shape, nothing else. It drops the role from the URL because the hash alone
says which table it came from. Don't delete it, and don't make it permanent: a 308 would be
cached in browsers we cannot reach if this ever has to move again.

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

A clone brings prod's `schema_migration` table with it, so the local database arrives on
whatever version prod is on. If your checkout has migrations prod has not seen yet, run
`pnpm migrate` afterwards; if prod is _ahead_ of your checkout, `pnpm migrate` will say so
rather than guess.

The compose file pins `postgres:16`. Bumping that major needs a dump/restore of the `db` volume.

## Mail setup

Here I describe how to fix so the mail the program sends are not always marked as spam.

One Loopia gotcha that applies to everything below: `*.nopestradamus.com` is wildcarded to Loopia's
mail cluster (194.9.94.85 and .86), so _every_ subdomain resolves whether or not a record exists.
A lookup that returns an answer is not proof your record saved — compare it against a made-up name
like `probe-xyz.nopestradamus.com` and see if you get the same thing. An explicit record does
override the wildcard.

Loopia also pushes zone changes to its two nameservers on a lag, so `ns2.loopia.se` can already
serve a new record while `ns1.loopia.se` still returns nothing. Ask both before concluding that a
record did not save.

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

### DMARC

DMARC ties SPF and DKIM to the `From:` header the recipient actually sees. It passes only if one
of them passes _and_ its domain matches the From: domain. It is a TXT record on the subdomain
`_dmarc` — not on the apex, which is the easy mistake:

"v=DMARC1; p=reject"

`p=reject` tells receivers to refuse mail claiming to be this domain that does not authenticate.
That is safe here because the app is the only sender and it aligns on both counts: it signs with
`d=nopestradamus.com` and sends `From: no-reply@nopestradamus.com`.

There is deliberately no `rua=` reporting address. Aggregate reports are only worth having if
somebody reads them. The tradeoff is that there is no warning if a sender ever breaks alignment —
its mail is rejected outright rather than landing in spam. So if mail mysteriously stops arriving,
suspect this record.

In Loopia's editor this is the same two-step flow as any subdomain: create `_dmarc` (just that, it
appends the domain), then add a record under it. The type dropdown defaults to `A` and must be
changed to `TXT`.

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

### Monthly health mail

Mail here is cron-driven and mostly idle — a prediction's end mail can be years away — so a broken
mail path would otherwise go unnoticed until the moment it matters most. The cron process sends a
health mail at 05:00 on the first of every month, pinned to `Europe/Stockholm` because the
container runs UTC. It goes to `healthMailReceiver` in `config.json`; leave that key out and the
job quietly does nothing.

It reports prediction counts and how many predictions still have mail unsent, so a stuck queue
shows up as a number rather than staying invisible. Generating those numbers hits the database, so
a broken database means no mail rather than a cheerful lie.

The _absence_ of the mail is the actual signal, and nothing alerts you to that, so pair it with a
calendar reminder at the same time.

To send one without waiting for the first of the month:

```sh
docker compose exec cron node scripts/send-health-mail.ts
```

`pnpm health-mail` runs the same thing locally, but `sendMail` only logs outside production, so it
proves the queries and the body without posting anything.

### Mail troubleshooting

`postqueue -j` is a nice command to check if the mails are not being sent.
When running locally you will most likely get `connection refused` errors. I believe this is ISPs blocking outgoing mails.
