import { query } from '../util/db';
import { getOldUnsentAcceptMails, getOldUnsentEndMails, getNextPrediction } from './prediction';

export const init = async () => {
  // TODO
  await getOldUnsentEndMails();

  await getNextPrediction();
};
