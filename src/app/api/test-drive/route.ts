import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import TestDrive from "@/models/test-drive.model";
import Vendor from "@/models/vendor.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { carId, startDate, endDate, startTime, endTime, notes } = body;

    if (!carId || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    console.log("Session:", session);
    // Use _id as defined in NextAuth session callback
    const userId = (session.user as any)._id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 },
      );
    }

    // Find the vendor that owns this car
    const vendor = await Vendor.findOne({ cars: carId });
    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor for this car not found" },
        { status: 404 },
      );
    }

    const newTestDrive = await TestDrive.create({
      carId,
      userId,
      vendorId: vendor._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      notes,
      status: "pending",
    });

    return NextResponse.json(
      { message: "Test drive booked successfully", testDrive: newTestDrive },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error booking test drive:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
