import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/session';
import { slugify, validateCar } from '@/lib/carValidation';
import { successResponse, errorResponse, unauthorized, validationError } from '@/lib/api-utils';

/** Every listing, including sold ones — the public route hides those. */
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) return unauthorized('Admin access required');

    const cars = await prisma.car.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take: 200,
    });

    return successResponse(cars);
  } catch (error) {
    console.error('Admin list cars error:', error);
    return errorResponse('Could not load listings', 'INTERNAL_ERROR', 500);
  }
}

/** Create a listing. It goes live on the site immediately. */
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) return unauthorized('Admin access required');

    const body = await request.json().catch(() => ({}));
    const { errors, data } = validateCar(body);

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    // Slugs are the public URL and must be unique; add a suffix rather than
    // failing when two cars share a title.
    const base = slugify(data.title!);
    let slug = base;
    for (let attempt = 2; await prisma.car.findUnique({ where: { slug } }); attempt++) {
      slug = `${base}-${attempt}`;
    }

    const car = await prisma.car.create({
      data: {
        slug,
        title: data.title!,
        brand: data.brand!,
        condition: data.condition!,
        type: data.type!,
        price: data.price!,
        description: data.description!,
        images: data.images!,
        sellerName: data.sellerName!,
        sellerVerified: data.sellerVerified ?? false,
        featured: data.featured ?? false,
        status: data.status ?? 'available',
        preOrder: false,
        location: data.location ?? null,
        vin: data.vin ?? null,
        mileage: data.mileage ?? null,
        year: data.year ?? null,
        color: data.color ?? null,
        transmission: data.transmission ?? null,
        fuel: data.fuel ?? null,
      },
    });

    return successResponse(car, 'Listing published', 201);
  } catch (error) {
    console.error('Create car error:', error);
    return errorResponse('Could not publish that listing', 'INTERNAL_ERROR', 500);
  }
}
