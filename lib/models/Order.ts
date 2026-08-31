import type { OrderModel } from '@/lib/generated/prisma/models';

import type { FinanceMonths, OrderKind, PaymentPlan } from '@/lib/config';

/**
 * The database columns are plain text so these unions stay the single source
 * of truth for the values the app uses (they contain hyphens, which Postgres
 * enum member names can't carry through Prisma). CHECK constraints in
 * `prisma/migrations` enforce the same sets at the database level.
 */
export type OrderStatus =
  | 'pending' // created, buyer has not paid yet
  | 'paid' // deposit or full payment confirmed by Paystack
  | 'failed' // Paystack reported a failed charge
  | 'cancelled' // abandoned or cancelled by admin
  | 'in-transit' // pre-order shipping
  | 'ready' // at the yard, awaiting inspection
  | 'completed'; // balance settled, keys handed over

/** Buyer details captured at checkout, before payment. */
export interface BuyerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
}

/**
 * An order as the app sees it: the Prisma row, but with the loose `String`
 * columns narrowed to their real unions.
 */
export type Order = Omit<OrderModel, 'status' | 'kind' | 'plan' | 'financeMonths'> & {
  status: OrderStatus;
  kind: OrderKind;
  plan: PaymentPlan;
  financeMonths: FinanceMonths | null;
};

/** Flat buyer columns re-assembled into the shape the UI uses. */
export function buyerOf(order: Order): BuyerDetails {
  return {
    fullName: order.buyerName,
    email: order.buyerEmail,
    phone: order.buyerPhone,
    address: order.buyerAddress,
    city: order.buyerCity,
    state: order.buyerState,
    notes: order.buyerNotes ?? undefined,
  };
}
