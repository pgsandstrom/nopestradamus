DROP TABLE IF EXISTS mail;
DROP TABLE IF EXISTS prediction;
DROP TABLE IF EXISTS participant;

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
	prediction_hash   TEXT      NOT NULL,
	mail               TEXT      NOT NULL,
	creator            BOOLEAN   NOT NULL,
	accepted           BOOLEAN,
	accepted_date      TIMESTAMP,
	accepted_mail_sent BOOLEAN   NOT NULL DEFAULT FALSE,
	end_mail_sent      BOOLEAN   NOT NULL DEFAULT FALSE
);

INSERT INTO prediction (title, body, hash, finish_date, public) VALUES ('title1', 'body1', 'hash1', DATE '2011-01-01', TRUE);
INSERT INTO participant (hash, prediction_hash, mail, creator) VALUES ('part_hash1-a', 'hash1', 'lol1-a@mail.com', true);
INSERT INTO participant (hash, prediction_hash, mail, creator) VALUES ('part_hash1-b', 'hash1', 'lol1-b@mail.com', false);

INSERT INTO prediction (title, body, hash, finish_date, public) VALUES ('title2', 'body2', 'hash2', DATE '2018-02-01', TRUE);
INSERT INTO participant (hash, prediction_hash, mail, creator) VALUES ('part_hash2-a', 'hash2', 'lol2-a@mail.com', true);
INSERT INTO participant (hash, prediction_hash, mail, creator) VALUES ('part_hash2-b', 'hash2', 'lol2-b@mail.com', false);

INSERT INTO prediction (title, body, hash, finish_date, public) VALUES ('title3', 'body3', 'hash3', DATE '3033-01-01', TRUE);
INSERT INTO participant (hash, prediction_hash, mail, creator) VALUES ('part_hash3-a', 'hash3', 'lol3-a@mail.com', true);
INSERT INTO participant (hash, prediction_hash, mail, creator) VALUES ('part_hash3-b', 'hash3', 'lol3-b@mail.com', false);

