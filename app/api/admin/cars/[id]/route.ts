import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/session';
import { validateCar } from '@/lib/carValidation';
import { successResponse, errorResponse, unauthorized, validationError, notFound } from '@/lib/api-utils';

/** Update a listing. Anything omitted is left alone. */
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/admin/cars/[id]'>) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) return unauthorized('Admin access required');

    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const { errors, data } = validateCar(body, { partial: true });

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    const existing = await prisma.car.findUnique({ where: { id } });
    if (!existing) return notFound('Listing not found');

    // The slug is the public URL — leave it alone once published so links and
    // any orders pointing at it keep working.
    const car = await prisma.car.update({ where: { id }, data });

    return successResponse(car, 'Listing updated');
  } catch (error) {
    console.error('Update car error:', error);
    return errorResponse('Could not update that listing', 'INTERNAL_ERROR', 500);
  }
}

/**
 * Remove a listing.
 *
 * If anyone has ordered this car the row is kept and marked sold instead —
 * a paid order must never end up pointing at a listing that no longer exists.
 */
export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/admin/cars/[id]'>) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) return unauthorized('Admin access required');

    const { id } = await ctx.params;

    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) return notFound('Listing not found');

    const orderCount = await prisma.order.count({
      where: { kind: 'buy', listingId: car.slug },
    });

    if (orderCount > 0) {
      await prisma.car.update({ where: { id }, data: { status: 'sold', featured: false } });
      return successResponse(
        { deleted: false, archived: true, orderCount },
        `This car has ${orderCount} order${orderCount === 1 ? '' : 's'} against it, so it was marked sold and hidden rather than deleted.`
      );
    }

    await prisma.car.delete({ where: { id } });

    return successResponse({ deleted: true, archived: false }, 'Listing deleted');
  } catch (error) {
    console.error('Delete car error:', error);
    return errorResponse('Could not delete that listing', 'INTERNAL_ERROR', 500);
  }
}
