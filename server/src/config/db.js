import mongoose from 'mongoose';

// Global cache to persist connection across serverless / cold-start invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // If already connected, reuse existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGODB_URI;

  // In production, never attempt to connect to localhost / 127.0.0.1
  if (!uri) {
    if (isProduction) {
      console.warn('  ⚠️  MONGODB_URI not set in production. Running in in-memory fallback mode.');
      return null;
    }
  }

  const connectionUri = uri || 'mongodb://127.0.0.1:27017/emergency-finder';

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: isProduction ? 3000 : 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(connectionUri, opts)
      .then((mongooseInstance) => {
        console.log(`  🔗  MongoDB Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null; // reset promise so subsequent attempts can retry
        console.warn(`  ⚠️  MongoDB Connection Warning: ${error.message}. Running in fallback mode.`);
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.conn = null;
  }

  return cached.conn;
};

