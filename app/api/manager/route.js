import { connectMongoDB } from "@/lib/mongodb";
import Manager from "@/models/manager";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const register = await req.json();
    const { name, email, phone, password, role } = register;

    if (!name || !email || !phone || !password || !role) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    const allowedRoles = ["manager"];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: "Invalid role" }),
        { status: 400 }
      );
    }

    await connectMongoDB();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    const existingManager = await Manager.findOne({
      $or: [{ email: trimmedEmail }, { phone: trimmedPhone }],
    });
    if (existingManager) {
      return new Response(
        JSON.stringify({ error: "Email or phone number already used" }),
        { status: 400 }
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newManager = new Manager({
      name: name.trim(),
      email: trimmedEmail,
      phone: trimmedPhone,
      password: hashPassword,
      oldPassword: hashPassword, // optional: can also be omitted entirely
      role: role.toLowerCase(),
    });

    await newManager.save();

    return new Response(
      JSON.stringify({ message: "Manager registered successfully" }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Error registering Manager:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
