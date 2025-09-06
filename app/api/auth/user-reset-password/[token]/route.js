// /api/auth/user-reset-password/[token]/route.js
import { connectMongoDB } from "@/lib/mongodb";
import User from '@/models/user';
import bcrypt from 'bcryptjs';

export async function POST(req, { params }) {
  const { token } = params;
  const { password } = await req.json();

  if (!token || !password) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  await connectMongoDB();

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return Response.json({ error: 'Token is invalid or has expired' }, { status: 400 });
  }

  // ✅ Hash new password
  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;

  // ✅ Clear token fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return Response.json({ message: 'Password reset successful' });
}
