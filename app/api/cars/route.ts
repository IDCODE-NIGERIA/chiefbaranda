import { NextRequest } from 'next/server';

import { listCars } from '@/lib/catalog';
import { successResponse, errorResponse } from '@/lib/api-utils';

/** Browse listings. Supports ?brand=, ?condition=, ?type=, ?featured=, ?q=. */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const featured = params.get('featured');

    const cars = await listCars({
      brand: params.get('brand') || undefined,
      condition: params.get('condition') || undefined,
      type: params.get('type') || undefined,
      featured: featured === null ? undefined : featured === 'true',
      q: params.get('q') || undefined,
      limit: Number(params.get('limit')) || undefined,
    });

    return successResponse(cars);
  } catch (error) {
    console.error('List cars error:', error);
    return errorResponse('Could not load listings', 'INTERNAL_ERROR', 500);
  }
}
