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

    const [orders, notifications, applications, totals, pendingCount, unreadCount] =
      await Promise.all([
        prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
        prisma.notification.findMany({
          where: { audience: 'admin' },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.sellerApplication.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
        prisma.order.aggregate({
          where: { status: { in: ['paid', 'in-transit', 'ready', 'completed'] } },
          _sum: { amountDueNow: true, balance: true },
          _count: true,
        }),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.notification.count({ where: { audience: 'admin', read: false } }),
      ]);

    return successResponse({
      stats: {
        collected: totals._sum.amountDueNow ?? 0,
        outstanding: totals._sum.balance ?? 0,
        paidOrders: totals._count,
        pendingOrders: pendingCount,
        unreadNotifications: unreadCount,
        sellerApplications: applications.filter((a) => a.status === 'pending').length,
      },
      orders,
      notifications,
      applications,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return errorResponse('Could not load the dashboard', 'INTERNAL_ERROR', 500);
  }
}
