import { connectMongoDB } from "@/lib/mongodb";
import Engineer from "@/models/engineer"; // ✅ make sure this exists
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectMongoDB();
  const { name, email, phone, password, role } = await req.json();

  if (!name || !email || !password || !phone || !role) {
    return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
  }

  try {
    const existingUser = await Engineer.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Engineer already exists" }), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEngineer = new Engineer({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    await newEngineer.save();

    return new Response(JSON.stringify({ message: "Engineer registered successfully" }), { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: "Failed to register engineer" }), { status: 500 });
  }
}
