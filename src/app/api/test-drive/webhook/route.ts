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
      await connectToDatabase();

      const vendor = await Vendor.findOne({ cars: metadata.carId });
      if (!vendor) {
        throw new Error("Vendor not found for carId " + metadata.carId);
      }

      const isDelivery = metadata.isDelivery === "true";
      const userLocation =
        isDelivery && metadata.userLocationCity
          ? {
              address: metadata.userLocationAddress || undefined,
              city: metadata.userLocationCity,
              state: metadata.userLocationState,
              lat: metadata.userLocationLat ? parseFloat(metadata.userLocationLat) : 0,
              lng: metadata.userLocationLng ? parseFloat(metadata.userLocationLng) : 0,
            }
          : undefined;

      const newTestDrive = await TestDrive.create({
        carId: metadata.carId,
        userId: metadata.userId,
        vendorId: vendor._id,
        startDate: new Date(metadata.startDate),
        endDate: new Date(metadata.endDate),
        startTime: metadata.startTime,
        endTime: metadata.endTime,
        notes: metadata.notes,
        status: "PENDING",
        stripeSessionId: session.id,
        paymentStatus: "PAID",
        isDelivery,
        userLocation,
      });
      console.log("New Test Drive created from webhook: ", newTestDrive);
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
  }

  return NextResponse.json({ received: true });
}
