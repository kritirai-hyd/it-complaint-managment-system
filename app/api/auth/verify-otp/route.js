import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(JSON.stringify({ message: "Email and OTP are required" }), { status: 400 });
    }

    await connectMongoDB();

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+otp +otpExpires +otpVerified");

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    // Check OTP expiry
    if (!user.otpExpires || user.otpExpires < new Date()) {
      return new Response(JSON.stringify({ message: "OTP expired. Please request a new one." }), { status: 400 });
    }

    // Compare hashed OTP
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return new Response(JSON.stringify({ message: "Invalid OTP" }), { status: 400 });
    }

    // OTP is valid
    user.otpVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return new Response(JSON.stringify({ verified: true }), { status: 200 });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
