'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

import { FieldError, useAuth, type User } from '@/app/context/AuthContext';
import { formatNairaExact } from '@/lib/carData';

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

/** Identity card: photo, name, status and the quick links off the profile. */
export default function ProfileSidebar({
  initialUser,
  orderCount,
  totalPaid,
  savedCount,
  memberSince,
}: {
  initialUser: User;
  orderCount: number;
  totalPaid: number;
  savedCount: number;
  memberSince: string;
}) {
  const { user: liveUser, updateProfile } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = liveUser ?? initialUser;

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);

    try {
      const dataUri = await toAvatarDataUri(file);
      await updateProfile({ avatar: dataUri });
    } catch (err) {
      if (err instanceof FieldError) setError(Object.values(err.fields)[0]);
      else setError(err instanceof Error ? err.message : 'Could not upload that photo');
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  return (
    <div className="lg:sticky lg:top-24 space-y-5">
      <div className="rounded-2xl border border-neutral-200 p-6 text-center">
        <div className="relative inline-block">
          {user.avatar ? (
            // A data URI — next/image optimisation would only get in the way.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt=""
              className="h-24 w-24 rounded-full object-cover border border-neutral-200"
            />
          ) : (
            <div className="grid place-items-center h-24 w-24 rounded-full bg-green-600 text-white text-3xl font-bold">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            aria-label="Change profile photo"
            className="absolute bottom-0 right-0 grid place-items-center h-8 w-8 rounded-full bg-neutral-900 text-white border-2 border-white hover:bg-neutral-700 disabled:opacity-60 transition-colors"
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

        <h1 className="mt-4 text-xl font-bold tracking-tight text-neutral-900">
          {user.firstName} {user.lastName}
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">{user.email}</p>

        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          <Badge tone="neutral">{user.userType === 'seller' ? 'Seller' : 'Buyer'}</Badge>
          {user.verified ? (
            <Badge tone="green">Verified</Badge>
          ) : (
            <Badge tone="amber">Unverified</Badge>
          )}
          {user.isAdmin && <Badge tone="dark">Admin</Badge>}
        </div>

        <p className="mt-3 text-xs text-neutral-400">Member since {memberSince}</p>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      </div>

      {/* At-a-glance numbers */}
      <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        <Metric label="Orders" value={String(orderCount)} />
        <Metric label="Saved cars" value={String(savedCount)} />
        <Metric label="Paid to date" value={formatNairaExact(totalPaid)} />
      </div>

      <nav className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
        <NavLink href="/orders">My orders</NavLink>
        {user.userType === 'buyer' && <NavLink href="/become-seller">Start selling</NavLink>}
        {user.userType === 'seller' && <NavLink href="/my-listings">My listings</NavLink>}
        {user.isAdmin && <NavLink href="/admin">Admin dashboard</NavLink>}
      </nav>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: 'neutral' | 'green' | 'amber' | 'dark';
}) {
  const styles = {
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    dark: 'bg-neutral-900 text-white border-neutral-900',
  }[tone];

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles}`}>
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-5 py-3.5">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
    >
      {children}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
