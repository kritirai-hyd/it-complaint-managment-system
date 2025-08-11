// app/api/complaint/[id]/route.js

import { connectMongoDB } from "@/lib/mongodb";
import Complaint from "@/models/complaint";
import mongoose from "mongoose";

export async function PATCH(request, contextPromise) {
  const { params } = await contextPromise;
  const id = params?.id;

  await connectMongoDB();

  // Validate MongoDB ObjectId
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return new Response(
      JSON.stringify({ error: "Invalid complaint ID" }),
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body" }),
      { status: 400 }
    );
  }

  const { status, assignedTo, assignedToEmail, engineerMessage } = body;

  // Validate required fields
  if (!status || !assignedTo || !assignedToEmail) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400 }
    );
  }

  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      {
        status,
        assignedTo,
        assignedToEmail,
        engineerMessage: engineerMessage || "",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedComplaint) {
      return new Response(
        JSON.stringify({ error: "Complaint not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Complaint updated", complaint: updatedComplaint }),
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH error:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { status: 500 }
    );
  }
}
