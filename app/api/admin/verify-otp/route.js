// /api/admin/verify-otp.js
import { connectMongoDB } from "@/lib/mongodb";
import Admin from "@/models/admin";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: "Email and OTP are required." }), { status: 400 });
    }

    await connectMongoDB();

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select("+otp +otpExpires");

    if (!admin) {
      return new Response(JSON.stringify({ error: "Admin not found." }), { status: 404 });
    }

    if (admin.otpVerified) {
      return new Response(JSON.stringify({ error: "OTP already verified." }), { status: 400 });
    }

    if (!admin.otp || !admin.otpExpires || admin.otp !== otp.trim()) {
      return new Response(JSON.stringify({ error: "Invalid OTP." }), { status: 400 });
    }

    if (new Date() > new Date(admin.otpExpires)) {
      return new Response(JSON.stringify({ error: "OTP expired." }), { status: 400 });
    }

    // Mark as verified
    admin.otpVerified = true;
    admin.otp = undefined;
    admin.otpExpires = undefined;

    await admin.save();

    return new Response(JSON.stringify({ message: "OTP verified. Registration complete." }), { status: 200 });

  } catch (err) {
    console.error("OTP verification error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error." }), { status: 500 });
  }
}
