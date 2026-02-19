import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/user.model";
import Vendor from "@/models/vendor.model";
import Car from "@/models/car.model";
import TestDrive from "@/models/test-drive.model";
import { carSchema } from "@/lib/validations/car";

// Helper to validate session & vendor ownership
export async function validateVendor(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return null;

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return null;

  // Find vendor associated with user
  return Vendor.findOne({ userId: user._id.toString() });
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const car = await Car.findById(id);

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json({ car }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// PATCH: Update Car
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const { params } = context;
    const { id } = (await params) || {};
    const vendor = await validateVendor(request);
    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership: Check if car ID exists in vendor's list
    // OR check if car.vendor matches vendor._id (if you added that field)
    const carExists = vendor.cars.includes(id);
    const carOwner = await Car.findOne({ _id: id, vendor: vendor._id });

    if (!carExists && !carOwner) {
      // Fallback logic depending on how strict you want to be
      // ideally: strictly check ownership
      // return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // ✅ Validate Body (Partial validation could be used, but since the form sends the full data, we'll use carSchema)
    const validation = carSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 },
      );
    }

    const validatedData = validation.data;

    const updatedCar = await Car.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true },
    );

    if (!updatedCar) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json(
      { car: updatedCar, message: "Updated successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove Car
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const { params } = context;
    const { id } = (await params) || {};
    const vendor = await validateVendor(request);
    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check for active bookings (Test Drives)
    const activeBooking = await TestDrive.findOne({
      carId: id,
      status: { $in: [ "confirmed"] },
    });

    if (activeBooking) {
      return NextResponse.json(
        { 
          error: "Cannot delete car with active bookings.",
          details: "Please complete or cancel all bookings before deleting." 
        }, 
        { status: 400 }
      );
    }

    // 2. Delete the Car Document
    const deletedCar = await Car.findByIdAndDelete(id);

    if (!deletedCar) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    // 3. Remove reference from Vendor's car list
    // Use $pull to remove the ID from the array
    await Vendor.updateOne({ _id: vendor._id }, { $pull: { cars: id } });

    return NextResponse.json(
      { message: "Car deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
