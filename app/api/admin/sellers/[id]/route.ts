import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/session';
import { successResponse, errorResponse, unauthorized } from '@/lib/api-utils';
import type { SellerApplicationStatus } from '@/lib/models/SellerApplication';

const ALLOWED: SellerApplicationStatus[] = ['pending', 'approved', 'rejected'];

/** Approve or reject a seller application. */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/sellers/[id]'>
) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return unauthorized('Admin access required');
    }

    const { id } = await ctx.params;
    const { status } = await request.json().catch(() => ({}));

    if (!ALLOWED.includes(status)) {
      return errorResponse('Unknown application status', 'INVALID_STATUS', 400);
    }

    const application = await prisma.sellerApplication.findUnique({ where: { id } });

    if (!application) {
      return errorResponse('Application not found', 'NOT_FOUND', 404);
    }

    await prisma.sellerApplication.update({
      where: { id },
      data: { status, reviewedAt: new Date(), reviewedBy: admin.email },
    });

    // Approving an applicant who already has an account upgrades them.
    if (status === 'approved') {
      await prisma.user.updateMany({
        where: { email: application.email },
        data: { userType: 'seller', verified: true },
      });
    }

    return successResponse({ id, status }, 'Application updated');
  } catch (error) {
    console.error('Update seller application error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
