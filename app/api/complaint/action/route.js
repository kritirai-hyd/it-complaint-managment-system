// app/api/complaint/status/route.js
import { NextResponse } from "next/server";
import Complaint from "@/models/complaint";
import { connectMongoDB } from "@/lib/mongodb";
import sendEmail from "@/utils/sendEmail";

export async function POST(req) {
  try {
    await connectMongoDB();

    const { complaintId, status, engineermessage, userEmail, userName, title } = await req.json();

    if (!complaintId || !status || !engineermessage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["resolve", "reject"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    complaint.status = status === "resolve" ? "Resolved" : "Rejected";
    complaint.engineerMessage = engineermessage;
    await complaint.save();

    const emailBody = `
Dear ${userName},

Your complaint titled "${title}" has been ${complaint.status}.

Message from our engineer:
"${engineermessage}"

If you're not satisfied, click here to reopen: http://localhost:3000/reopen/${complaintId}

Thank you,  
Bank Support Team
`;

    await sendEmail(userEmail, {
      subject: `Complaint ${complaint.status} - ID ${complaintId}`,
      body: emailBody,
    });

    return NextResponse.json({ message: "Complaint updated and email sent" });
  } catch (err) {
    console.error("POST /api/complaint/status error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
