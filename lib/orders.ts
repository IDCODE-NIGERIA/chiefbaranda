import type { Prisma } from '@/lib/generated/prisma/client';

import { prisma } from '@/lib/prisma';
import { claimListing } from '@/lib/catalog';
import { notifyPaymentReceived } from '@/lib/notifications';
import { verifyTransaction } from '@/lib/paystack';
import type { Order, OrderStatus } from '@/lib/models/Order';

/**
 * Settling a payment happens from two places — the Paystack webhook and the
 * buyer's redirect back to the site — and whichever arrives first must win
 * exactly once. The conditional update below is the guard: only the call that
 * flips the order out of `pending` sends notifications or claims stock.
 */

export async function getOrderByReference(reference: string): Promise<Order | null> {
  const order = await prisma.order.findUnique({ where: { reference } });
  return (order as Order) ?? null;
}

export interface SettleResult {
  order: Order | null;
  /** True when this call is the one that transitioned the order. */
  changed: boolean;
  status: OrderStatus;
}

/**
 * Confirm a transaction against Paystack and move the order forward.
 * Always re-verifies with the gateway — a redirect or webhook body alone is
 * never taken as proof of payment.
 */
export async function settleOrder(reference: string): Promise<SettleResult> {
  const order = await getOrderByReference(reference);

  if (!order) {
    return { order: null, changed: false, status: 'pending' };
  }

  // Already settled by the other path.
  if (order.status !== 'pending') {
    return { order, changed: false, status: order.status };
  }

  const verification = await verifyTransaction(reference);
  const succeeded = verification.status === 'success';

  // Guard against a tampered or partial charge.
  const amountMatches = Math.abs(verification.amount - order.amountDueNow) < 1;
  if (succeeded && !amountMatches) {
    console.error(
      `[orders] amount mismatch on ${reference}: expected ${order.amountDueNow}, got ${verification.amount}`
    );
  }

  const nextStatus: OrderStatus = succeeded && amountMatches ? 'paid' : 'failed';

  // Atomic: only the caller that matches `status: 'pending'` updates a row.
  const result = await prisma.order.updateMany({
    where: { reference, status: 'pending' },
    data: {
      status: nextStatus,
      paidAt: verification.paidAt ?? new Date(),
      // The gateway payload is free-form JSON; Prisma needs it widened.
      paystackData: verification.raw as Prisma.InputJsonValue,
    },
  });

  // Someone else settled it between our read and write.
  if (result.count !== 1) {
    const current = await getOrderByReference(reference);
    return { order: current, changed: false, status: current?.status ?? 'pending' };
  }

  const settled: Order = {
    ...order,
    status: nextStatus,
    paidAt: verification.paidAt ?? new Date(),
  };

  if (nextStatus === 'paid') {
    await claimListing(order.kind, order.listingId).catch((error) => {
      console.error('Failed to claim stock for', reference, error);
    });
    await notifyPaymentReceived(settled).catch((error) => {
      console.error('Payment notification failed for', reference, error);
    });
  }

  return { order: settled, changed: true, status: nextStatus };
}
