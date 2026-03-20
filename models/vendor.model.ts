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
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    lat?: number;
    lng?: number;
  };
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
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
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
});

// Force reload model in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete (mongoose.models as any).Vendor;
}

const Vendor: Model<IVendor> =
  (mongoose.models.Vendor as Model<IVendor>) ||
  mongoose.model<IVendor>("Vendor", VendorProfileSchema);

export default Vendor;
