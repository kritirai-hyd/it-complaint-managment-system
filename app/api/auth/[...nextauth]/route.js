import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import { connectMongoDB } from "@/lib/mongodb";
import sendEmail from "@/lib/sendEmail";

import Admin from "@/models/admin";
import Manager from "@/models/manager";
import Engineer from "@/models/engineer";
import User from "@/models/user";

const roleModelMap = {
  admin: Admin,
  manager: Manager,
  engineer: Engineer,
  user: User,
};

const generateOTP = () => ({
  code: Math.floor(100000 + Math.random() * 900000).toString(),
  expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry
});

const sendOTPEmail = async (email, code) => {
  await sendEmail({
    to: email,
    subject: "Your One-Time Password (OTP)",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Verification Code</h2>
        <p>Please use the following code to complete your login:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center;">
          <h3>${code}</h3>
        </div>
        <p style="font-size: 14px; color: #666;">This code will expire in 15 minutes.</p>
      </div>
    `,
  });
};

const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        otp: { label: "OTP", type: "text", placeholder: "123456" },
        resendOtp: { label: "Resend OTP", type: "boolean" },  // Custom flag for resend
      },
      async authorize(credentials) {
        try {
          const { email, password, role = "user", otp, resendOtp } = credentials || {};

          if (!email || !password) throw new Error("Email and password are required");

          await connectMongoDB();

          const modelKey = role.toLowerCase();
          const Model = roleModelMap[modelKey];
          if (!Model) throw new Error("Invalid user role");

          // Select OTP and password fields explicitly
          const user = await Model.findOne({ email }).select("+password +otp +otpExpires +otpVerified +otpRequired");
          if (!user) throw new Error("Invalid email or password");

          if (!user.password) throw new Error("Please use your social login provider");

          // Validate password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) throw new Error("Invalid email or password");

          // Ensure otpRequired exists
          if (typeof user.otpRequired !== "boolean") {
            user.otpRequired = true;
            await user.save();
          }

          // Handle resend OTP request
          if (resendOtp) {
            const { code, expiresAt } = generateOTP();
            const hashedOTP = await bcrypt.hash(code, 10);
            user.otp = hashedOTP;
            user.otpExpires = expiresAt;
            user.otpVerified = false;
            await user.save();

            await sendOTPEmail(user.email, code);
            throw new Error("OTP_SENT");  // Special error to inform frontend
          }

          // Handle OTP requirement and verification
          if (user.otpRequired) {
            if (!otp) {
              // No OTP provided, generate/send if needed
              if (!user.otp || new Date(user.otpExpires) < new Date()) {
                const { code, expiresAt } = generateOTP();
                const hashedOTP = await bcrypt.hash(code, 10);

                user.otp = hashedOTP;
                user.otpExpires = expiresAt;
                user.otpVerified = false;
                await user.save();

                await sendOTPEmail(user.email, code);
              }
              throw new Error("OTP_REQUIRED");
            }

            // Validate OTP
            if (!user.otp || !user.otpExpires) {
              throw new Error("No OTP found. Please request a new one.");
            }

            if (new Date(user.otpExpires) < new Date()) {
              throw new Error("OTP has expired. Please request a new one.");
            }

            const isOtpValid = await bcrypt.compare(otp, user.otp);
            if (!isOtpValid) throw new Error("Invalid OTP code");

            // OTP verified - clear OTP and mark verified
            user.otp = undefined;
            user.otpExpires = undefined;
            user.otpVerified = true;
            await user.save();
          }

          // Successful login
          return {
            id: user._id.toString(),
            email: user.email,
            role: modelKey,
            name: user.name || "",
            otpVerified: user.otpVerified || false,
          };
        } catch (error) {
          // Log for debugging
          console.error("Authentication error:", error.message);

          // Propagate special errors so frontend can handle them
          if (["OTP_REQUIRED", "OTP_SENT"].includes(error.message)) {
            throw new Error(error.message);
          }
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.otpVerified = user.otpVerified || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.otpVerified = token.otpVerified || false;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-otp",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
