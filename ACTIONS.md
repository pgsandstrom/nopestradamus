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

- [x] **4. The block route reports success for unknown hashes** —
      `app/api/account/[hash]/block/route.ts`
      `setAccountBlocked` on a hash with no matching row updated nothing and the handler still
      returned `{status:'ok'}`. RFC 8058 turned out not to argue for the 200: it says nothing
      at all about status codes, and section 3.1 says the server "SHOULD verify that the opaque
      or hard-to-forge component is valid", which points the other way. `setAccountBlocked` now
      returns whether a row matched and the handler answers 404 for hashes that match no account.
      Blocking an already-blocked account is still a 200 — the update is idempotent, and nothing
      deletes rows from `mail`, so a hash that was ever mailed out keeps working.

## Dead code the linters miss

- [x] **5. Unused exports** — `validateDate` (`shared/validate-prediction.ts:10`) was only
      imported by its own test, where it duplicated the `isValidDate` cases in
      `shared/date-util.test.ts`. It was a one-line alias of `isValidDate` and production code
      validates through `validateDateString`, so it and its test block are gone. `isProd`
      (`util/env.ts:1`) is no longer exported, since `isDev` is its only caller and nothing tests
      it. `formatDate` (`shared/date-util.ts:18`) stays exported: the entry had it as in-file
      only, but `shared/date-util.test.ts` imports it directly, and un-exporting the primitive the
      rest of the module formats through would mean dropping those cases or rerouting them through
      `formatDateString`, which has its own. On the tooling: `--files` is dropped from
      `knip:production`, so that run reports unused exports as well. It is a strict superset —
      checked with a throwaway orphan file and a throwaway test-only file, both still listed under
      "Unused files" — and adds no noise here beyond `validateDate`; `--include files,exports,types`
      narrows it again if that changes. `ignoreExportsUsedInFile: true` is deliberately kept:
      dropping it would also have caught `isProd`, but it flags `formatDate` and `ROLES`
      (`shared/index.ts:32`) too, which are exported on purpose, so the in-file class stays a
      manual read rather than a check.

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
