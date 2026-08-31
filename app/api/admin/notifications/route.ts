import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/session';
import { successResponse, errorResponse, unauthorized } from '@/lib/api-utils';

/** Mark admin notifications read — one by id, or all of them. */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return unauthorized('Admin access required');
    }

    const { id, all } = await request.json().catch(() => ({}));

    if (all) {
      const result = await prisma.notification.updateMany({
        where: { audience: 'admin', read: false },
        data: { read: true },
      });
      return successResponse({ updated: result.count });
    }

    if (!id || typeof id !== 'string') {
      return errorResponse('A valid notification id is required', 'INVALID_ID', 400);
    }

    const result = await prisma.notification.updateMany({
      where: { id },
      data: { read: true },
    });

    return successResponse({ updated: result.count });
  } catch (error) {
    console.error('Mark notification error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
