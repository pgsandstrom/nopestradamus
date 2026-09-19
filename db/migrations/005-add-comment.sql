-- Comments on a prediction.
--
-- The author is a mail address, the same identity a session carries, and deliberately not a
-- creater or participant hash. Who may comment is decided when the comment is written (today:
-- the creater and the participants), and what the author is to the prediction is derived when it
-- is read, exactly like everything else a visitor may do. Keying a comment to a role row would
-- make opening comments to every logged-in visitor a schema change instead of a policy change.
--
-- An identity rather than a random hash: nothing about a comment is secret, and the id is what
-- a later edit or delete would address it by.

CREATE TABLE comment (
	id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	prediction_hash TEXT      NOT NULL,
	mail            TEXT      NOT NULL,
	body            TEXT      NOT NULL,
	created         TIMESTAMP NOT NULL DEFAULT now()
);

-- every read is one prediction's comments in the order they were written
CREATE INDEX comment_prediction_hash_idx ON comment (prediction_hash, created);
