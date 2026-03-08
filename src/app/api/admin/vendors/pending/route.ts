import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { getServerSession } from "next-auth";
import User from "@/models/user.model";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const pendingVendors = await Vendor.find({
      verificationStatus: "PENDING",
    }).populate("userId", "name email");

    return NextResponse.json(pendingVendors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
