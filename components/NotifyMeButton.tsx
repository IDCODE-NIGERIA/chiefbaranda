'use client';

import { useState } from 'react';

import { useAuth } from '@/app/context/AuthContext';

/**
 * "Tell me when this lands." Signed-in buyers register with one click;
 * everyone else gets an inline email field rather than a modal.
 */
export default function NotifyMeButton({
  listingId,
  listingTitle,
}: {
  listingId: string;
  listingTitle: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function register(withEmail: string) {
    setState('saving');
    setMessage(null);

    try {
      const res = await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: withEmail,
          phone: user?.phone,
          listingId,
          listingTitle,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setState('error');
        setMessage(json.errors?.email || json.error || 'That did not work.');
        return;
      }

      setState('done');
      setMessage(json.data?.alreadyRegistered ? "You're already on the list" : "We'll text you");
    } catch {
      setState('error');
      setMessage('Network problem. Try again.');
    }
  }

  if (state === 'done') {
    return (
      <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-green-700">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        {message}
      </p>
    );
  }

  if (open && !user) {
    return (
      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          register(email);
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label={`Email to be notified about ${listingTitle}`}
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={state === 'saving'}
          className="bg-green-800 text-white w-full py-2 rounded-xl text-[11px] font-bold mt-2 hover:bg-green-700 disabled:opacity-60 transition-all"
        >
          {state === 'saving' ? 'Saving…' : 'Notify me'}
        </button>
        {message && <p className="mt-1.5 text-[10px] text-red-600">{message}</p>}
      </form>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={state === 'saving'}
        onClick={() => (user ? register(user.email) : setOpen(true))}
        className="bg-green-800 text-white w-full py-2 rounded-xl text-[11px] font-bold mt-3 hover:bg-green-700 disabled:opacity-60 transition-all"
      >
        {state === 'saving' ? 'Saving…' : 'Notify me'}
      </button>
      {message && <p className="mt-1.5 text-[10px] text-red-600">{message}</p>}
    </>
  );
}
