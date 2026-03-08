import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/models/user.model";
import Vendor from "@/models/vendor.model";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    // 1. Basic Validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email/Username, Password, and Role are required." },
        { status: 400 },
      );
    }

    // 2. Connect DB
    await connectToDatabase();

    // 3. Find User (by Email OR Username)
    // Assuming 'email' field from frontend can contain either email address or username
    const user = await User.findOne({
      $or: [{ email: email }, { name: email }],
    }); // Ideally 'username' field exists in your schema

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    // 4. Check Password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    // 5. Verify Role Authorization
    // Ensure the user actually has the privileges they are trying to log in with
    if (user.role !== role) {
      return NextResponse.json(
        { error: `Access Denied: You are not authorized as a ${role}.` },
        { status: 403 },
      );
    }
    //i want different message for the different verificationStatus
    // if (user.role === "vendor") {
    //   const vendor = await Vendor.findOne({ userId: user._id.toString() });
    //   if (!vendor) {
    //     return NextResponse.json(
    //       { error: "Vendor profile not found. Please contact support." },
    //       { status: 404 },
    //     );
    //   }
    //   if (vendor.verificationStatus === "PENDING") {
    //     return NextResponse.json(
    //       { error: "Your vendor application is still pending approval." },
    //       { status: 403 },
    //     );
    //   }
    //   if (vendor.verificationStatus === "REJECTED") {
    //     return NextResponse.json(
    //       { error: "Your vendor application has been rejected." },
    //       { status: 403 },
    //     );
    //   }
    // }

    // 6. Success Response
    let vendorId = null;
    let responseMessage = "";
    let verificationStatus = "";
    if (user.role === "vendor") {
      const vendor = await Vendor.findOne({
        userId: user._id.toString(),
      });
      if (vendor) {
        vendorId = vendor._id.toString();
        if (vendor.verificationStatus === "PENDING") {
          responseMessage =
            "Login successful, but your vendor application is still pending approval.";
          verificationStatus = "PENDING";
        } else if (vendor.verificationStatus === "REJECTED") {
          responseMessage =
            "Login successful, but your vendor application has been rejected.";
          verificationStatus = "REJECTED";
        } else {
          responseMessage = "Login successful";
          verificationStatus = "APPROVED";
        }
      }
    }

    return NextResponse.json(
      {
        message: responseMessage,
        verificationStatus: verificationStatus,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          vendorId,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Admin Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
