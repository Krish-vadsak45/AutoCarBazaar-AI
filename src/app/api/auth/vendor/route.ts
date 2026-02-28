import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/user.model";
import Vendor from "@/models/vendor.model";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    // 1. Verify User Session (Must be logged in as a normal user first)
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to register as a vendor." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      businessName,
      ownerName,
      contactDetails,
      website,
      description,
      businessType,
      vendorType,
      gstNumber,
      address,
      identityProof,
      bankDetails,
      password,
    } = body;

    await connectToDatabase();

    // 2. Find the existing user
    const currentUser = await User.findOne({ email: session.user.email });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 },
      );
    }

    // Check if user is already a vendor
    if (currentUser.role === "vendor") {
      return NextResponse.json(
        { error: "You are already registered as a vendor." },
        { status: 400 },
      );
    }

    // --- Validate User Password ---
    if (!currentUser.password) {
      return NextResponse.json(
        {
          error:
            "Please set a password in your profile settings before registering.",
          redirect: "/profile",
        },
        { status: 403 },
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to confirm your identity." },
        { status: 400 },
      );
    }

    const isMatch = await bcrypt.compare(password, currentUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid password provided." },
        { status: 401 },
      );
    }
    // ----------------------------

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
        { status: 409 },
      );
    }

    // 4. Create the Vendor Profile (Linked to User ID)
    const newVendor = new Vendor({
      userId: currentUser._id, // Link to existing user
      businessName,
      ownerName,
      contactDetails,
      website,
      description,
      businessType,
      vendorType,
      gstNumber,
      address,
      identityProof,
      bankDetails,
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
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Vendor Registration Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
