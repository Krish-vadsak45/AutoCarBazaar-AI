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
  isActive: boolean;
  isVerified: boolean;
  cars: string[];
  businessName: string;
  businessType: "INDIVIDUAL" | "COMPANY" | "AGENCY";
  vendorType: "SINGLE_OWNER" | "FLEET_OWNER";

  // New Interface Fields
  ownerName: string;
  contactDetails: {
    email: string;
    phone: string;
    alternatePhone?: string;
  };
  address?: string;
  gstNumber?: string;
  website?: string;
  description?: string;

  identityProof: {
    type: "AADHAAR" | "PAN" | "PASSPORT" | "DRIVING_LICENSE";
    number: string;
    documentUrl: string;
  };
  bankDetails: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  };
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  workingHours?: workingHours[];

  totalTestDrivesBooked: number;
  totalRevenue: number;

  priority: number;
  subscriptionStatus: "NONE" | "ACTIVE" | "PENDING_PENALTY";
}

const VendorProfileSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  isActive: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
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
    type: String,
  },

  // New Fields
  contactDetails: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String }, // Optional
  },

  ownerName: { type: String, required: true },
  gstNumber: { type: String }, // Optional for individuals
  website: { type: String },
  description: { type: String },

  identityProof: {
    type: {
      type: String,
      enum: ["AADHAAR", "PAN", "PASSPORT", "DRIVING_LICENSE"],
      required: true,
    },
    number: { type: String, required: true },
    documentUrl: { type: String, required: true },
  },

  // 💳 Bank Details (Uncommented and fixed)
  bankDetails: {
    bankName: { type: String, required: true }, // Added Bank Name
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true }, // Should add validation regex later
  },

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

  // Booking Analytics
  totalTestDrivesBooked: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },

  // VIP Subscription & Priority
  priority: { type: Number, default: 1 },
  subscriptionStatus: {
    type: String,
    enum: ["NONE", "ACTIVE", "PENDING_PENALTY"],
    default: "NONE",
  },
});

// Force reload model to pick up schema changes
delete mongoose.models.Vendor;

const Vendor: Model<IVendor> = mongoose.model<IVendor>(
  "Vendor",
  VendorProfileSchema,
);

export default Vendor;
