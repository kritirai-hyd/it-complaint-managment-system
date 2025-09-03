// app/api/register/request-otp/route.js

import { prisma } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { sendOtpEmail } from '@/lib/sendOtpEmail';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP in DB
    await prisma.oTP.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send OTP Email — ✅ fixed call
    await sendOtpEmail(email, otp);

    return NextResponse.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Error in request-otp:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
