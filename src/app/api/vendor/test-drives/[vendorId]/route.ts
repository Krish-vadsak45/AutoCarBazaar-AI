import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import TestDrive from "@/models/test-drive.model";
import Car from "@/models/car.model";
import User from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> },
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await params;

    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 },
      );
    }

    // Optional: Add authorization check here if you want to restrict who can see what.
    // For now, assuming if they are logged in and hit this route in the admin portal, it's fine.

    const testDrives = await TestDrive.find({ vendorId })
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

    return NextResponse.json(testDrives, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching vendor test drives:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
