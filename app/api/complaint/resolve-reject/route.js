import { connectMongoDB } from "@/lib/mongodb";
import Complaint from "@/models/complaint";
import nodemailer from "nodemailer";

// POST /api/complaint/resolve-reject
export async function POST(req) {
  console.log("✅ POST /api/complaint/resolve-reject hit");

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
    });
  }

  const { id, status, engineerMessage } = body;
  const numericId = Number(id);

  // Validation
  if (!numericId || isNaN(numericId)) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing complaint ID." }),
      { status: 400 }
    );
  }

  const allowedStatuses = ["Resolved", "Rejected"];
  if (!allowedStatuses.includes(status)) {
    return new Response(JSON.stringify({ error: "Invalid status value." }), {
      status: 400,
    });
  }

  if (!engineerMessage?.trim()) {
    return new Response(
      JSON.stringify({ error: "Engineer message is required." }),
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();

    const complaint = await Complaint.findOne({ complaintId: numericId }); 
    if (!complaint) {
      return new Response(JSON.stringify({ error: "Complaint not found." }), {
        status: 404,
      });
    }

    const updated = await Complaint.findOneAndUpdate(
      { complaintId: numericId },
      {
        status,
        engineerMessage,
        resolutionMessage: engineerMessage,
        updatedAt: new Date(),
      },
      { new: true }
    );

    const complaintIdForEmail =
      updated.complaintId ||
      updated.complaintid ||
      (updated._id ? updated._id.toString() : "Unknown ID");

    // Get engineer email from assignedToEmail field
    const engineerEmail = updated.assignedToEmail;
    if (!engineerEmail) {
      return new Response(
        JSON.stringify({ error: "Assigned engineer email not found." }),
        { status: 404 }
      );
    }

    // Send email to engineer
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

      const mailOptions = {
        from: `"Support Team" <${process.env.EMAIL_USER}>`,
        to: engineerEmail,
        subject: `Complaint #${complaintIdForEmail} - ${status}`,
        text: `
Dear Engineer,

The complaint (ID: ${complaintIdForEmail}) has been marked as "${status}".

Message from the engineer:
"${engineerMessage}"

Please take the necessary action.

Best regards,  
Support Team
        `.trim(),
      };

      await transporter.sendMail(mailOptions);
      console.log("📧 Email sent to engineer:", engineerEmail);
    } catch (emailErr) {
      console.error("❌ Failed to send email:", emailErr);
      return new Response(
        JSON.stringify({
          warning: "Complaint updated but email failed to send to engineer.",
          emailError: emailErr.message,
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Complaint #${complaintIdForEmail} marked as "${status}". Engineer notified via email.`,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Server error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to update complaint status." }),
      { status: 500 }
    );
  }
}
