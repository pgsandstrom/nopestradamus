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
- **A visitor is an email address and nothing more.** The session cookie holds the hash of a
  `session` row, and that row's `mail` is the whole identity — there are no per-prediction
  permissions stored anywhere. `server/session.ts` is the database half (the cron process reaches
  it to sweep expired rows), `server/session-cookie.ts` the Next half, and `getCurrentUserMail()`
  is the only way to ask who is here. What that address may do on a prediction is `getRoleForMail`,
  computed from the prediction already in hand rather than queried for.
- **A secret link is `/prediction/PREDICTION-HASH#ROLE-HASH`.** The fragment is never sent to the
  server by the browser, so `components/session-negotiator.tsx` — mounted in the header, which is
  on every route — trades it for a session and then wipes it out of the address bar. The old
  `/prediction/HASH/ROLE/ROLEHASH` route is now nothing but a redirect to that shape and has to
  stay: mails sent years ago still carry it and cannot be recalled.
- **The login cover is CSS driven by an attribute, not React state.** The server cannot see the
  fragment, so the first paint of a secret link would show the prediction as a stranger sees it.
  The inline script in `app/layout.tsx` puts `data-logging-in` on `<html>` before that paint;
  `components/login-cover.module.css` keys off it; `session-negotiator.tsx` removes it only once
  the login has really answered, and on success holds it through a full `location.reload()`
  rather than a `router.refresh()`. The attribute name is spelled out in all three places — grep
  for `LOGIN_COVER_ATTRIBUTE` before renaming it.
- Everything under `/admin` is behind a separate session cookie of its own. `app/admin/layout.tsx` renders the login
  form, but it is not the gate: each admin page and each action in `app/admin/actions.ts` asks
  `isAdminAuthenticated()` for itself, because a layout is not re-rendered when the visitor moves
  between the pages under it.
- Imports are sorted by `simple-import-sort` and it autofixes, so never hand-sort them.
- `POST /api/account/[hash]/block` stays a route handler rather than a server action, because mail
  clients POST to it directly for RFC 8058 List-Unsubscribe one-click and `server/mailer.ts`
  names it in the `List-Unsubscribe` header. It must not move.
- `README.md` ends with known issues left alone on purpose. They are behaviour changes, not
  cleanups — don't fix them as drive-by work.
