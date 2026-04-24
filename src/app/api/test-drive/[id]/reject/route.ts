import { NextResponse } from 'next/server';

import connectToDatabase from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import TestDrive from '@/models/test-drive.model';
import Vendor from '@/models/vendor.model';
import { stripe } from '@/lib/stripe';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    // Assuming params is a promise in Next.js 15
    const id = (await params).id;

    // Find the test drive by ID
    const testDrive = await TestDrive.findById(id);

    if (!testDrive) {
      return NextResponse.json({ error: 'Test drive not found' }, { status: 404 });
    }

    if (testDrive.status === 'REJECTED' || testDrive.paymentStatus === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Test drive already rejected or refunded' },
        { status: 400 }
      );
    }

    if (!testDrive.paymentIntentId) {
      return NextResponse.json(
        {
          error: 'No Stripe payment intent found for this test drive to issue a refund.',
        },
        { status: 400 }
      );
    }

    // 1. Issue the refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: testDrive.paymentIntentId,
    });

    if (refund.status === 'succeeded' || refund.status === 'pending') {
      // 2. Update DB status and vendor metrics
      testDrive.status = 'REJECTED';
      testDrive.paymentStatus = 'REFUNDED';

      const vendorId = testDrive.vendorId;
      if (vendorId) {
        const vendor = await Vendor.findById(vendorId);
        if (vendor) {
          vendor.totalTestDrivesBooked = Math.max(0, (vendor.totalTestDrivesBooked || 1) - 1);
          vendor.totalRevenue = Math.max(
            0,
            (vendor.totalRevenue || 0) - (testDrive.bookingFeeAmount || 0)
          );
          await vendor.save();
        }
      }

      await testDrive.save();

      return NextResponse.json({
        message: 'Test drive rejected and customer refunded successfully',
        testDrive,
      });
    } else {
      throw new Error(`Refund failed with status: ${refund.status}`);
    }
  } catch (error: unknown) {
    console.error('Error rejecting test drive:', error);
    return NextResponse.json(
      { error: getErrorMessage(error, 'Internal Server Error') },
      { status: 500 }
    );
  }
}
