import { NextRequest } from 'next/server';

import { settleOrder } from '@/lib/orders';
import { successResponse, errorResponse } from '@/lib/api-utils';

/**
 * Called when Paystack redirects the buyer back to /checkout/callback.
 * Re-verifies with the gateway rather than trusting the redirect, and is safe
 * to call after the webhook has already settled the order.
 */
export async function GET(request: NextRequest) {
  const reference =
    request.nextUrl.searchParams.get('reference') ||
    request.nextUrl.searchParams.get('trxref');

  if (!reference) {
    return errorResponse('No payment reference supplied', 'MISSING_REFERENCE', 400);
  }

  try {
    const { order, status } = await settleOrder(reference);

    if (!order) {
      return errorResponse('We could not find that order', 'ORDER_NOT_FOUND', 404);
    }

    return successResponse({
      reference: order.reference,
      status,
      listingId: order.listingId,
      listingTitle: order.listingTitle,
      listingImage: order.listingImage,
      kind: order.kind,
      plan: order.plan,
      price: order.price,
      amountPaid: order.amountDueNow,
      balance: order.balance,
      monthlyInstalment: order.monthlyInstalment,
      financeMonths: order.financeMonths,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return errorResponse('We could not confirm this payment', 'VERIFY_FAILED', 502);
  }
}
