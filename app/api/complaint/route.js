import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Complaint from "@/models/complaint";
import cloudinary from "@/lib/cloudinary";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import { Readable } from "stream";

// Disable body parsing for formidable to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILE_COUNT = 5;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

// Utility: Create temp upload directory
const createTempDir = () => {
  const tempDir = path.join(process.cwd(), "temp_uploads");
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

// Utility: Sanitize filename for safety and consistency
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9-_.]/g, "_").substring(0, 100);
};

// Normalize form fields to single string trimmed value
const normalizeField = (field) => {
  if (Array.isArray(field)) return field[0]?.toString().trim() || "";
  return field?.toString().trim() || "";
};

// Convert Next.js Request to Node.js Readable for formidable
const toNodeReadable = (webReq) => {
  const readable = Readable.from(webReq.body);
  Object.assign(readable, {
    headers: Object.fromEntries(webReq.headers),
    method: webReq.method,
    url: webReq.url,
  });
  return readable;
};

// Field validation configuration
const FIELD_CONFIG = {
  Name: { dbField: "name", required: true, maxLength: 100 },
  Email: {
    dbField: "userEmail",
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    error: "Please enter a valid email address",
  },
  "Phone Number": {
    dbField: "phone",
    required: true,
    pattern: /^\d{10}$/,
    error: "Phone number must be 10 digits",
  },
  "Complaint Type": { dbField: "complaintType", required: true },
  "Complaint Sub-Type": { dbField: "complaintSubType" },
  Location: { dbField: "location", required: true },
  "Company Name": { dbField: "companyAddress", required: true },
  Title: { dbField: "title", required: true, maxLength: 200 },
  Description: { dbField: "description", required: true, maxLength: 2000 },
};

// Validate form fields
const validateFields = (fields) => {
  const errors = [];
  const cleanData = {};

  for (const [fieldName, config] of Object.entries(FIELD_CONFIG)) {
    const value = normalizeField(fields[fieldName]);

    if (config.required && !value) {
      errors.push(`${fieldName} is required`);
      continue;
    }

    if (value) {
      if (config.maxLength && value.length > config.maxLength) {
        errors.push(`${fieldName} must be less than ${config.maxLength} characters`);
      } else if (config.pattern && !config.pattern.test(value)) {
        errors.push(config.error || `Invalid ${fieldName} format`);
      } else {
        cleanData[config.dbField] = value;
      }
    }
  }

  return { cleanData, errors };
};

// Validate uploaded files
const validateFiles = (files) => {
  const errors = [];
  let totalSize = 0;

  const fileList = Array.isArray(files) ? files : files ? [files] : [];

  if (fileList.length > MAX_FILE_COUNT) {
    errors.push(`Maximum ${MAX_FILE_COUNT} files allowed`);
    return { errors };
  }

  for (const file of fileList) {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File "${file.originalFilename}" exceeds 5MB limit`);
      continue;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      errors.push(`File type not supported: ${file.originalFilename}`);
      continue;
    }

    totalSize += file.size;
    if (totalSize > MAX_TOTAL_FILE_SIZE) {
      errors.push("Total attachments size exceeds 20MB limit");
      break;
    }
  }

  return { errors, fileList, totalSize };
};

// Upload a single file to Cloudinary and clean up temp file
const uploadToCloudinary = async (filePath, originalName) => {
  try {
    const safeName = sanitizeFilename(originalName);
    const publicId = `complaints/${safeName}_${Date.now()}`;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "complaints",
      resource_type: "auto",
      public_id: publicId,
      overwrite: false,
    });

    return {
      url: result.secure_url,
      name: originalName,
      type: result.resource_type,
      size: result.bytes,
    };
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error("Failed to delete temp file:", filePath);
    }
  }
};

// Process multiple attachments
const processAttachments = async (files) => {
  const attachments = [];

  for (const file of files) {
    try {
      const uploadedFile = await uploadToCloudinary(file.filepath, file.originalFilename);
      attachments.push(uploadedFile);
    } catch (error) {
      console.error("Failed to upload file:", file.originalFilename, error);
      throw new Error(`Failed to process ${file.originalFilename}`);
    }
  }

  return attachments;
};

// Parse multipart form data using formidable
const parseFormData = async (nodeReq) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      maxFiles: MAX_FILE_COUNT,
      maxFileSize: MAX_FILE_SIZE,
      uploadDir: createTempDir(),
      keepExtensions: true,
      filter: (part) => {
        // Allow only allowed mimetypes or no mimetype (form fields)
        return part.mimetype ? ALLOWED_FILE_TYPES.includes(part.mimetype) : true;
      },
    });

    form.parse(nodeReq, (err, fields, files) => {
      if (err) {
        reject(new Error("Failed to parse form data"));
      } else {
        resolve({ fields, files });
      }
    });
  });
};

// Generate unique 4-digit complaint ID
const generateComplaintId = async () => {
  let attempts = 0;
  while (attempts < 10) {
    const id = Math.floor(1000 + Math.random() * 9000);
    const exists = await Complaint.exists({ complaintId: id });
    if (!exists) return id;
    attempts++;
  }
  throw new Error("Failed to generate unique complaint ID");
};

// POST handler to submit a new complaint
export async function POST(req) {
  try {
    await connectMongoDB();

    const nodeReq = toNodeReadable(req); // Convert to Node.js stream
    const { fields, files } = await parseFormData(nodeReq);

    // Validate form fields
    const { cleanData, errors: fieldErrors } = validateFields(fields);
    if (fieldErrors.length > 0) {
      return NextResponse.json({ success: false, errors: fieldErrors }, { status: 400 });
    }

    // Validate and process attachments if any
    let attachments = [];
    if (files.files) {
      const { errors: fileErrors, fileList } = validateFiles(files.files);
      if (fileErrors.length > 0) {
        return NextResponse.json({ success: false, errors: fileErrors }, { status: 400 });
      }
      attachments = await processAttachments(fileList);
    }

    // Create complaint document
    const complaint = new Complaint({
      ...cleanData,
      complaintId: await generateComplaintId(),
      attachments,
      status: "pending",
      createdAt: new Date(),
    });

    await complaint.save();

    return NextResponse.json(
      {
        success: true,
        complaintId: complaint.complaintId,
        message: "Complaint submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/complaint error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET handler to retrieve complaints
export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);

    const email = searchParams.get("email");
    const isAdmin = searchParams.get("admin") === "true";

    if (!isAdmin && !email) {
      return NextResponse.json(
        { success: false, message: "Email parameter is required" },
        { status: 400 }
      );
    }

    const filter = isAdmin ? {} : { userEmail: email };
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const assignedTo = searchParams.get("assignedTo");

    if (status) filter.status = status;
    if (type) filter.complaintType = type;
    if (assignedTo) filter.assignedToEmail = assignedTo;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error("GET /api/complaint error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
