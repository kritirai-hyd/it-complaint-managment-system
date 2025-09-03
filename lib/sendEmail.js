// lib/sendEmail.js
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export default async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: '"Kriti Rai" <kritirai.hyd@gmail.com>', // sender info fixed
    to,               // to is passed in parameter
    subject,          // subject passed in parameter
    text,             // plain-text body
    html,             // optional html body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
