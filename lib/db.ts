import mongoose from "mongoose";

const RAW_MONGODB_URI = process.env.MONGODB_URI as string;
if (!RAW_MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

// The MongoDB driver rejects a connection string that repeats an option
// (e.g. "...&w=majority&w=majority" → 'URI option "w" cannot appear more than
// once'). Env vars get hand-edited, so de-duplicate query options here, keeping
// the last value of each key. Everything before "?" is left untouched.
function normalizeMongoUri(uri: string) {
  const q = uri.indexOf("?");
  if (q === -1) return uri;
  const base = uri.slice(0, q);
  const seen = new Map<string, string>();
  for (const part of uri.slice(q + 1).split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const key = eq === -1 ? part : part.slice(0, eq);
    seen.set(key.toLowerCase(), part);
  }
  const query = Array.from(seen.values()).join("&");
  return query ? `${base}?${query}` : base;
}

const MONGODB_URI = normalizeMongoUri(RAW_MONGODB_URI);

let cached = (global as any).mongoose || { conn: null, promise: null };
(global as any).mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Don't cache a failed connect: otherwise one transient failure makes every
    // later request in this (long-lived) function instance fail forever.
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
