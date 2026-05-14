import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    console.error(`Please ensure that MongoDB is running locally on port 27017, or update the MONGO_URI in your server/.env file to a valid MongoDB Atlas cluster.\n`);
    // process.exit(1);
  }
};

export default connectDB;
