// app/api/send-email/route.js (for Next.js App Router)

import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body
    const { subject, message } = await request.json();

    // Validate input
    if (!subject || !message) {
      return NextResponse.json(
        { message: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Create a transporter using your email service
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or 'hotmail', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // Configure the email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: process.env.RECIPIENT_EMAIL, // Your email where you want to receive notifications
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fce7f3 0%, #fed7aa 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #ec4899; margin-bottom: 20px;">${subject}</h2>
            <div style="color: #78350f; line-height: 1.6; white-space: pre-wrap;">
              ${message}
            </div>
            <hr style="border: none; border-top: 2px solid #fbcfe8; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Sent from your Valentine's Day Website 💕
            </p>
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email sent successfully!' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send email',
        error: error.message 
      },
      { status: 500 }
    );
  }
}