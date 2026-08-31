'use client';

import { useState } from 'react';

import { FieldError, useAuth, type User } from '@/app/context/AuthContext';

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

/** Editable account details and the password form. */
export default function ProfileDetails({ initialUser }: { initialUser: User }) {
  const { user: liveUser, updateProfile, changePassword } = useAuth();
  const user = liveUser ?? initialUser;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstName: initialUser.firstName,
    lastName: initialUser.lastName,
    phone: initialUser.phone,
    address: initialUser.address ?? '',
    city: initialUser.city ?? '',
    state: initialUser.state ?? '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [changingPassword, setChangingPassword] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function startEditing() {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
    });
    setErrors({});
    setFormError(null);
    setNotice(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setNotice(null);

    try {
      await updateProfile(form);
      setEditing(false);
      setNotice('Your details have been saved.');
    } catch (err) {
      if (err instanceof FieldError) setErrors(err.fields);
      else setFormError(err instanceof Error ? err.message : 'Could not save your changes');
    } finally {
      setSaving(false);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordErrors({});
    setFormError(null);
    setNotice(null);

    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPassword(false);
      setNotice('Your password has been changed.');
    } catch (err) {
      if (err instanceof FieldError) setPasswordErrors(err.fields);
      else setFormError(err instanceof Error ? err.message : 'Could not change your password');
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-5">
      {notice && (
        <p className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {notice}
        </p>
      )}
      {formError && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <section className="rounded-2xl border border-neutral-200 overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="font-semibold tracking-tight text-neutral-900">Account details</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Where we deliver, and how we reach you.
            </p>
          </div>
          {!editing && (
            <button
              onClick={startEditing}
              className="shrink-0 rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Edit
            </button>
          )}
        </header>

        {editing ? (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First name" value={form.firstName} onChange={(v) => set('firstName', v)} error={errors.firstName} />
              <Field label="Last name" value={form.lastName} onChange={(v) => set('lastName', v)} error={errors.lastName} />
              <Field label="Phone" type="tel" value={form.phone} onChange={(v) => set('phone', v)} error={errors.phone} />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                <input
                  value={user.email}
                  disabled
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 cursor-not-allowed"
                />
                <p className="mt-1.5 text-xs text-neutral-500">
                  Identifies your orders, so it can&apos;t be changed here.
                </p>
              </div>

              <Field
                className="sm:col-span-2"
                label="Delivery address"
                value={form.address}
                onChange={(v) => set('address', v)}
                error={errors.address}
                placeholder="12 Adeola Odeku Street, Victoria Island"
              />
              <Field label="City" value={form.city} onChange={(v) => set('city', v)} error={errors.city} />

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-neutral-700 mb-1.5">
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
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-sm text-neutral-500">
              We use this address to prefill checkout — you can still change it per order.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5 p-6">
            <Row label="First name" value={user.firstName} />
            <Row label="Last name" value={user.lastName} />
            <Row label="Phone" value={user.phone} />
            <Row label="Email" value={user.email} />
            <Row
              label="Delivery address"
              value={user.address || 'Not set yet'}
              muted={!user.address}
              className="sm:col-span-2"
            />
            <Row label="City" value={user.city || '—'} muted={!user.city} />
            <Row label="State" value={user.state || '—'} muted={!user.state} />
          </dl>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="font-semibold tracking-tight text-neutral-900">Password</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Change the password you use to sign in.
            </p>
          </div>
          {!showPassword && (
            <button
              onClick={() => setShowPassword(true)}
              className="shrink-0 rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Change
            </button>
          )}
        </header>

        {showPassword && (
          <form onSubmit={handlePassword} className="p-6 space-y-4 max-w-md">
            <Field
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(v) => setPasswordForm((p) => ({ ...p, currentPassword: v }))}
              error={passwordErrors.currentPassword}
              autoComplete="current-password"
            />
            <Field
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(v) => setPasswordForm((p) => ({ ...p, newPassword: v }))}
              error={passwordErrors.newPassword}
              autoComplete="new-password"
            />
            <Field
              label="Confirm new password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(v) => setPasswordForm((p) => ({ ...p, confirmPassword: v }))}
              error={passwordErrors.confirmPassword}
              autoComplete="new-password"
            />
            <p className="text-xs text-neutral-500">
              At least 8 characters, with an uppercase letter, a lowercase letter and a number.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {changingPassword ? 'Changing…' : 'Change password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPassword(false);
                  setPasswordErrors({});
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
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
  label, value, onChange, error, type = 'text', placeholder, autoComplete, className = '',
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  type?: string; placeholder?: string; autoComplete?: string; className?: string;
}) {
  const id = `profile-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <input
        id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} className={inputClass(Boolean(error))}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

function Row({
  label, value, muted = false, className = '',
}: { label: string; value: string; muted?: boolean; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</dt>
      <dd className={`mt-1 text-sm font-medium ${muted ? 'text-neutral-400' : 'text-neutral-900'}`}>
        {value}
      </dd>
    </div>
  );
}
