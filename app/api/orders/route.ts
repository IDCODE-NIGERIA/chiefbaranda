import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { findListing, isDatabaseConfigured } from '@/lib/catalog';
import { quoteOrder, baseUrl, type OrderKind, type PaymentPlan } from '@/lib/config';
import { generateReference, initializeTransaction } from '@/lib/paystack';
import { notifyAdminPaymentRequested } from '@/lib/notifications';
import { isValidEmail, isValidPhone } from '@/lib/auth';
import { successResponse, errorResponse, validationError } from '@/lib/api-utils';
import type { BuyerDetails, Order } from '@/lib/models/Order';

const KINDS: OrderKind[] = ['buy', 'pre-order'];
const PLANS: PaymentPlan[] = ['deposit', 'finance', 'full'];

/**
 * Create an order and hand back a Paystack checkout URL.
 *
 * The buyer supplies their details and what they want; the price and every
 * amount owed are computed here from the stored listing, never taken from
 * the request body.
 */
export async function POST(request: NextRequest) {
  try {
    // Never accept an order we cannot record — that would take a payment we
    // have no way of honouring.
    if (!isDatabaseConfigured()) {
      return errorResponse(
        'Ordering is not available yet. Please contact us to complete this purchase.',
        'DATABASE_NOT_CONFIGURED',
        503
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      kind,
      listingId,
      plan = 'deposit',
      financeMonths,
      fullName,
      email,
      phone,
      address,
      city,
      state,
      notes,
    } = body ?? {};

    const errors: Record<string, string> = {};

    if (!KINDS.includes(kind)) errors.kind = 'Select what you are ordering';
    if (!listingId?.trim?.()) errors.listingId = 'No car selected';
    if (!PLANS.includes(plan)) errors.plan = 'Choose a payment plan';

    if (!fullName?.trim()) errors.fullName = 'Full name is required';
    if (!email?.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
    if (!phone?.trim()) errors.phone = 'Phone number is required';
    else if (!isValidPhone(phone)) errors.phone = 'Enter a valid phone number';
    if (!address?.trim()) errors.address = 'Delivery address is required';
    if (!city?.trim()) errors.city = 'City is required';
    if (!state?.trim()) errors.state = 'State is required';

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    const listing = await findListing(kind, listingId);
    if (!listing) {
      return errorResponse('That listing no longer exists', 'LISTING_NOT_FOUND', 404);
    }
    if (!listing.available) {
      return errorResponse('That car is no longer available', 'LISTING_UNAVAILABLE', 409);
    }

    const quote = quoteOrder({ price: listing.price, kind, plan, financeMonths });

    const session = await getSessionUser(request);
    const reference = generateReference();

    const buyer: BuyerDetails = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      notes: notes?.trim() || undefined,
    };

    const order = (await prisma.order.create({
      data: {
        reference,
        userId: session?.id ?? null,
        buyerName: buyer.fullName,
        buyerEmail: buyer.email,
        buyerPhone: buyer.phone,
        buyerAddress: buyer.address,
        buyerCity: buyer.city,
        buyerState: buyer.state,
        buyerNotes: buyer.notes ?? null,
        kind,
        listingId: listing.id,
        listingTitle: listing.title,
        listingImage: listing.image,
        plan,
        financeMonths: quote.financeMonths,
        price: quote.price,
        amountDueNow: quote.amountDueNow,
        balance: quote.balance,
        financeFee: quote.financeFee,
        monthlyInstalment: quote.monthlyInstalment,
        status: 'pending',
        paystackReference: reference,
      },
    })) as Order;

    // Alert the admin that money has been requested, before it arrives.
    await notifyAdminPaymentRequested(order).catch((error) => {
      console.error('Admin notification failed for', reference, error);
    });

    // Without Paystack keys the order is still recorded — the checkout page
    // tells the buyer payment is not live yet rather than erroring out.
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.warn('[orders] PAYSTACK_SECRET_KEY not set — order saved without checkout URL');
      return successResponse(
        { reference, authorizationUrl: null, paymentConfigured: false, quote },
        'Order created, payment gateway not configured',
        201
      );
    }

    try {
      const init = await initializeTransaction({
        email: buyer.email,
        amountNaira: quote.amountDueNow,
        reference,
        callbackUrl: `${baseUrl()}/checkout/callback`,
        metadata: {
          orderReference: reference,
          listingTitle: listing.title,
          kind,
          plan,
          buyerName: buyer.fullName,
          buyerPhone: buyer.phone,
        },
      });

      await prisma.order.update({
        where: { reference },
        data: { paystackAuthorizationUrl: init.authorizationUrl },
      });

      return successResponse(
        {
          reference,
          authorizationUrl: init.authorizationUrl,
          paymentConfigured: true,
          quote,
        },
        'Order created',
        201
      );
    } catch (error) {
      console.error('Paystack initialize failed for', reference, error);
      return errorResponse(
        'We could not reach the payment gateway. Your order was saved — try again in a moment.',
        'GATEWAY_ERROR',
        502
      );
    }
  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/** The signed-in buyer's own orders. */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('Sign in to see your orders', 'NOT_AUTHENTICATED', 401);
    }

    const orders = await prisma.order.findMany({
      where: { OR: [{ userId: session.id }, { buyerEmail: session.email.toLowerCase() }] },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return successResponse(orders);
  } catch (error) {
    console.error('List orders error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
