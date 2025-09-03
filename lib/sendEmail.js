import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(to, otp) {
  console.log(`[sendOtpEmail] Sending OTP (${otp}) to ${to}`);

  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[sendOtpEmail] Sent: ${info.messageId} to ${to}`);
  return info;
}
