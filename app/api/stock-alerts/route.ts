import { NextRequest } from 'next/server';

import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { isValidEmail } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { successResponse, errorResponse, validationError } from '@/lib/api-utils';

/** "Notify me when this lands" from the Coming Soon rail. */
export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return errorResponse(
        'Alerts are not available yet.',
        'DATABASE_NOT_CONFIGURED',
        503
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, phone, listingId, listingTitle } = body ?? {};

    const errors: Record<string, string> = {};
    if (!email?.trim()) errors.email = 'Enter your email so we can reach you';
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
    if (!listingId?.trim?.()) errors.listingId = 'No car selected';

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    const normalisedEmail = email.trim().toLowerCase();

    // Asking twice shouldn't create two alerts — the unique index on
    // (email, listingId) makes this idempotent.
    const existing = await prisma.stockAlert.findUnique({
      where: { email_listingId: { email: normalisedEmail, listingId } },
    });

    if (existing) {
      return successResponse({ alreadyRegistered: true }, "You're already on the list");
    }

    await prisma.stockAlert.create({
      data: {
        email: normalisedEmail,
        phone: phone?.trim() || null,
        listingId,
        listingTitle: listingTitle || listingId,
        notified: false,
      },
    });

    // No SMS for these — they're low urgency, the dashboard is enough.
    await createNotification({
      audience: 'admin',
      kind: 'stock-alert',
      title: `Stock alert — ${listingTitle || listingId}`,
      body: `${normalisedEmail} wants to be told when this lands.`,
      href: '/admin',
    }).catch((error) => console.error('Stock alert notification failed:', error));

    return successResponse({ alreadyRegistered: false }, "We'll let you know", 201);
  } catch (error) {
    console.error('Stock alert error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
