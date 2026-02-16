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
        { status: 400 },
      );
    }

    // Find the vendor profile associated with this user
    const vendor = await Vendor.findOne({ userId });
    console.log("DEBUG: Vendor profile found:", !!vendor);

    if (!vendor) {
      console.log("DEBUG: No vendor profile matches userId:", userId);
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404 },
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
      { status: 500 },
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
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userId = (session.user as any)._id;
    const userRole = (session.user as any).role;

    let query: any = { _id: id };

    // If not admin, restrict to vendor's own test drives
    if (userRole !== "admin") {
      const vendor = await Vendor.findOne({ userId });

      if (!vendor) {
        return NextResponse.json(
          { error: "Vendor profile not found" },
          { status: 404 },
        );
      }
      query.vendorId = vendor._id;
    }

    const testDrive = await TestDrive.findOneAndUpdate(
      query,
      { status: status.toLowerCase() },
      { new: true },
    );

    if (!testDrive) {
      return NextResponse.json(
        { error: "Test drive booking not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(testDrive);
  } catch (error: any) {
    console.error("Error updating test drive status:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
