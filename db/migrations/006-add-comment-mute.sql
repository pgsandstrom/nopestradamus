-- Who has muted the comment mails of which prediction.
--
-- Comment mails only, and the name says so on purpose: muting a prediction's comments never
-- stops its other mails. The mail when a prediction finishes is the reason the site exists and
-- still goes out; the way to stop that is blocking the whole address, which is `mail.blocked`.
--
-- Keyed by mail address for the same reason a comment is: a session is an address, and what that
-- address is to the prediction is derived rather than stored. A row means muted, no row means
-- not, so unmuting is a delete and nobody starts out with a row.

CREATE TABLE comment_mute (
	prediction_hash TEXT      NOT NULL,
	mail            TEXT      NOT NULL,
	created         TIMESTAMP NOT NULL DEFAULT now(),
	PRIMARY KEY (prediction_hash, mail)
);
