import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Car from "@/models/car.model";
import Vendor from "@/models/vendor.model";
import User from "@/models/user.model"; // Import User model
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Find User by email to get user ID
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Find Vendor profile linked to this User
    const vendor = await Vendor.findOne({ userId: user._id.toString() });
    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404 }
      );
    }

    // 3. Fetch all cars listed in the vendor's profile
    // Assuming vendor.cars is an array of ObjectIds
    const cars = await Car.find({ _id: { $in: vendor.cars } })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    return NextResponse.json({ cars }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor cars:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}
