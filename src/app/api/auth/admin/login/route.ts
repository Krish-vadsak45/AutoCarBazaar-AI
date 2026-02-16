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

    // 6. Success Response
    let vendorId = null;
    if (user.role === "vendor") {
      const vendor = await Vendor.findOne({ userId: user._id });
      if (vendor) {
        vendorId = vendor._id.toString();
      }
    }

    return NextResponse.json(
      {
        message: "Login successful",
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
