const mongoose = require('mongoose');

// In serverless environments (Vercel), this module can be re-invoked on every
// cold start. Without caching, that means a brand-new MongoDB connection —
// full TLS handshake + auth — on every single cold start, which is the main
// cause of slow first-loads. Caching the connection promise on `global`
// means a warm function instance reuses the existing connection instead of
// reconnecting.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
        maxPoolSize: 5,
      })
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected:', mongooseInstance.connection.host);
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset so the next request can retry instead of being stuck on a
    // rejected promise forever.
    cached.promise = null;
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;