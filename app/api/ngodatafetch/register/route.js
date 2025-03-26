import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import NgoModel from '@/schema/ngodetails';


export async function POST(request) {
  try {
    
    // Parse request body
    const { name, email, location, clerkUserId } = await request.json();
    
    // Validate required fields
    if (!name || !email || !location || !clerkUserId) {
      return NextResponse.json(
        { error: "All fields are required: name, email, location, clerkUserId" },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingEmail = await NgoModel.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    
    // Check if Clerk user already registered
    const existingUser = await NgoModel.findOne({ clerkUserId });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already registered an NGO" },
        { status: 409 }
      );
    }
    
    // Create new NGO
    const newNGO = await NgoModel.create({
      name,
      email,
      location,
      clerkUserId
    });
    
    // Return success response with NGO data (excluding sensitive fields)
    return NextResponse.json(
      {
        success: true,
        message: "NGO registered successfully",
        data: {
          name: newNGO.name,
          email: newNGO.email,
          location: newNGO.location,
          id: newNGO._id,
          createdAt: newNGO.createdAt
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(el => el.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate field value entered" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}