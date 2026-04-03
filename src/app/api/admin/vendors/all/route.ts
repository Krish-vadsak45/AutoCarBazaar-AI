import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectToDatabase();
    
    // We can fetch all vendors, populated with their user email and name.
    const allVendors = await Vendor.find({}).populate("userId", "name email").sort({ createdAt: -1 });

    return NextResponse.json(allVendors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
