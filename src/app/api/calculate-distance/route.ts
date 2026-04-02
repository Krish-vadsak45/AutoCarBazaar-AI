import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origins = searchParams.get("origins");
  const destinations = searchParams.get("destinations");

  if (!origins || !destinations) {
    return NextResponse.json(
      { error: "origins and destinations are required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.DISTANCEMATRIX_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Distance API key not configured" },
      { status: 500 },
    );
  }

  const pickupEncoded = encodeURIComponent(origins);
  const destinationEncoded = encodeURIComponent(destinations);

  const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${pickupEncoded}&destinations=${destinationEncoded}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: `Distance API error: ${data.status}` },
        { status: 400 },
      );
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== "OK") {
      return NextResponse.json(
        { error: "Could not calculate distance between these locations" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      distance: element.distance?.text,
      duration: element.duration?.text,
      distanceValue: element.distance?.value, // metres
      durationValue: element.duration?.value, // seconds
      originAddress: data.origin_addresses?.[0],
      destinationAddress: data.destination_addresses?.[0],
    });
  } catch (error: any) {
    console.error("Distance API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch distance" },
      { status: 500 },
    );
  }
}
