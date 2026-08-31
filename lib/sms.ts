/**
 * Termii SMS client, used for the admin alert when a payment comes in.
 *
 * Sending is best-effort: a failed SMS must never fail a payment. Callers get
 * a result object back rather than an exception.
 */

const TERMII_ENDPOINT = 'https://api.ng.termii.com/api/sms/send';

export interface SmsResult {
  sent: boolean;
  error?: string;
  messageId?: string;
}

/** Termii wants 234XXXXXXXXXX — no plus, no leading zero. */
export function toInternational(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return `234${digits.slice(1)}`;
  if (digits.length === 10) return `234${digits}`;
  return digits;
}

export async function sendSms(to: string, message: string): Promise<SmsResult> {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || 'N-Alert';

  if (!apiKey) {
    // Not configured yet — log so it is visible in dev, but don't blow up.
    console.warn('[sms] TERMII_API_KEY not set, skipping SMS to', to);
    return { sent: false, error: 'TERMII_API_KEY not configured' };
  }

  try {
    const res = await fetch(TERMII_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        to: toInternational(to),
        from: senderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: apiKey,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return { sent: false, error: json?.message || `Termii returned ${res.status}` };
    }

    return { sent: true, messageId: json?.message_id };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : 'SMS failed' };
  }
}

/** Every admin phone in ADMIN_PHONES (comma separated). */
export function adminPhones(): string[] {
  return (process.env.ADMIN_PHONES || process.env.ADMIN_PHONE || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

export async function smsAllAdmins(message: string): Promise<SmsResult> {
  const phones = adminPhones();

  if (phones.length === 0) {
    console.warn('[sms] no ADMIN_PHONES configured, skipping admin alert');
    return { sent: false, error: 'No admin phone configured' };
  }

  const results = await Promise.all(phones.map((phone) => sendSms(phone, message)));
  const failed = results.filter((r) => !r.sent);

  if (failed.length === results.length) {
    return { sent: false, error: failed[0]?.error || 'All admin SMS failed' };
  }

  return { sent: true };
}
