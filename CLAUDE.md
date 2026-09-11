@AGENTS.md

# Nopestradamus

Service for long term predictions. Two processes: a Next.js 16 app (App Router, React 19) and a
Node process holding a cron job. `README.md` covers setup, deploy and the mail/DNS configuration.

## Commands

The package manager is **pnpm**, not npm.

- `pnpm validate` — typecheck + lint + test. Run this before calling work done.
- `pnpm lint --fix` — clears trivial issues; do this before reading lint output closely.
- `pnpm format` — prettier over the repo.
- `pnpm dev-database` — postgres in docker. Everything except `/prediction/create` reads from the
  database, so without it the app answers 500.
- `pnpm knip` — unused files, exports and dependencies.

## Layout

| Path          | What lives there                                                   |
| ------------- | ------------------------------------------------------------------ |
| `app/`        | routes, server actions, global styles                              |
| `components/` | shared UI, including the small `ui/` primitives that replaced MUI  |
| `server/`     | database access, mail rendering/sending, the scheduler             |
| `shared/`     | domain types and pure helpers used by both processes (unit tested) |
| `util/`       | config, env and the postgres pool                                  |

## Code patterns

- **Every relative import carries an explicit `.ts` / `.tsx` extension.** Node runs
  `server-cron.ts` directly via type stripping with no build step, so extensionless relative
  imports break the cron process. `tsconfig.json` sets `erasableSyntaxOnly` for the same reason.
- `verbatimModuleSyntax` is on, so type-only imports must be written `import type { X }`.
- Pages are server components; mutations go through server actions in `app/actions.ts` and
  `app/admin/actions.ts`.
- Styling is plain CSS Modules with design tokens in `app/globals.css`. No UI framework.
- Database access goes through `util/db.ts`. Use the `SQL` tagged template so values are
  parameterised rather than interpolated into the query string.
- Everything under `/admin` is behind a session cookie. `app/admin/layout.tsx` renders the login
  form, but it is not the gate: each admin page and each action in `app/admin/actions.ts` asks
  `isAdminAuthenticated()` for itself, because a layout is not re-rendered when the visitor moves
  between the pages under it.
- Imports are sorted by `simple-import-sort` and it autofixes, so never hand-sort them.

## The one URL that must not move

`POST /api/account/[hash]/block` stays a route handler rather than a server action, because mail
clients POST to it directly for RFC 8058 List-Unsubscribe one-click. It is referenced by the
`List-Unsubscribe` header in `server/mailer.ts`.

## Known issues are deliberate

`README.md` ends with a list of real behaviour bugs left alone during the modernization. They are
behaviour changes, not cleanups — don't fix them as drive-by work.
