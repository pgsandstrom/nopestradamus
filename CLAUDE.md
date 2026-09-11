@AGENTS.md

# Nopestradamus

Service for long term predictions. Two processes: a Next.js 16 app (App Router, React 19) and a
Node process holding a cron job.

## Commands

The package manager is **pnpm**, not npm.

- `pnpm validate` — typecheck + lint + test. Run this before calling work done.
- `pnpm dev-database` — postgres in docker. Everything except `/prediction/create` reads from the
  database, so without it the app answers 500.

## Code patterns

- **Every relative import carries an explicit `.ts` / `.tsx` extension.** Node runs
  `server-cron.ts` directly via type stripping with no build step, so extensionless relative
  imports break the cron process. `tsconfig.json` sets `erasableSyntaxOnly` for the same reason,
  and `verbatimModuleSyntax` means type-only imports must be written `import type { X }`.
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
- `POST /api/account/[hash]/block` stays a route handler rather than a server action, because mail
  clients POST to it directly for RFC 8058 List-Unsubscribe one-click and `server/mailer.ts`
  names it in the `List-Unsubscribe` header. It must not move.
- `README.md` ends with known issues left alone on purpose. They are behaviour changes, not
  cleanups — don't fix them as drive-by work.
