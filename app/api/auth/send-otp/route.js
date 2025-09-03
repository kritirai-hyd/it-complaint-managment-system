import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';
import sendEmail from '@/lib/sendEmail';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), { status: 400 });
    }

    await connectMongoDB();

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    // Prevent spamming - OTP already sent and valid
    if (user.otp && user.otpExpires > new Date()) {
      return new Response(JSON.stringify({ 
        message: "OTP already sent. Please wait before requesting again." 
      }), { status: 429 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // You should hash the OTP before storing it for security!
    const hashedOTP = await bcrypt.hash(otp, 10);

    user.otp = hashedOTP; // Store hashed OTP, never plaintext
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    user.otpVerified = false;

    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "Your OTP Code",
        html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
      });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return new Response(JSON.stringify({ message: "Failed to send OTP email" }), { status: 500 });
    }

    return new Response(JSON.stringify({ otpSent: true }), { status: 200 });
  } catch (error) {
    console.error("Error in send-otp:", error);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
