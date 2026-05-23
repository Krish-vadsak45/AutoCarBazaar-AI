import { NextResponse } from 'next/server';

import transporter from '@/lib/nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Send Custom Email directly to the provided address
    const mailOptions = {
      from: "samarthgabani2005@gmail.com", // Set appropriate sender
      to,
      subject,
      // Convert regular line breaks to HTML breaks for proper formatting
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
               ${body.replace(/\n/g, '<br />')}
               <br /><br />
               <p style="color: #777; font-size: 14px;"><strong>AutoCarBazaar Team</strong></p>
               <p style="color: #aaa; font-size: 12px;">This is an administrative email dispatched securely via the AutoCarBazaar platform.</p>
             </div>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'Email sent successfully',
    });
  } catch (error: unknown) {
    console.error('Custom Email Send Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
