import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, sparse: true },
    name: { type: String },
    password: { type: String },
    role: { type: String, enum: ["admin", "user", "vendor"], default: "user" },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
