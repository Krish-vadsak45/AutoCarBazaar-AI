import mongoose, { Schema, models } from "mongoose";

const MessageItemSchema = new Schema({
  sender: {
    type: String,
    enum: ["ADMIN", "VENDOR"],
    required: true,
  },
  content: {
    type: String,
    required: true,
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
  }
});

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
  { timestamps: true }
);

const Chat = models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;
