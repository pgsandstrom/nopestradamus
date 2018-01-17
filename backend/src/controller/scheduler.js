import moment from 'moment';
import { getOldBetWithUnsentAcceptMails, getOldBetWithUnsentEndMails, getNextPrediction, getPrediction } from './prediction';
import { sendAcceptMail, sendEndMail } from './mailer';

export const init = async () => {
  try {
    await handleAllUnsentAcceptEmails();

    await handleAllUnsentEndEmails();

    await ensureWaitingForBet();
  } catch (e) {
    console.error('INIT FAILED');
    console.log(e);
    throw e;
  }
};

let isWaiting = false;

const ensureWaitingForBet = async () => {
  if (isWaiting === false) {
    const predictionList = await getNextPrediction();
    if (predictionList.length > 0) {
      const prediction = predictionList[0];
      const finishDateMoment = moment(prediction.finish_date);
      const msDiff = finishDateMoment.diff(moment());
      console.log(`waiting ${msDiff}ms for bet ${prediction.hash}`);
      isWaiting = true;
      setTimeout(() => {
        handleUnsentEndEmail(prediction.hash);
        isWaiting = false;
        ensureWaitingForBet();
      }, msDiff);
    }
  } else {
    console.log('Already waiting for bet, not waiting again');
  }
  // TODO start wait stuff
};

const handleAllUnsentAcceptEmails = async () => {
  const unsentAcceptMails = await getOldBetWithUnsentAcceptMails();
  if (unsentAcceptMails.length > 0) {
    const { hash } = unsentAcceptMails[0];
    handleUnsentAcceptEmail(hash);
  }
};

const handleAllUnsentEndEmails = async () => {
  const unsentEndMails = await getOldBetWithUnsentEndMails();
  if (unsentEndMails.length > 0) {
    const { hash } = unsentEndMails[0];
    handleUnsentEndEmail(hash);
  }
};

const handleUnsentAcceptEmail = async (hash) => {
  const prediction = await getPrediction(hash);
  const creatorMail = prediction.participants.find(participant => participant.creator).mail;
  const mails = prediction.participants.filter(participant => participant.accepted_mail_sent === false).map(participant => participant.mail);
  mails.forEach(async (mail) => {
    const participant = prediction.participants.find(p => p.mail === mail);
    try {
      await sendAcceptMail(mail, creatorMail, prediction.title, prediction.body, participant.finish_date, hash, participant.hash);
    } catch (e) {
      console.error(`failed sending end mail to ${mail}`);
    }
  });
};

const handleUnsentEndEmail = async (hash) => {
  const prediction = await getPrediction(hash);
  const creatorMail = prediction.participants.find(participant => participant.creator).mail;
  const mails = prediction.participants.filter(participant => participant.end_mail_sent === false).map(participant => participant.mail);
  mails.forEach(async (mail) => {
    const participant = prediction.participants.find(p => p.mail === mail);
    try {
      await sendEndMail(mail, creatorMail, prediction.title, prediction.body, participant.accepted_date, hash);
    } catch (e) {
      console.error(`failed sending end mail to ${mail}`);
    }
  });
};
