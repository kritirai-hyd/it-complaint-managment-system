const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer and Gmail SMTP.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML content of the email
 */
const ForgetsendEmail = async (to, subject, html) => {
  if (!to) throw new Error('Recipient email (to) is required');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials are not set in environment variables');
  }

  // Create reusable transporter object using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Could not send email');
  }
};

module.exports = ForgetsendEmail;
