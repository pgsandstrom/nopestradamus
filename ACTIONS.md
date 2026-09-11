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

- [x] **7. Double `isRole` check** — `app/prediction/[hash]/[role]/[rolehash]/page.tsx:15`
      The ternary followed by a recheck existed only to satisfy narrowing. Replaced with an early
      `if (!isRole(role))` return, then a plain `await getPrediction(...)` and an
      `if (prediction === undefined)` return. Both returns render the same not-found markup, so it
      moved into a local `NotFound` component rather than being written out twice.

- [ ] **8. Per-mail transport and disk read** — `server/mailer.ts:111`
      A nodemailer transport is constructed and `privkey.pem` re-read from disk on every send.
      `getConfig` already caches; `getPrivateKey` does not.

- [x] **9. User-visible grammar** — five one-word fixes, all applied:
  - `app/page.tsx:38` — "So whats the point?" → "So what&apos;s the point?" (the escape matches
    the `that&apos;s` two paragraphs up)
  - `components/prediction.tsx:23` — "The predictions finishes on" → "The prediction finishes on"
  - `app/prediction/[hash]/[role]/[rolehash]/answer-controller.tsx:51` — "ask you participants" →
    "ask your participants"
  - `app/prediction/[hash]/[role]/[rolehash]/answer-controller.tsx:97` and `:104` — "and has
    accepted it" → "and have accepted it", agreeing with the "You" that starts both sentences
  - `server/mailer.ts:159` — "Dont want to receive these mails?" → "Don't want ...", which goes
    out in every mail

## Noted, but not low-hanging

- **Admin auth was a URL query param** — done: `app/admin/layout.tsx`, `server/admin-session.ts`
  `?password=` landed in browser history, referrers and any access log, and every admin action
  took the password as its first argument, so it travelled with every call from the console.
  Replaced with a login form and a session cookie:
  - `app/admin/layout.tsx` gates everything under `/admin`, so a second admin screen is a
    `page.tsx` and nothing else.
  - The cookie holds `<expiry>.<nonce>.<HMAC>`, signed with the admin password itself. Changing
    the password in `config.json` therefore logs out the sessions minted under the old one, and
    there is no second secret to deploy. `httpOnly`, `sameSite=strict`, `secure` outside dev,
    seven days.
  - The password is checked in exactly one place now, `attemptAdminLogin`, and that one place is
    throttled: three attempts free, then a lockout doubling from 5s up to a 5 minute cap, reset
    on success. One bucket for the whole process rather than one per caller — with a single
    password, per-caller buckets are just something to rotate around. The cost is that someone
    hammering the form keeps the real admin waiting too.
  - Pages and actions ask `isAdminAuthenticated()` for themselves instead of trusting the layout,
    which is not re-rendered when the visitor moves between the pages under it.

- **`privkey.pem` and `config.json` are `COPY`d into both images** — `Dockerfile.frontend`,
  `Dockerfile.cron`
  Secrets end up in image layers. Decided to keep it: the images are built on the deploy host
  and never pushed anywhere, so anyone who could pull them out of a layer could read the files
  off the host anyway. The `TODO` in both files is replaced by a comment saying so.
  What would change the answer: pushing to a registry, a second deploy host, or CI building the
  images. Then bind mount the two files from the host in `docker-compose.yml` (and add them to
  `.dockerignore`), which also makes rotating a key a restart rather than a rebuild.
