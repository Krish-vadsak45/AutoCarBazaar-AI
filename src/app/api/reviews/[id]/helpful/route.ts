import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/db";
import Review from "@/models/review.model";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const user = await mongoose
      .model("User")
      .findOne({ email: session.user.email });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const review = await Review.findById(id);
    if (!review)
      return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const isHelpful = review.helpfulUsers.includes(user._id);

    if (isHelpful) {
      // Remove helpful
      review.helpfulUsers = review.helpfulUsers.filter(
        (userId: any) => userId.toString() !== user._id.toString(),
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add helpful
      review.helpfulUsers.push(user._id);
      review.helpfulCount += 1;
    }

    await review.save();
    return NextResponse.json(
      {
        helpfulCount: review.helpfulCount,
        isHelpful: !isHelpful,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
