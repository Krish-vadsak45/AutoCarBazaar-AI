import { NextRequest, NextResponse } from 'next/server';

import connectToDatabase from '@/lib/db';
import Car from '@/models/car.model';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const { action } = await req.json(); // expected "increment" or "decrement"

    if (!action || !['increment', 'decrement'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'increment' or 'decrement'." },
        { status: 400 }
      );
    }

    const incrementValue = action === 'increment' ? 1 : -1;

    const car = await Car.findByIdAndUpdate(
      id,
      {
        $inc: { totalBookedCount: incrementValue },
      },
      { new: true }
    );

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Ensure it doesn't drop below 0
    const bookedCount = car.totalBookedCount ?? 0;
    if (bookedCount < 0) {
      car.totalBookedCount = 0;
      await car.save();
    }

    return NextResponse.json(car, { status: 200 });
  } catch (error) {
    console.error(`Failed to ${req.method} car booking count:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
