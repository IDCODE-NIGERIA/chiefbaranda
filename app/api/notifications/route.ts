import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { successResponse, errorResponse } from '@/lib/api-utils';

/** The signed-in user's own notifications. */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return errorResponse('Sign in to see your activity', 'NOT_AUTHENTICATED', 401);

    const notifications = await prisma.notification.findMany({
      where: { audience: 'user', userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return successResponse(notifications);
  } catch (error) {
    console.error('List notifications error:', error);
    return errorResponse('Could not load your activity', 'INTERNAL_ERROR', 500);
  }
}

/** Mark the user's notifications read — one, or all of them. */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return errorResponse('Sign in first', 'NOT_AUTHENTICATED', 401);

    const { id, all } = await request.json().catch(() => ({}));

    // Scoped to this user's own rows, so an id from elsewhere does nothing.
    const result = await prisma.notification.updateMany({
      where: {
        audience: 'user',
        userId: session.id,
        ...(all ? { read: false } : { id: String(id ?? '') }),
      },
      data: { read: true },
    });

    return successResponse({ updated: result.count });
  } catch (error) {
    console.error('Mark notification error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
