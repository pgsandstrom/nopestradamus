DROP TABLE prediction;
DROP TABLE participant;

CREATE TABLE mail (
	mail TEXT PRIMARY KEY,
	hash TEXT NOT NULL
);

CREATE TABLE prediction (
	hash              TEXT PRIMARY KEY,
	created           TIMESTAMP NOT NULL DEFAULT now(),
	title             TEXT      NOT NULL,
	body              TEXT      NOT NULL,
	finish_date       TIMESTAMP NOT NULL,
	public            BOOLEAN   NOT NULL,
	creator_validated BOOLEAN   NOT NULL DEFAULT FALSE
);

CREATE TABLE participant (
	hash               TEXT PRIMARY KEY,
	created            TIMESTAMP NOT NULL DEFAULT now(),
	predicition_hash   TEXT      NOT NULL,
	mail               TEXT      NOT NULL,
	creator            BOOLEAN   NOT NULL,
	accepted           BOOLEAN,
	accepted_date      TIMESTAMP,
	accepted_mail_sent BOOLEAN   NOT NULL DEFAULT FALSE,
	end_mail_sent      BOOLEAN   NOT NULL DEFAULT FALSE
);

INSERT INTO prediction (title, body, hash, finish_date, public) VALUES ('title1', 'body1', 'hash1', now() + 'integer 7', TRUE);
INSERT INTO participant (hash, predicition_hash, mail) VALUES ('part_hash1', 'hash1', 'lol@mail.com');
