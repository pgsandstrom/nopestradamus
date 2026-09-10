# Nopestradamus

Service for long term predictions.

## Technical notes

The project is two processes: one Next.js app, and one Node process which holds a cron job.

- **Next.js 16, App Router, React 19.** Pages are server components; mutations go through server
  actions in `app/actions.ts` and `app/admin/actions.ts`.
- **No UI framework.** Styling is plain CSS Modules with design tokens in `app/globals.css`.
- **The cron process needs no build step.** Node runs `server-cron.ts` directly via type stripping,
  which is why every relative import carries an explicit `.ts` extension and why `tsconfig.json`
  sets `erasableSyntaxOnly`.

### Layout

| Path          | What lives there                                                   |
| ------------- | ------------------------------------------------------------------ |
| `app/`        | routes, server actions, global styles                              |
| `components/` | shared UI, including the small `ui/` primitives that replaced MUI  |
| `server/`     | database access, mail rendering/sending, the scheduler             |
| `shared/`     | domain types and pure helpers used by both processes (unit tested) |
| `util/`       | config, env and the postgres pool                                  |

### The one URL that must not move

`POST /api/account/[hash]/block` stays a route handler rather than a server action, because mail
clients POST to it directly for RFC 8058 List-Unsubscribe one-click. It is referenced by the
`List-Unsubscribe` header in `server/mailer.ts`.

## Development

```sh
npm install
npm run dev-database   # postgres in docker, exposed on 5432
npm run dev
```

You need a `config.json` (see `config.example.json`) and a `privkey.pem` (see
`privkey.example.pem`) for the admin console and for sending mail respectively. Neither is needed
to build.

Everything except `/prediction/create` reads from the database, so without a running postgres the
app answers 500. If `localhost:3000` is dead on arrival, check that first.

Database connection details can be overridden with the standard `PGHOST`, `PGPORT`, `PGDATABASE`,
`PGUSER` and `PGPASSWORD` environment variables.

```sh
npm run lint
npm run typecheck
npm run test
npm run cron        # run the cron process locally
```

### Developing on Windows: do it inside WSL

The whole thing deploys as Linux containers, so developing in WSL means local and prod are the
same shape. You also stop fighting CRLF, and you can actually build the docker images. Do not
install Docker Desktop for this. WSL2 is already a Linux VM, which is the only thing Docker
Desktop was going to give you, so install the engine straight into the distro instead.

**Put the repo on the Linux filesystem.** This is the part that matters. Clone into something
like `~/code/nopestradamus`. If you leave the code on `/mnt/c/...` and just run WSL against it,
every file read crosses the 9p bridge and Next's dev watcher ends up slower than it was on
Windows. Cloning fresh also gives you an LF checkout for free.

```sh
git clone <this repo> ~/code/nopestradamus
cd ~/code/nopestradamus
```

**Install node inside the distro.** WSL inherits the Windows PATH, so a bare `npm` may well
resolve to `/mnt/c/Program Files/nodejs/npm` while no linux node exists at all. Installing with
that would put Windows binaries in a linux `node_modules` and the failures are baffling. Use nvm
(grab the current install line from https://github.com/nvm-sh/nvm), then:

```sh
nvm install --lts       # needs to be node 24 or newer, see "engines" in package.json
nvm alias default lts/*
which node               # MUST NOT be under /mnt/c
```

**Install docker engine and the compose plugin.** Ubuntu's own packages are the least hassle:

```sh
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker      # works because /etc/wsl.conf has systemd=true
sudo usermod -aG docker $USER
```

The group change needs a fresh distro, so run `wsl --shutdown` from PowerShell and come back.
Then `docker run --rm hello-world` should work without sudo. If you specifically want a newer
engine than Ubuntu ships, use Docker's own apt repo instead, but on a very fresh Ubuntu their
repo may not have your release codename yet.

Now the normal flow works:

```sh
npm ci
npm run dev-database
npm run dev
```

Do not copy `node_modules` over from the Windows checkout, it has platform-specific binaries in
it. Install fresh.

## deploy

with this command:

`docker compose up -d --build`

Note that the compose file pins `postgres:16`. Bumping that major version needs a dump/restore of
the `db` volume, it is not a drop-in change.

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

These were deliberately left alone during the modernization, since they are behaviour changes
rather than cleanups:

- `handleUnsentAcceptEmail` in `server/scheduler.ts` sends participant accept mails with a
  `forEach(async ...)`, so it returns before the mails are sent and a failure surfaces as an
  unhandled rejection instead of reaching the caller.
- `deletePrediction` issues three separate `DELETE`s with no transaction, so a failure part way
  through leaves orphaned `creater`/`participant` rows.
- `db/database.sql` has no index on the `prediction_hash` columns that every lookup joins on.
