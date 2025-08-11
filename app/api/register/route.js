import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, phone, password, oldPassword } = await req.json();

    if (!name || !email || !phone || !password || !oldPassword) {
      return new Response(
        JSON.stringify({ error: "All fields are required." }),
        { status: 400 }
      );
    }

    await connectMongoDB();


    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Email is already registered." }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      oldPassword: hashedPassword, 
    });

    await newUser.save();

    return new Response(
      JSON.stringify({ message: "User registered successfully." }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Error registering user:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500 }
    );
  }
}
