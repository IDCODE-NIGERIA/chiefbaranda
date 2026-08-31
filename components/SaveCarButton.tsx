'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/app/context/AuthContext';

/**
 * Bookmark a listing. Signed-out visitors are sent to sign in and returned
 * here afterwards, rather than silently doing nothing.
 */
export default function SaveCarButton({
  listingId,
  listingKind = 'buy',
  initialSaved = false,
  variant = 'button',
}: {
  listingId: string;
  listingKind?: 'buy' | 'pre-order';
  initialSaved?: boolean;
  variant?: 'button' | 'icon';
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!isAuthenticated) {
      const target = listingKind === 'pre-order' ? `/pre-orders/${listingId}` : `/cars/${listingId}`;
      router.push(`/signin?redirect=${encodeURIComponent(target)}`);
      return;
    }

    setBusy(true);
    // Optimistic — the heart should respond instantly.
    setSaved((prev) => !prev);

    try {
      const res = await fetch('/api/saved-cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ listingId, listingKind }),
      });
      const json = await res.json();

      if (!res.ok) {
        setSaved((prev) => !prev); // put it back
        return;
      }
      setSaved(json.data.saved);
      router.refresh();
    } catch {
      setSaved((prev) => !prev);
    } finally {
      setBusy(false);
    }
  }

  const heart = (
    <svg
      width={variant === 'icon' ? 18 : 16}
      height={variant === 'icon' ? 18 : 16}
      viewBox="0 0 24 24"
      fill={saved ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-label={saved ? 'Remove from saved cars' : 'Save this car'}
        aria-pressed={saved}
        className={[
          'grid place-items-center h-9 w-9 rounded-full backdrop-blur transition-colors disabled:opacity-60',
          saved ? 'bg-white text-red-600' : 'bg-white/90 text-neutral-700 hover:text-red-600',
        ].join(' ')}
      >
        {heart}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60',
        saved
          ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
          : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50',
      ].join(' ')}
    >
      {heart}
      {saved ? 'Saved' : 'Save this car'}
    </button>
  );
}
