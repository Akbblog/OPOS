import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Fail fast if the server(s) are unreachable
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    // Provide clearer guidance for common Atlas connection issues
    // (invalid URI, network egress, IP access list / whitelist)
    console.error('MongoDB connection error:', e);
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`${message} — check MONGODB_URI, network access, and Atlas IP access list: https://www.mongodb.com/docs/atlas/security-whitelist/`);
  }

  return cached.conn;
}

export default dbConnect;