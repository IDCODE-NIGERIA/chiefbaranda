import Link from 'next/link';
import Image from 'next/image';

import { prisma } from '@/lib/prisma';
import { findListing } from '@/lib/catalog';
import { formatNairaExact, safeImageSrc} from '@/lib/carData';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import SaveCarButton from '@/components/SaveCarButton';
import type { Order } from '@/lib/models/Order';
import type { OrderKind } from '@/lib/config';

/**
 * The read-only half of the profile — recent orders, saved cars and activity.
 *
 * A server component so it renders with real content on first paint; the
 * editable half above it is a client component.
 */
export default async function ProfileExtras({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [orders, savedRows, notifications] = await Promise.all([
    prisma.order.findMany({
      where: { OR: [{ userId }, { buyerEmail: email.toLowerCase() }] },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.savedCar.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.notification.findMany({
      where: { audience: 'user', userId },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ]);

  // Saved listings may have been delisted since; drop those.
  const saved = (
    await Promise.all(
      savedRows.map((row) => findListing(row.listingKind as OrderKind, row.listingId))
    )
  ).filter((listing): listing is NonNullable<typeof listing> => listing !== null);

  return (
    <div className="space-y-5">
      {/* Recent orders */}
      <section className="rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold tracking-tight text-neutral-900">Recent orders</h2>
          {orders.length > 0 && (
            <Link href="/orders" className="text-sm font-medium text-green-700 hover:underline">
              See all
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <EmptyCard
            title="No orders yet"
            body="When you reserve a pre-order or buy a car, it appears here."
            actionLabel="Browse cars"
            actionHref="/categories"
          />
        ) : (
          <ul className="space-y-3">
            {(orders as Order[]).map((order) => (
              <li key={order.reference}>
                <Link
                  href={`/orders/${order.reference}`}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-4 hover:border-neutral-900 transition-colors"
                >
                  <div className="relative h-14 w-20 shrink-0 rounded-xl bg-neutral-100 overflow-hidden">
                    <Image
                      src={safeImageSrc(order.listingImage)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-neutral-900 truncate">{order.listingTitle}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 font-mono">{order.reference}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-neutral-900">
                    {formatNairaExact(order.amountDueNow)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Saved cars */}
      <section className="rounded-2xl border border-neutral-200 p-6">
        <h2 className="font-semibold tracking-tight text-neutral-900 mb-4">Saved cars</h2>

        {saved.length === 0 ? (
          <EmptyCard
            title="Nothing saved yet"
            body="Tap the heart on any listing to keep it here and come back to it."
            actionLabel="Find a car"
            actionHref="/categories"
          />
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {saved.map((listing) => (
              <li
                key={`${listing.kind}-${listing.id}`}
                className="rounded-2xl border border-neutral-200 overflow-hidden flex flex-col"
              >
                <Link
                  href={listing.kind === 'pre-order' ? `/pre-orders/${listing.id}` : `/cars/${listing.id}`}
                  className="relative h-36 bg-neutral-100 block"
                >
                  <Image
                    src={safeImageSrc(listing.image)}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {!listing.available && (
                    <span className="absolute top-3 left-3 rounded-full bg-neutral-900/85 px-2.5 py-1 text-[11px] font-medium text-white">
                      No longer available
                    </span>
                  )}
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <Link
                    href={listing.kind === 'pre-order' ? `/pre-orders/${listing.id}` : `/cars/${listing.id}`}
                    className="font-semibold text-neutral-900 hover:text-green-700"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-sm text-neutral-500 mt-0.5">{listing.subtitle}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="font-semibold text-neutral-900">
                      {formatNairaExact(listing.price)}
                    </p>
                    <SaveCarButton
                      listingId={listing.id}
                      listingKind={listing.kind}
                      initialSaved
                      variant="icon"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity */}
      <section className="rounded-2xl border border-neutral-200 p-6">
        <h2 className="font-semibold tracking-tight text-neutral-900 mb-4">Activity</h2>

        {notifications.length === 0 ? (
          <EmptyCard
            title="Nothing to report"
            body="Payment confirmations and updates about your cars show up here."
          />
        ) : (
          <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
            {notifications.map((n) => (
              <li key={n.id} className={`px-5 py-4 flex gap-4 ${n.read ? '' : 'bg-green-50/40'}`}>
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    n.read ? 'bg-neutral-300' : 'bg-green-600'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900">{n.title}</p>
                  <p className="text-sm text-neutral-600 mt-0.5">{n.body}</p>
                  <p className="text-xs text-neutral-400 mt-1.5">
                    {new Date(n.createdAt).toLocaleString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {n.href && (
                  <Link
                    href={n.href}
                    className="shrink-0 self-center text-sm font-medium text-green-700 hover:underline"
                  >
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyCard({
  title,
  body,
  actionLabel,
  actionHref,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <p className="font-medium text-neutral-900">{title}</p>
      <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">{body}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
