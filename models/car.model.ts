import mongoose, { Document, Model } from "mongoose";

export interface ICar extends Document {
  image: string;
  title: string;
  price: string | number;
  year?: string | number;
  transmission?: string;
  fuel?: string;
  tags?: string[];
}

const CarSchema = new mongoose.Schema<ICar>(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: mongoose.Schema.Types.Mixed, required: true },
    year: { type: String },
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
