import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { bikePrices, carPrices, resetTokens } = await request.json();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (bikePrices) settings.bikePrices = bikePrices;
    if (carPrices) settings.carPrices = carPrices;

    // Handle token reset
    if (resetTokens) {
      settings.currentTokenNumber = 0;
    }

    await settings.save();
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}