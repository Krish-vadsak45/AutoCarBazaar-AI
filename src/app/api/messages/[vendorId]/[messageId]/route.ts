import { NextResponse } from 'next/server';

import connectToDatabase from '@/lib/db';
import Chat from '@/models/message.model'; // Our Chat model

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ vendorId: string; messageId: string }> }
) {
  try {
    const { vendorId, messageId } = await params;
    const body = await req.json();
    const { action, content } = body;

    await connectToDatabase();

    const chat = await Chat.findOne({ vendorId });
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (action === 'DELETE') {
      message.isDeleted = true;
      // Overwrite content or leave it and handle on frontend?
      // Better to keep it secure: overwrite content visually on frontend to "🚫 This message was deleted"
      // But we can just set the flag, so frontend can display correctly.
      message.content = '🚫 This message was deleted';
    } else if (action === 'EDIT') {
      if (!content || content.trim() === '') {
        return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
      }
      message.content = content.trim();
      message.isEdited = true;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await chat.save();

    return NextResponse.json(message);
  } catch (error: unknown) {
    console.error('Message Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
