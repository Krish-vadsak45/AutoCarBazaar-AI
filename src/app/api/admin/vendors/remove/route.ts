import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Assuming admin role check is needed, similar to approve route
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await req.json();

    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        isActive: false,
        isVerified: false,
        // Optionally update verificationStatus if needed, e.g. to suspicious or removed
        verificationStatus: "REJECTED",
      },
      { returnDocument: "after" },
    );

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Vendor removed successfully",
      vendor,
    });
  } catch (error: any) {
    console.error("Error removing vendor:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
