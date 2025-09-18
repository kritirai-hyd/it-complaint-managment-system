// app/api/register/verify-otp/route.js

import { prisma } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email: rawEmail, otp: enteredOtp } = await req.json();

    if (!rawEmail || !enteredOtp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();

    // Find the latest OTP record for this email (order by creation date desc)
    const otpRecord = await prisma.oTP.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Compare OTP with hashed OTP in DB
    const isOtpValid = await bcrypt.compare(enteredOtp, otpRecord.otp);

    if (!isOtpValid) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Check if user already exists (avoid duplicates)
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create user from OTP record info
    const newUser = await prisma.users.create({
      data: {
        name: otpRecord.name,
        email: otpRecord.email,
        phone: otpRecord.phone,
        password: otpRecord.password,
        role: otpRecord.role,
        otpVerified: true,
      },
    });

    // Delete used OTP record
    await prisma.oTP.delete({ where: { id: otpRecord.id } });

    return NextResponse.json({ message: 'OTP verified, account created', userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
