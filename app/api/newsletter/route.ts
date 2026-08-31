import { NextRequest } from 'next/server';

import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { isValidEmail } from '@/lib/auth';
import { successResponse, errorResponse, validationError } from '@/lib/api-utils';

/** Newsletter sign-up from the footer. */
export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return errorResponse('Sign-ups are not available yet.', 'DATABASE_NOT_CONFIGURED', 503);
    }

    const { email, source } = await request.json().catch(() => ({}));

    if (!email?.trim()) return validationError({ email: 'Enter your email address' });
    if (!isValidEmail(email)) return validationError({ email: 'That email looks wrong' });

    const normalised = email.trim().toLowerCase();

    // Signing up twice is not an error — just say yes again.
    await prisma.newsletterSubscriber.upsert({
      where: { email: normalised },
      update: {},
      create: { email: normalised, source: source || 'footer' },
    });

    return successResponse({ subscribed: true }, "You're on the list.");
  } catch (error) {
    console.error('Newsletter error:', error);
    return errorResponse('Could not sign you up', 'INTERNAL_ERROR', 500);
  }
}
