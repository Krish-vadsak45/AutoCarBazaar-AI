import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Chat from "@/models/message.model";
import Vendor from "@/models/vendor.model";

// Fetch chat history for a specific vendor
export async function GET(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await params;
    await connectToDatabase();
    // Validate vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const chat = await Chat.findOne({ vendorId });
    if (!chat) {
      return NextResponse.json([]); // Send empty array if no chat
    }

    // Automatically mark unread messages as read depending on the viewer.
    // If the URL has ?markRead=ADMIN, it means the ADMIN is looking at it, so we mark VENDOR messages true.
    const { searchParams } = new URL(req.url);
    const viewer = searchParams.get("markRead");
    
    if (viewer === "ADMIN" || viewer === "VENDOR") {
      const senderToMark = viewer === "ADMIN" ? "VENDOR" : "ADMIN";
      let updated = false;
      
      chat.messages.forEach((msg: any) => {
        if (msg.sender === senderToMark && !msg.isRead) {
          msg.isRead = true;
          updated = true;
        }
      });
      if (updated) {
        await chat.save();
      }
    }

    return NextResponse.json(chat.messages);
  } catch (error: any) {
    console.error("GET Messages Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new message from either Admin or Vendor
export async function POST(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await params;
    await connectToDatabase();
    const body = await req.json();
    const { sender, content } = body;

    if (!sender || !["ADMIN", "VENDOR"].includes(sender)) {
      return NextResponse.json({ error: "Invalid sender type" }, { status: 400 });
    }
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    const newMessage = {
      sender,
      content: content.trim(),
      isRead: false,
    };

    // Upsert the chat document so we only have 1 document per vendor.
    const chat = await Chat.findOneAndUpdate(
      { vendorId },
      { $push: { messages: newMessage } },
      { new: true, upsert: true }
    );

    // Return the newly added message directly
    return NextResponse.json(chat.messages[chat.messages.length - 1], { status: 201 });
  } catch (error: any) {
    console.error("POST Message Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
