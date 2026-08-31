import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { checkCode, issueCode } from '@/lib/verification';
import { successResponse, errorResponse, validationError } from '@/lib/api-utils';

/** Send a verification code to the signed-in user's own phone. */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return errorResponse('Sign in first', 'NOT_AUTHENTICATED', 401);

    if (session.phoneVerifiedAt) {
      return successResponse({ alreadyVerified: true }, 'Your phone is already verified.');
    }

    const result = await issueCode(
      session,
      'verify',
      (code) => `ChiefBaranda: your verification code is ${code}. It expires in 10 minutes.`
    );

    if (result.cooldown) {
      return errorResponse(
        `We just sent one. Try again in ${result.cooldown} seconds.`,
        'COOLDOWN',
        429
      );
    }

    return successResponse(
      {
        sent: result.sent,
        maskedPhone: result.maskedPhone,
        // Development only — see lib/verification.ts.
        ...(result.devCode ? { devCode: result.devCode } : {}),
      },
      result.devCode
        ? 'SMS is not configured — use the code shown here (development only).'
        : `We sent a code to ${result.maskedPhone}.`
    );
  } catch (error) {
    console.error('Send verification error:', error);
    return errorResponse('Could not send a code', 'INTERNAL_ERROR', 500);
  }
}

/** Confirm the code and mark the phone verified. */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return errorResponse('Sign in first', 'NOT_AUTHENTICATED', 401);

    const { code } = await request.json().catch(() => ({}));

    if (!code?.trim()) return validationError({ code: 'Enter the 6-digit code' });
    if (!/^\d{6}$/.test(code.trim())) return validationError({ code: 'The code is 6 digits' });

    const outcome = await checkCode(session.id, 'verify', code.trim());

    if (!outcome.ok) {
      const message =
        outcome.reason === 'expired'
          ? 'That code has expired. Send a new one.'
          : outcome.reason === 'too-many-attempts'
            ? 'Too many wrong attempts. Send a new code.'
            : 'That code is not correct.';
      return validationError({ code: message });
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data: { phoneVerifiedAt: new Date(), verified: true },
    });

    return successResponse(
      { verified: true, phone: user.phone },
      'Phone verified.'
    );
  } catch (error) {
    console.error('Confirm verification error:', error);
    return errorResponse('Could not verify that code', 'INTERNAL_ERROR', 500);
  }
}
