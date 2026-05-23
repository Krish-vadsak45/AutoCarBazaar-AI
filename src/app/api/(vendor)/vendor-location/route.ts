import { NextResponse } from 'next/server';

import { validateVendor } from '../vend-cars/[id]/route';

export async function PATCH(req: Request) {
  try {
    const vendor = await validateVendor(req);

    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { address } = await req.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Valid address string is required' }, { status: 400 });
    }

    vendor.address = address;
    await vendor.save();

    return NextResponse.json({ message: 'Location updated', address }, { status: 200 });
  } catch (error) {
    console.error('Error updating vendor location:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const vendor = await validateVendor(req);

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        address: vendor.address ?? '',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching vendor location:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
