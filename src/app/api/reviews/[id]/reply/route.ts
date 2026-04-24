import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

import connectToDatabase from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import Review from '@/models/review.model';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await mongoose.model('User').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    review.replies.push({
      userId: user._id,
      text,
      createdAt: new Date(),
    });

    await review.save();

    // Return populated reply
    const lastReply = review.replies[review.replies.length - 1];
    return NextResponse.json(
      {
        ...JSON.parse(JSON.stringify(lastReply)),
        userId: {
          _id: user._id,
          name: user.name,
          image: user.image,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
