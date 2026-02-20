import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  savedCars: mongoose.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, sparse: true },
    name: { type: String },
    password: { type: String },
    role: { type: String, enum: ["admin", "user", "vendor"], default: "user" },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
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
