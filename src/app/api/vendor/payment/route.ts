import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import connectToDatabase from '@/lib/db';
import Vendor from '@/models/vendor.model';
import { stripe } from '@/lib/stripe';

import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(_req: Request) {
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

    if (!vendor.isVerified) {
      return NextResponse.json(
        { error: 'Account must be verified by admin first' },
        { status: 403 }
      );
    }

    if (vendor.isActive) {
      return NextResponse.json({ message: 'Account is already active' }, { status: 200 });
    }

    // Process the payment here (integration with Stripe, etc)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Vendor Registration Fee',
              description: 'One-time registration fee to activate your vendor account',
            },
            unit_amount: 1000 * 100, // 1000 INR
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/vendor/${vendorId}/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/vendor/${vendorId}/payment?canceled=true`,
      metadata: {
        vendorId: vendor._id.toString(),
        type: 'vendor_registration',
      },
    });

    return NextResponse.json(
      { sessionId: checkoutSession.id, url: checkoutSession.url },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment API Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
