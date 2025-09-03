module.exports = {

"[project]/.next-internal/server/app/api/complaint/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[externals]/mongoose [external] (mongoose, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("mongoose", () => require("mongoose"));

module.exports = mod;
}}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}}),
"[project]/lib/mongodb.js [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// lib/mongodb.js
__turbopack_context__.s({
    "connectMongoDB": ()=>connectMongoDB,
    "getUserByEmail": ()=>getUserByEmail,
    "prisma": ()=>prisma
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not defined in environment variables");
}
const getUserByEmail = async (email)=>{
    return prisma.user.findUnique({
        where: {
            email
        }
    });
};
// Mongoose connection cache
let cached = ("TURBOPACK ident replacement", globalThis).mongoose;
if (!cached) {
    cached = ("TURBOPACK ident replacement", globalThis).mongoose = {
        conn: null,
        promise: null
    };
}
async function connectMongoDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then((mongoose)=>{
            console.log("✅ Connected to MongoDB");
            return mongoose;
        }).catch((err)=>{
            console.error("❌ MongoDB connection error:", err);
            throw err;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
;
}),
"[project]/models/complaint.js [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
const attachmentSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].Schema({
    url: {
        type: String,
        required: true
    },
    name: String,
    type: String,
    size: Number
});
const complaintSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].Schema({
    complaintId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    phone: String,
    complaintType: String,
    complaintSubType: String,
    location: String,
    companyAddress: String,
    title: String,
    description: String,
    status: {
        type: String,
        default: "pending"
    },
    attachments: [
        attachmentSchema
    ],
    assignedTo: {
        type: String,
        default: ""
    },
    assignedToEmail: {
        type: String,
        default: ""
    },
    engineerMessage: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});
const Complaint = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.Complaint || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model("Complaint", complaintSchema);
const __TURBOPACK__default__export__ = Complaint;
}),
"[externals]/crypto [external] (crypto, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}}),
"[externals]/querystring [external] (querystring, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}}),
"[externals]/url [external] (url, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}}),
"[externals]/fs [external] (fs, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[externals]/path [external] (path, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}}),
"[externals]/https [external] (https, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}}),
"[externals]/http [external] (http, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}}),
"[externals]/stream [external] (stream, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[project]/lib/cloudinary.js [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript)");
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v2"].config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v2"];
}),
"[externals]/node:fs [external] (node:fs, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}}),
"[externals]/node:crypto [external] (node:crypto, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}}),
"[externals]/node:events [external] (node:events, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}}),
"[externals]/domain [external] (domain, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("domain", () => require("domain"));

module.exports = mod;
}}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}}),
"[externals]/node:os [external] (node:os, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:os", () => require("node:os"));

module.exports = mod;
}}),
"[externals]/node:path [external] (node:path, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}}),
"[externals]/node:string_decoder [external] (node:string_decoder, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:string_decoder", () => require("node:string_decoder"));

module.exports = mod;
}}),
"[externals]/node:stream [external] (node:stream, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}}),
"[externals]/fs/promises [external] (fs/promises, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/app/api/complaint/route.js [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "GET": ()=>GET,
    "POST": ()=>POST,
    "config": ()=>config
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mongodb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mongodb.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$complaint$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/complaint.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cloudinary.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$formidable$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/formidable/src/index.js [app-route] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$formidable$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/formidable/src/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const config = {
    api: {
        bodyParser: false
    }
};
// File settings
const MAX_FILE_COUNT = 10; // Still limiting to avoid abuse
// Utility: Create temporary upload directory
const createTempDir = ()=>{
    const tempDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "temp_uploads");
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(tempDir)) {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["mkdirSync"])(tempDir, {
            recursive: true
        });
    }
    return tempDir;
};
// Utility: Sanitize file names
const sanitizeFilename = (filename)=>{
    return filename.replace(/[^a-zA-Z0-9-_.]/g, "_").substring(0, 100);
};
// Normalize form field
const normalizeField = (field)=>{
    if (Array.isArray(field)) return field[0]?.toString().trim() || "";
    return field?.toString().trim() || "";
};
// Convert Next.js Request to Node.js Readable
const toNodeReadable = (webReq)=>{
    const readable = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["Readable"].from(webReq.body);
    Object.assign(readable, {
        headers: Object.fromEntries(webReq.headers),
        method: webReq.method,
        url: webReq.url
    });
    return readable;
};
// Field configuration
const FIELD_CONFIG = {
    Name: {
        dbField: "name",
        required: true,
        maxLength: 100
    },
    Email: {
        dbField: "userEmail",
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        error: "Please enter a valid email address"
    },
    "Phone Number": {
        dbField: "phone",
        required: true,
        pattern: /^\d{10}$/,
        error: "Phone number must be 10 digits"
    },
    "Complaint Type": {
        dbField: "complaintType",
        required: true
    },
    "Complaint Sub-Type": {
        dbField: "complaintSubType"
    },
    Location: {
        dbField: "location",
        required: true
    },
    "Company Name": {
        dbField: "companyAddress",
        required: true
    },
    Title: {
        dbField: "title",
        required: true,
        maxLength: 200
    },
    Description: {
        dbField: "description",
        required: true,
        maxLength: 2000
    }
};
// Validate form fields
const validateFields = (fields)=>{
    const errors = [];
    const cleanData = {};
    for (const [fieldName, config] of Object.entries(FIELD_CONFIG)){
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
    return {
        cleanData,
        errors
    };
};
// Validate files - only max count
const validateFiles = (files)=>{
    const errors = [];
    const fileList = Array.isArray(files) ? files : files ? [
        files
    ] : [];
    if (fileList.length > MAX_FILE_COUNT) {
        errors.push(`Maximum ${MAX_FILE_COUNT} files allowed`);
    }
    return {
        errors,
        fileList
    };
};
// Upload to Cloudinary
const uploadToCloudinary = async (filePath, originalName)=>{
    try {
        const safeName = sanitizeFilename(originalName);
        const publicId = `complaints/${safeName}_${Date.now()}`;
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].uploader.upload(filePath, {
            folder: "complaints",
            resource_type: "auto",
            public_id: publicId,
            overwrite: false
        });
        return {
            url: result.secure_url,
            name: originalName,
            type: result.resource_type,
            size: result.bytes
        };
    } finally{
        // Clean up temporary file
        try {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(filePath);
        } catch (err) {
            console.error("Failed to delete temp file:", filePath);
        }
    }
};
// Handle all files
const processAttachments = async (files)=>{
    const attachments = [];
    for (const file of files){
        try {
            const uploaded = await uploadToCloudinary(file.filepath, file.originalFilename);
            attachments.push(uploaded);
        } catch (error) {
            console.error("Upload failed:", file.originalFilename, error);
            throw new Error(`Failed to process ${file.originalFilename}`);
        }
    }
    return attachments;
};
// Parse multipart form data
const parseFormData = async (nodeReq)=>{
    return new Promise((resolve, reject)=>{
        const form = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$formidable$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])({
            multiples: true,
            maxFiles: MAX_FILE_COUNT,
            maxFileSize: Infinity,
            uploadDir: createTempDir(),
            keepExtensions: true,
            filter: ()=>true
        });
        form.parse(nodeReq, (err, fields, files)=>{
            if (err) {
                reject(new Error("Failed to parse form data"));
            } else {
                resolve({
                    fields,
                    files
                });
            }
        });
    });
};
// Generate random 4-digit complaint ID
const generateComplaintId = async ()=>{
    let attempts = 0;
    while(attempts < 10){
        const id = Math.floor(1000 + Math.random() * 9000);
        const exists = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$complaint$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].exists({
            complaintId: id
        });
        if (!exists) return id;
        attempts++;
    }
    throw new Error("Failed to generate unique complaint ID");
};
async function POST(req) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mongodb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectMongoDB"])();
        const nodeReq = toNodeReadable(req);
        const { fields, files } = await parseFormData(nodeReq);
        const { cleanData, errors: fieldErrors } = validateFields(fields);
        if (fieldErrors.length > 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                errors: fieldErrors
            }, {
                status: 400
            });
        }
        let attachments = [];
        if (files.files) {
            const { errors: fileErrors, fileList } = validateFiles(files.files);
            if (fileErrors.length > 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    errors: fileErrors
                }, {
                    status: 400
                });
            }
            attachments = await processAttachments(fileList);
        }
        const complaint = new __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$complaint$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
            ...cleanData,
            complaintId: await generateComplaintId(),
            attachments,
            status: "pending",
            createdAt: new Date()
        });
        await complaint.save();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            complaintId: complaint.complaintId,
            message: "Complaint submitted successfully"
        }, {
            status: 201
        });
    } catch (error) {
        console.error("POST /api/complaint error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: error.message || "Internal server error"
        }, {
            status: 500
        });
    }
}
async function GET(req) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mongodb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectMongoDB"])();
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
        const isAdmin = searchParams.get("admin") === "true";
        const isManager = searchParams.get("manager") === "true";
        if (!isAdmin && !isManager && !email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: "Email parameter is required"
            }, {
                status: 400
            });
        }
        const filter = isAdmin || isManager ? {} : {
            userEmail: email
        };
        const status = searchParams.get("status");
        const type = searchParams.get("type");
        const assignedTo = searchParams.get("assignedTo");
        if (status) filter.status = status;
        if (type) filter.complaintType = type;
        if (assignedTo) filter.assignedToEmail = assignedTo;
        const complaints = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$complaint$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find(filter).sort({
            createdAt: -1
        }).limit(100).lean();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            complaints
        });
    } catch (error) {
        console.error("GET /api/complaint error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: error.message || "Internal server error"
        }, {
            status: 500
        });
    }
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__b8d1e4fb._.js.map