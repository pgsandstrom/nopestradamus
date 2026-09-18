-- Secret URLs now log you in. The role hash arrives as the fragment of
-- /prediction/PREDICTION-HASH#ROLE-HASH, is traded for a row here, and the cookie then only
-- carries this row's hash — the secret itself never becomes a cookie.
--
-- Sessions live in the database rather than in a signed cookie so there is no second secret to
-- keep in config.json alongside adminPassword, and so a session can be ended by deleting a row.
--
-- `mail` is the identity, and matches the primary key of the `mail` table. It is not declared a
-- foreign key because nothing else in this schema declares one.

CREATE TABLE session (
	hash    TEXT PRIMARY KEY,
	mail    TEXT      NOT NULL,
	created TIMESTAMP NOT NULL DEFAULT now(),
	expires TIMESTAMP NOT NULL
);

-- the hourly sweep of dead rows is the only query here that does not go through the primary key
CREATE INDEX session_expires_idx ON session (expires);
