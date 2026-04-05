import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  carId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  testDriveId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isVerified: boolean;
  helpfulCount: number;
  helpfulUsers: mongoose.Types.ObjectId[];
  replies: Array<{
    userId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    carId: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    testDriveId: {
      type: Schema.Types.ObjectId,
      ref: "TestDrive",
      required: true,
      unique: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
    helpfulUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    replies: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Force bypass cache
delete mongoose.models.Review;

const Review =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
