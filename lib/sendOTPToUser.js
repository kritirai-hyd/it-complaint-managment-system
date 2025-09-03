import bcrypt from 'bcryptjs';
import User from '@/models/user';
import Admin from '@/models/admin';
import sendEmail from './sendEmail';

export const sendOTPToUser = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Check in both collections (user + admin)
  const account = await User.findOne({ email }) || await Admin.findOne({ email });
  if (!account) throw new Error('Account not found');

  account.otp = hashedOtp;
  account.otpExpires = otpExpires;
  account.otpVerified = false;

  await account.save();

  // Send via email
  await sendEmail({
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
  });
};
