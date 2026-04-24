import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { stripe } from '@/lib/stripe';
import connectToDatabase from '@/lib/db';
import Vendor from '@/models/vendor.model';

import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(_request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { _id?: string })._id; // Check vendor session

    const vendor = await Vendor.findOne({ userId });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Only allow VIP checkouts if they have a priority > 1 (You can change this logic)
    // For testing/development, let's say they just click "Subscribe" and get Priority 5
    // or pay for their earned priority tier. Let's just charge a flat 2000 INR monthly.

    const priority = vendor.priority || 1;
    const dynamicPrices: Record<number, number> = {
      1: 1000,
      2: 1500,
      3: 2000,
      4: 2500,
      5: 3000,
    };
    const monthlyFee = dynamicPrices[priority] || 1000;
    const vipMonthlyFeeInCents = monthlyFee * 100;

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `VIP Priority Subscription (Level ${priority})`,
              description: `Maintain your Priority Tier ${priority} & Unlock maximum visibility.`,
            },
            unit_amount: vipMonthlyFeeInCents,
            // To make this a recurring subscription, set recurring:
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/vendor/${vendor._id}/payment?vip_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/vendor/${vendor._id}/payment?vip_canceled=true`,
      metadata: {
        vendorId: vendor._id.toString(),
        type: 'vip_subscription',
      },
    });

    console.log('VIP Checkout created for vendor:', vendor._id);
    console.log('Metadata:', checkoutSession.metadata);

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('VIP Stripe Session Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
