import { NextResponse } from "next/server";
import Complaint from "@/models/complaint";
import Engineer from "@/models/engineer";
import { connectMongoDB } from "@/lib/mongodb";
import nodemailer from "nodemailer";

// POST /api/complaint/action
export async function POST(req) {
  try {
    await connectMongoDB();
    console.log("✅ Connected to MongoDB");

    const data = await req.json();
    const {
      complaintId,
      status,
      engineermessage,
      userEmail,  // optional, not used here
      userName,
      title,
    } = data;

    // Validate required fields
    if (!complaintId || !status || !engineermessage || !userName || !title) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Validate status value
    if (!["resolve", "reject"].includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid status value. Must be 'resolve' or 'reject'." },
        { status: 400 }
      );
    }

    // Find complaint by complaintId
    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found." },
        { status: 404 }
      );
    }

    // Determine engineer email: try assignedToEmail first, then engineerEmail, then Engineer model lookup
    let engineerEmail = complaint.assignedToEmail || complaint.engineerEmail;

    if (!engineerEmail && complaint.engineerId) {
      const engineer = await Engineer.findById(complaint.engineerId);
      engineerEmail = engineer?.email;
    }

    if (!engineerEmail) {
      return NextResponse.json(
        { error: "Engineer email not found." },
        { status: 404 }
      );
    }

    // Update complaint status and engineer message
    complaint.status = status.toLowerCase() === "resolve" ? "Resolved" : "Rejected";
    complaint.engineerMessage = engineermessage;
    await complaint.save();
    console.log(`🛠️ Complaint ${complaintId} updated to ${complaint.status}`);

    // Prepare email content
    const emailBody = `
Dear Engineer,

The complaint titled "${title}" (ID: ${complaintId}) has been marked as "${complaint.status}".

Message from engineer:
"${engineermessage}"

Please take the necessary action.

Thank you,
Bank Support Team
`.trim();

    // Send email notification to engineer
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false otherwise
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Bank Support" <${process.env.EMAIL_USER}>`,
        to: engineerEmail,
        subject: `Complaint ${complaint.status} - ID ${complaintId}`,
        text: emailBody,
      });
      console.log("📧 Email sent to engineer:", engineerEmail);

    } catch (emailErr) {
      console.error("❌ Failed to send email:", emailErr.message);
      // Respond success on update, but warn about email failure
      return NextResponse.json({
        warning: "Complaint updated but email failed to send to engineer.",
        emailError: emailErr.message,
      }, { status: 200 });
    }

    // Success response
    return NextResponse.json({
      message: `Complaint ${complaintId} marked as ${complaint.status}. Email sent to engineer.`,
    }, { status: 200 });

  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
