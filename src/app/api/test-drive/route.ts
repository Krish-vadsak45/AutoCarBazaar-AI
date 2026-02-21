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
    const { carId, startDate, endDate, startTime, endTime, notes } = body;

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
    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor for this car not found" },
        { status: 404 },
      );
    }

    const newTestDrive = await TestDrive.create({
      carId,
      userId,
      vendorId: vendor._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      notes,
      status: "PENDING",
    });

    const populatedTestDrive = await newTestDrive.populate([
      { path: "userId" },
      { path: "carId" },
      { path: "vendorId" },
    ]);

    const mailOptions = {
      from: "samarthgabani2005@gmail.com",

      // populatedTestDrive.userId.email
      to: "samarthpatel1011@gmail.com",

      subject: `Test Drive Request Confirmation - ${populatedTestDrive.carId.title}`,

      html: `
        <h2>Test Drive Confirmation</h2>
    
        <p>Dear ${populatedTestDrive.userId.name},</p>
    
        <p>Your test drive request has been successfully submitted. Below are your booking details:</p>
    
        <ul>
          <li><strong>Request ID:</strong> ${populatedTestDrive._id}</li>
          <li><strong>Car:</strong> ${populatedTestDrive.carId.title}</li>
          <li><strong>Dealer:</strong> ${
            populatedTestDrive.vendorId.businessName
          }</li>
          <li><strong>Location:</strong> ${
            populatedTestDrive.vendorId.address.city
          }, ${populatedTestDrive.vendorId.address.state}</li>
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
          populatedTestDrive.vendorId.businessName
        }.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending confirmation email:", error);
      } else {
        toast.success("Confirmation email sent successfully!");
        console.log("Confirmation email sent:", info.response);
      }
    });

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
