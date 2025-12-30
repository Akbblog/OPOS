import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Aggregate weekly data
    const weeklyData = await Order.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
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

    const data = weeklyData[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      bikeRevenue: 0,
      carRevenue: 0,
      bikeOrders: 0,
      carOrders: 0
    };

    return NextResponse.json({
      period: `${sevenDaysAgo.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`,
      ...data
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    return NextResponse.json({ error: 'Failed to generate weekly report' }, { status: 500 });
  }
}