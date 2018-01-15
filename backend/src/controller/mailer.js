import nodemailer from 'nodemailer';
import moment from 'moment';

export const sendAcceptMail = async (receiver, creatorMail, title, body, finishDate, betHash, acceptHash) => {
  const mailTitle = `Your opinion has been requested by ${creatorMail}!`;
  const mailBody = `
<div>
<div>
${creatorMail} has asked you to accept a bet! The bet is described below
</div>
<div style="background:#a3a3a3">
  <h3>${title}</h3>
  <div>${body}</div>
</div>
<div>The bet ends at ${moment(finishDate).format('YYYY MM DD')}. At the given date, you will all receive a mail and be confronted with your predictions!</div>
<div>To accept the bet, click the following link. If you dont want to accept, just ignore this mail and perhaps mail for silly friend</div>
<a href="http://nopestradamus.com/accept/${acceptHash}">I accept this bet!</a>
<div>To get an overview of the bet before you accept
<a href="http://nopestradamus.com/view/${betHash}">click here</a>
</div>
</div>`;
  return sendMail(receiver, mailTitle, mailBody);
};

export const sendEndMail = async (receiver, creatorMail, title, body, acceptedDate, betHash) => {
  const mailTitle = `Your bet from ${creatorMail} has finished!!!`;
  const mailBody = `
<div>
<div>A bet was accepted by you on ${moment(acceptedDate).format('YYYY MM DD')} by ${creatorMail}. It has now finished! Here is the bet:</div>
<div style="background:#a3a3a3">
  <h3>${title}</h3>
  <div>${body}</div>
</div>
<div>To get an overview of the bet 
<a href="http://nopestradamus.com/view/${betHash}">click here</a>
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
