import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Car from "@/models/car.model";

export async function GET() {
  await connectToDatabase();
  const cars = await Car.find().lean();
  return NextResponse.json({ cars });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const created = await Car.create(body);
    return NextResponse.json({ car: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unknown" },
      { status: 500 },
    );
  }
}
