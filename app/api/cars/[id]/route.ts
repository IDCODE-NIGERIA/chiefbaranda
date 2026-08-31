import { getCar } from '@/lib/catalog';
import { successResponse, errorResponse, notFound } from '@/lib/api-utils';

/** A single listing, by slug or id. */
export async function GET(_request: Request, ctx: RouteContext<'/api/cars/[id]'>) {
  try {
    const { id } = await ctx.params;
    const car = await getCar(id);

    if (!car) {
      return notFound('That car is not on the marketplace');
    }

    return successResponse(car);
  } catch (error) {
    console.error('Get car error:', error);
    return errorResponse('Could not load this listing', 'INTERNAL_ERROR', 500);
  }
}
