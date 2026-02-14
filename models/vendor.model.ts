import mongoose, { Model, Schema } from "mongoose";
import User from "./user.model";

interface workingHours extends mongoose.Document {
  day: string;
  isOpen: boolean;
  openTime?: string; // Format: HH:mm
  closeTime?: string; // Format: HH:mm
}

export interface IVendor extends mongoose.Document {
  userId: string;
  cars: string[];
  businessName: string;
  businessType: "INDIVIDUAL" | "COMPANY" | "AGENCY";
  vendorType: "SINGLE_OWNER" | "FLEET_OWNER";
  address: {
    city: string;
    state: string;
    pincode: string;
  };
  identityProof: {
    type: "AADHAAR" | "PAN" | "PASSPORT" | "DRIVING_LICENSE";
    number: string;
    documentUrl: string;
  };
  // bankDetails: {
  //     accountHolderName: string;
  //     accountNumber: string;
  //     ifscCode: string;
  // };
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  workingHours?: workingHours[];
}

const VendorProfileSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  cars: [{ type: Schema.Types.ObjectId, ref: "Car" }],

  businessName: { type: String, required: true },
  businessType: {
    type: String,
    enum: ["INDIVIDUAL", "COMPANY", "AGENCY"],
    required: true,
  },
  vendorType: {
    type: String,
    enum: ["SINGLE_OWNER", "FLEET_OWNER"],
    default: "SINGLE_OWNER",
  },

  address: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },

  identityProof: {
    type: {
      type: String,
      enum: ["AADHAAR", "PAN", "PASSPORT", "DRIVING_LICENSE"],
      required: true,
    },
    number: { type: String, required: true },
    documentUrl: { type: String, required: true },
  },

  // // 💳 Bank Details
  // bankDetails: {
  //   accountHolderName: { type: String, required: true },
  //   accountNumber: { type: String, required: true },
  //   ifscCode: { type: String, required: true },
  // },

  // ✅ Verification Status
  verificationStatus: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  },
  // "workingHours": [
  //   { "day": "MONDAY", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
  //   { "day": "SUNDAY", "isOpen": false }
  // ]
  workingHours: [
    {
      day: {
        type: String,
        enum: [
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ],
        required: true,
      },
      isOpen: { type: Boolean, required: true },
      openTime: { type: String }, // Format: HH:mm
      closeTime: { type: String }, // Format: HH:mm
    },
  ],
});

const Vendor: Model<IVendor> =
  (mongoose.models.Vendor as Model<IVendor>) ||
  mongoose.model<IVendor>("Vendor", VendorProfileSchema);

export default Vendor;
