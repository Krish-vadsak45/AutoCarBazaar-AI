import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import connectToDatabase from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import Car from '@/models/car.model';
import Vendor from '@/models/vendor.model';
import { carSchema } from '@/lib/validations/car';
import type { CarFormValues } from '@/lib/validations/car';
import { canUseBulkUpload } from '@/lib/vip';

import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'vendor' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cars } = body;

    if (!Array.isArray(cars) || cars.length === 0) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Get the Vendor Profile for the current user
    const vendor = await Vendor.findOne({
      userId: session.user._id,
    });

    if (!vendor && session.user.role === 'vendor') {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    if (session.user.role === 'vendor' && vendor) {
      if (!canUseBulkUpload(vendor.priority)) {
        return NextResponse.json(
          {
            error: 'Bulk CSV upload requires VIP level 5 (priority > 4).',
          },
          { status: 403 }
        );
      }
    }

    // Prepare data and validate
    const validatedCars = cars.map((carData: Partial<CarFormValues>) => {
      // Set the vendor ID and default status
      const processedData = {
        ...carData,
        vendorId: vendor?._id || session.user.vendorId || session.user._id,
        status: 'available',
      };

      // Basic validation check - we use parse to ensure it matches schema
      const result = carSchema.safeParse(processedData);
      if (!result.success) {
        // Use z.format() or format the error manually
        const firstError = result.error.issues[0];
        throw new Error(
          `Validation failed for one or more records: ${firstError.path.join('.')} - ${firstError.message}`
        );
      }

      return result.data;
    });

    // Bulk insert
    const createdCars = await Car.insertMany(validatedCars);

    // 2. Link the created cars to the vendor's profile
    if (vendor) {
      const carIds = createdCars.map((car) => car._id);
      await Vendor.findByIdAndUpdate(vendor._id, {
        $push: { cars: { $each: carIds } },
      });
    }

    return NextResponse.json(
      {
        message: `${createdCars.length} vehicles uploaded successfully`,
        count: createdCars.length,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to process bulk upload') },
      { status: 500 }
    );
  }
}
