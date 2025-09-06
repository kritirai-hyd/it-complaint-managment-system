import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    oldPassword: {
      type: String,
      select: false,
    },
    otp: {
      type: String,
      select: true,
    },
    otpExpires: {
      type: Date,
      select: true,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    otpRequired: {
      type: Boolean,
      select: false,
      default: false,
    },

    // ✅ Fix: Add password reset fields here
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
