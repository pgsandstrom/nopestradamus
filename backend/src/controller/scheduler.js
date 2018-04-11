import moment from 'moment';
import {
  getOldBetWithUnsentAcceptMails, getOldBetWithUnsentEndMails, getNextPrediction, getPrediction,
  getOldBetWithUnsentCreaterAcceptMails, setCreaterAcceptMailSent, setParticipantAcceptMailSent,
} from './prediction';
import { sendAcceptMail, sendCreaterAcceptMail, sendEndMail } from './mailer';

export const init = async () => {
  try {
    await handleAllUnsentCreaterAcceptEmails();

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

export const ensureWaitingForBet = async () => {
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
    } else {
      console.log('No promise to wait for');
    }
  } else {
    console.log('Already waiting for bet, not waiting again');
  }
};

const handleAllUnsentCreaterAcceptEmails = async () => {
  const unsentCreaterAcceptMails = await getOldBetWithUnsentCreaterAcceptMails();
  unsentCreaterAcceptMails.forEach(item => handleUnsentCreaterAcceptEmail(item.hash));
};

const handleAllUnsentAcceptEmails = async () => {
  const unsentAcceptMails = await getOldBetWithUnsentAcceptMails();
  unsentAcceptMails.forEach(item => handleUnsentAcceptEmail(item.hash));
};

const handleAllUnsentEndEmails = async () => {
  const unsentEndMails = await getOldBetWithUnsentEndMails();
  unsentEndMails.forEach(item => handleUnsentEndEmail(item.hash));
};

export const handleUnsentCreaterAcceptEmail = async (hash) => {
  const prediction = await getPrediction(hash);
  const mail = prediction.creater.mail;
  try {
    await sendCreaterAcceptMail(prediction);
    await setCreaterAcceptMailSent(prediction.creater.hash);
  } catch (e) {
    console.error(`failed sending creater accept mail to ${mail}`);
  }
};

export const handleUnsentAcceptEmail = async (hash) => {
  const prediction = await getPrediction(hash);
  const createrMail = prediction.creater.mail;
  const mails = prediction.participants.filter(participant => participant.accepted_mail_sent === false).map(participant => participant.mail);
  mails.forEach(async (mail) => {
    const participant = prediction.participants.find(p => p.mail === mail);
    try {
      await sendAcceptMail(mail, createrMail, prediction.title, prediction.body, participant.finish_date, hash, participant.hash);
      await setParticipantAcceptMailSent(participant.hash);
    } catch (e) {
      console.error(`failed sending accept mail to ${mail}`);
    }
  });
};

const handleUnsentEndEmail = async (hash) => {
  const prediction = await getPrediction(hash);
  const createrMail = prediction.creater.mail;
  const mails = prediction.participants
    .filter(participant => participant.accepted)
    .filter(participant => participant.end_mail_sent === false)
    .map(participant => participant.mail);
  mails.forEach(async (mail) => {
    const participant = prediction.participants.find(p => p.mail === mail);
    try {
      await sendEndMail(mail, createrMail, prediction.title, prediction.body, participant.accepted_date, hash);
    } catch (e) {
      console.error(`failed sending end mail to ${mail}`);
    }
  });
};
