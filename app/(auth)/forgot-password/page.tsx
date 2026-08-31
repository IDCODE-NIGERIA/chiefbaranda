'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Two steps on one page: ask for the account, then take the code and the new
 * password. Keeping it together means the code stays on screen next to the
 * field it belongs to.
 */
export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error || 'Could not send a code.');
        return;
      }

      setMaskedPhone(json.data.maskedPhone ?? null);
      setDevCode(json.data.devCode ?? null);
      setNotice(json.message);
      setStep('reset');
    } catch {
      setFormError('Network problem. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code, newPassword, confirmPassword }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error || 'Could not reset your password.');
        return;
      }

      router.replace('/signin?reset=1');
    } catch {
      setFormError('Network problem. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700/80 mb-3">
          Forgot password
        </p>
        <h1 className="text-3xl sm:text-[34px] font-semibold tracking-tight text-neutral-900 leading-[1.15]">
          {step === 'request' ? 'Let&apos;s get you back in.' : 'Check your phone.'}
        </h1>
        <p className="mt-2.5 text-[15px] text-neutral-500">
          {step === 'request'
            ? 'Give us the phone number or email on your account and we will text you a code.'
            : maskedPhone
              ? `We sent a 6-digit code to ${maskedPhone}. It expires in 10 minutes.`
              : 'Enter the 6-digit code we sent you.'}
        </p>
      </div>

      {notice && step === 'reset' && (
        <p className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {notice}
        </p>
      )}

      {devCode && (
        <p className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          SMS is not configured, so here is the code for testing:{' '}
          <span className="font-mono font-semibold tracking-widest">{devCode}</span>
        </p>
      )}

      {formError && (
        <p className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      {step === 'request' ? (
        <form onSubmit={requestCode} className="space-y-5">
          <Field
            label="Phone number or email"
            value={identifier}
            onChange={setIdentifier}
            error={errors.identifier}
            placeholder="0803 123 4567"
            autoComplete="username"
          />
          <button
            type="submit"
            disabled={busy || !identifier.trim()}
            className="w-full rounded-full bg-green-600 py-3.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {busy ? 'Sending…' : 'Send me a code'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitReset} className="space-y-5">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-1.5">
              6-digit code
            </label>
            <input
              id="code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoComplete="one-time-code"
              className={`${inputClass(Boolean(errors.code))} text-center text-lg font-mono tracking-[0.4em]`}
            />
            {errors.code && <p className={errorClass}>{errors.code}</p>}
          </div>

          <Field
            label="New password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={setNewPassword}
            error={errors.newPassword}
            autoComplete="new-password"
          />
          <Field
            label="Confirm new password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 accent-green-600"
            />
            Show passwords
          </label>

          <p className="text-xs text-neutral-500">
            At least 8 characters, with an uppercase letter, a lowercase letter and a number.
          </p>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-green-600 py-3.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {busy ? 'Saving…' : 'Set new password'}
          </button>

          <button
            type="button"
            onClick={() => requestCode()}
            disabled={busy}
            className="w-full text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-60"
          >
            Didn&apos;t get it? Send another code
          </button>
        </form>
      )}

      <p className="mt-8 text-sm text-neutral-500">
        Remembered it?{' '}
        <Link href="/signin" className="font-medium text-neutral-900 hover:text-green-700">
          Sign in
        </Link>
      </p>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <div>
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
