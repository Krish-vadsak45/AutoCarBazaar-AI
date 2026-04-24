import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import connectToDatabase from '@/lib/db';
import User from '@/models/user.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received signup data:', body);
    const { name, email, password } = body;

    // ✅ Validate input
    if (!name || !email || !password) {
      const errorResponse = { error: 'All fields are required' };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    await connectToDatabase();

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const errorResponse = { error: 'User already exists' };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const successResponse = {
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    };

    return NextResponse.json(successResponse, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);

    const errorResponse = { error: 'Internal Server Error' };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
