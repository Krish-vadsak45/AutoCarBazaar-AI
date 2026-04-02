import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import TestDrive from "@/models/test-drive.model";
import Vendor from "@/models/vendor.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import transporter from "@/lib/nodemailer";
import { toast } from "react-toastify";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      carId,
      startDate,
      endDate,
      startTime,
      endTime,
      notes,
      isDelivery,
      userLocation,
    } = body;

    if (!carId || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    console.log("Session:", session);
    // Use _id as defined in NextAuth session callback
    const userId = (session.user as any)._id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 },
      );
    }

    // Find the vendor that owns this car
    const vendor = await Vendor.findOne({ cars: carId });

    const newTestDrive = await TestDrive.create({
      carId,
      userId,
      vendorId: vendor ? vendor._id : undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      notes,
      status: "PENDING",
      isDelivery: isDelivery ?? false,
      address: userLocation?.address || undefined,
    });
    console.log("New Test Drive created: ", newTestDrive);
    const populatedTestDrive = await newTestDrive.populate([
      { path: "userId" },
      { path: "carId" },
      { path: "vendorId" },
    ]);

    const mailOptions = {
      from: "samarthgabani2005@gmail.com",

      // populatedTestDrive.userId.email
      to: "samarthpatel1011@gmail.com",

      subject: `Test Drive Request Confirmation - ${(populatedTestDrive.carId as any).title}`,

      html: `
        <h2>Test Drive Confirmation</h2>
    
        <p>Dear ${(populatedTestDrive.userId as any).name},</p>
    
        <p>Your test drive request has been successfully submitted. Below are your booking details:</p>
    
        <ul>
          <li><strong>Request ID:</strong> ${populatedTestDrive._id}</li>
          <li><strong>Car:</strong> ${(populatedTestDrive.carId as any).title}</li>
          <li><strong>Dealer:</strong> ${
            (populatedTestDrive.vendorId as any)?.businessName || "Admin"
          }</li>
          <li><strong>Location:</strong> ${
            (populatedTestDrive.vendorId as any)?.address?.city || ""
          }, ${(populatedTestDrive.vendorId as any)?.address?.state || "N/A"}</li>
          <li><strong>Date:</strong> ${new Date(
            populatedTestDrive.startDate,
          ).toDateString()} - ${new Date(
            populatedTestDrive.endDate,
          ).toDateString()}</li>
          <li><strong>Time:</strong> ${populatedTestDrive.startTime} - ${
            populatedTestDrive.endTime
          }</li>
          <li><strong>Status:</strong> ${populatedTestDrive.status.toUpperCase()}</li>
        </ul>
    
        <p>If you need assistance, please contact the dealer.</p>
    
        <p>Thank you for choosing ${
          (populatedTestDrive.vendorId as any)?.businessName ||
          "Auto Car Bazaar"
        }.</p>
      `,
    };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error("Error sending confirmation email:", error);
    //   } else {
    //     toast.success("Confirmation email sent successfully!");
    //     console.log("Confirmation email sent:", info.response);
    //   }
    // });

    return NextResponse.json(
      { message: "Test drive booked successfully", testDrive: newTestDrive },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error booking test drive:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
