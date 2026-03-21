import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import TestDrive from "@/models/test-drive.model";
import { stripe } from "@/lib/stripe";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    // Assuming params is a promise in Next.js 15
    const id = (await params).id;

    // Find the test drive by ID
    const testDrive = await TestDrive.findById(id);

    if (!testDrive) {
      return NextResponse.json(
        { error: "Test drive not found" },
        { status: 404 },
      );
    }

    if (
      testDrive.status === "REJECTED" ||
      testDrive.paymentStatus === "REFUNDED"
    ) {
      return NextResponse.json(
        { error: "Test drive already rejected or refunded" },
        { status: 400 },
      );
    }

    if (!testDrive.paymentIntentId) {
      return NextResponse.json(
        {
          error:
            "No Stripe payment intent found for this test drive to issue a refund.",
        },
        { status: 400 },
      );
    }

    // 1. Issue the refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: testDrive.paymentIntentId,
    });

    if (refund.status === "succeeded" || refund.status === "pending") {
      // 2. Update DB status
      testDrive.status = "REJECTED";
      testDrive.paymentStatus = "REFUNDED";
      await testDrive.save();

      return NextResponse.json({
        message: "Test drive rejected and customer refunded successfully",
        testDrive,
      });
    } else {
      throw new Error(`Refund failed with status: ${refund.status}`);
    }
  } catch (error: any) {
    console.error("Error rejecting test drive:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
