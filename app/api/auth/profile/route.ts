import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { isValidPhone } from '@/lib/auth';
import { successResponse, errorResponse, validationError } from '@/lib/api-utils';

/**
 * Avatars are stored inline as data URIs. Postgres handles this fine at this
 * size, and it avoids a blob store until car photo uploads need one. The cap
 * is deliberately tight — the client downscales before sending.
 */
const MAX_AVATAR_BYTES = 300 * 1024;
const AVATAR_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/;

/** Update the signed-in user's own details. */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('Sign in to update your profile', 'NOT_AUTHENTICATED', 401);
    }

    const body = await request.json().catch(() => ({}));
    const { firstName, lastName, phone, address, city, state, avatar } = body ?? {};

    const errors: Record<string, string> = {};

    if (firstName !== undefined && !firstName?.trim()) {
      errors.firstName = 'First name cannot be empty';
    }
    if (lastName !== undefined && !lastName?.trim()) {
      errors.lastName = 'Last name cannot be empty';
    }
    if (phone !== undefined) {
      if (!phone?.trim()) errors.phone = 'Phone cannot be empty';
      else if (!isValidPhone(phone)) errors.phone = 'Enter a valid phone number';
    }

    if (avatar) {
      if (!AVATAR_PATTERN.test(avatar)) {
        errors.avatar = 'Upload a PNG, JPEG or WebP image';
      } else if (Buffer.byteLength(avatar, 'utf8') > MAX_AVATAR_BYTES) {
        errors.avatar = 'That image is too large — keep it under 300KB';
      }
    }

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    // Email is deliberately not editable here: it identifies the account and
    // the orders attached to it, so changing it needs a verification flow.
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(firstName !== undefined ? { firstName: firstName.trim() } : {}),
        ...(lastName !== undefined ? { lastName: lastName.trim() } : {}),
        ...(phone !== undefined ? { phone: phone.trim() } : {}),
        ...(address !== undefined ? { address: address?.trim() || null } : {}),
        ...(city !== undefined ? { city: city?.trim() || null } : {}),
        ...(state !== undefined ? { state: state?.trim() || null } : {}),
        ...(avatar !== undefined ? { avatar: avatar || null } : {}),
      },
    });

    return successResponse(
      {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        avatar: user.avatar,
        verified: user.verified,
        address: user.address,
        city: user.city,
        state: user.state,
      },
      'Profile updated'
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
