import mongoose, { Document, Model } from 'mongoose';
export interface ISpecs {
  make?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  mileage?: string;
  color?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ICar extends Document {
  images?: string[];
  image?: string; // legacy single image field
  title: string;
  status: 'available' | 'unavailable';
  price: number;
  pricePerHour?: number;
  transmission?: string;
  bodyType?: string;
  description?: string;
  features?: string[];
  specs?: ISpecs;
  tags?: string[];
  carAddress?: string;
  vendorId?: mongoose.Types.ObjectId;
  videoUrl?: string;
  averageRating?: number;
  reviewCount?: number;
  totalBookedCount?: number;
  createdAt: Date;
  updatedAt: Date;
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
  { _id: false }
);

const CarSchema = new mongoose.Schema<ICar>(
  {
    images: { type: [String], default: [] },
    image: { type: String },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    pricePerHour: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available',
    },
    transmission: { type: String },
    bodyType: { type: String },
    description: { type: String },
    features: { type: [String], default: [] },
    specs: { type: SpecsSchema },
    tags: { type: [String], default: [] },
    carAddress: { type: String },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    videoUrl: { type: String },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    totalBookedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Force bypass cache
delete mongoose.models.Car;

const Car: Model<ICar> =
  (mongoose.models.Car as Model<ICar>) || mongoose.model<ICar>('Car', CarSchema);

export default Car;
