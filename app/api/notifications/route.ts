import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/lib/models/Notification';

export async function GET() {
  try {
    await dbConnect();
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    
    if (!data.title || !data.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const notification = new Notification(data);
    await notification.save();
    
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    await Notification.updateMany({}, { isRead: true });
    return NextResponse.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}