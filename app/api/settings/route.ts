import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      console.log('Creating new settings document with defaults');
      settings = new Settings({
        bikePrices: [100, 150, 200],
        carPrices: [100, 150, 200],
        currentTokenNumber: 0
      });
      await settings.save();
      console.log('Settings document created:', settings);
    } else {
      // Ensure currentTokenNumber is properly initialized if it doesn't exist
      if (settings.currentTokenNumber === undefined || settings.currentTokenNumber === null) {
        console.log('Fixing currentTokenNumber, was:', settings.currentTokenNumber);
        settings.currentTokenNumber = 0;
        await settings.save();
        console.log('Fixed currentTokenNumber to 0');
      }
    }
    console.log('Returning settings:', settings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { bikePrices, carPrices, resetTokens, fixTokens } = await request.json();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        bikePrices: [100, 150, 200],
        carPrices: [100, 150, 200],
        currentTokenNumber: 0
      });
    }

    if (bikePrices) settings.bikePrices = bikePrices;
    if (carPrices) settings.carPrices = carPrices;

    // Handle token reset
    if (resetTokens) {
      settings.currentTokenNumber = 0;
      console.log('Token counter reset to 0');
    }

    // Handle token fix
    if (fixTokens) {
      settings.currentTokenNumber = settings.currentTokenNumber || 0;
      console.log('Token counter fixed to:', settings.currentTokenNumber);
    }

    await settings.save();
    console.log('Settings saved:', settings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}