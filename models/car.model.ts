import mongoose, { Document, Model } from "mongoose";
export interface ISpecs {
  make?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  mileage?: string;
  color?: string;
  [key: string]: any;
}

export interface ICar extends Document {
  images?: string[];
  image?: string; // legacy single image field
  title: string;
  price: number;
  transmission?: string;
  bodyType?: string;
  description?: string;
  features?: string[];
  specs?: ISpecs;
  tags?: string[];
}

const SpecsSchema = new mongoose.Schema<ISpecs>(
  {
    make: { type: String },
    model: { type: String },
    year: { type: Number },
    fuelType: { type: String },
    mileage: { type: String },
    color: { type: String },
  },
  { _id: false },
);

const CarSchema = new mongoose.Schema<ICar>(
  {
    images: { type: [String], default: [] },
    image: { type: String },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    transmission: { type: String },
    bodyType: { type: String },
    description: { type: String },
    features: { type: [String], default: [] },
    specs: { type: SpecsSchema },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

const Car: Model<ICar> =
  (mongoose.models.Car as Model<ICar>) ||
  mongoose.model<ICar>("Car", CarSchema);

export default Car;
