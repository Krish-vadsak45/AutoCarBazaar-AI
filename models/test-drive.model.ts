import mongoose, { Document, Schema } from "mongoose";

export interface IUserLocation {
  address?: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export interface ITestDrive extends Document {
  carId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  notes?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  stripeSessionId?: string;
  paymentStatus: "PENDING" | "PAID" | "UNPAID";
  isDelivery: boolean;
  userLocation?: IUserLocation;
}

const TestDriveSchema = new Schema<ITestDrive>(
  {
    carId: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
      uppercase: true, // Ensure it's always stored as uppercase
    },
    stripeSessionId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "UNPAID"],
      default: "PENDING",
      uppercase: true,
    },
    isDelivery: { type: Boolean, default: false },
    userLocation: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true },
);

export default mongoose.models.TestDrive ||
  mongoose.model<ITestDrive>("TestDrive", TestDriveSchema);
