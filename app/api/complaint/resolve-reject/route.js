import { connectMongoDB } from "@/lib/mongodb";
import Complaint from "@/models/complaint";
import nodemailer from "nodemailer";

export async function POST(req) {
  let body;

  // Parse JSON body safely
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), { status: 400 });
  }

  const { id, status, engineerMessage } = body;
  const numericId = Number(id);

  // Validate complaint ID - must be numeric
  if (!numericId || isNaN(numericId)) {
    return new Response(JSON.stringify({ error: "Invalid or missing complaint ID." }), {
      status: 400,
    });
  }

  // Validate status value
  const allowedStatuses = ["Resolved", "Rejected"];
  if (!allowedStatuses.includes(status)) {
    return new Response(JSON.stringify({ error: "Invalid status value." }), { status: 400 });
  }

  // Validate engineer message
  if (!engineerMessage?.trim()) {
    return new Response(JSON.stringify({ error: "engineer message is required." }), { status: 400 });
  }

  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Find complaint by complaintid (numeric)
    const complaint = await Complaint.findOne({ complaintid: numericId });
    if (!complaint) {
      return new Response(JSON.stringify({ error: "Complaint not found." }), { status: 404 });
    }

    // Update complaint with new status and engineer message
    const updated = await Complaint.findOneAndUpdate(
      { complaintid: numericId },
      {
        status,
        engineerMessage,
        resolutionMessage: engineerMessage,
        updatedAt: new Date(),
      },
      { new: true }
    );

    // Determine complaint ID for email (fallback to complaintId or _id string)
    const complaintIdForEmail =
      updated.complaintid || updated.complaintId || (updated._id ? updated._id.toString() : "Unknown ID");

    // Send email notification to user if email exists
    if (updated.userEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"Support Team" <${process.env.EMAIL_USER}>`,
          to: updated.userEmail,
          subject: `Complaint #${complaintIdForEmail} - ${status}`,
          text: `
Dear ${updated.name || "Customer"},

Your complaint (ID: ${complaintIdForEmail}) has been marked as "${status}".

Message from our support team:
"${engineerMessage}"

If you need further help, feel free to reply to this email or contact support.

Best regards,
Support Team
          `.trim(),
        };

        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error("❌ Failed to send email:", emailErr);
        // Return 200 because complaint was updated, but email failed
        return new Response(
          JSON.stringify({
            warning: "Complaint updated but email failed to send.",
            emailError: emailErr.message,
          }),
          { status: 200 }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Complaint #${complaintIdForEmail} marked as "${status}". User notified via email.`,
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
