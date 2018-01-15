import { getOldUnsentAcceptMails, getOldUnsentEndMails, getNextPrediction, getPrediction } from './prediction';
import { sendAcceptMail, sendEndMail } from './mailer';

export const init = async () => {
  await sendUnsentAcceptMails();

  await sendUnsentEndMails();

  const prediction = await getNextPrediction();
  // TODO start wait stuff
};

const sendUnsentAcceptMails = async () => {
  const unsentAcceptMails = await getOldUnsentAcceptMails();
  if (unsentAcceptMails.length > 0) {
    const [{ hash }] = unsentAcceptMails; // LOL vad fult. Ändra eslint regler?
    const mails = unsentAcceptMails.map(item => item.mail);
    const prediction = await getPrediction(hash);
    const creatorMail = prediction.participants.find(p => p.creator).mail;
    mails.forEach((mail) => {
      const acceptHash = prediction.participants.find(p => p.mail === mail).hash;
      sendAcceptMail(mail, creatorMail, prediction.title, prediction.body, prediction.finish_date, hash, acceptHash);
    });
  }
};

const sendUnsentEndMails = async () => {
  const unsentEndMails = await getOldUnsentEndMails();
  if (unsentEndMails.length > 0) {
    const [{ hash }] = unsentEndMails; // LOL vad fult. Ändra eslint regler?
    const mails = unsentEndMails.map(item => item.mail);
    const prediction = await getPrediction(hash);
    const creatorMail = prediction.participants.find(participant => participant.creator).mail;
    mails.forEach((mail) => {
      const participant = prediction.participants.find(p => p.mail === mail);
      sendEndMail(mail, creatorMail, prediction.title, prediction.body, participant.accepted_date, hash);
    });
  }
};
