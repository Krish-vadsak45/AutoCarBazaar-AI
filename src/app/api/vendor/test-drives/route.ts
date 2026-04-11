import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import TestDrive from "@/models/test-drive.model";
import Vendor from "@/models/vendor.model";
import Car from "@/models/car.model";
import User from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    console.log("DEBUG: Session found:", !!session);
    if (!session || !session.user) {
      console.log("DEBUG: Unauthorized - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vendorIdParam = searchParams.get("vendorId");
    const userRole = session.user.role;

    let vendorIdToUse;

    if (userRole === "admin" && vendorIdParam) {
      vendorIdToUse = vendorIdParam;
      // Optionally verify vendor exists
      const vendor = await Vendor.findById(vendorIdParam);
      if (!vendor) {
        return NextResponse.json(
          { error: "Vendor not found" },
          { status: 404 },
        );
      }
    } else {
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
      vendorIdToUse = vendor._id;
    }

    console.log("DEBUG: Fetching test drives for vendorId:", vendorIdToUse);
    // Fetch test drives for this vendor specifically
    const testDrives = await TestDrive.find({ vendorId: vendorIdToUse })
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
        { error: "Booking ID and Status are required" },
        { status: 400 },
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
          { status: 403 },
        );
      }
      query.vendorId = vendor._id;
    }

    // Fetch the existing drive to know its previous state
    const existingDrive = await TestDrive.findOne(query);

    if (!existingDrive) {
      return NextResponse.json(
        { error: "Test drive not found or access denied" },
        { status: 404 },
      );
    }

    const previousStatus = existingDrive.status;
    const newStatus = status.toUpperCase();

    const updatedDrive = await TestDrive.findOneAndUpdate(
      query,
      { status: newStatus }, // Ensure consistency (PENDING, CONFIRMED)
      { returnDocument: "after" },
    );

    // Manage Car's totalBookedCount
    // We consider "CONFIRMED" and "COMPLETED" as states where the car counts as "booked"
    const prevIsBooked =
      previousStatus === "CONFIRMED" || previousStatus === "COMPLETED";
    const newIsBooked = newStatus === "CONFIRMED" || newStatus === "COMPLETED";

    if (updatedDrive && updatedDrive.carId) {
      if (!prevIsBooked && newIsBooked) {
        // Status changed to booked (Increment)
        await Car.findByIdAndUpdate(updatedDrive.carId, {
          $inc: { totalBookedCount: 1 },
        });
      } else if (prevIsBooked && !newIsBooked) {
        // Status changed OUT of booked (e.g., Cancelled, Pending) -> Decrement
        const car = await Car.findById(updatedDrive.carId);
        if (car && (car.totalBookedCount || 0) > 0) {
          await Car.findByIdAndUpdate(updatedDrive.carId, {
            $inc: { totalBookedCount: -1 },
          });
        }
      }
    }

    // If it was cancelled or rejected, decrement the vendor stats
    if (
      updatedDrive &&
      existingDrive.paymentStatus === "PAID" &&
      previousStatus !== "CANCELLED" &&
      previousStatus !== "REJECTED" &&
      (newStatus === "CANCELLED" || newStatus === "REJECTED")
    ) {
      updatedDrive.paymentStatus = "REFUNDED";
      await updatedDrive.save();

      if (updatedDrive && updatedDrive.vendorId) {
        const matchingVendor = await Vendor.findById(updatedDrive.vendorId);
        if (matchingVendor) {
          matchingVendor.totalTestDrivesBooked = Math.max(
            0,
            (matchingVendor.totalTestDrivesBooked || 1) - 1,
          );
          matchingVendor.totalRevenue = Math.max(
            0,
            (matchingVendor.totalRevenue || 0) -
              (updatedDrive.bookingFeeAmount || 0),
          );
          await matchingVendor.save();
        }
      }
    }

    return NextResponse.json(updatedDrive, { status: 200 });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
