import nodemailer from 'nodemailer';

interface IMailPar {
  subject: string;
  html: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

const sendMail = (parms: IMailPar) => {

  const { subject, html } = parms;
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.MAIL_TO,
    subject,
    html
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

export default sendMail;