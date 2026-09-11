# Modernization actions

Low-hanging fruit found while surveying the repo. `pnpm validate` and `pnpm knip` were both clean
at the time, so none of this is something the tooling reports on its own.

The three entries under "Known issues" in `README.md` are deliberately not listed here — they are
behaviour changes rather than cleanups.

## Bugs

- [x] **1. `confirmAccountExistance` check-then-insert race** — `server/account.ts:7`
      `SELECT count(*)` followed by `INSERT` on a table where `mail` is the primary key. Two
      concurrent calls for the same address both saw no row and the second `INSERT` failed on the
      key. Replaced with a single `INSERT ... ON CONFLICT (mail) DO NOTHING`, which keeps the old
      behaviour of leaving an existing row untouched.

- [ ] **2. React keys built from censored mail** — `components/prediction.tsx:33`
      `censorMail` is lossy, so `alice@x.com` and `alyce@x.com` both render as `a**ce@x.com` and
      collide as keys. Key on something unique instead. Same smell at `app/admin/page.tsx:39`,
      which keys an `<article>` on the whole mail body.

- [x] **3. `deleteTestPredictionsAction` cannot see private predictions** — `app/admin/actions.ts:48`
      It went through `getPredictions`, which filtered `WHERE public IS true`, so private test
      predictions were invisible to the cleanup button. Dropped that filter and renamed the
      function to `adminGetPredictionsByTitle`, since with no visibility filter the old name
      promised something it no longer did. It had no other caller. The title match is `ILIKE`,
      so it is case-insensitive.

- [ ] **4. The block route reports success for unknown hashes** —
      `app/api/account/[hash]/block/route.ts`
      `setAccountBlocked` on a hash with no matching row updates nothing and the handler still
      returns `{status:'ok'}`. Worth a 404 — but check the RFC 8058 side first, mail clients may
      prefer the 200.

## Dead code the linters miss

- [ ] **5. Unused exports** — `validateDate` (`shared/validate-prediction.ts:10`) is only imported
      by its own test. `isProd` (`util/env.ts:1`) and `formatDate` (`shared/date-util.ts:18`) are
      only used inside their own file.
      Knip cannot catch these as configured: `knip:production` runs with `--files`, which reports
      unused _files_ and never unused exports, and `ignoreExportsUsedInFile: true` hides the other
      two. Dropping `--files` from the production run would surface this class permanently.

- [ ] **6. `creator_validated` is never read or written** — `db/database.sql:20`
      Also spelled `creator` while the rest of the schema and the code say `creater`.

## Polish

- [ ] **7. Double `isRole` check** — `app/prediction/[hash]/[role]/[rolehash]/page.tsx:15`
      The ternary followed by a recheck exists only to satisfy narrowing. An early
      `if (!isRole(role))` return reads better and drops a branch.

- [ ] **8. Per-mail transport and disk read** — `server/mailer.ts:111`
      A nodemailer transport is constructed and `privkey.pem` re-read from disk on every send.
      `getConfig` already caches; `getPrivateKey` does not.

- [ ] **9. User-visible grammar** — five one-word fixes:
  - `app/page.tsx:38` — "So whats the point?"
  - `components/prediction.tsx:23` — "The predictions finishes on"
  - `app/prediction/[hash]/[role]/[rolehash]/answer-controller.tsx:51` — "ask you participants"
  - `app/prediction/[hash]/[role]/[rolehash]/answer-controller.tsx:97` and `:104` — "and has
    accepted it"
  - `server/mailer.ts:159` — "Dont want to receive these mails?", which goes out in every mail

## Noted, but not low-hanging

- **Admin auth is a URL query param** — `app/admin/page.tsx:14`
  `?password=` lands in browser history, referrers and any access log. Needs a cookie or session
  to fix properly, but worth doing before the modernization is called done.

- **`privkey.pem` and `config.json` are `COPY`d into both images** — `Dockerfile.frontend`,
  `Dockerfile.cron`
  The `TODO Is this how we want to handle privkey?` in both files is asking the right question.
  Secrets baked into image layers.
