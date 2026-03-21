import mongoose, { Document, Schema } from "mongoose";

export interface ITestDrive extends Document {
  carId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  notes?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REJECTED";
  stripeSessionId?: string;
  paymentIntentId?: string;
  paymentStatus: "PENDING" | "PAID" | "UNPAID" | "REFUNDED";
  isDelivery: boolean;
  address?: string;
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
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REJECTED"],
      default: "PENDING",
      uppercase: true, // Ensure it's always stored as uppercase
    },
    stripeSessionId: { type: String },
    paymentIntentId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "UNPAID", "REFUNDED"],
      default: "PENDING",
      uppercase: true,
    },
    isDelivery: { type: Boolean, default: false },
    address: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.TestDrive ||
  mongoose.model<ITestDrive>("TestDrive", TestDriveSchema);
