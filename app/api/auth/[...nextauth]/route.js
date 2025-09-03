import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import User from "@/models/user";
import { sendOtpEmail } from "@/lib/sendEmail";

const allowedAdminRoles = ["admin", "manager", "engineer"];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ----------------------
// ADMIN LOGIN FLOW
// ----------------------
async function authorizeAdmin({ email, password, role, otp }) {
  if (!role || !allowedAdminRoles.includes(role.toLowerCase())) {
    throw new Error("Invalid role");
  }

  await connectMongoDB();

  const admin = await Admin.findOne({ email }).select("+password +otp +otpExpires +otpRequired");
  if (!admin) throw new Error("Admin not found");
  if (admin.role !== role.toLowerCase()) throw new Error("Role mismatch");

  const validPassword = await bcrypt.compare(password, admin.password);
  if (!validPassword) throw new Error("Invalid password");

  if (!otp) {
    const code = generateOTP();
    admin.otp = await bcrypt.hash(code, 10);
    admin.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    admin.otpRequired = true;
    await admin.save();

    await sendOtpEmail(admin.email, code);

    throw new Error(JSON.stringify({
      code: "OTP_REQUIRED",
      message: "OTP sent to your email",
    }));
  }

  const freshAdmin = await Admin.findOne({ email }).select("+otp +otpExpires +otpRequired");

  if (!freshAdmin.otp || !freshAdmin.otpExpires || !freshAdmin.otpRequired) {
    throw new Error("OTP not requested or expired");
  }

  if (new Date() > new Date(freshAdmin.otpExpires)) {
    throw new Error("OTP expired");
  }

  const otpValid = await bcrypt.compare(otp, freshAdmin.otp);
  if (!otpValid) throw new Error("Invalid OTP");

  // Clear OTP
  freshAdmin.otp = undefined;
  freshAdmin.otpExpires = undefined;
  freshAdmin.otpRequired = false;
  await freshAdmin.save();

  return {
    id: freshAdmin._id.toString(),
    email: freshAdmin.email,
    name: freshAdmin.name,
    role: freshAdmin.role,
  };
}

// ----------------------
// USER LOGIN FLOW
// ----------------------
async function authorizeUser({ email, password, otp }) {
  await connectMongoDB();

  const user = await User.findOne({ email }).select("+password +otp +otpExpires +otpRequired");
  if (!user) throw new Error("User not found");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error("Invalid password");

  if (!otp) {
    const code = generateOTP();
    user.otp = await bcrypt.hash(code, 10);
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.otpRequired = true;
    await user.save();

    await sendOtpEmail(user.email, code);

    throw new Error(JSON.stringify({
      code: "OTP_REQUIRED",
      message: "OTP sent to your email",
    }));
  }

  if (!user.otp || !user.otpExpires || !user.otpRequired) {
    throw new Error("OTP not requested or expired");
  }

  if (new Date() > new Date(user.otpExpires)) {
    throw new Error("OTP expired");
  }

  const otpValid = await bcrypt.compare(otp, user.otp);
  if (!otpValid) throw new Error("Invalid OTP");

  // Clear OTP
  user.otp = undefined;
  user.otpExpires = undefined;
  user.otpRequired = false;
  await user.save();

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: "user",
  };
}

// ----------------------
// NEXTAUTH CONFIG
// ----------------------
const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const { email, password, role, otp } = credentials;

        try {
          // 🔐 Route based on admin role only
          if (allowedAdminRoles.includes((role || "").toLowerCase())) {
            return await authorizeAdmin({ email, password, role, otp });
          } else {
            return await authorizeUser({ email, password, otp });
          }
        } catch (err) {
          if (err.message.includes("OTP_REQUIRED")) {
            throw new Error(err.message); // this will be parsed on frontend
          }
          throw new Error(err.message || "Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
