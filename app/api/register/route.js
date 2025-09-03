// /app/api/register/route.js
import { hash } from 'bcryptjs';
import User from '@/models/user';
import { connectMongoDB } from '@/lib/mongodb';

export async function POST(req) {
  await connectMongoDB();

  const { name, email, phone, password } = await req.json();

  try {
    // ✅ Check if user already exists by email or phone
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), {
        status: 400,
      });
    }

    // ✅ Hash the password
    const hashedPassword = await hash(password, 10);

    // ✅ Create new user with otpVerified = false by default
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      oldPassword: hashedPassword,
      otpVerified: false, // new users must verify OTP before login
    });

    // TODO: send OTP email/SMS here (optional)

    return new Response(
      JSON.stringify({ message: 'User registered successfully' }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
