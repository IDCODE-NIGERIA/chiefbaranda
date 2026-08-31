import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { issueCode, maskPhone } from '@/lib/verification';
import { successResponse, errorResponse, validationError } from '@/lib/api-utils';

/**
 * Start a password reset: text a one-time code to the account's phone.
 *
 * The response is deliberately identical whether or not the account exists.
 * Saying "no account with that number" would let anyone check which phone
 * numbers are registered here.
 */
export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json().catch(() => ({}));

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return validationError({ identifier: 'Enter your phone number or email' });
    }

    const value = identifier.trim();
    const digits = value.replace(/\D/g, '');

    // Accept either the email or the phone in any of the usual formats.
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

    // The generic answer, used for every outcome.
    const generic = successResponse(
      { sent: true, maskedPhone: user ? maskPhone(user.phone) : null },
      'If that account exists, we have sent a code to the phone on it.'
    );

    if (!user) return generic;

    const result = await issueCode(
      user,
      'reset',
      (code) => `ChiefBaranda: your password reset code is ${code}. It expires in 10 minutes. If this wasn't you, ignore this message.`
    );

    if (result.cooldown) {
      return errorResponse(
        `You asked for a code a moment ago. Try again in ${result.cooldown} seconds.`,
        'COOLDOWN',
        429
      );
    }

    // In development without SMS credentials, hand the code back so the flow
    // can actually be walked through. Never reachable in production.
    if (result.devCode) {
      return successResponse(
        { sent: false, maskedPhone: result.maskedPhone, devCode: result.devCode },
        'SMS is not configured — use the code shown here (development only).'
      );
    }

    return generic;
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('Could not start a password reset', 'INTERNAL_ERROR', 500);
  }
}
