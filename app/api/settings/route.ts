import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Notification from '@/lib/models/Notification';

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
    const { bikePrices, carPrices, resetTokens, fixTokens, systemReset } = await request.json();

    // Handle system reset - DANGER: This deletes ALL data
    if (systemReset) {
      console.log('SYSTEM RESET INITIATED - Deleting all data...');
      
      // Delete all orders
      const ordersDeleted = await Order.deleteMany({});
      console.log(`Deleted ${ordersDeleted.deletedCount} orders`);
      
      // Delete all products
      const productsDeleted = await Product.deleteMany({});
      console.log(`Deleted ${productsDeleted.deletedCount} products`);
      
      // Delete all notifications
      const notificationsDeleted = await Notification.deleteMany({});
      console.log(`Deleted ${notificationsDeleted.deletedCount} notifications`);
      
      // Reset settings to defaults
      let settings = await Settings.findOne();
      if (settings) {
        settings.bikePrices = [100, 150, 200];
        settings.carPrices = [100, 150, 200];
        settings.currentTokenNumber = 0;
        await settings.save();
      } else {
        settings = new Settings({
          bikePrices: [100, 150, 200],
          carPrices: [100, 150, 200],
          currentTokenNumber: 0
        });
        await settings.save();
      }
      
      console.log('SYSTEM RESET COMPLETED');
      return NextResponse.json({ 
        message: 'System reset completed successfully',
        deleted: {
          orders: ordersDeleted.deletedCount,
          products: productsDeleted.deletedCount,
          notifications: notificationsDeleted.deletedCount
        }
      });
    }

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