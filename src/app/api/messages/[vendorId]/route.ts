import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Chat from "@/models/message.model";
import Vendor from "@/models/vendor.model";
import { canUseRichSupportChat } from "@/lib/vip";

// Fetch chat history for a specific vendor
export async function GET(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> },
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Create a new message from either Admin or Vendor
export async function POST(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> },
) {
  try {
    const { vendorId } = await params;
    await connectToDatabase();
    const body = await req.json();
    const { sender, content, type = "TEXT", fileUrl, fileName } = body;

    console.log("Incoming Message Body:", JSON.stringify(body, null, 2));

    if (!sender || !["ADMIN", "VENDOR"].includes(sender)) {
      return NextResponse.json(
        { error: "Invalid sender type" },
        { status: 400 },
      );
    }

    // 🔒 Gating Check for Vendors
    if (sender === "VENDOR" && type !== "TEXT") {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor || !canUseRichSupportChat(vendor.priority)) {
        return NextResponse.json(
          { error: "Rich media messages require VIP 2+ (Priority > 1)" },
          { status: 403 },
        );
      }
    }

    if (type === "TEXT" && (!content || content.trim().length === 0)) {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 },
      );
    }

    if (type !== "TEXT" && !fileUrl) {
      return NextResponse.json(
        { error: "File attachment is required for this message type" },
        { status: 400 },
      );
    }

    const newMessage = {
      sender,
      type: type || "TEXT",
      content: content ? content.trim() : "",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      isRead: false,
    };

    console.log("Document to be pushed:", JSON.stringify(newMessage, null, 2));

    // Upsert the chat document so we only have 1 document per vendor.
    const chat = await Chat.findOneAndUpdate(
      { vendorId },
      { $push: { messages: newMessage } },
      {
        returnDocument: "after",
        upsert: true,
        lean: true,
        strict: false,
      },
    );

    // Get the most recently pushed message
    const lastMessage = chat.messages[chat.messages.length - 1];
    console.log("Saved Message from DB:", JSON.stringify(lastMessage, null, 2));

    // Return the newly added message directly
    return NextResponse.json(lastMessage, {
      status: 201,
    });
  } catch (error: any) {
    console.error("POST Message Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
