import { NextRequest } from 'next/server';

import { verifyWebhookSignature } from '@/lib/paystack';
import { settleOrder } from '@/lib/orders';

/**
 * Paystack webhook — the authoritative signal that money moved.
 *
 * Paystack retries on any non-200, so this always answers 200 once the
 * signature checks out, even if we decide to ignore the event.
 */
export async function POST(request: NextRequest) {
  // The signature is over the exact bytes, so read the body as text first.
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[webhook] rejected a request with an invalid signature');
    return new Response('Invalid signature', { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Bad payload', { status: 400 });
  }

  const reference = event.data?.reference;

  if (!reference || !event.event?.startsWith('charge.')) {
    return Response.json({ received: true });
  }

  try {
    const result = await settleOrder(reference);
    console.log(`[webhook] ${event.event} ${reference} -> ${result.status}`);
  } catch (error) {
    // Log and still return 200: a retry storm won't fix a bug on our side,
    // and the buyer's redirect will settle the order as a fallback.
    console.error('[webhook] failed to settle', reference, error);
  }

  return Response.json({ received: true });
}
