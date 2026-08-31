'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

import { FieldError, useAuth, type User } from '@/app/context/AuthContext';

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

/** Longest edge of a stored avatar, in pixels. */
const AVATAR_SIZE = 256;

/**
 * Downscale and re-encode a chosen image in the browser, so what reaches the
 * server is always a small square JPEG regardless of what the phone produced.
 */
function toAvatarDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('That file is not an image'));
      image.onload = () => {
        // Centre-crop to a square, then scale down.
        const edge = Math.min(image.width, image.height);
        const canvas = document.createElement('canvas');
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Your browser could not process that image'));
          return;
        }

        context.drawImage(
          image,
          (image.width - edge) / 2,
          (image.height - edge) / 2,
          edge,
          edge,
          0,
          0,
          AVATAR_SIZE,
          AVATAR_SIZE
        );

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfileEditor({
  initialUser,
  orderCount,
}: {
  initialUser: User;
  orderCount: number;
}) {
  const { user: liveUser, updateProfile, changePassword } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);

  // The server already knows who this is, so render their details on the
  // first pass rather than flashing an empty page while the context loads.
  // Once AuthContext has the user, it wins — it reflects live edits.
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

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    setNotice(null);

    try {
      const dataUri = await toAvatarDataUri(file);
      await updateProfile({ avatar: dataUri });
      setNotice('Photo updated.');
    } catch (err) {
      if (err instanceof FieldError) setFormError(Object.values(err.fields)[0]);
      else setFormError(err instanceof Error ? err.message : 'Could not upload that photo');
    } finally {
      // Let the same file be picked again after a failure.
      if (fileInput.current) fileInput.current.value = '';
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
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {/* Identity */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative">
            {user.avatar ? (
              // Data URI, so next/image optimisation would only get in the way.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt=""
                className="h-20 w-20 rounded-full object-cover border border-neutral-200"
              />
            ) : (
              <div className="grid place-items-center h-20 w-20 rounded-full bg-green-600 text-white text-2xl font-bold">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 grid place-items-center h-8 w-8 rounded-full bg-neutral-900 text-white border-2 border-white hover:bg-neutral-700 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>

            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatar}
              className="hidden"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5 capitalize">
              {user.userType}
              {user.verified && ' · verified'}
              {user.isAdmin && ' · admin'}
            </p>
          </div>

          {!editing && (
            <button
              onClick={startEditing}
              className="ml-auto rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Edit details
            </button>
          )}
        </div>

        {notice && (
          <p className="mt-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            {notice}
          </p>
        )}
        {formError && (
          <p className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        {/* Details */}
        {editing ? (
          <form onSubmit={handleSave} className="mt-8 space-y-5">
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
                  Your email identifies your orders and can&apos;t be changed here.
                </p>
              </div>

              <Field
                className="sm:col-span-2"
                label="Default delivery address"
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
              We use this address to prefill your checkout — you can still change it per order.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="mt-8 rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
            <Row label="Email" value={user.email} />
            <Row label="Phone" value={user.phone} />
            <Row label="Account type" value={user.userType === 'seller' ? 'Seller' : 'Buyer'} />
            <Row
              label="Delivery address"
              value={
                user.address
                  ? [user.address, user.city, user.state].filter(Boolean).join(', ')
                  : 'Not set yet'
              }
              muted={!user.address}
            />
            <Row label="Orders placed" value={String(orderCount)} />
          </dl>
        )}

        {/* Password */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Password</h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                Change the password you use to sign in.
              </p>
            </div>
            {!showPassword && (
              <button
                onClick={() => setShowPassword(true)}
                className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Change password
              </button>
            )}
          </div>

          {showPassword && (
            <form onSubmit={handlePassword} className="mt-5 space-y-4 max-w-md">
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
                  className="rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
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
                  className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            My orders
          </Link>
          {user.userType === 'buyer' && (
            <Link
              href="/become-seller"
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Start selling
            </Link>
          )}
          {user.isAdmin && (
            <Link
              href="/admin"
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Admin dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

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
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4 px-5 py-4">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd className={`text-sm font-medium ${muted ? 'text-neutral-400' : 'text-neutral-900'}`}>
        {value}
      </dd>
    </div>
  );
}
