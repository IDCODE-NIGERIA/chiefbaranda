import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/session';
import { successResponse, errorResponse, unauthorized } from '@/lib/api-utils';

/** Everything the admin dashboard needs, in one round trip. */
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return unauthorized('Admin access required');
    }

    const [
      orders,
      notifications,
      applications,
      cars,
      users,
      stockAlerts,
      totals,
      pendingCount,
      unreadCount,
      carCounts,
      slotAggregate,
      imageStats,
    ] = await Promise.all([
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.notification.findMany({
        where: { audience: 'admin' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.sellerApplication.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.car.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
      // Never send password hashes to the browser, even to an admin.
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: {
          id: true, firstName: true, lastName: true, email: true, phone: true,
          userType: true, role: true, verified: true, avatar: true,
          city: true, state: true, createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.stockAlert.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.order.aggregate({
        where: { status: { in: ['paid', 'in-transit', 'ready', 'completed'] } },
        _sum: { amountDueNow: true, balance: true },
        _count: true,
      }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.notification.count({ where: { audience: 'admin', read: false } }),
      prisma.car.groupBy({ by: ['status'], _count: true }),
      prisma.preOrderSlot.aggregate({ _sum: { remaining: true }, _count: true }),
      prisma.image.aggregate({ _sum: { size: true }, _count: true }),
    ]);

    const byStatus = Object.fromEntries(carCounts.map((c) => [c.status, c._count]));

    return successResponse({
      stats: {
        collected: totals._sum.amountDueNow ?? 0,
        outstanding: totals._sum.balance ?? 0,
        paidOrders: totals._count,
        pendingOrders: pendingCount,
        unreadNotifications: unreadCount,
        sellerApplications: applications.filter((a) => a.status === 'pending').length,
        totalUsers: users.length,
        totalCars: cars.length,
        carsAvailable: byStatus.available ?? 0,
        carsReserved: byStatus.reserved ?? 0,
        carsSold: byStatus.sold ?? 0,
        preOrderSlots: slotAggregate._count,
        slotsRemaining: slotAggregate._sum.remaining ?? 0,
        stockAlerts: stockAlerts.filter((a) => !a.notified).length,
        imageCount: imageStats._count,
        imageBytes: imageStats._sum.size ?? 0,
      },
      orders,
      notifications,
      applications,
      cars,
      users,
      stockAlerts,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return errorResponse('Could not load the dashboard', 'INTERNAL_ERROR', 500);
  }
}
