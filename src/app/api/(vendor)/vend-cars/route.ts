import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import connectToDatabase from '@/lib/db';
import Car from '@/models/car.model';
import Vendor from '@/models/vendor.model';
import User from '@/models/user.model'; // Import User model

import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    const userRole = session?.user?.role;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check query params for vendorId (for Admin access)
    const { searchParams } = new URL(request.url);
    const vendorIdParam = searchParams.get('vendorId');

    let cars;

    if (userRole === 'admin' && vendorIdParam) {
      // If Admin and specific vendor requested
      const vendor = await Vendor.findById(vendorIdParam);
      if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
      }
      // Assuming vendor.cars is an array of ObjectIds
      cars = await Car.find({ _id: { $in: vendor.cars || [] } })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Default: Fetch for logged-in vendor user
      // 1. Find User by email to get user ID
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // 2. Find Vendor profile linked to this User
      const vendor = await Vendor.findOne({ userId: user._id.toString() });
      if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
      }

      // 3. Fetch all cars listed in the vendor's profile
      cars = await Car.find({ _id: { $in: vendor.cars || [] } })
        .sort({ createdAt: -1 }) // Sort by newest first
        .lean();
    }

    return NextResponse.json({ cars }, { status: 200 });
  } catch (error) {
    console.error('Error fetching vendor cars:', error);
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
  }
}
