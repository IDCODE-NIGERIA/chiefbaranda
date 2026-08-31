import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { hashPassword, verifyPassword, isValidPassword } from '@/lib/auth';
import { successResponse, errorResponse, validationError } from '@/lib/api-utils';

/** Change the signed-in user's password. */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('Sign in to change your password', 'NOT_AUTHENTICATED', 401);
    }

    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmPassword } = body ?? {};

    const errors: Record<string, string> = {};

    if (!currentPassword) errors.currentPassword = 'Enter your current password';
    if (!newPassword) errors.newPassword = 'Enter a new password';
    else {
      const check = isValidPassword(newPassword);
      if (!check.valid) errors.newPassword = check.message!;
    }
    if (!confirmPassword) errors.confirmPassword = 'Confirm your new password';
    else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    // Re-read the row — the session deliberately doesn't carry the hash.
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return errorResponse('Account not found', 'USER_NOT_FOUND', 404);
    }

    // Proving knowledge of the current password is what stops a stolen
    // session from locking the real owner out.
    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) {
      return validationError({ currentPassword: 'That is not your current password' });
    }

    if (await verifyPassword(newPassword, user.password)) {
      return validationError({ newPassword: 'That is already your password' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword) },
    });

    return successResponse({ changed: true }, 'Password changed');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
