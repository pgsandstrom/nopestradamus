-- Every stored address in lower case, and the database refusing any other spelling from now on.
--
-- The app compares addresses exactly, so one person who typed their address two ways had two
-- accounts, and a session under one spelling did not match their rows under the other. The part
-- before the @ may be case sensitive by RFC 5321, but no provider anyone uses treats it so.
--
-- `mail` is keyed by the address, so spellings that lower to the same one are merged first. The
-- survivor is validated if any of them was, and blocked if any of them was: an unsubscribe is
-- honoured whichever spelling it came through. Only one account hash can survive, so the
-- unsubscribe links in mails sent to the others stop finding an account.

UPDATE mail SET
	validated = merged.validated,
	blocked = merged.blocked
FROM (
	SELECT lower(mail) AS lowered, bool_or(validated) AS validated, bool_or(blocked) AS blocked
	FROM mail
	GROUP BY lower(mail)
	HAVING count(*) > 1
) AS merged
WHERE lower(mail.mail) = merged.lowered;

-- keeps the lowest spelling of each address, which is an arbitrary but deterministic choice
DELETE FROM mail AS other USING mail AS kept
WHERE lower(other.mail) = lower(kept.mail) AND other.mail > kept.mail;

-- a mute is keyed by address too, so the same merge
DELETE FROM comment_mute AS other USING comment_mute AS kept
WHERE other.prediction_hash = kept.prediction_hash
	AND lower(other.mail) = lower(kept.mail)
	AND other.mail > kept.mail;

UPDATE mail SET mail = lower(mail) WHERE mail <> lower(mail);
UPDATE creater SET mail = lower(mail) WHERE mail <> lower(mail);
UPDATE participant SET mail = lower(mail) WHERE mail <> lower(mail);
UPDATE session SET mail = lower(mail) WHERE mail <> lower(mail);
UPDATE login_token SET mail = lower(mail) WHERE mail <> lower(mail);
UPDATE comment SET mail = lower(mail) WHERE mail <> lower(mail);
UPDATE comment_mute SET mail = lower(mail) WHERE mail <> lower(mail);

-- A code path that forgets normalizeMail (shared/mail-util.ts) fails here, loudly, instead of
-- quietly creating a second account.
ALTER TABLE mail ADD CONSTRAINT mail_mail_normalized CHECK (mail = lower(btrim(mail)));
ALTER TABLE creater ADD CONSTRAINT creater_mail_normalized CHECK (mail = lower(btrim(mail)));
ALTER TABLE participant ADD CONSTRAINT participant_mail_normalized CHECK (mail = lower(btrim(mail)));
ALTER TABLE session ADD CONSTRAINT session_mail_normalized CHECK (mail = lower(btrim(mail)));
ALTER TABLE login_token ADD CONSTRAINT login_token_mail_normalized CHECK (mail = lower(btrim(mail)));
ALTER TABLE comment ADD CONSTRAINT comment_mail_normalized CHECK (mail = lower(btrim(mail)));
ALTER TABLE comment_mute ADD CONSTRAINT comment_mute_mail_normalized CHECK (mail = lower(btrim(mail)));
