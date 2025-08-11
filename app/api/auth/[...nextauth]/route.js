import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import { connectMongoDB } from "@/lib/mongodb";

import Admin from "@/models/admin";
import Manager from "@/models/manager";
import Engineer from "@/models/engineer";
import User from "@/models/user";

const handler = NextAuth({
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
        role: { label: "Role", type: "text", placeholder: "admin / manager / engineer (optional for users)" },
      },

      async authorize(credentials) {
        const { email, password, role } = credentials;

        if (!email || !password) {
          throw new Error("Email and password are required.");
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedRole = role?.trim().toLowerCase();

        await connectMongoDB();

        // Handle regular user login (no role required)
        if (!normalizedRole) {
          const user = await User.findOne({ email: normalizedEmail }).select("+password +name");
          if (!user) throw new Error("Invalid email or password.");

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) throw new Error("Invalid email or password.");

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: "user",
          };
        }

        // Role-to-model map for Admin, Manager, Engineer
        const roleModelMap = {
          admin: Admin,
          manager: Manager,
          engineer: Engineer,
        };

        const Model = roleModelMap[normalizedRole];
        if (!Model) throw new Error("Invalid role. Valid roles are: admin, manager, engineer.");

        const account = await Model.findOne({ email: normalizedEmail }).select("+password +role +name");
        if (!account) throw new Error("Invalid email or password.");

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) throw new Error("Invalid email or password.");

        return {
          id: account._id.toString(),
          email: account.email,
          name: account.name,
          role: account.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
