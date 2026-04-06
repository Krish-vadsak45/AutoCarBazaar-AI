import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Car from "@/models/car.model";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch top 10 cars based on totalBookedCount (descending order)
    const cars = await Car.find({ status: "available" })
      .select("title images image tags price specs transmission description") // Select needed fields
      .sort({ totalBookedCount: -1 }) // Sort by highest bookings
      .limit(10)
      .lean();

    return NextResponse.json(cars, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch top 10 cars:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
