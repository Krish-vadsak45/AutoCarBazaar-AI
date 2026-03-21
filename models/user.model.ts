import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
  image?: string;
  phone?: number;
  isActive?: boolean;
  isVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  address?: string;
  savedCars: mongoose.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, sparse: true },
    name: { type: String },
    password: { type: String },
    role: { type: String, enum: ["admin", "user", "vendor"], default: "user" },
    image: {
      type: String,
    },
    phone: { type: Number },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    savedCars: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],
  },
  { timestamps: true, strict: false },
);

// Force reload model in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete (mongoose.models as any).User;
}

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
