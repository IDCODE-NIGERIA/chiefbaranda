import crypto from 'node:crypto';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { sendSms } from '@/lib/sms';

/**
 * One-time SMS codes for password resets and phone verification.
 *
 * The rules that make this safe live here rather than in the routes, so both
 * flows get them identically:
 *  - codes are stored hashed, never in plain text
 *  - they expire quickly and can only be used once
 *  - a limited number of wrong guesses burns the code
 *  - requesting one is rate-limited per user
 */

export type CodePurpose = 'reset' | 'verify';

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
/** Minimum gap between requests for the same purpose. */
const RESEND_COOLDOWN_SECONDS = 60;

/** Six digits, uniformly distributed — no Math.random for a credential. */
function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

/** Mask a phone for display: 08031234567 -> 0803****567 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\s/g, '');
  if (digits.length < 7) return '•••';
  return `${digits.slice(0, 4)}****${digits.slice(-3)}`;
}

export interface IssueResult {
  sent: boolean;
  /** Set when the caller asked again too soon. */
  cooldown?: number;
  maskedPhone: string;
  /** Only populated outside production when SMS is unconfigured. */
  devCode?: string;
  error?: string;
}

/**
 * Create a code and text it to the user.
 *
 * Callers must not vary their response based on whether the account exists —
 * that would turn this into a way to discover who has an account.
 */
export async function issueCode(
  user: { id: string; phone: string },
  purpose: CodePurpose,
  message: (code: string) => string
): Promise<IssueResult> {
  const masked = maskPhone(user.phone);

  // Throttle resends so nobody can be spammed, and the SMS bill can't be run
  // up by hammering the endpoint.
  const recent = await prisma.verificationCode.findFirst({
    where: { userId: user.id, purpose, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  if (recent) {
    const age = (Date.now() - recent.createdAt.getTime()) / 1000;
    if (age < RESEND_COOLDOWN_SECONDS) {
      return { sent: false, cooldown: Math.ceil(RESEND_COOLDOWN_SECONDS - age), maskedPhone: masked };
    }
  }

  // Only one live code per purpose — issuing a new one invalidates the old.
  await prisma.verificationCode.updateMany({
    where: { userId: user.id, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = generateCode();

  await prisma.verificationCode.create({
    data: {
      userId: user.id,
      codeHash: await hashPassword(code),
      purpose,
      sentTo: user.phone,
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    },
  });

  const result = await sendSms(user.phone, message(code));

  // Without SMS credentials the code would be unreachable, which makes the
  // feature untestable in development. Surface it there — never in production.
  if (!result.sent && process.env.NODE_ENV !== 'production') {
    console.warn(`[verification] SMS not configured — ${purpose} code for ${user.phone} is ${code}`);
    return { sent: false, maskedPhone: masked, devCode: code, error: result.error };
  }

  return { sent: result.sent, maskedPhone: masked, error: result.error };
}

export type CheckOutcome =
  | { ok: true; userId: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'too-many-attempts' };

/**
 * Check a submitted code and consume it.
 *
 * Returns the same `invalid` reason for a wrong code and an unknown user, so
 * this cannot be used to probe which phone numbers are registered.
 */
export async function checkCode(
  userId: string,
  purpose: CodePurpose,
  submitted: string
): Promise<CheckOutcome> {
  const record = await prisma.verificationCode.findFirst({
    where: { userId, purpose, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return { ok: false, reason: 'invalid' };

  if (record.expiresAt < new Date()) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
    return { ok: false, reason: 'expired' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
    return { ok: false, reason: 'too-many-attempts' };
  }

  const matches = await verifyPassword(submitted, record.codeHash);

  if (!matches) {
    const attempts = record.attempts + 1;
    await prisma.verificationCode.update({
      where: { id: record.id },
      // Burn the code entirely once the limit is reached.
      data: { attempts, ...(attempts >= MAX_ATTEMPTS ? { consumedAt: new Date() } : {}) },
    });
    return {
      ok: false,
      reason: attempts >= MAX_ATTEMPTS ? 'too-many-attempts' : 'invalid',
    };
  }

  // Single use.
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  return { ok: true, userId };
}
