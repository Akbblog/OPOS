import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { category, amount, customerEmail } = await request.json();

    if (!category || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Get the next token number (first come first serve)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find the highest token number for today
    const lastOrder = await Order.findOne({
      timestamp: { $gte: today }
    }).sort({ tokenNumber: -1 });

    const tokenNumber = lastOrder ? lastOrder.tokenNumber + 1 : 1;

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