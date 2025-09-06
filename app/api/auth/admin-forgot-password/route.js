import crypto from 'crypto';
import sendResetPasswordEmail from '@/lib/adminsendResetPasswordEmail';  // or wherever your function is
import Admin from '@/models/admin';
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req, res) {
    
  try {
    await connectMongoDB();

    const { email } = await req.json();

    if (!email) return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });

    const admin = await Admin.findOne({ email });

    if (!admin) return new Response(JSON.stringify({ error: 'admin not found' }), { status: 404 });

    // Generate a secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set token expiration (1 hour from now)
    const resetTokenExpiry = Date.now() + 3600 * 1000;

    // Save token & expiry in user document
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = resetTokenExpiry;
    await admin.save();

    // Now call your email function with token
    await sendResetPasswordEmail(email, resetToken);

    return new Response(JSON.stringify({ message: 'Password reset email sent' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
