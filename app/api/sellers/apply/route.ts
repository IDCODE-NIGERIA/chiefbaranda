import { NextRequest } from 'next/server';

import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { isValidEmail, isValidPhone } from '@/lib/auth';
import { notifySellerApplication } from '@/lib/notifications';
import { successResponse, errorResponse, validationError } from '@/lib/api-utils';

/** Seller onboarding application from /become-seller. */
export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return errorResponse(
        'Applications are not available yet. Please contact us directly.',
        'DATABASE_NOT_CONFIGURED',
        503
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      firstName,
      lastName,
      email,
      phone,
      shopName,
      shopAddress,
      city,
      state,
      businessType,
      carsPerMonth,
      about,
      termsAccepted,
    } = body ?? {};

    const errors: Record<string, string> = {};

    if (!firstName?.trim()) errors.firstName = 'First name is required';
    if (!lastName?.trim()) errors.lastName = 'Last name is required';
    if (!email?.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
    if (!phone?.trim()) errors.phone = 'Phone is required';
    else if (!isValidPhone(phone)) errors.phone = 'Enter a valid phone number';
    if (!shopName?.trim()) errors.shopName = 'Business name is required';
    if (!shopAddress?.trim()) errors.shopAddress = 'Business address is required';
    if (!city?.trim()) errors.city = 'City is required';
    if (!state?.trim()) errors.state = 'State is required';
    if (!businessType?.trim()) errors.businessType = 'Tell us what kind of business this is';
    if (!termsAccepted) errors.termsAccepted = 'Accept the seller terms to continue';

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    const session = await getSessionUser(request);

    const application = await prisma.sellerApplication.create({
      data: {
        userId: session?.id ?? null,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        shopName: shopName.trim(),
        shopAddress: shopAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        businessType: businessType.trim(),
        carsPerMonth: carsPerMonth?.trim() || '',
        about: about?.trim() || '',
        status: 'pending',
      },
    });

    await notifySellerApplication({
      name: `${application.firstName} ${application.lastName}`,
      shopName: application.shopName,
      phone: application.phone,
      applicationId: application.id,
    }).catch((error) => {
      console.error('Seller application notification failed:', error);
    });

    return successResponse({ applicationId: application.id }, 'Application received', 201);
  } catch (error) {
    console.error('Seller application error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
