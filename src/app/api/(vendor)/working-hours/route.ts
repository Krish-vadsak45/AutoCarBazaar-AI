import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/db";
import Vendor from "@/models/vendor.model";
import User from "@/models/user.model";
import { validateVendor } from "../vend-cars/[id]/route";
import { authOptions } from "../../auth/[...nextauth]/route";

const DEFAULT_HOURS = [
  { day: "MONDAY", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "TUESDAY", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "WEDNESDAY", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "THURSDAY", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "FRIDAY", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "SATURDAY", isOpen: true, openTime: "10:00", closeTime: "14:00" },
  { day: "SUNDAY", isOpen: false, openTime: "00:00", closeTime: "00:00" },
];

// async function getVendor(session: any) {
//   if (!session?.user?.email) return null;
//   await connectToDatabase();
//   const user = await User.findOne({ email: session.user.email });
//   if (!user) return null;
//   return Vendor.findOne({ userId: user._id });
// }

export async function GET(req: Request) {
  try {
    // const session = await getServerSession(authOptions);
    // const vendor = await validateVendor(session);
    const vendor = await validateVendor(req);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Return stored hours or defaults if empty
    const hours =
      vendor.workingHours && vendor.workingHours.length > 0
        ? vendor.workingHours
        : DEFAULT_HOURS;

    return NextResponse.json({ workingHours: hours }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    // const session = await getServerSession(authOptions);
    // const vendor = await validateVendor(session);

    const vendor = await validateVendor(req);

    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workingHours } = await req.json();

    // Specific validation can go here if needed
    // Strip `_id` to prevent Mongoose cast issues with subdocuments
    const cleanHours = workingHours.map((h: any) => {
      const { _id, ...rest } = h;
      return rest;
    });

    await Vendor.updateOne(
      { _id: vendor._id },
      { $set: { workingHours: cleanHours } },
    );

    return NextResponse.json(
      { message: "Working hours updated", workingHours },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("PATCH working-hours error:", error.message || error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
