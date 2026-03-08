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
      $or: [
        { verificationStatus: "PENDING" },
        // verificationStatus: "APPROVED" and isActive and isVerified true then prevent to create new vendor profile
        {
          $and: [
            { verificationStatus: "APPROVED" },
            { isActive: true },
            { isVerified: true },
          ],
        },
      ],
    });
    if (existingVendor) {
      if (existingVendor.verificationStatus === "PENDING") {
        return NextResponse.json(
          {
            error:
              "You already have a pending vendor application. Please wait for admin approval.",
          },
          { status: 409 },
        );
      }
      if (
        existingVendor.verificationStatus === "APPROVED" &&
        existingVendor.isActive &&
        existingVendor.isVerified
      ) {
        return NextResponse.json(
          {
            error: "You are already registered as an approved vendor.",
          },
          { status: 409 },
        );
      }
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

    // 5. DO NOT update User Role yet. Waiting for Admin Approval.
    // currentUser.role = "vendor";
    // await currentUser.save();

    return NextResponse.json(
      {
        message:
          "Vendor application submitted successfully. Please wait for admin approval.",
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
