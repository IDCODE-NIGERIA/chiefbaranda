import crypto from 'node:crypto';

/**
 * Minimal Paystack client — initialise a transaction, verify one, and
 * authenticate webhooks. Server-only: the secret key must never reach the
 * browser.
 */

const PAYSTACK_BASE = 'https://api.paystack.co';

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not set');
  }
  return key;
}

/** Paystack works in kobo. Naira amounts are always integers here. */
export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function fromKobo(kobo: number): number {
  return Math.round(kobo) / 100;
}

export interface InitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyResult {
  status: string; // 'success' | 'failed' | 'abandoned' | ...
  reference: string;
  /** Amount actually charged, converted back to naira. */
  amount: number;
  paidAt: Date | null;
  channel: string | null;
  currency: string;
  raw: Record<string, unknown>;
}

async function paystackFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.status) {
    const message = json?.message || `Paystack request failed (${res.status})`;
    throw new Error(message);
  }

  return json.data;
}

/**
 * Create a transaction and get the hosted checkout URL to redirect the buyer to.
 */
export async function initializeTransaction(params: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<InitializeResult> {
  const data = await paystackFetch('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      amount: toKobo(params.amountNaira),
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: 'NGN',
      metadata: params.metadata ?? {},
    }),
  });

  return {
    authorizationUrl: data.authorization_url,
    accessCode: data.access_code,
    reference: data.reference,
  };
}

/**
 * Confirm a transaction with Paystack. This is the authority on whether money
 * moved — never mark an order paid based on the browser redirect alone.
 */
export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const data = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`);

  return {
    status: data.status,
    reference: data.reference,
    amount: fromKobo(data.amount),
    paidAt: data.paid_at ? new Date(data.paid_at) : null,
    channel: data.channel ?? null,
    currency: data.currency ?? 'NGN',
    raw: data,
  };
}

/**
 * Paystack signs every webhook with HMAC SHA512 of the raw body using the
 * secret key. Compare in constant time.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;

  const expected = crypto.createHmac('sha512', secretKey()).update(rawBody).digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

/** Short, readable, collision-resistant order reference: CB-8F3K2Q. */
export function generateReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1
  const bytes = crypto.randomBytes(6);
  let out = '';
  for (const byte of bytes) {
    out += alphabet[byte % alphabet.length];
  }
  return `CB-${out}`;
}
