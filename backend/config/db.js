import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // In serverless, don't exit - just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    return false;
  }
};

export default connectDB;
