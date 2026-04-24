import { NextResponse } from 'next/server';

import connectToDatabase from '@/lib/db';
import Vendor from '@/models/vendor.model';
import Chat from '@/models/message.model'; // Our Chat model

export async function GET() {
  try {
    await connectToDatabase();

    // We can fetch all vendors, populated with their user email and name.
    const allVendors = await Vendor.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Fetch all chats where Vendor has sent an unread message
    const unreadChats = await Chat.find({
      messages: {
        $elemMatch: { sender: 'VENDOR', isRead: false },
      },
    }).select('vendorId');

    // Convert ObjectIds to strings for easy O(1) lookup
    const unreadVendorIds = new Set(unreadChats.map((c) => c.vendorId.toString()));

    // Attach unread flag to each vendor
    const vendorsWithUnreadStatus = allVendors.map((vendor) => {
      // Mongoose docs back to plain objects
      const vendorObj = vendor.toObject();
      vendorObj.hasUnreadMessages = unreadVendorIds.has(vendor._id.toString());
      return vendorObj;
    });

    return NextResponse.json(vendorsWithUnreadStatus);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
