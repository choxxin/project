import { NextResponse } from "next/server";
import connectDB from "../route";
import GarbageModel from "../../../schema/garbage_detal"; // Adjust the path as needed

// Connect to MongoDB
await connectDB();

// Handle GET request (Retrieve all garbage entries)
export async function POST() {
  try {
    const garbageEntries = await GarbageModel.find({});
    return NextResponse.json(garbageEntries, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
