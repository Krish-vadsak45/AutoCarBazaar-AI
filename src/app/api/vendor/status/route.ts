import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import connectToDatabase from '@/lib/db';
import Vendor from '@/models/vendor.model';

import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(_req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as { role?: string }).role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorId = (session.user as { vendorId?: string }).vendorId;

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    // console.log("Venodor Data:", vendor);

    return NextResponse.json({
      isVerified: vendor.isVerified,
      isActive: vendor.isActive,
      priority: vendor.priority,
      subscriptionStatus: vendor.subscriptionStatus,
    });
  } catch (error) {
    console.error('Error fetching vendor status:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor status' }, { status: 500 });
  }
}
