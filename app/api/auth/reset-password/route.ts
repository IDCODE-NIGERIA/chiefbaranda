import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { hashPassword, isValidPassword } from '@/lib/auth';
import { checkCode } from '@/lib/verification';
import { successResponse, errorResponse, validationError } from '@/lib/api-utils';

/** Finish a password reset with the code that was texted to the user. */
export async function POST(request: NextRequest) {
  try {
    const { identifier, code, newPassword, confirmPassword } = await request
      .json()
      .catch(() => ({}));

    const errors: Record<string, string> = {};

    if (!identifier?.trim()) errors.identifier = 'Missing account';
    if (!code?.trim()) errors.code = 'Enter the 6-digit code';
    else if (!/^\d{6}$/.test(code.trim())) errors.code = 'The code is 6 digits';

    if (!newPassword) errors.newPassword = 'Choose a new password';
    else {
      const strength = isValidPassword(newPassword);
      if (!strength.valid) errors.newPassword = strength.message!;
    }

    if (!confirmPassword) errors.confirmPassword = 'Confirm your new password';
    else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) return validationError(errors);

    const value = identifier.trim();
    const digits = value.replace(/\D/g, '');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: value.toLowerCase() },
          ...(digits.length >= 10
            ? [
                { phone: value },
                { phone: digits },
                { phone: `0${digits.slice(-10)}` },
                { phone: `+234${digits.slice(-10)}` },
                { phone: `234${digits.slice(-10)}` },
              ]
            : []),
        ],
      },
    });

    // Same message for an unknown account as for a wrong code.
    if (!user) {
      return validationError({ code: 'That code is not valid. Request a new one.' });
    }

    const outcome = await checkCode(user.id, 'reset', code.trim());

    if (!outcome.ok) {
      const message =
        outcome.reason === 'expired'
          ? 'That code has expired. Request a new one.'
          : outcome.reason === 'too-many-attempts'
            ? 'Too many wrong attempts. Request a new code.'
            : 'That code is not valid. Request a new one.';
      return validationError({ code: message });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword) },
    });

    // Any other outstanding codes for this account are now stale.
    await prisma.verificationCode.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    return successResponse(
      { reset: true },
      'Password changed. You can sign in with your new password.'
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('Could not reset your password', 'INTERNAL_ERROR', 500);
  }
}
