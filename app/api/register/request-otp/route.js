// app/api/register/request-otp/route.js

import { prisma } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/sendOtpEmail';

export async function POST(req) {
  try {
    const { name, email: rawEmail, phone, password } = await req.json();

    // ✅ Validate inputs
    if (!name || !rawEmail || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();

    // ✅ Check if user already exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // ✅ Remove any existing OTPs for this email
    await prisma.oTP.deleteMany({ where: { email } });

    // ✅ Store OTP and user details
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

    // ✅ Send OTP via email
    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'OTP sent to email' }, { status: 200 });
  } catch (err) {
    console.error('Error in request-otp:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
