import { NextResponse } from 'next/server';
import NgoModel from '@/schema/ngodetails';
import connectDB from '../../route'; // Make sure this is your proper DB connection utility

export async function POST(request) {  // Changed from GET to POST
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Parse the request body
    const { clerkUserId } = await request.json();
    console.log('Received clerkUserId from body:', clerkUserId);

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'clerkUserId is required in the request body' },
        { status: 400 }
      );
    }
    
    // Find NGO by clerkUserId
    const ngo = await NgoModel.findOne({ clerkUserId });
    
    if (!ngo) {
      return NextResponse.json(
        { exists: false, message: 'NGO not found' },
        { status: 405 }
      );
    }
    
    // Return only the necessary fields
    const responseData = {
      exists: true,
      ngo: {
        name: ngo.name,
        email: ngo.email,
        location: ngo.location
      }
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error checking NGO user:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}