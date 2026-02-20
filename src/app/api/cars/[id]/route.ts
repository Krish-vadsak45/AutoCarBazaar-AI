import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Car from "@/models/car.model";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    await connectToDatabase();
    const { params } = context;
    const { id } = (await params) || {};
    if (!id) {
      return NextResponse.json({ error: "Missing car id" }, { status: 400 });
    }
    console.log("Fetching car with id:", id);
    let car;
    try {
      car = await Car.findById(id).lean();
    } catch (err: any) {
      // Mongoose CastError for invalid ObjectId
      if (err?.name === "CastError") {
        return NextResponse.json({ error: "Invalid car id" }, { status: 400 });
      }
      console.error("Error fetching car by id:", err);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json({ car });
  } catch (error: any) {
    console.error("GET /api/cars/[id] error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Unknown" },
      { status: 500 },
    );
  }
}

// patch request to change the status of the car to available or unavailable

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    await connectToDatabase();
    const { params } = context;
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing car id" }, { status: 400 });
    }
    const { status } = await request.json();
    if (!["available", "unavailable"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }
    const car = await Car.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).lean();
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }
    return NextResponse.json({ car });
  } catch (error: any) {
    console.error("PATCH /api/cars/[id] error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Unknown" },
      { status: 500 },
    );
  }
}
