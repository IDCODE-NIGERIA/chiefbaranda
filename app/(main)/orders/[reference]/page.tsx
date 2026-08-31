import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { getCurrentUser } from '@/lib/session';
import { getOrderByReference } from '@/lib/orders';
import { formatNairaExact, safeImageSrc} from '@/lib/carData';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import type { OrderStatus } from '@/lib/models/Order';

export const metadata: Metadata = {
  title: 'Order · ChiefBaranda',
};

export const dynamic = 'force-dynamic';

/** Fulfilment stages shown as a progress trail. */
const stages: { status: OrderStatus; title: string; body: string }[] = [
  { status: 'paid', title: 'Payment received', body: 'Your deposit is in escrow.' },
  { status: 'in-transit', title: 'On the way', body: 'The car is shipping to Nigeria.' },
  { status: 'ready', title: 'Ready for inspection', body: 'Come and see it at our yard.' },
  { status: 'completed', title: 'Completed', body: 'Balance settled, keys handed over.' },
];

export default async function OrderDetailPage({ params }: PageProps<'/orders/[reference]'>) {
  const { reference } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/signin?redirect=/orders/${reference}`);

  const order = await getOrderByReference(reference);
  if (!order) notFound();

  const ownsOrder =
    String(order.userId) === user.id ||
    order.buyerEmail === user.email.toLowerCase();

  if (!ownsOrder && !user.isAdmin) {
    notFound();
  }

  const reachedIndex = stages.findIndex((s) => s.status === order.status);
  const isLive = order.status !== 'pending' && order.status !== 'failed' && order.status !== 'cancelled';

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <nav className="text-sm text-neutral-500 mb-6">
          <Link href="/orders" className="hover:text-neutral-900">
            My orders
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 font-mono">{order.reference}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative h-24 w-32 shrink-0 rounded-2xl bg-neutral-100 overflow-hidden">
            <Image
              src={safeImageSrc(order.listingImage)}
              alt={order.listingTitle}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {order.listingTitle}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1.5 text-sm text-neutral-500">
              {order.kind === 'pre-order' ? 'Pre-order' : 'Purchase'} · placed{' '}
              {new Date(order.createdAt).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {order.status === 'pending' && order.paystackAuthorizationUrl && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-medium text-amber-900">This order is not paid for yet</p>
            <p className="mt-1 text-sm text-amber-800">
              Your slot is not reserved until the deposit lands.
            </p>
            <a
              href={order.paystackAuthorizationUrl}
              className="mt-4 inline-flex rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              Complete payment
            </a>
          </div>
        )}

        {/* Money */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-4">Payment</h2>
          <dl className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
            <DetailRow label="Car price" value={formatNairaExact(order.price)} />
            <DetailRow
              label={order.status === 'pending' ? 'Due now' : 'Paid'}
              value={formatNairaExact(order.amountDueNow)}
              emphasis
            />
            {order.financeFee > 0 && (
              <DetailRow label="Finance service charge" value={formatNairaExact(order.financeFee)} />
            )}
            <DetailRow
              label={
                order.financeMonths
                  ? `Balance over ${order.financeMonths} months`
                  : 'Balance on delivery'
              }
              value={formatNairaExact(order.balance)}
            />
            {order.monthlyInstalment > 0 && (
              <DetailRow
                label="Monthly instalment"
                value={formatNairaExact(order.monthlyInstalment)}
              />
            )}
            <DetailRow label="Reference" value={order.reference} mono />
            {order.paidAt && (
              <DetailRow
                label="Paid on"
                value={new Date(order.paidAt).toLocaleString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
            )}
          </dl>
        </section>

        {/* Progress */}
        {isLive && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-4">Progress</h2>
            <ol className="rounded-2xl border border-neutral-200 p-6 space-y-6">
              {stages.map((stage, i) => {
                const done = reachedIndex >= i;
                return (
                  <li key={stage.status} className="flex gap-4">
                    <span
                      className={[
                        'grid place-items-center h-8 w-8 shrink-0 rounded-full text-sm font-semibold',
                        done ? 'bg-green-600 text-white' : 'bg-neutral-100 text-neutral-400',
                      ].join(' ')}
                    >
                      {done ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div>
                      <p className={done ? 'font-medium text-neutral-900' : 'font-medium text-neutral-400'}>
                        {stage.title}
                      </p>
                      <p className="text-sm text-neutral-500 mt-0.5">{stage.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Delivery */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-4">
            Delivery details
          </h2>
          <dl className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
            <DetailRow label="Name" value={order.buyerName} />
            <DetailRow label="Email" value={order.buyerEmail} />
            <DetailRow label="Phone" value={order.buyerPhone} />
            <DetailRow
              label="Address"
              value={`${order.buyerAddress}, ${order.buyerCity}, ${order.buyerState}`}
            />
            {order.buyerNotes && <DetailRow label="Notes" value={order.buyerNotes} />}
          </dl>
        </section>

        <p className="mt-10 text-sm text-neutral-500">
          Questions about this order?{' '}
          <Link href="/contact" className="text-green-700 font-medium hover:underline">
            Talk to our team
          </Link>{' '}
          and quote <span className="font-mono">{order.reference}</span>.
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  emphasis = false,
  mono = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4 px-5 py-4">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd
        className={[
          'text-sm text-right',
          emphasis ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-800',
          mono ? 'font-mono' : '',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  );
}
