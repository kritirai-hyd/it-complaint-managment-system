import { connectMongoDB } from "@/lib/mongodb";
import Complaint from "@/models/complaint";

export async function POST(request) {
  await connectMongoDB();

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { complaintId } = body;

  if (!complaintId) {
    return new Response(JSON.stringify({ error: "Missing complaintId" }), { status: 400 });
  }

  const newComplaintData = {
    ...body,
    complaintId: complaintId, // e.g. 9554
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const complaint = new Complaint(newComplaintData);
    await complaint.save();

    return new Response(
      JSON.stringify({ message: "Complaint created", complaint }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return new Response(JSON.stringify({ error: "Server error", details: error.message }), { status: 500 });
  }
}
