// app/api/ngos/route.js
import { NextResponse } from "next/server";
import NgoModel from "@/schema/ngodetails";
import connectDB from "../route";

export async function POST(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const total = await NgoModel.countDocuments({});

    const ngos = await NgoModel.find({})
      .select("name email location status registrationDate")
      .skip(skip)
      .limit(limit)
      .sort({ registrationDate: -1 }) // newest first
      .lean();

    return NextResponse.json({
      success: true,
      count: ngos.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: ngos,
    });
  } catch (error) {
    console.error("Error fetching NGOs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
