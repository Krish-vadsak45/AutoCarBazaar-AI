import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET() {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await connectToDatabase();

    await Vendor.updateMany(
      {
        verificationStatus: "APPROVED",
      },
      {
        $set: { isVerified: true, isActive: true },
      },
    );
    // Only return approved vendors
    const approvedVendors = await Vendor.find({
      isActive: true, // Only show active vendors
      isVerified: true, // Only show verified vendors
      verificationStatus: "APPROVED",
    }).populate("userId", "name email");

    return NextResponse.json(approvedVendors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
