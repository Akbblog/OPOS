import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, order } = await request.json();

    if (!email || !order) {
      return NextResponse.json({ error: 'Email and order data required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // In production, integrate with email service (SendGrid, Nodemailer, etc.)
    // For now, we'll simulate email sending
    console.log(`Sending receipt to ${email} for order #${order.tokenNumber}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Implement actual email sending
    // Example with nodemailer:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({
    //   from: 'noreply@opos.com',
    //   to: email,
    //   subject: `Receipt for Order #${order.tokenNumber}`,
    //   html: generateReceiptHTML(order)
    // });

    return NextResponse.json({ 
      success: true, 
      message: `Receipt sent to ${email}` 
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
