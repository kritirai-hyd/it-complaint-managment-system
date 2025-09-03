// lib/mongodb.js

import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables");
}

// Prisma helper
export const getUserByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } });
};

// Mongoose connection cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectMongoDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => {
      console.log("✅ Connected to MongoDB");
      return mongoose;
    }).catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Export both
export { prisma };
