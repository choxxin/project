import { NextResponse } from "next/server";
import EcoModel from "../../schema/operationinfo";
import connectDB from "../route"; // Adjust the import path as needed

// Helper function to set CORS headers
function setCORSHeaders(response) {
  response.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS"); // Allow POST and OPTIONS methods
  response.headers.set("Access-Control-Allow-Headers", "Content-Type"); // Allow Content-Type header
  return response;
}

// Handle preflight OPTIONS request
// Handle preflight OPTIONS request
export function OPTIONS() {
  const response = new NextResponse(null, { status: 204 }); // No content
  return setCORSHeaders(response);
}

// Handle POST request
export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Parse the request body
    const { location, reforestation, garbage_collection } =
      await request.json();

    // Validate required fields
    if (!location) {
      const response = NextResponse.json(
        { success: false, error: "Location is required" },
        { status: 400 }
      );
      return setCORSHeaders(response);
    }

    // Create new eco-info entry
    const newEcoInfo = await EcoModel.create({
      location,
      reforestation,
      garbage_collection,
    });

    // Success response
    const response = NextResponse.json(
      {
        success: true,
        message: "Eco-info created successfully",
        data: {
          id: newEcoInfo._id,
          location: newEcoInfo.location,
          reforestation: newEcoInfo.reforestation,
          garbage_collection: newEcoInfo.garbage_collection,
          createdAt: newEcoInfo.createdAt,
        },
      },
      { status: 201 }
    );

    return setCORSHeaders(response);
  } catch (error) {
    console.error("Error creating eco-info:", error);

    let response;
    if (error.code === 11000) {
      response = NextResponse.json(
        { success: false, error: "This location already exists" },
        { status: 400 }
      );
    } else if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      response = NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    } else {
      response = NextResponse.json(
        {
          success: false,
          error: "Failed to create eco-info",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return setCORSHeaders(response);
  }
}
