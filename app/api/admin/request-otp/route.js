// /api/admin/request-otp.js
import { connectMongoDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import bcrypt from "bcryptjs";
import { sendAdminOtpEmail } from '@/lib/sendAdminOtpEmail';

export async function POST(req) {
  try {
    const { name, email, phone, password, role } = await req.json();

    if (!name || !email || !phone || !password || !role) {
      return new Response(JSON.stringify({ error: "All fields are required." }), { status: 400 });
    }

    const allowedRoles = ["admin", "manager", "engineer"];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return new Response(JSON.stringify({ error: "Invalid role." }), { status: 400 });
    }

    await connectMongoDB();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    // Check if email or phone already used
    const existing = await Admin.findOne({
      $or: [{ email: trimmedEmail }, { phone: trimmedPhone }],
    });

    if (existing) {
      return new Response(JSON.stringify({ error: "Email or phone already used." }), { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password to store in temp admin (not fully saved yet)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert a "pre-registration" document
    await Admin.findOneAndUpdate(
      { email: trimmedEmail },
      {
        name: name.trim(),
        email: trimmedEmail,
        phone: trimmedPhone,
        password: hashedPassword,
        role: role.toLowerCase(),
        otp,
        otpExpires,
        otpVerified: false,
      },
      { upsert: true, new: true }
    );

    // Send OTP to email
await sendAdminOtpEmail({
  to: trimmedEmail,
  subject: "Your OTP Code",
  text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
});

    return new Response(JSON.stringify({ message: "OTP sent to email." }), { status: 200 });

  } catch (err) {
    console.error("Error sending OTP:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error." }), { status: 500 });
  }
}
