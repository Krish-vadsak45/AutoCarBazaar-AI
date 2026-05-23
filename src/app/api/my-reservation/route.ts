import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import TestDrive from '@/models/test-drive.model';
import connectToDatabase from '@/lib/db';
import Vendor from '@/models/vendor.model';
import User from '@/models/user.model';
import Car from '@/models/car.model';

import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user._id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build filter
    const filter: { userId: string; status?: string } = { userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Fetch data with pagination
    const [testDrives, total] = await Promise.all([
      TestDrive.find(filter)
        .populate([
          { path: 'carId', model: Car },
          { path: 'vendorId', model: Vendor },
          { path: 'userId', model: User },
        ])
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit),
      TestDrive.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        data: testDrives,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}
