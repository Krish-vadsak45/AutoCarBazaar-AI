import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email?: string;
  name?: string;
  image?: string;
  role?: string;
  meta?: Record<string, any>;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    name: { type: String },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
