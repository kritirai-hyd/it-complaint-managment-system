import { connectMongoDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "@/lib/sendEmail";

export async function POST(req) {
  try {
    const { email, role } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });

    await connectMongoDB();

    const isAdmin = role && ["admin", "manager", "engineer"].includes(role.toLowerCase());
    const Model = isAdmin ? Admin : User;

    const user = await Model.findOne({ email: email.toLowerCase() });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(code, 10);
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = hashedOtp;
    user.otpExpires = expires;
    user.otpRequired = true;
    await user.save();

    await sendOtpEmail(user.email, code);

    return new Response(JSON.stringify({ message: "OTP sent to email" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
