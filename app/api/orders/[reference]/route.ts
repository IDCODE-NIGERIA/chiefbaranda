import { NextRequest } from 'next/server';

import { getSessionUser } from '@/lib/session';
import { getOrderByReference } from '@/lib/orders';
import { successResponse, errorResponse } from '@/lib/api-utils';

/**
 * A single order. Visible to the buyer who placed it (by session or by the
 * email on the order) and to admins.
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/orders/[reference]'>
) {
  try {
    const { reference } = await ctx.params;
    const order = await getOrderByReference(reference);

    if (!order) {
      return errorResponse('Order not found', 'ORDER_NOT_FOUND', 404);
    }

    const session = await getSessionUser(request);
    const ownsOrder =
      session &&
      (order.userId === session.id || order.buyerEmail === session.email.toLowerCase());

    if (!ownsOrder && !session?.isAdmin) {
      return errorResponse('You do not have access to this order', 'FORBIDDEN', 403);
    }

    return successResponse(order);
  } catch (error) {
    console.error('Get order error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
