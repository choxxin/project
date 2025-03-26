import { NextResponse } from 'next/server';
import EcoModel from '@/schema/operationinfo';
import connectDB from '../route'; // Adjust the import path as needed

// Database connection helper

export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Find all eco-info entries
    const allEcoInfo = await EcoModel.find().sort({ createdAt: -1 }); // Newest first
    
    // Return the data
    return NextResponse.json({
      success: true,
      count: allEcoInfo.length,
      data: allEcoInfo
    });
    
  } catch (error) {
    console.error('Error fetching eco-info:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch eco-info',
        details: error.message 
      },
      { status: 500 }
    );
  }
}