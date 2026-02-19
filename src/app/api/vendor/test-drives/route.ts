import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import TestDrive from "@/models/test-drive.model";
import Vendor from "@/models/vendor.model";
import Car from "@/models/car.model";
import User from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    console.log("DEBUG: Session found:", !!session);
    if (!session || !session.user) {
      console.log("DEBUG: Unauthorized - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any)._id;
    console.log("DEBUG: User ID from session:", userId);

    if (!userId) {
      console.log("DEBUG: User ID missing in session object");
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    // Find the vendor profile associated with this user
    const vendor = await Vendor.findOne({ userId });
    console.log("DEBUG: Vendor profile found:", !!vendor);

    if (!vendor) {
      console.log("DEBUG: No vendor profile matches userId:", userId);
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404 }
      );
    }

    console.log("DEBUG: Fetching test drives for vendorId:", vendor._id);
    // Fetch test drives for this vendor specifically
    const testDrives = await TestDrive.find({ vendorId: vendor._id })
      .populate({
        path: "carId",
        select: "title image images price",
        model: Car,
      })
      .populate({
        path: "userId",
        select: "name email",
        model: User,
      })
      .sort({ createdAt: -1 });

    console.log("DEBUG: Number of test drives found:", testDrives.length);
    return NextResponse.json(testDrives);
  } catch (error: any) {
    console.error("Error fetching vendor test drives:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Booking ID and Status are required" },
        { status: 400 }
      );
    }

    const userId = (session.user as any)._id; // Logged in user's ID
    const userRole = (session.user as any).role;

    // Secure Query:
    // 1. If Admin: Can update any record
    // 2. If Vendor: Can only update records where vendorId matches their profile
    let query: any = { _id: id };

    if (userRole !== "admin") {
      const vendor = await Vendor.findOne({ userId });
      if (!vendor) {
        return NextResponse.json(
          { error: "Vendor profile not found for this user" },
          { status: 403 }
        );
      }
      query.vendorId = vendor._id;
    }

    const updatedDrive = await TestDrive.findOneAndUpdate(
      query,
      { status: status.toUpperCase() }, // Ensure consistency (PENDING, CONFIRMED)
      { new: true }
    );

    if (!updatedDrive) {
      return NextResponse.json(
        { error: "Test drive not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDrive, { status: 200 });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
