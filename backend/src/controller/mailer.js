import nodemailer from 'nodemailer';

// // create reusable transporter object using the default SMTP transport
// const transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');
//
// // setup e-mail data with unicode symbols
// const mailOptions = {
//   from: '"Fred Foo ?" <foo@blurdybloop.com>', // sender address
//   to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
//   subject: 'Hello ✔', // Subject line
//   text: 'Hello world ?', // plaintext body
//   html: '<b>Hello world ?</b>', // html body
// };
//
// // send mail with defined transport object
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     return console.log(error);
//   }
//   console.log(`Message sent: ${info.response}`);
// });

export const sendMail = async () => {
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
  });

  const mailOptions = {
    from: '"Nopestradamus" <no-reply@nopestradamus.com>',
    to: ['pg.sandstrom@gmail.com'],
    subject: 'test',
    html: 'hello lol',
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.log('send mail fail');
  }
};
