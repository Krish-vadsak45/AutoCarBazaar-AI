import { NextResponse } from 'next/server';

import connectToDatabase from '@/lib/db';
import Chat from '@/models/message.model'; // Now exports ChatSchema
import { IMessageItem } from '@/src/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');
    const role = searchParams.get('role'); // "ADMIN" or "VENDOR"

    if (!vendorId || !role) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await connectToDatabase();

    const chat = await Chat.findOne({ vendorId });
    if (!chat) {
      return NextResponse.json({ hasUnread: false });
    }

    // Determine whose messages we are counting as unread
    const senderToCheck = role === 'VENDOR' ? 'ADMIN' : 'VENDOR';

    const hasUnread = chat.messages.some(
      (msg: IMessageItem) => msg.sender === senderToCheck && !msg.isRead
    );

    return NextResponse.json({ hasUnread });
  } catch (error: unknown) {
    console.error('Unread Status Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
