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
      settings = new Settings();
    }

    const tokenNumber = settings.currentTokenNumber + 1;
    settings.currentTokenNumber = tokenNumber;
    await settings.save();

    const order = new Order({ 
      tokenNumber,
      category, 
      amount,
      customerEmail: customerEmail || '',
    });
    await order.save();

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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