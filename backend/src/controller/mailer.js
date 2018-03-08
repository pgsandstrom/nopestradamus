import nodemailer from 'nodemailer';
import moment from 'moment';
import { getPrivateKey } from '../util/config';

export const sendCreaterAcceptMail = async (prediction) => {
  console.log(`sending creater accept mail to ${prediction.creater.mail}`);
  // console.log(`accept: /prediction/${prediction.hash}/creater/${prediction.creater.hash}`);
  // console.log(`view: /prediction/${prediction.hash}`);
  const mailTitle = 'Nopestradamus: Validate your mail for your bet!';
  const mailBody = `Below is the bet that was created by this mail:

---

Title: ${prediction.title}

${prediction.body}

---

To validate or deny this prediction, visit the following link:
http://nopestradamus.com/prediction/${prediction.hash}/creater/${prediction.creater.hash}

To get an overview of the bet before you accept visit this link:
http://nopestradamus.com/prediction/${prediction.hash}`;
  return sendMail(prediction.creater.mail, mailTitle, mailBody);
};

export const sendAcceptMail = async (receiver, createrMail, title, body, finishDate, predictionHash, acceptHash) => {
  console.log(`sending accept mail to ${receiver}`);
  // console.log(`accept: /prediction/${predictionHash}/participant/${acceptHash}`);
  // console.log(`view: /prediction/${predictionHash}`);
  const mailTitle = `Your opinion has been requested by ${createrMail}!`;
  const mailBody = `${createrMail} has asked you to accept a bet! The bet is described below

---

Title: ${title}

${body}

---

The bet ends at ${moment(finishDate).format('YYYY MM DD')}. At the given date, you will all receive a mail and be confronted with your predictions!
To accept or deny the bet, click the following link:
http://nopestradamus.com/prediction/${predictionHash}/participant/${acceptHash}

To get an overview of the bet before you accept
http://nopestradamus.com/prediction/${predictionHash}
`;
  return sendMail(receiver, mailTitle, mailBody);
};

export const sendEndMail = async (receiver, createrMail, title, body, acceptedDate, predictionHash) => {
  console.log(`sending end mail to ${receiver}`);
  const mailTitle = `Your bet from ${createrMail} has finished!!!`;
  const mailBody = `A bet was accepted by you on ${moment(acceptedDate).format('YYYY MM DD')} by ${createrMail}. It has now finished! Here is the bet:

---

Title: ${title}

${body}

---

To get an overview of the bet visit this link:
http://nopestradamus.com/prediction/${predictionHash}

Now you must discuss who won the bet!`;
  return sendMail(receiver, mailTitle, mailBody);
};

const sendMail = async (receiver, title, body) => {
  const privateKey = getPrivateKey();
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
    dkim: {
      domainName: 'nopestradamus.com',
      keySelector: 'hej',
      privateKey,
    },
  });

  const mailOptions = {
    from: '"Nopestradamus" <no-reply@nopestradamus.com>',
    to: [receiver],
    subject: title,
    text: body,
    // html: body,
  };

  try {
    await transporter.verify();
    return transporter.sendMail(mailOptions);
  } catch (e) {
    console.log(`send mail fail: ${e}`);
    throw e;
  }
};
