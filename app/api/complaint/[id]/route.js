// app/api/complaint/[id]/route.js

import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Complaint from "@/models/complaint";

export async function PATCH(request, context) {
  const { params } = context; // ✅ Awaiting not needed here anymore (Next.js >= 13.4.4+ fixed this)
  await connectMongoDB();

  const id = params.id;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { status, assignedTo, assignedToEmail } = body;

  if (!status || !assignedTo || !assignedToEmail) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

try {
  const complaint = await Complaint.findOneAndUpdate(
    { complaintId: id },       // filter by complaintId field
    { status, assignedTo, assignedToEmail }, // update data
    { new: true }              // return updated doc
  );

  if (!complaint) {
    return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Complaint assigned", complaint });
} catch (err) {
  console.error("PATCH error:", err);
  return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
}

}
