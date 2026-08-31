/**
 * Commercial rules for the marketplace.
 *
 * Percentages live here (not in the database) so they can be changed in one
 * place. Anything that quotes a price to a buyer must go through
 * `quoteOrder()` so the checkout, the admin dashboard and the payment
 * webhook can never disagree about what is owed.
 */

export type OrderKind = 'buy' | 'pre-order';

/** Share of the price collected upfront, by order kind. */
export const DEPOSIT_RATES: Record<OrderKind, number> = {
  // Cars already on the ground in Nigeria — buyer commits harder.
  buy: 0.4,
  // Imports we still have to source and ship — smaller commitment upfront.
  'pre-order': 0.3,
};

/** Monthly instalment plans offered on the balance. */
export const FINANCE_PLANS = [3, 6, 12] as const;
export type FinanceMonths = (typeof FINANCE_PLANS)[number];

/** Flat service charge added to a financed balance, per plan length. */
export const FINANCE_FEE_RATES: Record<FinanceMonths, number> = {
  3: 0.03,
  6: 0.07,
  12: 0.15,
};

export type PaymentPlan = 'deposit' | 'finance' | 'full';

export interface OrderQuote {
  /** Full landed price of the vehicle, in naira. */
  price: number;
  /** Percentage of the price taken now, as a 0-1 fraction. */
  depositRate: number;
  /** Amount the buyer pays right now, in naira. */
  amountDueNow: number;
  /** Amount still owed after this payment, in naira. */
  balance: number;
  /** Service charge applied to a financed balance, in naira. */
  financeFee: number;
  /** Monthly instalment on a financed balance, in naira. */
  monthlyInstalment: number;
  financeMonths: FinanceMonths | null;
  plan: PaymentPlan;
  kind: OrderKind;
}

function roundNaira(n: number): number {
  return Math.round(n);
}

/**
 * Single source of truth for what a buyer owes.
 *
 * Never trust an amount sent from the browser — recompute it here using the
 * price stored on the listing.
 */
export function quoteOrder(params: {
  price: number;
  kind: OrderKind;
  plan: PaymentPlan;
  financeMonths?: number | null;
}): OrderQuote {
  const { price, kind, plan } = params;
  const depositRate = DEPOSIT_RATES[kind];

  if (plan === 'full') {
    return {
      price,
      depositRate: 1,
      amountDueNow: roundNaira(price),
      balance: 0,
      financeFee: 0,
      monthlyInstalment: 0,
      financeMonths: null,
      plan,
      kind,
    };
  }

  const amountDueNow = roundNaira(price * depositRate);
  const balance = roundNaira(price - amountDueNow);

  if (plan === 'finance') {
    const months = (FINANCE_PLANS as readonly number[]).includes(params.financeMonths ?? 0)
      ? (params.financeMonths as FinanceMonths)
      : FINANCE_PLANS[0];
    const financeFee = roundNaira(balance * FINANCE_FEE_RATES[months]);
    return {
      price,
      depositRate,
      amountDueNow,
      balance: balance + financeFee,
      financeFee,
      monthlyInstalment: roundNaira((balance + financeFee) / months),
      financeMonths: months,
      plan,
      kind,
    };
  }

  return {
    price,
    depositRate,
    amountDueNow,
    balance,
    financeFee: 0,
    monthlyInstalment: 0,
    financeMonths: null,
    plan,
    kind,
  };
}

/** Human label for a deposit rate, e.g. "40%". */
export function depositLabel(kind: OrderKind): string {
  return `${Math.round(DEPOSIT_RATES[kind] * 100)}%`;
}

/** Emails allowed into /admin, from ADMIN_EMAILS (comma separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/** Absolute base URL, needed for Paystack callbacks. */
export function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  );
}
