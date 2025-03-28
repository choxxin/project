import { NextResponse } from "next/server";
// import connectDB from "../../utils/route"; // Adjust the import path as needed
import GarbageModel from "../../schema/garbage_detal"; // Adjust the path as needed
import mongoose from "mongoose";
async function connectDB() {
  try {
    console.log("Connecting to MongoDB...");
    const connectionInstance = await mongoose.connect(
      process.env.NEXT_MONGODB_URI
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
}
// Enable CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins (change to specific URL for security)
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle CORS preflight requests (OPTIONS)

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// Handle POST request (Add garbage entry)
export async function POST(req) {
  try {
    await connectDB(); // Ensure database is connected

    // Parse JSON body
    const { location, type, description } = await req.json();

    // Validate request body
    if (!location || !type) {
      return new Response(
        JSON.stringify({ error: "Location and Type are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create a new garbage entry
    const garbageEntry = await GarbageModel.create({
      location,
      type,
      description: description || "No additional details provided.",
    });

    return new Response(JSON.stringify(garbageEntry), {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
