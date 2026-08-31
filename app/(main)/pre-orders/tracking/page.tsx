import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { formatNairaExact } from '@/lib/carData';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import type { Order } from '@/lib/models/Order';

export const metadata: Metadata = {
  title: 'Track a shipment · ChiefBaranda',
  description: 'Follow your pre-ordered car from the port to our yard.',
};

export const dynamic = 'force-dynamic';

export default async function TrackingPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">Sign in to track your car</h1>
          <p className="text-neutral-600 leading-relaxed mb-6">
            Your shipments are tied to your account. Sign in and we&apos;ll show you exactly
            where each one is.
          </p>
          <Link
            href="/signin?redirect=/pre-orders/tracking"
            className="inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const shipments = (await prisma.order.findMany({
    where: {
      OR: [{ userId: user.id }, { buyerEmail: user.email.toLowerCase() }],
      kind: 'pre-order',
      status: { in: ['paid', 'in-transit', 'ready', 'completed'] },
    },
    orderBy: { createdAt: 'desc' },
  })) as Order[];

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-3">
          Tracking
        </p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">
          Where your cars are.
        </h1>
        <p className="mt-3 text-neutral-600">
          Every pre-order you have paid a deposit on, and how far along it is.
        </p>

        {shipments.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-neutral-200 px-6 py-14 text-center">
            <p className="text-neutral-900 font-medium">Nothing in transit</p>
            <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
              Once you reserve a pre-order slot, this is where you follow it from the port
              all the way to our yard.
            </p>
            <Link
              href="/pre-orders"
              className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Browse pre-orders
            </Link>
          </div>
        ) : (
          <ul className="mt-10 space-y-4">
            {shipments.map((order) => (
              <li key={order.reference}>
                <Link
                  href={`/orders/${order.reference}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl border border-neutral-200 p-5 hover:border-neutral-900 transition-colors"
                >
                  <div className="relative h-20 w-28 shrink-0 rounded-xl bg-neutral-100 overflow-hidden">
                    <Image
                      src={order.listingImage || '/logo.png'}
                      alt={order.listingTitle}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold text-neutral-900">{order.listingTitle}</h2>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      Delivering to {order.buyerCity}, {order.buyerState} ·{' '}
                      <span className="font-mono">{order.reference}</span>
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <p className="text-sm text-neutral-500">Balance</p>
                    <p className="font-semibold text-neutral-900">
                      {formatNairaExact(order.balance)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
