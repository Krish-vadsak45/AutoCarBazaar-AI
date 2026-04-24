import crypto from 'crypto';

import { NextResponse } from 'next/server';

import connectToDatabase from '@/lib/db';
import User from '@/models/user.model';
import transporter from '@/lib/nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User with this email does not exist' }, { status: 404 });
    }

    // Check if user is a credentials user (has password)
    if (!user.password) {
      return NextResponse.json(
        {
          message:
            'This account uses social login (Google/GitHub). Please sign in with that provider.',
        },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 10 minutes
    const resetTokenExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordToken = passwordResetToken;

    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    // Create reset URL
    // Use process.env.NEXTAUTH_URL or fallback to localhost if not set (for dev) -- though for production it should be set
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
          <p>This link is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Password reset email sent' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
