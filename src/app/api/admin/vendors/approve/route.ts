import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Vendor from "@/models/vendor.model";
import User from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId, action } = await req.json();

    if (!vendorId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await connectToDatabase();

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (action === "approve") {
      await Vendor.findByIdAndUpdate(vendorId, {
        verificationStatus: "APPROVED",
        isVerified: true,
        isActive: true,
      });

      // Update User Role to 'vendor'
      await User.findByIdAndUpdate(vendor.userId, { role: "vendor" });
    } else {
      await Vendor.findByIdAndUpdate(vendorId, {
        verificationStatus: "REJECTED",
      });
    }

    return NextResponse.json({ message: `Vendor request ${action}ed` });
  } catch (error: any) {
    console.error("Error processing vendor approval:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
