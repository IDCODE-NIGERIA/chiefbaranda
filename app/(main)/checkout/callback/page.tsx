'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { formatNairaExact } from '@/lib/carData';

type Receipt = {
  reference: string;
  status: string;
  listingId: string;
  listingTitle: string;
  kind: 'buy' | 'pre-order';
  plan: string;
  price: number;
  amountPaid: number;
  balance: number;
  monthlyInstalment: number;
  financeMonths: number | null;
  buyerName: string;
  buyerEmail: string;
};

function CallbackContent() {
  const params = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // A missing reference is knowable during render — no effect needed.
  const error = reference
    ? fetchError
    : 'We did not get a payment reference back from Paystack.';

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;

    // The webhook may beat us here; either way we ask the server to confirm
    // with Paystack rather than trusting this redirect.
    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) {
          setFetchError(json.error || 'We could not confirm this payment.');
          return;
        }
        setReceipt(json.data);
      })
      .catch(() => {
        if (!cancelled) setFetchError('We could not reach our servers to confirm the payment.');
      });

    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (error) {
    return (
      <Shell>
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 8v5M12 17h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">Something went wrong</h1>
        <p className="text-neutral-600 leading-relaxed mb-6">{error}</p>
        <p className="text-sm text-neutral-500 mb-6">
          If money left your account, don&apos;t worry — it is traceable by your
          reference. Contact us and we&apos;ll sort it out.
        </p>
        <Link
          href="/contact"
          className="inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Contact support
        </Link>
      </Shell>
    );
  }

  if (!receipt) {
    return (
      <Shell>
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center">
          <span className="h-6 w-6 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">Confirming your payment…</h1>
        <p className="text-neutral-600">This takes a second. Please don&apos;t close this page.</p>
      </Shell>
    );
  }

  if (receipt.status !== 'paid') {
    return (
      <Shell>
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 8v5M12 17h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">Payment not completed</h1>
        <p className="text-neutral-600 leading-relaxed mb-2">
          We couldn&apos;t confirm a successful charge for{' '}
          <span className="font-medium text-neutral-900">{receipt.listingTitle}</span>.
        </p>
        <p className="text-sm text-neutral-500 mb-6">
          Reference <span className="font-mono">{receipt.reference}</span> — nothing has been
          taken from your account.
        </p>
        <Link
          href={`/checkout?kind=${receipt.kind}&listing=${encodeURIComponent(receipt.listingId)}`}
          className="inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Try again
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 mb-3">
        {receipt.kind === 'pre-order' ? 'Your slot is reserved' : 'The car is yours to inspect'}
      </h1>
      <p className="text-neutral-600 leading-relaxed">
        We received {formatNairaExact(receipt.amountPaid)} for your{' '}
        <span className="font-medium text-neutral-900">{receipt.listingTitle}</span>. A receipt is
        on its way to {receipt.buyerEmail}, and our team has been alerted.
      </p>

      <dl className="mt-8 rounded-2xl border border-neutral-200 divide-y divide-neutral-100 text-left">
        <ReceiptRow label="Reference" value={receipt.reference} mono />
        <ReceiptRow label="Car price" value={formatNairaExact(receipt.price)} />
        <ReceiptRow label="Paid today" value={formatNairaExact(receipt.amountPaid)} />
        <ReceiptRow
          label={
            receipt.financeMonths
              ? `Balance over ${receipt.financeMonths} months`
              : 'Balance on delivery'
          }
          value={formatNairaExact(receipt.balance)}
        />
        {receipt.financeMonths ? (
          <ReceiptRow
            label="Monthly instalment"
            value={formatNairaExact(receipt.monthlyInstalment)}
          />
        ) : null}
      </dl>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          href={`/orders/${receipt.reference}`}
          className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Track this order
        </Link>
        <Link
          href="/categories"
          className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Keep browsing
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">{children}</div>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3.5">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd
        className={`text-sm font-medium text-neutral-900 ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <p className="text-neutral-600">Loading…</p>
        </Shell>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
