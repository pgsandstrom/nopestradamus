@AGENTS.md

# Nopestradamus

Service for long term predictions. Two processes: a Next.js 16 app (App Router, React 19) and a
Node process holding a cron job.

## Commands

The package manager is **pnpm**, not npm.

- `pnpm validate` — typecheck + lint + test. Run this before calling work done.
- `pnpm dev-database` — postgres in docker, then applies the migrations. Every page reads from
  the database, so without it the app answers 500. `/prediction/create` is the one exception,
  and only for a visitor with no session cookie — the header looks one up when there is one.
- `pnpm migrate` — apply pending `db/migrations/*.sql` to the dev database.

## Code patterns

- **Every relative import carries an explicit `.ts` / `.tsx` extension.** Node runs
  `server-cron.ts` directly via type stripping with no build step, so extensionless relative
  imports break the cron process. `tsconfig.json` sets `erasableSyntaxOnly` for the same reason,
  and `verbatimModuleSyntax` means type-only imports must be written `import type { X }`.
- Pages are server components; mutations go through server actions in `app/actions.ts` and
  `app/admin/actions.ts`.
- Styling is plain CSS Modules with design tokens in `app/globals.css`. No UI framework.
- Schema changes are migrations: a new `db/migrations/NNN-what-it-does.sql`, never an edit to an
  existing one. `db/migrate.ts` checksums applied files and refuses a changed one, and the
  `migrate` compose service runs them before the app containers start. See the README section
  before adding one.
- Database access goes through `util/db.ts`. Use the `SQL` tagged template so values are
  parameterised rather than interpolated into the query string.
- A visitor is a mail address: the session cookie names one, and what it may do on a prediction
  is derived from that, not stored. Three things about it are not visible from the code:
  - The legacy `/prediction/HASH/ROLE/ROLEHASH` route is only a redirect now, and has to stay.
    Mails sent years ago carry it and cannot be recalled — it is not dead code.
  - `requestLoginMailAction` answers identically whether it sent a mail, found nothing, hit a
    blocked address or hit the cooldown. Making that message more helpful turns an open form into
    a way of asking who uses the site.
  - The login cover is CSS keyed off `data-logging-in` on `<html>`, set by an inline script, and
    held through a full `location.reload()`. React state cannot beat the first paint and
    `router.refresh()` gives no signal for "painted"; both look like obvious simplifications.
- Everything under `/admin` is behind a separate session cookie of its own. `app/admin/layout.tsx` renders the login
  form, but it is not the gate: each admin page and each action in `app/admin/actions.ts` asks
  `isAdminAuthenticated()` for itself, because a layout is not re-rendered when the visitor moves
  between the pages under it.
- Imports are sorted by `simple-import-sort` and it autofixes, so never hand-sort them.
- `POST /api/account/[hash]/block` stays a route handler rather than a server action, because mail
  clients POST to it directly for RFC 8058 List-Unsubscribe one-click and `server/mailer.ts`
  names it in the `List-Unsubscribe` header. It must not move. Its sibling
  `POST /api/account/[hash]/mute-comments/[predictionHash]` is what a comment mail names instead:
  it mutes that prediction's comment mails and nothing else, and must not move either.
- `README.md` ends with known issues left alone on purpose. They are behaviour changes, not
  cleanups — don't fix them as drive-by work.
