import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blazeup_offboarding';
  try {
    await mongoose.connect(uri);
    console.log(`🌿 MongoDB Connected successfully to: ${uri}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}
