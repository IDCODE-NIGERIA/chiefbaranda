import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { formatNairaExact } from '@/lib/carData';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import type { Order } from '@/lib/models/Order';

export const metadata: Metadata = {
  title: 'My orders · ChiefBaranda',
};

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/signin?redirect=/orders');

  // Match on the account and on the email used at checkout, so orders placed
  // as a guest before signing up still show up.
  const orders = (await prisma.order.findMany({
    where: { OR: [{ userId: user.id }, { buyerEmail: user.email.toLowerCase() }] },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })) as Order[];

  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">
          Your orders
        </h1>
        <p className="mt-3 text-neutral-600">
          Every car you have reserved or bought, and what is still owed on each.
        </p>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-neutral-200 px-6 py-14 text-center">
            <p className="text-neutral-900 font-medium">Nothing here yet</p>
            <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
              When you reserve a pre-order or buy a car, it shows up here with its
              full payment history.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link
                href="/categories"
                className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Browse cars
              </Link>
              <Link
                href="/pre-orders"
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                See pre-orders
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-10 space-y-4">
            {orders.map((order) => (
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
                      <span className="font-mono">{order.reference}</span>
                      {' · '}
                      {order.kind === 'pre-order' ? 'Pre-order' : 'Purchase'}
                      {' · '}
                      {new Date(order.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <p className="text-sm text-neutral-500">Paid</p>
                    <p className="font-semibold text-neutral-900">
                      {formatNairaExact(order.status === 'pending' ? 0 : order.amountDueNow)}
                    </p>
                    {order.balance > 0 && (
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {formatNairaExact(order.balance)} outstanding
                      </p>
                    )}
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
