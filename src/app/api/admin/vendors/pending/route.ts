import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import connectToDatabase from '@/lib/db';
import Vendor from '@/models/vendor.model';

import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const pendingVendors = await Vendor.find({
      verificationStatus: 'PENDING',
    }).populate('userId', 'name email');

    return NextResponse.json(pendingVendors);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
