import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import connectToDatabase from '@/lib/db';
import User from '@/models/user.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    await connectToDatabase();

    // 2️⃣ Find user
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 3️⃣ Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // 4️⃣ Success response
    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    return NextResponse.json({ message: 'Login successful', user: responseUser }, { status: 200 });
  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
