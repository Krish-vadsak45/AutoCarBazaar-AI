import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/user.model";
import Vendor from "@/models/vendor.model";

export async function POST(request: Request) {
  try {
    // 1. Verify User Session (Must be logged in as a normal user first)
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to register as a vendor." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { businessName, businessType, vendorType, address, identityProof } =
      body;

    await connectToDatabase();

    // 2. Find the existing user
    const currentUser = await User.findOne({ email: session.user.email });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // 3. Check if Vendor Profile already exists
    const existingVendor = await Vendor.findOne({
      userId: currentUser._id.toString(),
    });
    if (existingVendor) {
      return NextResponse.json(
        {
          error:
            "You are already registered as a vendor (or pending approval).",
        },
        { status: 409 }
      );
    }

    // 4. Create the Vendor Profile (Linked to User ID)
    const newVendor = new Vendor({
      userId: currentUser._id, // Link to existing user
      businessName,
      businessType,
      vendorType,
      address,
      identityProof,
      verificationStatus: "PENDING",
    });

    await newVendor.save();

    // 5. Update User Role to 'vendor'
    // Now the user has both a User document AND a Vendor document, and their role is updated.
    currentUser.role = "vendor";
    await currentUser.save();

    return NextResponse.json(
      {
        message: "Vendor profile created successfully. Role updated.",
        vendorId: newVendor._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Vendor Registration Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
