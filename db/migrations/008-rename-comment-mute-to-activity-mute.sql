-- A mute now covers everything that happens on a prediction after it starts: new comments, and
-- somebody accepting or rejecting it. The table is renamed to say so. Existing rows keep their
-- meaning — whoever muted a chatty comment thread does not want to hear about its answers either.
--
-- Still not the finish mail. That is the reason the site exists and still goes out; the way to
-- stop it is blocking the whole address, which is `mail.blocked`.

ALTER TABLE comment_mute RENAME TO prediction_activity_mute;
ALTER TABLE prediction_activity_mute RENAME CONSTRAINT comment_mute_pkey TO prediction_activity_mute_pkey;
ALTER TABLE prediction_activity_mute RENAME CONSTRAINT comment_mute_mail_normalized TO prediction_activity_mute_mail_normalized;
