'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Confirm the user owns the phone number on their account.
 *
 * Until this is done, the number on an order is just something someone typed.
 */
export default function VerifyPhone({
  phone,
  verified,
}: {
  phone: string;
  verified: boolean;
}) {
  const router = useRouter();

  const [sent, setSent] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(verified);

  async function sendCode() {
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Could not send a code.');
        return;
      }
      if (json.data.alreadyVerified) {
        setDone(true);
        return;
      }

      setMaskedPhone(json.data.maskedPhone ?? null);
      setDevCode(json.data.devCode ?? null);
      setSent(true);
    } catch {
      setError('Network problem. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.errors?.code || json.error || 'That code is not correct.');
        return;
      }

      setDone(true);
      router.refresh();
    } catch {
      setError('Network problem. Try again.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="rounded-2xl border border-neutral-200 p-6">
        <h2 className="font-semibold tracking-tight text-neutral-900">Phone</h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-green-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {phone} is verified.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-neutral-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold tracking-tight text-neutral-900">
            Verify your phone
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Confirm {phone} so we can reach you about your cars.
          </p>
        </div>
        {!sent && (
          <button
            onClick={sendCode}
            disabled={busy}
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Send code'}
          </button>
        )}
      </div>

      {devCode && (
        <p className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          SMS is not configured, so here is the code for testing:{' '}
          <span className="font-mono font-semibold tracking-widest">{devCode}</span>
        </p>
      )}

      {sent && (
        <form onSubmit={confirm} className="mt-4 flex flex-wrap items-start gap-3">
          <div>
            <label htmlFor="verify-code" className="sr-only">
              6-digit code
            </label>
            <input
              id="verify-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoComplete="one-time-code"
              className="w-40 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-lg font-mono tracking-[0.3em] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {busy ? 'Checking…' : 'Verify'}
          </button>
          <button
            type="button"
            onClick={sendCode}
            disabled={busy}
            className="px-2 py-3 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-60"
          >
            Resend
          </button>
        </form>
      )}

      {sent && maskedPhone && !error && (
        <p className="mt-2 text-sm text-neutral-500">
          Code sent to {maskedPhone}. It expires in 10 minutes.
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}
