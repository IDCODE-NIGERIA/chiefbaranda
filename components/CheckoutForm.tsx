'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

import { formatNairaExact, safeImageSrc} from '@/lib/carData';
import {
  FINANCE_PLANS,
  quoteOrder,
  depositLabel,
  type FinanceMonths,
  type PaymentPlan,
} from '@/lib/config';
import type { Listing } from '@/lib/catalog';

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const planCopy: Record<PaymentPlan, { label: string; blurb: (kind: Listing['kind']) => string }> = {
  deposit: {
    label: 'Pay a deposit',
    blurb: (kind) =>
      kind === 'pre-order'
        ? `${depositLabel('pre-order')} now to reserve your slot, balance when the car lands.`
        : `${depositLabel('buy')} now to lock the car, balance on inspection day.`,
  },
  finance: {
    label: 'Spread the balance',
    blurb: (kind) =>
      `Same ${depositLabel(kind)} deposit, then pay the rest monthly. A service charge applies.`,
  },
  full: {
    label: 'Pay in full',
    blurb: () => 'Settle everything now. Nothing left to pay on delivery.',
  },
};

/** Buyer details known before the page renders, from the server session. */
export interface CheckoutPrefill {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export default function CheckoutForm({
  listing,
  prefill,
}: {
  listing: Listing;
  prefill?: CheckoutPrefill;
}) {
  const [plan, setPlan] = useState<PaymentPlan>('deposit');
  const [financeMonths, setFinanceMonths] = useState<FinanceMonths>(FINANCE_PLANS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefilled from the signed-in user's saved profile — still editable, since
  // this particular car might be going somewhere else. This comes from the
  // server rather than AuthContext: the context is still loading at mount, so
  // reading it here would leave the fields permanently blank.
  const [form, setForm] = useState({
    fullName: prefill?.fullName ?? '',
    email: prefill?.email ?? '',
    phone: prefill?.phone ?? '',
    address: prefill?.address ?? '',
    city: prefill?.city ?? '',
    state: prefill?.state ?? '',
    notes: '',
  });

  // Mirrors the server-side calculation so the buyer sees the real figures
  // before they commit. The server recomputes this and is the authority.
  const quote = useMemo(
    () => quoteOrder({ price: listing.price, kind: listing.kind, plan, financeMonths }),
    [listing.price, listing.kind, plan, financeMonths]
  );

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'We need a name for the paperwork.';
    if (!form.email.trim()) next.email = 'Enter your email for the receipt.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'That email looks wrong.';
    if (!form.phone.trim()) next.phone = 'We call this number about your car.';
    else if (!/^(\+?234|0)[789]\d{9}$/.test(form.phone.replace(/\s/g, '')))
      next.phone = 'Use a Nigerian number — e.g. 0803 123 4567.';
    if (!form.address.trim()) next.address = 'Where should we deliver?';
    if (!form.city.trim()) next.city = 'City is required.';
    if (!form.state.trim()) next.state = 'Select your state.';
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const found = validate();
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          kind: listing.kind,
          listingId: listing.id,
          plan,
          financeMonths: plan === 'finance' ? financeMonths : null,
          ...form,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        setFormError(json.error || 'We could not start this payment.');
        setSubmitting(false);
        return;
      }

      if (json.data.authorizationUrl) {
        // Hand off to Paystack's hosted checkout.
        window.location.href = json.data.authorizationUrl;
        return;
      }

      // Payment keys aren't configured — the order is saved, so show it.
      window.location.href = `/orders/${json.data.reference}`;
    } catch {
      setFormError('Network problem. Check your connection and try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-3">
          {listing.kind === 'pre-order' ? 'Reserve a slot' : 'Secure this car'}
        </p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">
          Almost yours.
        </h1>
        <p className="mt-3 text-neutral-600 max-w-xl">
          Give us your details, choose how you want to pay, and we&apos;ll take
          you to a secure Paystack page. Your money is held in escrow until you
          inspect the car.
        </p>

        <div className="mt-10 grid lg:grid-cols-12 gap-10 items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10">
            <section>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-1">
                Your details
              </h2>
              <p className="text-sm text-neutral-500 mb-5">
                This is who the car is registered to and where we deliver it.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  className="sm:col-span-2"
                  label="Full name"
                  value={form.fullName}
                  onChange={(v) => set('fullName', v)}
                  error={errors.fullName}
                  placeholder="Adeboye Bello"
                  autoComplete="name"
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => set('email', v)}
                  error={errors.email}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <Field
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => set('phone', v)}
                  error={errors.phone}
                  placeholder="0803 123 4567"
                  autoComplete="tel"
                />
                <Field
                  className="sm:col-span-2"
                  label="Delivery address"
                  value={form.address}
                  onChange={(v) => set('address', v)}
                  error={errors.address}
                  placeholder="12 Adeola Odeku Street, Victoria Island"
                  autoComplete="street-address"
                />
                <Field
                  label="City"
                  value={form.city}
                  onChange={(v) => set('city', v)}
                  error={errors.city}
                  placeholder="Lagos"
                  autoComplete="address-level2"
                />

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    State
                  </label>
                  <select
                    id="state"
                    value={form.state}
                    onChange={(e) => set('state', e.target.value)}
                    className={inputClass(Boolean(errors.state))}
                  >
                    <option value="">Select a state</option>
                    {nigerianStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.state && <p className={errorClass}>{errors.state}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    Anything we should know? <span className="text-neutral-400">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Preferred colour, pickup yard, best time to call…"
                    className={inputClass(false)}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-1">
                How do you want to pay?
              </h2>
              <p className="text-sm text-neutral-500 mb-5">
                {listing.kind === 'pre-order'
                  ? `Pre-orders need ${depositLabel('pre-order')} upfront.`
                  : `Cars on the ground need ${depositLabel('buy')} upfront.`}
              </p>

              <div className="space-y-3">
                {(Object.keys(planCopy) as PaymentPlan[]).map((key) => (
                  <label
                    key={key}
                    className={[
                      'flex gap-3 rounded-xl border p-4 cursor-pointer transition-colors',
                      plan === key
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-400',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={key}
                      checked={plan === key}
                      onChange={() => setPlan(key)}
                      className="mt-1 accent-green-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-neutral-900">
                        {planCopy[key].label}
                      </span>
                      <span className="block text-sm text-neutral-500 mt-0.5">
                        {planCopy[key].blurb(listing.kind)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              {plan === 'finance' && (
                <div className="mt-4 rounded-xl border border-neutral-200 p-4">
                  <p className="text-sm font-medium text-neutral-700 mb-3">
                    Spread the balance over
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {FINANCE_PLANS.map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setFinanceMonths(months)}
                        className={[
                          'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                          financeMonths === months
                            ? 'bg-neutral-900 text-white'
                            : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400',
                        ].join(' ')}
                      >
                        {months} months
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-neutral-600">
                    {formatNairaExact(quote.monthlyInstalment)} per month for{' '}
                    {quote.financeMonths} months, including a{' '}
                    {formatNairaExact(quote.financeFee)} service charge.
                  </p>
                </div>
              )}
            </section>

            {formError && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-3.5 font-semibold transition-colors"
            >
              {submitting
                ? 'Taking you to Paystack…'
                : `Pay ${formatNairaExact(quote.amountDueNow)}`}
            </button>

            <p className="text-xs text-neutral-500">
              Payments are processed by Paystack. We never see or store your card
              details.
            </p>
          </form>

          {/* Summary */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
              <div className="flex gap-4 p-5 border-b border-neutral-100">
                <div className="relative h-20 w-28 shrink-0 rounded-xl bg-neutral-100 overflow-hidden">
                  <Image
                    src={safeImageSrc(listing.image)}
                    alt={listing.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-neutral-500">
                    {listing.kind === 'pre-order' ? 'Pre-order' : 'Available now'}
                  </p>
                  <h2 className="font-semibold text-neutral-900 truncate">{listing.title}</h2>
                  <p className="text-sm text-neutral-500 truncate">{listing.subtitle}</p>
                </div>
              </div>

              <dl className="p-5 space-y-3 text-sm">
                <Row label="Car price" value={formatNairaExact(quote.price)} />
                {quote.financeFee > 0 && (
                  <Row label="Finance service charge" value={formatNairaExact(quote.financeFee)} />
                )}
                <Row
                  label={
                    plan === 'full'
                      ? 'Paying in full'
                      : `Deposit (${Math.round(quote.depositRate * 100)}%)`
                  }
                  value={formatNairaExact(quote.amountDueNow)}
                  emphasis
                />
                <Row
                  label={
                    plan === 'finance'
                      ? `Balance over ${quote.financeMonths} months`
                      : 'Balance on delivery'
                  }
                  value={formatNairaExact(quote.balance)}
                />
                {plan === 'finance' && (
                  <Row
                    label="Monthly instalment"
                    value={formatNairaExact(quote.monthlyInstalment)}
                  />
                )}
              </dl>

              <div className="border-t border-neutral-100 bg-neutral-50/60 px-5 py-4 flex items-baseline justify-between">
                <span className="text-sm font-medium text-neutral-700">Due now</span>
                <span className="text-xl font-semibold tracking-tight text-neutral-900">
                  {formatNairaExact(quote.amountDueNow)}
                </span>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm text-neutral-600">
              {[
                'Held in escrow until you inspect the car',
                'Walk away at inspection and your deposit is refunded',
                'Every naira itemised — no agent fees',
              ].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {line}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

const errorClass = 'mt-1.5 text-sm text-red-600';

function inputClass(hasError: boolean): string {
  return [
    'w-full rounded-xl border bg-white px-4 py-3 text-sm text-neutral-900 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
    hasError ? 'border-red-300' : 'border-neutral-200 hover:border-neutral-400',
  ].join(' ');
}

function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClass(Boolean(error))}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd
        className={
          emphasis ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'
        }
      >
        {value}
      </dd>
    </div>
  );
}
