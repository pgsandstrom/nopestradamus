DROP TABLE prediction;
DROP TABLE participant;


CREATE TABLE prediction (
	id      SERIAL PRIMARY KEY,
	created TIMESTAMP NOT NULL DEFAULT now(),
	title   TEXT      NOT NULL,
	body    TEXT      NOT NULL,
	hash    TEXT      NOT NULL,
	public  BOOLEAN   NOT NULL
);

CREATE TABLE participant (
	id             SERIAL PRIMARY KEY,
	created        TIMESTAMP NOT NULL DEFAULT now(),
	predicition_id INTEGER   NOT NULL,
	mail           TEXT      NOT NULL,
	hash           TEXT      NOT NULL,
	accepted       BOOLEAN
)
