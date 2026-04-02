import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Car from "@/models/car.model";
import Vendor, { IVendor } from "@/models/vendor.model";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { carId, bookingDetails, isDelivery, userLocation } =
      await request.json();

    console.log("Received checkout request:", {
      carId,
      isDelivery,
      userLocation,
    });

    if (!carId || !bookingDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const car = await Car.findById(carId);

    console.log("Looking up vendor for carId:", carId);

    // Most reliable way to find the vendor containing this car ID
    // 1. Try finding it where cars array contains exactly this ID
    let vendor: IVendor | null = await Vendor.findOne({
      cars: carId.toString(),
    }).lean<IVendor>();

    // 2. Fallback: Try matching with $in on string values
    if (!vendor) {
      console.log("Trying with $in string match...");
      vendor = await Vendor.findOne({
        cars: { $in: [carId.toString()] },
      }).lean<IVendor>();
    }

    console.log("Vendor lookup result:", vendor ? vendor._id : "null");

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
    const basePriceInCents = totalPrice * 100;

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const line_items: any[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Test Drive Booking: ${car.title}`,
            description: `Booking for ${bookingDetails.startDate} to ${bookingDetails.endDate}`,
            images: car.images && car.images.length > 0 ? [car.images[0]] : [],
          },
          unit_amount: basePriceInCents,
        },
        quantity: 1,
      },
    ];

    let deliveryFeeInCents = 0;

    // Define car's address type based on standard ICar model expectations
    const carAddress = car.carAddress;
    const vendorAddress = vendor?.address;

    const startAddress = carAddress || vendorAddress;

    if (isDelivery && userLocation?.address && startAddress) {
      // Use the actual distance calculation endpoint
      const distanceUrl = `${baseUrl}/api/calculate-distance?origins=${encodeURIComponent(startAddress)}&destinations=${encodeURIComponent(userLocation.address)}`;
      const distanceRes = await fetch(distanceUrl);
      const distanceData = await distanceRes.json();

      if (!distanceRes.ok || distanceData.error) {
        return NextResponse.json(
          { error: distanceData.error || "Failed to calculate distance" },
          { status: 400 },
        );
      }

      console.log("📍 [Checkout API] Calculated Distance Data:", distanceData);
      console.log(
        `🛣️ [Checkout API] Distance: ${distanceData.distance}, Value: ${distanceData.distanceValue} meters`,
      );

      // distanceValue is in metres, convert to km
      const distanceKm = (distanceData.distanceValue || 0) / 1000;

      const ratePerKm = 10; // 10Rs per km
      const deliveryTotal = Math.ceil(distanceKm) * ratePerKm;
      // Note: Assuming Stripe currency is 'inr' if Rs, but 'usd' is hardcoded above.
      // If it's INR, it's minimum 500 paise (₹5). We'll set it to INR calculation equivalent for now.
      deliveryFeeInCents = deliveryTotal * 100;

      line_items.push({
        price_data: {
          currency: "inr", // Assuming INR for Rs
          product_data: {
            name: `Delivery Fee (${Math.ceil(distanceKm)} km)`,
            description: `Driver will bring the car to your location`,
          },
          unit_amount: deliveryFeeInCents,
        },
        quantity: 1,
      });

      // Update main item to INR to match if you're mixing currencies (Stripe requires same currency per session)
      line_items[0].price_data.currency = "inr";
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: `${baseUrl}/test-drive/${carId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/test-drive/${carId}?canceled=true`,
      metadata: {
        carId,
        vendorId: vendor ? vendor._id.toString() : "",
        userId: (session.user as any)._id,
        startDate: bookingDetails.startDate,
        endDate: bookingDetails.endDate,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        notes: bookingDetails.notes || "",
        isDelivery: isDelivery ? "true" : "false",
        userLocationAddress: userLocation?.address || "No address provided",
        bookingFeeAmount: totalPrice.toString(),
      },
    });

    console.log("=========================================");
    console.log("🚗 STRIPE CHECKOUT API HIT (LOCAL) 🚗");
    console.log("Metadata built for Stripe:", checkoutSession.metadata);
    console.log("=========================================");

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
