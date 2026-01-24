import mongoose, { Document, Model } from "mongoose";

export interface ICar extends Document {
  image: string;
  title: string;
  price: number;
  year?: number;
  transmission?: string;
  fuel?: string;
  tags?: string[];
}

const CarSchema = new mongoose.Schema<ICar>(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    year: { type: Number },
    transmission: { type: String },
    fuel: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

const Car: Model<ICar> =
  (mongoose.models.Car as Model<ICar>) ||
  mongoose.model<ICar>("Car", CarSchema);

export default Car;
