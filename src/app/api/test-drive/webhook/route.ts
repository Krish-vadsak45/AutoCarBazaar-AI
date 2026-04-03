import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/db";
import TestDrive from "@/models/test-drive.model";
import Vendor from "@/models/vendor.model";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !endpointSecret) {
    return NextResponse.json(
      { error: "Missing signature or secret" },
      { status: 400 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { metadata } = session;

    try {
      console.log("---- Webhook Hit ----");
      console.log("Stripe Event Metadata:", metadata);

      await connectToDatabase();

      if (metadata.type === "vendor_registration") {
        const vendor = await Vendor.findById(metadata.vendorId);
        if (vendor) {
          await Vendor.findByIdAndUpdate(metadata.vendorId, {
            isActive: true,
            isVerified: true, // Also set isVerified to true as payment is successful
          });
          console.log(
            `Vendor ${vendor._id} activated and verified via Stripe payment.`,
          );
        }
        return NextResponse.json({ received: true });
      }

      if (metadata.type === "vip_subscription") {
        const vendor = await Vendor.findById(metadata.vendorId);
        if (vendor) {
          vendor.subscriptionStatus = "ACTIVE";
          await vendor.save();
          console.log(`Vendor ${vendor._id} upgraded to VIP ACTIVE status!`);
        }
        return NextResponse.json({ received: true });
      }

      let vendor: any = undefined;

      // First try to find by the vendorId explicitly passed in metadata
      if (metadata.vendorId && metadata.vendorId !== "") {
        vendor = await Vendor.findById(metadata.vendorId);
      }

      // If still no vendor, find by carId matching in the cars array
      if (!vendor && metadata.carId) {
        vendor = await Vendor.findOne({ cars: metadata.carId });

        // Manual fallback check if mongoose isn't finding it cleanly via ObjectId Array matching
        if (!vendor) {
          const allVendors = await Vendor.find({});
          vendor =
            allVendors.find((v) =>
              v.cars.some((id) => id.toString() === metadata.carId.toString()),
            ) || undefined;
        }
      }

      console.log("---- DEBUG VENDOR ----");
      console.log(
        "Vendor found for webhook update:",
        vendor ? vendor._id : "None found!",
      );
      console.log("----------------------");

      const isDelivery = metadata.isDelivery === "true";
      const actualAddress = metadata.userLocationAddress || undefined;

      console.log(
        "Webhook processed address:",
        actualAddress,
        "IsDelivery:",
        isDelivery,
      );

      // Fix: metadata from Stripe is always string, we need to cast to Number precisely
      const feeAmount =
        typeof metadata.bookingFeeAmount !== "undefined"
          ? Number(metadata.bookingFeeAmount)
          : 0;

      const newTestDrive = await TestDrive.create({
        carId: metadata.carId,
        userId: metadata.userId,
        vendorId: vendor ? vendor._id : undefined,
        startDate: new Date(metadata.startDate),
        endDate: new Date(metadata.endDate),
        startTime: metadata.startTime,
        endTime: metadata.endTime,
        notes: metadata.notes,
        status: "PENDING",
        stripeSessionId: session.id,
        paymentIntentId: session.payment_intent,
        paymentStatus: "PAID",
        isDelivery,
        address:
          actualAddress || "DEBUG: Stripe metadata didn't have an address",
        bookingFeeAmount: feeAmount,
      });

      console.log("New Test Drive created from webhook: ", newTestDrive);

      if (vendor) {
        try {
          const updatedVendor = await Vendor.findByIdAndUpdate(
            vendor._id,
            {
              $inc: {
                totalTestDrivesBooked: 1,
                totalRevenue: feeAmount,
              },
            },
            { new: true },
          );

          console.log("----- UPDATED VENDOR DETAILS -----");
          console.log(updatedVendor);
          console.log("----------------------------------");

          console.log(
            `Vendor ${vendor._id} updated stats (+1 booked, +${feeAmount} revenue).`,
          );
        } catch (updateErr) {
          console.error("Failed to update vendor stats:", updateErr);
        }
      }

      const populatedTestDrive = await TestDrive.findById(
        newTestDrive._id,
      ).populate([
        { path: "userId" },
        { path: "carId" },
        { path: "vendorId" },
      ] as any);

      // --- EMAIL NOTIFICATION LOGIC (Mirroring existing route.ts) ---
      if (populatedTestDrive) {
        console.log(
          `Booking email logically triggered from webhook for ID: ${populatedTestDrive._id}`,
        );
      }
    } catch (err) {
      console.error("Database or Email process failed in webhook: ", err);
      return NextResponse.json(
        { error: "Booking insertion failed" },
        { status: 500 },
      );
    }
  } else if (
    event.type === "refund.created" ||
    event.type === "refund.updated"
  ) {
    const refund = event.data.object as any;
    if (refund.status === "succeeded") {
      try {
        await connectToDatabase();

        // Find existing test drive FIRST to check its current status
        const existingDrive = await TestDrive.findOne({
          paymentIntentId: refund.payment_intent,
        });

        if (existingDrive && existingDrive.paymentStatus !== "REFUNDED") {
          existingDrive.paymentStatus = "REFUNDED";
          existingDrive.status = "REJECTED";
          await existingDrive.save();

          console.log(
            `TestDrive ${existingDrive._id} payment marked as REFUNDED`,
          );

          // Decrement vendor stats
          if (existingDrive.vendorId) {
            try {
              const vendor = await Vendor.findByIdAndUpdate(
                existingDrive.vendorId,
                {
                  $inc: {
                    totalTestDrivesBooked: -1,
                    totalRevenue: -(existingDrive.bookingFeeAmount || 0),
                  },
                },
                { new: true },
              );
              console.log(
                `Vendor ${vendor?._id} decremented stats (-1 booked, -${existingDrive.bookingFeeAmount || 0} revenue) via webhook.`,
              );
            } catch (err) {
              console.error("Failed to decrement vendor stats:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error updating test drive status for refund:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
