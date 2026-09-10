import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emergency-finder';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`  🔗  MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`  ⚠️  MongoDB Connection Warning: ${error.message}. Running in fallback mode.`);
  }
};
