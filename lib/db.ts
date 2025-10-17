import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://kunwaranirudhsingh7:admin@cluster0.z0vhl0t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" as string;
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
