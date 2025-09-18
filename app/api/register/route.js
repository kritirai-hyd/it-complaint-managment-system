import { prisma } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/sendOtpEmail';

export async function POST(req) {
  try {
    const { email: rawEmail, name, phone, password } = await req.json();

    if (!rawEmail || !name || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();

    // Check if user exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Remove existing OTPs
    await prisma.oTP.deleteMany({ where: { email } });

    // Store OTP and user info
    await prisma.oTP.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        otp: hashedOtp,
        expiresAt,
        role: 'user',
      },
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    return NextResponse.json({ message: 'OTP sent to email' }, { status: 200 });

  } catch (error) {
    console.error('Error in request-otp:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
