import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { PipelineStage } from 'mongoose';

import connectToDatabase from '@/lib/db';
import Car from '@/models/car.model';
import Vendor from '@/models/vendor.model';
import { carSchema } from '@/lib/validations/car';
import { canAddListingVideo } from '@/lib/vip';
import { ICar } from '@/models/car.model';

import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    console.log('Connected to database for GET /api/cars');

    const url = new URL(request.url);
    const qp = url.searchParams;

    // Build Mongo filter
    type MongoFilter = Record<string, unknown>;
    const andFilters: MongoFilter[] = [];

    // Search query across multiple fields
    const q = qp.get('searchQuery')?.trim();
    if (q) {
      const regex = new RegExp(q, 'i');
      andFilters.push({
        $or: [
          { title: regex },
          { transmission: regex },
          { 'specs.fuelType': regex },
          { 'specs.year': isNaN(Number(q)) ? undefined : Number(q) },
          { description: regex },
          { tags: { $in: [regex] } },
        ].filter(Boolean) as MongoFilter[],
      });
    }

    // Company filter: multiple companies OR'd
    const companies = qp.getAll('company');
    if (companies && companies.length > 0) {
      const companyOr = companies.map((c) => {
        const r = new RegExp(c.trim(), 'i');
        return {
          $or: [{ title: r }, { 'specs.make': r }, { tags: { $in: [r] } }],
        };
      });
      andFilters.push({ $or: companyOr });
    }

    // Transmission & fuel
    const transmission = qp.get('transmission');
    if (transmission) {
      andFilters.push({
        transmission: { $regex: transmission, $options: 'i' },
      });
    }
    const fuel = qp.get('fuel');
    if (fuel) {
      andFilters.push({ 'specs.fuelType': { $regex: fuel, $options: 'i' } });
    }

    // Year range
    const yearFrom = qp.get('yearFrom');
    const yearTo = qp.get('yearTo');
    if (yearFrom || yearTo) {
      const yearCond: Record<string, number> = {};
      if (yearFrom && !isNaN(Number(yearFrom))) {
        yearCond.$gte = Number(yearFrom);
      }
      if (yearTo && !isNaN(Number(yearTo))) {
        yearCond.$lte = Number(yearTo);
      }
      if (Object.keys(yearCond).length) {
        andFilters.push({ 'specs.year': yearCond });
      }
    }

    // Price range
    const minPrice = qp.get('minPrice');
    const maxPrice = qp.get('maxPrice');
    if (minPrice || maxPrice) {
      const priceCond: Record<string, number> = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        priceCond.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        priceCond.$lte = Number(maxPrice);
      }
      if (Object.keys(priceCond).length) {
        andFilters.push({ price: priceCond });
      }
    }

    // Combine all filters with $and
    const filter = andFilters.length > 0 ? { $and: andFilters } : {};

    // Pagination
    const page = parseInt(qp.get('page') || '1', 10);
    const limit = parseInt(qp.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // Log final filter for diagnostics
    console.log('Final cars filter:', JSON.stringify(filter), 'Page:', page, 'Limit:', limit);
    // console.log("Final cars filter:", JSON.stringify(filter));

    let carsRaw;
    let totalCars;
    try {
      const vendorCollection = Vendor.collection.name;

      const sortPipeline: PipelineStage[] = [
        {
          $lookup: {
            from: vendorCollection,
            localField: 'vendorId',
            foreignField: '_id',
            as: '_vipVendor',
          },
        },
        {
          $addFields: {
            vendorPriority: {
              $ifNull: [{ $arrayElemAt: ['$_vipVendor.priority', 0] }, 1],
            },
          },
        },
        { $sort: { vendorPriority: -1, createdAt: -1 } },
        { $project: { _vipVendor: 0 } },
      ];

      const listPipeline: PipelineStage[] = [
        { $match: filter },
        ...sortPipeline,
        { $skip: skip },
        { $limit: limit },
      ];

      [carsRaw, totalCars] = await Promise.all([
        Car.aggregate(listPipeline),
        Car.countDocuments(filter),
      ]);
      console.log('Found', carsRaw.length, 'cars (Total:', totalCars, ')');

      const cars = (carsRaw as ICar[]).map((c) => ({
        ...c,
        id: c._id?.toString() || '',
        image: c.images?.[0] || c.image || '',
        year: c.specs?.year || (c as unknown as { year?: string | number }).year,
        fuel: c.specs?.fuelType || (c as unknown as { fuel?: string }).fuel,
        make: c.specs?.make || (c as unknown as { make?: string }).make,
      }));

      return NextResponse.json({
        cars,
        hasMore: totalCars > skip + cars.length,
      });
    } catch (err) {
      console.error('Error running Car.find with filter:', filter, err);
      const message = err instanceof Error ? err.message : 'Query failed';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    // return NextResponse.json({ cars });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     await connectToDatabase();
//     console.log(body);
//     const created = await Car.create(body);
//     return NextResponse.json({ car: created }, { status: 201 });
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error?.message ?? "Unknown" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const userId = user._id;

    await connectToDatabase();

    const vendor = await Vendor.findOne({ userId: userId });
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor profile not found. Please register as a vendor.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // ✅ Validate Body
    const validation = carSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    const video = validatedData.videoUrl?.trim();
    if (video) {
      if (!canAddListingVideo(vendor.priority)) {
        return NextResponse.json(
          {
            error: 'Listing video requires VIP level 3 or higher (priority > 2).',
          },
          { status: 403 }
        );
      }
    }

    const createPayload = {
      ...validatedData,
      vendorId: vendor._id,
    } as Record<string, unknown>;
    if (video) {
      createPayload.videoUrl = video;
    } else {
      delete createPayload.videoUrl;
    }

    const newCar = await Car.create(createPayload);

    // Push carId into vendor using update to bypass potential strict schema validation errors on outdated documents
    await Vendor.findByIdAndUpdate(
      vendor._id,
      { $push: { cars: newCar._id.toString() } },
      { runValidators: false }
    );

    return NextResponse.json({ message: 'Car created successfully', car: newCar }, { status: 201 });
  } catch (error) {
    console.error('Create Car Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
