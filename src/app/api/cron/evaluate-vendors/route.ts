import { NextResponse } from 'next/server';

import connectToDatabase from '@/lib/db';
import Vendor from '@/models/vendor.model';
import { processMonthlySubscriptionEmails } from '@/lib/subscription-emails';

// You can protect this cron job via a secret token if needed by checking headers or query params
export async function GET(_req: Request) {
  try {
    await connectToDatabase();

    // If it's not the 1st of the month, only process the warning emails
    const today = new Date().getDate();
    if (today !== 1) {
      await processMonthlySubscriptionEmails();
      return NextResponse.json({
        message:
          'Scheduled emails processed. Priority evaluation skipped (not the 1st of the month).',
      });
    }

    // Step 1: Fetch all verified vendors to evaluate priorities on Day 1
    const vendors = await Vendor.find({ isVerified: true, isActive: true });

    if (!vendors || vendors.length === 0) {
      return NextResponse.json({
        message: 'No active verified vendors found to evaluate',
      });
    }

    // Weight configuration
    const VOLUME_WEIGHT = 500;

    // Step 1: Calculate scores for each vendor
    const vendorScores = vendors.map((vendor) => {
      const volume = vendor.totalTestDrivesBooked || 0;
      const revenue = vendor.totalRevenue || 0;

      const score = volume * VOLUME_WEIGHT + revenue;
      return { vendorId: vendor._id, score };
    });

    // Step 2: Sort vendors by score (Descending)
    vendorScores.sort((a, b) => b.score - a.score);

    // Step 3: Determine Priority Tiers based on percentiles
    const totalVendors = vendorScores.length;

    // Pre-calculate percentile cutoffs
    // Top 10% = Priority 5
    // Next 20% (Top 10-30%) = Priority 4
    // Next 30% (Top 30-60%) = Priority 3
    // Next 20% (Top 60-80%) = Priority 2
    // Bottom 20% = Priority 1

    const updates = vendorScores.map(async (v, index) => {
      const percentile = ((index + 1) / totalVendors) * 100;

      let earnedPriority = 1;
      if (percentile <= 10) {
        earnedPriority = 5;
      } else if (percentile <= 30) {
        earnedPriority = 4;
      } else if (percentile <= 60) {
        earnedPriority = 3;
      } else if (percentile <= 80) {
        earnedPriority = 2;
      } else {
        earnedPriority = 1;
      }

      // Note: We might want a minimum score to earn priority > 1 so new vendors with 0 score aren't bumped up automatically if there are few vendors.
      // If score is 0, force priority 1.
      if (v.score === 0) {
        earnedPriority = 1;
      }

      await Vendor.updateOne({ _id: v.vendorId }, { $set: { priority: earnedPriority } });

      return {
        vendorId: v.vendorId,
        score: v.score,
        newPriority: earnedPriority,
      };
    });

    // Step 5: Save all priority updates
    const results = await Promise.all(updates);

    // Step 6: Dispatch 1st Day VIP Emails to Vendors with their finalized newly updated Priorities
    await processMonthlySubscriptionEmails();

    return NextResponse.json({
      message: 'Vendor dynamic priorities calculated and emails dispatched successfully',
      totalEvaluated: totalVendors,
      results,
    });
  } catch (error) {
    console.error('Evaluation Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
