import mongoose, { Schema, models } from "mongoose";

const MessageItemSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ["ADMIN", "VENDOR"],
      required: true,
    },
    type: {
      type: String,
      enum: ["TEXT", "IMAGE", "VIDEO", "FILE", "AUDIO"],
      default: "TEXT",
    },
    content: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true, minimize: false },
);

// Explicitly clear the model to force Next.js to use the updated schema immediately
if (mongoose.models.Chat) {
  delete mongoose.models.Chat;
}

const ChatSchema = new Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      unique: true,
    },
    messages: [MessageItemSchema],
  },
  { timestamps: true, minimize: false },
);

const Chat = models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;
