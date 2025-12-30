import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get current date and start of day
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Aggregate daily data
    const dailyData = await Order.aggregate([
      {
        $match: {
          timestamp: { $gte: startOfDay, $lt: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
          bikeRevenue: {
            $sum: { $cond: [{ $eq: ['$category', 'bike'] }, '$amount', 0] }
          },
          carRevenue: {
            $sum: { $cond: [{ $eq: ['$category', 'car'] }, '$amount', 0] }
          },
          bikeOrders: {
            $sum: { $cond: [{ $eq: ['$category', 'bike'] }, 1, 0] }
          },
          carOrders: {
            $sum: { $cond: [{ $eq: ['$category', 'car'] }, 1, 0] }
          }
        }
      }
    ]);

    const data = dailyData[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      bikeRevenue: 0,
      carRevenue: 0,
      bikeOrders: 0,
      carOrders: 0
    };

    return NextResponse.json({
      date: startOfDay.toISOString().split('T')[0],
      ...data
    });
  } catch (error) {
    console.error('Daily report error:', error);
    return NextResponse.json({ error: 'Failed to generate daily report' }, { status: 500 });
  }
}