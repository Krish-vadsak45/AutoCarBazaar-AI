import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import connectToDatabase from '@/lib/db';
import User from '@/models/user.model';
import Car from '@/models/car.model';

import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user._id;
    console.log('GET /api/saved-cars: User ID found:', userId);

    const user = await User.findById(userId).populate({
      path: 'savedCars',
      model: Car,
      options: { strictPopulate: false },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.savedCars || [], { status: 200 });
  } catch (error) {
    console.error('Error fetching saved cars:', error);
    return NextResponse.json({ error: 'Failed to fetch saved cars' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    console.log('POST /api/saved-cars: Session:', session);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { carId } = await request.json();
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return NextResponse.json({ error: 'Invalid Car ID' }, { status: 400 });
    }

    const userId = session.user._id;
    console.log('POST /api/saved-cars: userId:', userId, 'carId:', carId);

    // Check if already saved
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const savedCarsList = user.savedCars || [];
    console.log('Current savedCars length:', savedCarsList.length);
    console.log(
      'Current savedCars IDs:',
      savedCarsList.map((id) => id.toString())
    );
    console.log('Checking for carId:', carId);

    const isSaved = savedCarsList.some((id) => id?.toString() === carId);
    console.log('Is car already saved?:', isSaved);

    let action;
    let update;

    if (isSaved) {
      update = { $pull: { savedCars: carId } };
      action = 'removed';
    } else {
      update = { $addToSet: { savedCars: carId } };
      action = 'saved';
    }

    console.log('Applying update:', JSON.stringify(update));
    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      returnDocument: 'after',
    }).lean();
    console.log(
      `Car ${action} successfully for user ${userId}. Updated user savedCars:`,
      JSON.stringify(updatedUser?.savedCars)
    );
    const collectionSize = Array.isArray(updatedUser?.savedCars)
      ? updatedUser.savedCars.length
      : 'N/A';
    console.log(`Collection size: ${collectionSize}`);

    return NextResponse.json({ message: `Car ${action} successfully`, action }, { status: 200 });
  } catch (error) {
    console.error('Error toggling saved car:', error);
    return NextResponse.json({ error: 'Failed to update saved cars' }, { status: 500 });
  }
}
