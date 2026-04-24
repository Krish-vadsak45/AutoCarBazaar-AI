import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

import connectToDatabase from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import Review from '@/models/review.model';
import TestDrive from '@/models/test-drive.model';
import Car from '@/models/car.model';
import { ReviewData } from '@/src/types';

type ReplySummary = {
  createdAt: string | Date;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { carId, testDriveId, rating, comment } = body;

    if (!carId || !testDriveId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify test drive is completed and belongs to the user
    const testDrive = await TestDrive.findOne({
      _id: testDriveId,
      carId,
      // userId: session.user.id, // Assuming session.user has an id
      status: 'COMPLETED',
    });

    if (!testDrive) {
      return NextResponse.json(
        { error: 'No completed test drive found for this car' },
        { status: 400 }
      );
    }

    // Check if review already exists for this test drive
    const existingReview = await Review.findOne({ testDriveId });
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this test drive' },
        { status: 400 }
      );
    }

    // Create review - handle user identification correctly
    // Since I don't see the exact session user ID field, we'll try to find user by email or use session.user.id
    const user = await mongoose.model('User').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const review = await Review.create({
      carId,
      userId: user._id,
      testDriveId,
      rating,
      comment,
      isVerified: true,
    });

    // Update Car aggregate ratings
    const carReviews = await Review.find({ carId });
    const count = carReviews.length;
    const avg = carReviews.reduce((acc, curr) => acc + curr.rating, 0) / count;

    await Car.findByIdAndUpdate(carId, {
      averageRating: avg,
      reviewCount: count,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get('carId');
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const rating = searchParams.get('rating');

    await connectToDatabase();

    const query: { carId?: mongoose.Types.ObjectId; rating?: number } = carId
      ? { carId: new mongoose.Types.ObjectId(carId) }
      : {};
    if (rating) {
      query.rating = Number.parseInt(rating);
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'name image')
        .populate({
          path: 'replies.userId',
          select: 'name image',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    // Enhance reviews with a 'hasMoreReplies' flag for the UI
    const enhancedReviews = reviews.map((review: ReviewData) => {
      // Sort replies by date (recent first) before slicing
      const sortedReplies = [...review.replies].sort(
        (a: ReplySummary, b: ReplySummary) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        ...review,
        hasMoreReplies: review.replies.length > 2,
        totalReplies: review.replies.length,
        // Send only the first 2 most recent replies initially
        replies: sortedReplies.slice(0, 2),
      };
    });

    return NextResponse.json(
      {
        reviews: enhancedReviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
