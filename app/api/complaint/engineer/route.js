import { connectMongoDB } from "@/lib/mongodb";
import Complaint from "@/models/complaint";

export async function GET(req) {
  try {
    await connectMongoDB();

    const url = new URL(req.url);
    let engineerName = url.searchParams.get("name");

    if (!engineerName || !engineerName.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid engineer name parameter." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    engineerName = engineerName.trim();

    // Case-insensitive exact match for engineer name
    const nameRegex = new RegExp(`^${engineerName}$`, "i");

    const complaints = await Complaint.find({ assignedTo: nameRegex }).lean();

    return new Response(
      JSON.stringify({ complaints }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[engineer Complaints GET Error]:", error);

    return new Response(
      JSON.stringify({ error: "Server error. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
