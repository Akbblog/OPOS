import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Aggregate monthly data
    const monthlyData = await Order.aggregate([
      {
        $match: {
          timestamp: { $gte: startOfMonth, $lt: endOfMonth }
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

    const data = monthlyData[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      bikeRevenue: 0,
      carRevenue: 0,
      bikeOrders: 0,
      carOrders: 0
    };

    return NextResponse.json({
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      ...data
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    return NextResponse.json({ error: 'Failed to generate monthly report' }, { status: 500 });
  }
}