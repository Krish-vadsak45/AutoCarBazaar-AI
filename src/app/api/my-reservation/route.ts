import connectToDatabase from "@/lib/db";
import TestDrive from "@/models/test-drive.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import Vendor from "@/models/vendor.model";
import User from "@/models/user.model";
import Car from "@/models/car.model";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any)._id;

    const testDrives = await TestDrive.find({ userId }).populate([
      { path: "carId", model: Car },
      { path: "vendorId", model: Vendor },
      { path: "userId", model: User },
    ]);

    return NextResponse.json(testDrives, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
