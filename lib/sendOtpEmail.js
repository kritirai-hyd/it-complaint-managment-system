// lib/sendOtpEmail.js

import nodemailer from 'nodemailer';

export async function sendOtpEmail(email, otp) {
  console.log(`[sendOtpEmail] Sending OTP ${otp} to ${email}`);

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}
