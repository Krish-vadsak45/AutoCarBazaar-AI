import { NextResponse } from 'next/server';

import connectToDatabase from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import Car, { ICar } from '@/models/car.model';
import { CarListItem } from '@/src/types';

function serializeCar(car: (ICar & { _id: { toString(): string } }) | CarListItem): CarListItem {
  return {
    _id: car._id.toString(),
    title: car.title,
    price: car.price,
    image: car.image,
    images: car.images,
    transmission: car.transmission,
    bodyType: car.bodyType,
    description: car.description,
    features: car.features,
    tags: car.tags,
    status: car.status,
    pricePerHour: car.pricePerHour,
    vendorId: car.vendorId?.toString(),
    carAddress: car.carAddress,
    vendorAddress: 'vendorAddress' in car ? car.vendorAddress : undefined,
    specs: car.specs,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    const { params } = context;
    const { id } = (await params) || {};
    if (!id) {
      return NextResponse.json({ error: 'Missing car id' }, { status: 400 });
    }
    console.log('Fetching car with id:', id);
    let car: CarListItem | null;
    try {
      const carDoc = await Car.findById(id).lean();
      car = carDoc ? serializeCar(carDoc as ICar & { _id: { toString(): string } }) : null;
    } catch (err: unknown) {
      // Mongoose CastError for invalid ObjectId
      if (err && typeof err === 'object' && 'name' in err && err.name === 'CastError') {
        return NextResponse.json({ error: 'Invalid car id' }, { status: 400 });
      }
      console.error('Error fetching car by id:', err);
      return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Try to find the associated vendor for default address
    try {
      const Vendor = (await import('@/models/vendor.model')).default;
      const vendor = await Vendor.findOne({ cars: id }).lean();
      if (vendor && vendor.address && !car.carAddress) {
        car = { ...car, vendorAddress: vendor.address };
      }
    } catch (err) {
      console.error('Failed to append vendor details to car info', err);
    }

    return NextResponse.json({ car });
  } catch (error: unknown) {
    console.error('GET /api/cars/[id] error:', error);
    return NextResponse.json({ error: getErrorMessage(error, 'Unknown') }, { status: 500 });
  }
}

// patch request to change the status of the car to available or unavailable

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    const { params } = context;
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing car id' }, { status: 400 });
    }
    const { status } = await request.json();
    if (!['available', 'unavailable'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    const carDoc = await Car.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!carDoc) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    const car = serializeCar(carDoc as ICar & { _id: { toString(): string } });
    return NextResponse.json({ car });
  } catch (error: unknown) {
    console.error('PATCH /api/cars/[id] error:', error);
    return NextResponse.json({ error: getErrorMessage(error, 'Unknown') }, { status: 500 });
  }
}
