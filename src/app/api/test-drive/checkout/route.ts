import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Car from "@/models/car.model";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { carId, bookingDetails, isDelivery, userLocation } =
      await request.json();

    if (!carId || !bookingDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const car = await Car.findById(carId);
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    // Use car's hourly price for calculation
    const hourlyRate = car.pricePerHour || 10; // default if not set

    // Calculate duration in hours
    const start = new Date(
      `${bookingDetails.startDate.split("T")[0]}T${bookingDetails.startTime}`,
    );
    const end = new Date(
      `${bookingDetails.endDate.split("T")[0]}T${bookingDetails.endTime}`,
    );
    const diffInMs = end.getTime() - start.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours <= 0) {
      return NextResponse.json(
        { error: "Invalid booking duration" },
        { status: 400 },
      );
    }

    const totalPrice = Math.round(diffInHours * hourlyRate);
    const amountInCents = totalPrice * 100;

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Test Drive Booking: ${car.title}`,
              description: `Booking for ${bookingDetails.startDate} to ${bookingDetails.endDate}`,
              images:
                car.images && car.images.length > 0 ? [car.images[0]] : [],
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/test-drive/${carId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/test-drive/${carId}?canceled=true`,
      metadata: {
        carId,
        userId: (session.user as any)._id,
        startDate: bookingDetails.startDate,
        endDate: bookingDetails.endDate,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        notes: bookingDetails.notes || "",
        isDelivery: isDelivery ? "true" : "false",
        userLocationLat: userLocation?.lat?.toString() ?? "",
        userLocationLng: userLocation?.lng?.toString() ?? "",
        userLocationCity: userLocation?.city ?? "",
        userLocationState: userLocation?.state ?? "",
        userLocationAddress: userLocation?.address ?? "",
      },
    });
    console.log("Stripe Checkout Session created: ", checkoutSession);
    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error("Stripe Session Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
