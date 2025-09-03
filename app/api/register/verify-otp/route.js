import { prisma } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Find latest OTP record for the email
    const record = await prisma.oTP.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json({ error: 'OTP record not found' }, { status: 404 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    const isValidOtp = await bcrypt.compare(otp, record.otp);
    if (!isValidOtp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Create user
    await prisma.users.create({
      data: {
        name: record.name ?? '',
        email: record.email,
        password: record.password ?? '',
        phone: record.phone ?? '',
        otpVerified: true,
        role: record.role ?? 'user',
      },
    });

    // Delete OTP record to clean up
    await prisma.oTP.delete({ where: { id: record.id } });

    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
