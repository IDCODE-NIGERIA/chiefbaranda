import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/session';
import { successResponse, errorResponse, unauthorized } from '@/lib/api-utils';

/** Hard ceiling per photo. The admin form downscales well below this. */
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Upload a listing photo. Admin only — this writes bytes to the database, so
 * it must never be open to anonymous callers.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return unauthorized('Admin access required');
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return errorResponse('No file was uploaded', 'NO_FILE', 400);
    }
    if (!ALLOWED.includes(file.type)) {
      return errorResponse('Upload a JPEG, PNG or WebP image', 'BAD_TYPE', 400);
    }
    if (file.size > MAX_BYTES) {
      return errorResponse('That image is larger than 4MB', 'TOO_LARGE', 400);
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    const image = await prisma.image.create({
      data: {
        data: bytes,
        mimeType: file.type,
        size: bytes.byteLength,
        uploadedBy: admin.email,
      },
      select: { id: true, size: true },
    });

    // Car.images stores URLs, so the rest of the app never knows or cares
    // that this one happens to live in Postgres.
    return successResponse(
      { id: image.id, url: `/api/images/${image.id}`, size: image.size },
      'Image uploaded',
      201
    );
  } catch (error) {
    console.error('Upload image error:', error);
    return errorResponse('Could not upload that image', 'INTERNAL_ERROR', 500);
  }
}
