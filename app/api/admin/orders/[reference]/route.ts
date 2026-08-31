import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/session';
import { successResponse, errorResponse, unauthorized, notFound } from '@/lib/api-utils';
import type { OrderStatus } from '@/lib/models/Order';

const ALLOWED: OrderStatus[] = [
  'pending',
  'paid',
  'failed',
  'cancelled',
  'in-transit',
  'ready',
  'completed',
];

/** Move an order along the fulfilment pipeline. */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/orders/[reference]'>
) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return unauthorized('Admin access required');
    }

    const { reference } = await ctx.params;
    const { status } = await request.json().catch(() => ({}));

    if (!ALLOWED.includes(status)) {
      return errorResponse('Unknown order status', 'INVALID_STATUS', 400);
    }

    const result = await prisma.order.updateMany({
      where: { reference },
      data: { status },
    });

    if (result.count === 0) {
      return notFound('Order not found');
    }

    return successResponse({ reference, status }, 'Order updated');
  } catch (error) {
    console.error('Update order error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
