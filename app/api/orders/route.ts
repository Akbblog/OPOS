import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Settings from '@/lib/models/Settings';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { category, amount, customerEmail } = await request.json();

    if (!category || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Get and increment token number from settings
    let settings = await Settings.findOne();
    if (!settings) {
      console.log('Creating new settings document');
      settings = new Settings({ currentTokenNumber: 0 });
      await settings.save();
    }

    // Ensure currentTokenNumber is a valid number
    const currentToken = typeof settings.currentTokenNumber === 'number' && !isNaN(settings.currentTokenNumber) 
      ? settings.currentTokenNumber 
      : 0;
    const tokenNumber = currentToken + 1;
    
    console.log(`Current token: ${currentToken}, New token: ${tokenNumber}`);
    
    settings.currentTokenNumber = tokenNumber;
    await settings.save();

    const order = new Order({ 
      tokenNumber,
      category, 
      amount: Number(amount),
      customerEmail: customerEmail || '',
    });
    await order.save();

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find().sort({ timestamp: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}