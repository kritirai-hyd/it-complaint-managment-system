// app/api/auth/verify-otp/route.js

import { verifyOTP } from "@/lib/otp";
import User from "@/models/user";
import jwt from "jsonwebtoken";
import { connectMongoDB } from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    await connectMongoDB();

    const valid = await verifyOTP(email, otp);
    if (!valid) {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "OTP verified successfully", token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
}
