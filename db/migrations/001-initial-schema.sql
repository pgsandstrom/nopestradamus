-- The schema as it stood before migrations existed.
--
-- Written with IF NOT EXISTS so it is its own baseline: it no-ops against the production
-- database, which already has these tables, and creates them on a fresh one. Later migrations
-- do not need this trick and should not use it — a migration that silently does nothing is
-- only wanted here, for the one file that has to agree with a database it never built.

CREATE TABLE IF NOT EXISTS mail (
	mail TEXT PRIMARY KEY,
	hash TEXT NOT NULL,
	validated BOOLEAN NOT NULL DEFAULT FALSE,
	blocked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS prediction (
	hash              TEXT PRIMARY KEY,
	created           TIMESTAMP NOT NULL DEFAULT now(),
	title             TEXT      NOT NULL,
	body              TEXT      NOT NULL,
	finish_date       TIMESTAMP NOT NULL,
	public            BOOLEAN   NOT NULL,
	creator_validated BOOLEAN   NOT NULL DEFAULT FALSE -- not used???
);

CREATE TABLE IF NOT EXISTS creater (
	hash               TEXT PRIMARY KEY,
	prediction_hash    TEXT    NOT NULL,
	mail               TEXT    NOT NULL,
	accepted           BOOLEAN,
	accepted_date      TIMESTAMP,
	accepted_mail_sent BOOLEAN NOT NULL DEFAULT FALSE,
	end_mail_sent      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS participant (
	hash               TEXT PRIMARY KEY,
	prediction_hash    TEXT    NOT NULL,
	mail               TEXT    NOT NULL,
	accepted           BOOLEAN,
	accepted_date      TIMESTAMP,
	accepted_mail_sent BOOLEAN NOT NULL DEFAULT FALSE,
	end_mail_sent      BOOLEAN NOT NULL DEFAULT FALSE
);
