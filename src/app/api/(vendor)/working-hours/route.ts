import { NextResponse } from 'next/server';

import Vendor from '@/models/vendor.model';

import { validateVendor } from '../vend-cars/[id]/route';

const DEFAULT_HOURS = [
  { day: 'MONDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'TUESDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'WEDNESDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'THURSDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'FRIDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'SATURDAY', isOpen: true, openTime: '10:00', closeTime: '14:00' },
  { day: 'SUNDAY', isOpen: false, openTime: '00:00', closeTime: '00:00' },
];

export async function GET(req: Request) {
  try {
    const vendor = await validateVendor(req);

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Return stored hours or defaults if empty
    const hours =
      vendor.workingHours && vendor.workingHours.length > 0 ? vendor.workingHours : DEFAULT_HOURS;

    return NextResponse.json({ workingHours: hours }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    // const session = await getServerSession(authOptions);
    // const vendor = await validateVendor(session);

    const vendor = await validateVendor(req);

    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workingHours } = await req.json();

    // Specific validation can go here if needed
    // Strip `_id` to prevent Mongoose cast issues with subdocuments
    const cleanHours = workingHours.map(
      (h: {
        _id?: unknown;
        day: string;
        isOpen: boolean;
        openTime?: string;
        closeTime?: string;
      }) => {
        const { _id: _, ...rest } = h;
        return rest;
      }
    );

    await Vendor.updateOne({ _id: vendor._id }, { $set: { workingHours: cleanHours } });

    return NextResponse.json({ message: 'Working hours updated', workingHours }, { status: 200 });
  } catch (error) {
    console.error('PATCH working-hours error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
