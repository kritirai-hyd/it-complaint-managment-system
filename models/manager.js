import mongoose from "mongoose";

// Allowed roles array (only manager)
const allowedRoles = ["manager"];

const ManagerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Manager name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, "Please use a valid 10-digit phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    oldPassword: {
      type: String,
      minlength: 6,
      default: null,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: allowedRoles,
        message: "Role must be 'manager'",
      },
      lowercase: true,
      trim: true,
    },
otp: { type: String, select: false },
otpExpires: { type: Date, select: false },
otpVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);


ManagerSchema.pre("save", function (next) {
  if (this.email) this.email = this.email.toLowerCase();
  if (this.role) this.role = this.role.toLowerCase();
  next();
});

const Manager = mongoose.models.Manager || mongoose.model("Manager", ManagerSchema);

export default Manager;
