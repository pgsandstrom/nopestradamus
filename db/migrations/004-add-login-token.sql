-- The header's "continue with e-mail" form mails a one-time link, and this is what that link
-- carries. Separate from `session` because it is the opposite kind of thing: short lived, spent
-- on first use, and worth nothing until it is traded for a session row.
--
-- The token rides in the fragment of the mailed URL exactly like a prediction's role hash does,
-- so it is never sent to a server on its own — which means a mail provider's link scanner cannot
-- burn it before the recipient clicks. That is what makes single use safe here.

CREATE TABLE login_token (
	hash    TEXT PRIMARY KEY,
	mail    TEXT      NOT NULL,
	created TIMESTAMP NOT NULL DEFAULT now(),
	expires TIMESTAMP NOT NULL
);

-- for the per-address cooldown that stops the form being pointed at somebody as a mail bomb
CREATE INDEX login_token_mail_idx ON login_token (mail);

-- for the hourly sweep of spent and stale rows
CREATE INDEX login_token_expires_idx ON login_token (expires);
