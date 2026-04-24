import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import connectToDatabase from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import Review from '@/models/review.model';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    // Default limit of 10 for paginated replies beyond the initial 4
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const reviewId = id;
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    await connectToDatabase();

    const review = await Review.findById(reviewId)
      .select('replies')
      .populate({
        path: 'replies.userId',
        select: 'name image',
      })
      .lean();

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const totalReplies = review.replies.length;
    const paginatedReplies = review.replies
      .sort(
        (a: ReplyItem, b: ReplyItem) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(skip, skip + limit);

    return NextResponse.json(
      {
        replies: paginatedReplies,
        pagination: {
          total: totalReplies,
          page,
          limit,
          totalPages: Math.ceil(totalReplies / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
type ReplyItem = {
  createdAt: string | Date;
};
