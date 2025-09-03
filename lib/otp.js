// lib/otp.js

import User from "@/models/user";

export async function generateOTP(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationDate = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await User.updateOne(
    { email },
    { otp, otpExpires: expirationDate, otpVerified: false }
  );

  return otp;
}

export async function verifyOTP(email, otp) {
  const user = await User.findOne({ email }).select("+otp +otpExpires +otpVerified");
  if (!user || !user.otp || !user.otpExpires) return false;
  if (user.otpVerified) return false;
  if (user.otp !== otp) return false;
  if (user.otpExpires < new Date()) return false;

  await User.updateOne(
    { email },
    { otpVerified: true, $unset: { otp: "", otpExpires: "" } }
  );

  return true;
}
