'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

function SignInContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { signin, error: authError, clearError, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const redirect = params.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) router.replace(redirect);
  }, [isAuthenticated, redirect, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = 'We need your email to sign you in.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "That doesn't look like an email.";
    if (!password) errs.password = 'Enter your password.';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await signin(email.trim(), password);
      router.replace(redirect);
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700/80 mb-3">
          Sign in
        </p>
        <h1 className="text-3xl sm:text-[34px] font-semibold tracking-tight text-neutral-900 leading-[1.15]">
          Welcome back, Chief.
        </h1>
        <p className="mt-2.5 text-[15px] text-neutral-500">
          Pick up where you left off — your saved cars are waiting.
        </p>
      </div>

      {authError && (
        <div
          role="alert"
          className="mb-5 flex gap-3 rounded-lg border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-800"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field
          label="Email"
          htmlFor="email"
          error={fieldErrors.email}
        >
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="chief@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className={inputCls(!!fieldErrors.email)}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={fieldErrors.password}
          rightSlot={
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-neutral-500 hover:text-green-700 transition-colors"
            >
              Forgot it?
            </Link>
          }
        >
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className={inputCls(!!fieldErrors.password) + ' pr-12'}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-neutral-500 hover:text-neutral-800"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>

        <label className="flex items-center gap-2.5 select-none pt-1">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-green-700 focus:ring-green-600"
          />
          <span className="text-sm text-neutral-600">Keep me signed in on this device</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:bg-neutral-400 transition-colors"
        >
          {submitting ? (
            <>
              <Spinner /> Signing you in…
            </>
          ) : (
            <>
              Sign in
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      <Divider>or continue with</Divider>

      <div className="grid grid-cols-2 gap-3">
        <SocialButton provider="google" />
        <SocialButton provider="apple" />
      </div>

      <p className="mt-8 text-sm text-neutral-600 text-center">
        New around here?{' '}
        <Link href="/signup" className="font-semibold text-neutral-900 underline decoration-green-600 decoration-2 underline-offset-4 hover:text-green-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}

function Field({
  label,
  htmlFor,
  error,
  rightSlot,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-800">
          {label}
        </label>
        {rightSlot}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
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

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-7 flex items-center gap-4">
      <div className="h-px flex-1 bg-neutral-200" />
      <span className="text-xs uppercase tracking-wider text-neutral-400">{children}</span>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

function SocialButton({ provider }: { provider: 'google' | 'apple' }) {
  const label = provider === 'google' ? 'Google' : 'Apple';
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
    >
      {provider === 'google' ? <GoogleIcon /> : <AppleIcon />}
      {label}
    </button>
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

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M16.37 1.43c0 1.14-.46 2.27-1.22 3.08-.82.87-2.16 1.55-3.27 1.46-.14-1.12.42-2.27 1.16-3.05.83-.88 2.23-1.53 3.33-1.49zM20.5 17.4c-.55 1.26-.81 1.83-1.52 2.95-.99 1.56-2.39 3.5-4.13 3.51-1.54.02-1.94-1-4.04-.99-2.1.01-2.54 1.01-4.08.99-1.74-.01-3.06-1.76-4.05-3.32C.69 16.83.4 11.91 2.37 9.27c1.4-1.88 3.6-2.98 5.67-2.98 2.11 0 3.43 1.15 5.18 1.15 1.69 0 2.72-1.16 5.16-1.16 1.84 0 3.78.99 5.17 2.72-4.54 2.49-3.81 8.97-3.05 8.4z" />
    </svg>
  );
}
