import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';

import connectToDatabase from '@/lib/db';
import User from '@/models/user.model';

import { authOptions } from '../auth/[...nextauth]/route';

// GET: Fetch logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user as { password?: string };
    const hasPassword = !!password;

    return NextResponse.json({ user: { ...userWithoutPassword, hasPassword } }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create or update user (Upsert)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, currentPassword, newPassword, image, phone, address } = body;

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update basic fields
    if (name) {
      user.name = name;
    }
    if (image) {
      user.image =
        image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    }
    if (phone) {
      user.phone = phone || 1234567890;
    }
    if (address !== undefined) {
      user.address = address;
    }

    // Handle password update
    if (newPassword) {
      if (user.password) {
        // User has a password, verify current password
        if (!currentPassword) {
          return NextResponse.json(
            { error: 'Current password is required to change password' },
            { status: 400 }
          );
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }
      }
      // Set new password (either no existing password or verified current)
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { user: { ...userWithoutPassword, hasPassword: !!user.password } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error upserting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
