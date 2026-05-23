import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/user.model";
import Vendor from "@/models/vendor.model";
import Car from "@/models/car.model";
import TestDrive from "@/models/test-drive.model";
import { carSchema } from "@/lib/validations/car";
import transporter from "@/lib/nodemailer";
import { canAddListingVideo } from "@/lib/vip";

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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const vendor = await validateVendor(request);
    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership: Check if car ID exists in vendor's list
    // OR check if car.vendor matches vendor._id (if you added that field)
    const carExists = vendor.cars.some(
      (c: unknown) => String(c) === String(id),
    );
    const carOwner = await Car.findOne({ _id: id, vendorId: vendor._id });

    if (!carExists && !carOwner) {
      // Fallback logic depending on how strict you want to be
      // ideally: strictly check ownership
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingCar = await Car.findById(id).lean();

    const body = await request.json();

    // ✅ Validate Body (Partial validation to allow updating specific fields)
    const validation = carSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 },
      );
    }

    const validatedData = { ...validation.data } as Record<string, unknown>;
    const mongoUpdate: {
      $set?: Record<string, unknown>;
      $unset?: Record<string, string>;
    } = {};

    if (validatedData.videoUrl !== undefined) {
      const trimmed = String(validatedData.videoUrl).trim();
      const previousVideo = String(existingCar?.videoUrl || "").trim();
      if (trimmed && !canAddListingVideo(vendor.priority)) {
        if (trimmed !== previousVideo) {
          return NextResponse.json(
            {
              error:
                "Listing video requires VIP level 3 or higher (priority > 2).",
            },
            { status: 403 },
          );
        }
      }
      if (!trimmed) {
        delete validatedData.videoUrl;
        mongoUpdate.$unset = { videoUrl: "" };
      } else {
        validatedData.videoUrl = trimmed;
      }
    }

    if (Object.keys(validatedData).length > 0) {
      mongoUpdate.$set = validatedData;
    }

    if (!mongoUpdate.$set && !mongoUpdate.$unset) {
      return NextResponse.json({
        car: await Car.findById(id),
        message: "No changes",
      });
    }

    const updatedCar = await Car.findByIdAndUpdate(id, mongoUpdate, {
      returnDocument: "after",
      runValidators: true,
    });

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

// DELETE: Remove Car & Notify Users
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // Car ID

    // 1. Authorization Check
    const vendor = await validateVendor(request);
    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 2. Find All Active Bookings (Pending or Confirmed)
    const activeBookings = await TestDrive.find({
      carId: id,
      status: { $in: ["PENDING", "CONFIRMED"] },
    }).populate("userId", "name email"); // Get User Email & Name

    // 3. Notify Users & Cancel Bookings
    if (activeBookings && activeBookings.length > 0) {
      const emailPromises = activeBookings.map(async (booking: any) => {
        if (booking.userId && booking.userId.email) {
          const mailOptions = {
            from: "samarthgabani2005@gmail.com",
            to: booking.userId.email || "",
            subject: "⚠️ Booking Cancelled - Vehicle Removed",
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #DC2626;">Booking Cancelled</h2>
                <p>Dear <strong>${booking.userId.name}</strong>,</p>
                <p>We regret to inform you that the vendor has removed the vehicle you booked from their inventory.</p>
                
                <div style="background: #FFF5F5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p><strong>Booking ID:</strong> ${booking._id}</p>
                  <p><strong>Date:</strong> ${new Date(
                    booking.startDate,
                  ).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span style="color: red;">CANCELLED</span></p>
                </div>

                <p>Consequently, your booking booking request has been automatically cancelled.</p>
                <p>We apologize for the inconvenience.</p>
                <hr style="border:0; border-top:1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">The CarRental Team</p>
              </div>
            `,
          };

          // Send Email
          return transporter
            .sendMail(mailOptions)
            .catch((err) =>
              console.error(`Failed to email ${booking.userId.email}`, err),
            );
        }
      });

      // Execute all emails in parallel
      await Promise.all(emailPromises);

      // Update Booking Statuses in DB
      await TestDrive.updateMany(
        { carId: id, status: { $in: ["PENDING", "CONFIRMED"] } },
        {
          status: "CANCELLED",
          paymentStatus: "REFUNDED",
          notes: "Automatically cancelled: Vendor deleted the vehicle.",
        },
      );

      // Decrement vendor's metrics for all cancelled bookings that were PAID
      const paidBookings = activeBookings.filter(
        (b) => b.paymentStatus === "PAID",
      );
      const totalRefundedRevenue = paidBookings.reduce(
        (sum, b) => sum + (b.bookingFeeAmount || 0),
        0,
      );
      const totalRefundedCount = paidBookings.length;

      if (totalRefundedCount > 0) {
        await Vendor.updateOne(
          { _id: vendor._id },
          {
            $inc: {
              totalTestDrivesBooked: -totalRefundedCount,
              totalRevenue: -totalRefundedRevenue,
            },
          },
        );
      }
    }

    // 4. Delete the Car Document
    const deletedCar = await Car.findByIdAndDelete(id);

    if (!deletedCar) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    // 5. Cleanup: Remove car from Vendor's listing array
    await Vendor.updateOne({ _id: vendor._id }, { $pull: { cars: id } });

    return NextResponse.json(
      {
        message: "Car deleted successfully. Affected users have been notified.",
        affectedBookings: activeBookings.length,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
