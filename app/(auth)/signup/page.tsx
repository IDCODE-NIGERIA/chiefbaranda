'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

type UserType = 'buyer' | 'seller';

function SignUpContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { signup, error: authError, clearError, isAuthenticated } = useAuth();

  const [userType, setUserType] = useState<UserType>(
    (params.get('as') as UserType) === 'seller' ? 'seller' : 'buyer'
  );
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  const pwStrength = useMemo(() => scorePassword(password), [password]);

  function validate() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required.';
    if (!lastName.trim()) e.lastName = 'Last name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Use a valid email address.';
    if (!phone.trim()) e.phone = 'Phone is required for delivery & verification.';
    else if (!/^(\+?234|0)[789]\d{9}$/.test(phone.replace(/\s/g, '')))
      e.phone = 'Use a Nigerian number — e.g. 0803 123 4567.';
    if (!password) e.password = 'Pick a password.';
    else if (password.length < 8) e.password = 'At least 8 characters.';
    if (confirmPassword !== password) e.confirmPassword = "Passwords don't match.";
    if (!terms) e.terms = 'Accept the terms to continue.';
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    clearError();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        userType,
        termsAccepted: terms,
      });
      router.replace('/');
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700/80 mb-3">
          Create account
        </p>
        <h1 className="text-3xl sm:text-[34px] font-semibold tracking-tight text-neutral-900 leading-[1.15]">
          Let&apos;s get you set up.
        </h1>
        <p className="mt-2.5 text-[15px] text-neutral-500">
          Takes about a minute. No paperwork, no agents calling you at 7am.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Account type"
        className="mb-6 inline-flex rounded-full bg-neutral-100 p-1 text-sm w-full sm:w-auto"
      >
        <TypePill active={userType === 'buyer'} onClick={() => setUserType('buyer')}>
          I&apos;m buying
        </TypePill>
        <TypePill active={userType === 'seller'} onClick={() => setUserType('seller')}>
          I&apos;m selling
        </TypePill>
      </div>

      {authError && (
        <div role="alert" className="mb-5 flex gap-3 rounded-lg border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" htmlFor="firstName" error={errors.firstName}>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Tunde"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={submitting}
              className={inputCls(!!errors.firstName)}
            />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Okafor"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={submitting}
              className={inputCls(!!errors.lastName)}
            />
          </Field>
        </div>

        <Field label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className={inputCls(!!errors.email)}
          />
        </Field>

        <Field
          label="Phone"
          htmlFor="phone"
          error={errors.phone}
          hint="We use this for delivery updates and OTP."
        >
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-neutral-500 border-r border-neutral-200 pr-3">
              🇳🇬 +234
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="803 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
              className={inputCls(!!errors.phone) + ' pl-[88px]'}
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password}>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className={inputCls(!!errors.password) + ' pr-12'}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-neutral-500 hover:text-neutral-800"
              tabIndex={-1}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {password && <StrengthMeter score={pwStrength} />}
        </Field>

        <Field label="Confirm password" htmlFor="confirm" error={errors.confirmPassword}>
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
            className={inputCls(!!errors.confirmPassword)}
          />
        </Field>

        <div className="pt-1">
          <label className="flex items-start gap-2.5 select-none">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-green-700 focus:ring-green-600"
            />
            <span className="text-sm text-neutral-600 leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" className="text-neutral-900 underline underline-offset-2 hover:text-green-700">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-neutral-900 underline underline-offset-2 hover:text-green-700">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.terms && <p className="mt-1.5 text-xs text-red-600">{errors.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:bg-neutral-400 transition-colors"
        >
          {submitting ? (
            <>
              <Spinner /> Creating your account…
            </>
          ) : (
            <>
              {userType === 'seller' ? 'Start selling' : 'Create account'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-sm text-neutral-600 text-center">
        Already on ChiefBaranda?{' '}
        <Link
          href="/signin"
          className="font-semibold text-neutral-900 underline decoration-green-600 decoration-2 underline-offset-4 hover:text-green-700"
        >
          Sign in instead
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpContent />
    </Suspense>
  );
}

function TypePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'flex-1 sm:flex-none px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
        active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block mb-1.5 text-sm font-medium text-neutral-800">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400',
    'focus:outline-none focus:ring-4 transition-shadow',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10',
    'disabled:bg-neutral-50 disabled:cursor-not-allowed',
  ].join(' ');
}

function scorePassword(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4) as 0 | 1 | 2 | 3 | 4;
}

function StrengthMeter({ score }: { score: 0 | 1 | 2 | 3 | 4 }) {
  const labels = ['', 'Weak', 'Okay', 'Strong', 'Excellent'];
  const colors = ['bg-neutral-200', 'bg-red-400', 'bg-amber-400', 'bg-lime-500', 'bg-green-600'];
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={[
              'h-1 flex-1 rounded-full transition-colors',
              i <= score ? colors[score] : 'bg-neutral-200',
            ].join(' ')}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-500 w-16 text-right">{labels[score]}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
