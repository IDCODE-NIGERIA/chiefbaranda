import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { findListing } from '@/lib/catalog';
import { successResponse, errorResponse } from '@/lib/api-utils';
import type { OrderKind } from '@/lib/config';

/** The signed-in user's saved cars, resolved to live listings. */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return errorResponse('Sign in to see saved cars', 'NOT_AUTHENTICATED', 401);

    const saved = await prisma.savedCar.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // A saved car may since have been delisted; drop those rather than
    // rendering dead links.
    const listings = await Promise.all(
      saved.map(async (row) => {
        const listing = await findListing(row.listingKind as OrderKind, row.listingId);
        return listing ? { ...listing, savedAt: row.createdAt } : null;
      })
    );

    return successResponse(listings.filter(Boolean));
  } catch (error) {
    console.error('List saved cars error:', error);
    return errorResponse('Could not load your saved cars', 'INTERNAL_ERROR', 500);
  }
}

/** Toggle a car in or out of the user's saved list. */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return errorResponse('Sign in to save cars', 'NOT_AUTHENTICATED', 401);

    const { listingId, listingKind = 'buy' } = await request.json().catch(() => ({}));

    if (!listingId || typeof listingId !== 'string') {
      return errorResponse('No car selected', 'INVALID_LISTING', 400);
    }
    if (listingKind !== 'buy' && listingKind !== 'pre-order') {
      return errorResponse('Unknown listing type', 'INVALID_KIND', 400);
    }

    const existing = await prisma.savedCar.findUnique({
      where: { userId_listingId: { userId: session.id, listingId } },
    });

    if (existing) {
      await prisma.savedCar.delete({ where: { id: existing.id } });
      return successResponse({ saved: false }, 'Removed from saved cars');
    }

    // Only save something that actually exists.
    const listing = await findListing(listingKind, listingId);
    if (!listing) return errorResponse('That listing no longer exists', 'NOT_FOUND', 404);

    await prisma.savedCar.create({
      data: { userId: session.id, listingId, listingKind },
    });

    return successResponse({ saved: true }, 'Saved');
  } catch (error) {
    console.error('Toggle saved car error:', error);
    return errorResponse('Could not save that car', 'INTERNAL_ERROR', 500);
  }
}
