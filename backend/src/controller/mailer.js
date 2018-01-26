import nodemailer from 'nodemailer';
import moment from 'moment';

export const sendCreaterAcceptMail = async (prediction) => {
  console.log(`sending creater accept mail to ${prediction.creater.mail}`);
  // console.log(`accept: /prediction/${prediction.hash}/creater/${prediction.creater.hash}`);
  // console.log(`view: /prediction/${prediction.hash}`);
  const mailTitle = 'Nopestradamus: Validate your mail for your bet!';
  const mailBody = `
<div>
<div>
    Below is the bet that was created by this mail:
</div>
<div style="background:#a3a3a3">
  <h3>${prediction.title}</h3>
  <div>${prediction.body}</div>
</div>
<div>To validate or deny this prediction, visit the following link:</div>
<a href="http://nopestradamus.com/prediction/${prediction.hash}/creater/${prediction.creater.hash}">Lets go!</a>
<div>To get an overview of the bet before you accept
<a href="http://nopestradamus.com/prediction/${prediction.hash}">click here</a>
</div>
</div>`;
  return sendMail(prediction.creater.mail, mailTitle, mailBody);
};

export const sendAcceptMail = async (receiver, createrMail, title, body, finishDate, predictionHash, acceptHash) => {
  console.log(`sending accept mail to ${receiver}`);
  // console.log(`accept: /prediction/${predictionHash}/participant/${acceptHash}`);
  // console.log(`view: /prediction/${predictionHash}`);
  const mailTitle = `Your opinion has been requested by ${createrMail}!`;
  const mailBody = `
<div>
<div>
${createrMail} has asked you to accept a bet! The bet is described below
</div>
<div style="background:#a3a3a3">
  <h3>${title}</h3>
  <div>${body}</div>
</div>
<div>The bet ends at ${moment(finishDate).format('YYYY MM DD')}. At the given date, you will all receive a mail and be confronted with your predictions!</div>
<div>To accept or deny the bet, click the following link.</div>
<a href="http://nopestradamus.com/prediction/${predictionHash}/participant/${acceptHash}">Lets go!</a>
<div>To get an overview of the bet before you accept
<a href="http://nopestradamus.com/prediction/${predictionHash}">click here</a>
</div>
</div>`;
  return sendMail(receiver, mailTitle, mailBody);
};

export const sendEndMail = async (receiver, createrMail, title, body, acceptedDate, predictionHash) => {
  console.log(`sending end mail to ${receiver}`);
  const mailTitle = `Your bet from ${createrMail} has finished!!!`;
  const mailBody = `
<div>
<div>A bet was accepted by you on ${moment(acceptedDate).format('YYYY MM DD')} by ${createrMail}. It has now finished! Here is the bet:</div>
<div style="background:#a3a3a3">
  <h3>${title}</h3>
  <div>${body}</div>
</div>
<div>To get an overview of the bet 
<a href="http://nopestradamus.com/prediction/${predictionHash}">click here</a>
<div>Now you must discuss who won the bet!</div>
</div>`;
  return sendMail(receiver, mailTitle, mailBody);
};

const sendMail = async (receiver, title, body) => {
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
  });

  const mailOptions = {
    from: '"Nopestradamus" <no-reply@nopestradamus.com>',
    to: [receiver],
    subject: title,
    html: body,
  };

  try {
    await transporter.verify();
    return transporter.sendMail(mailOptions);
  } catch (e) {
    console.log('send mail fail');
    throw e;
  }
};
