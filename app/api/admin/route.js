import { connectMongoDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, phone, password, role } = await req.json();

    if (!name || !email || !phone || !password || !role) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    const allowedRoles = ["admin", "manager", "engineer"];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: "Invalid role" }),
        { status: 400 }
      );
    }

    await connectMongoDB();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    const existingAdmin = await Admin.findOne({
      $or: [{ email: trimmedEmail }, { phone: trimmedPhone }],
    });

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: "Email or phone number already used" }),
        { status: 400 }
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name: name.trim(),
      email: trimmedEmail,
      phone: trimmedPhone,
      password: hashPassword,
      oldPassword: null,
      role: role.toLowerCase(),
    });

    await newAdmin.save();

    return new Response(
      JSON.stringify({ message: "Admin registered successfully" }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Error registering admin:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
