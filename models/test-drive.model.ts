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
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
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
  },
  { timestamps: true },
);

export default mongoose.models.TestDrive ||
  mongoose.model<ITestDrive>("TestDrive", TestDriveSchema);
