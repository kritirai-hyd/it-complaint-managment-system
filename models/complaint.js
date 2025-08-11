import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: String,
  type: String,
  size: Number,
});

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    userEmail: { type: String, required: true },
    phone: String,
    complaintType: String,
    complaintSubType: String,
    location: String,
    companyAddress: String,
    title: String,
    description: String,
    status: { type: String, default: "pending" },
    attachments: [attachmentSchema],
        assignedTo: { type: String, default: "" },
    assignedToEmail: { type: String, default: "" },
    engineerMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);

export default Complaint;
