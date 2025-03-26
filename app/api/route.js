import mongoose from "mongoose";
async function connectDB() {
  try {
    console.log("Connecting to MongoDB...");
    const connectionInstance = await mongoose.connect(process.env.NEXT_MONGODB_URI);
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
}

export default connectDB;

