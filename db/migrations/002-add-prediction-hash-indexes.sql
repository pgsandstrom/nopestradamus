-- Every prediction read joins creater and participant on prediction_hash, and both tables only
-- had the primary key on their own hash, so those joins and the deletes in removePrediction were
-- sequential scans.
--
-- Plain CREATE INDEX rather than CONCURRENTLY: the whole migration run is one transaction and
-- CONCURRENTLY cannot take part in it. Both tables are small enough that the write lock it holds
-- is not worth arranging around.

CREATE INDEX creater_prediction_hash_idx ON creater (prediction_hash);
CREATE INDEX participant_prediction_hash_idx ON participant (prediction_hash);
