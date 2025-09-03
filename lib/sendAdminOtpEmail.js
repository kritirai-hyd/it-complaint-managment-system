// lib/sendAdminOtpEmail.js

import nodemailer from "nodemailer";

export async function sendAdminOtpEmail({ to, subject, text, html }) {
  console.log(`[sendAdminOtpEmail] Sending OTP to ${to}`);

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or your SMTP provider
      auth: {
        user: process.env.EMAIL_USER,  // ⚠️ Use a different email account
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Admin Verification" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Admin OTP email sent:", info.response);
  } catch (error) {
    console.error("Error sending admin OTP email:", error);
    throw new Error("Failed to send admin OTP email");
  }
}
