// /api/auth/user-reset-password/[token]/route.js
import { connectMongoDB } from "@/lib/mongodb";
import Admin from '@/models/admin';
import bcrypt from 'bcryptjs';

export async function POST(req, { params }) {
  const { token } = params;
  const { password } = await req.json();

  if (!token || !password) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  await connectMongoDB();

  const admin = await Admin.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!admin) {
    return Response.json({ error: 'Token is invalid or has expired' }, { status: 400 });
  }

  // ✅ Hash new password
  const hashed = await bcrypt.hash(password, 10);
  admin.password = hashed;

  // ✅ Clear token fields
admin.resetPasswordToken = undefined;
admin.resetPasswordExpires = undefined;

  await admin.save();

  return Response.json({ message: 'Password reset successful' });
}
