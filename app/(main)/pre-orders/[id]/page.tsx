import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getPreOrderSlot } from '@/lib/catalog';
import { formatNairaExact, originCountries, conditionLabels } from '@/lib/carData';
import { depositLabel, quoteOrder } from '@/lib/config';

export async function generateMetadata({
  params,
}: PageProps<'/pre-orders/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const slot = await getPreOrderSlot(id);

  if (!slot) return { title: 'Pre-order not found · ChiefBaranda' };

  return {
    title: `Pre-order ${slot.title} ${slot.trim} · ChiefBaranda`,
    description: `Reserve a ${slot.title} ${slot.trim} from ${slot.source}. ${depositLabel(
      'pre-order'
    )} deposit, balance when it lands at ${slot.port}.`,
  };
}

const timeline = [
  { title: 'You reserve', body: 'Deposit goes into escrow and your slot is taken off the list.' },
  { title: 'We source and buy', body: 'Our partner secures the exact unit and sends you photos before it ships.' },
  { title: 'On the water', body: 'You get tracking updates from port to port, with duty and clearing itemised.' },
  { title: 'Inspect and collect', body: 'Check it at our yard. Happy? Pay the balance and take the keys.' },
];

export default async function PreOrderDetailPage({ params }: PageProps<'/pre-orders/[id]'>) {
  const { id } = await params;
  const slot = await getPreOrderSlot(id);

  if (!slot) notFound();

  const quote = quoteOrder({ price: slot.fromPrice, kind: 'pre-order', plan: 'deposit' });
  const country = originCountries.find((c) => c.slug === slot.origin);
  const soldOut = slot.remaining <= 0 || !slot.active;
  const urgent = slot.remaining > 0 && slot.remaining <= 2;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <nav className="text-sm text-neutral-500 mb-6">
          <Link href="/pre-orders" className="hover:text-neutral-900">
            Pre-orders
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">{slot.title}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-linear-to-br from-neutral-100 to-neutral-50">
              <Image
                src={slot.image}
                alt={`${slot.title} ${slot.trim}`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain p-8"
                priority
              />
              <span className="absolute top-4 right-4 rounded-full bg-neutral-900/90 backdrop-blur px-3 py-1 text-xs font-medium text-white">
                {slot.eta}
              </span>
            </div>

            <h2 className="mt-10 text-lg font-semibold tracking-tight text-neutral-900">
              How this pre-order runs
            </h2>
            <ol className="mt-5 space-y-5">
              {timeline.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-neutral-900">{step.title}</p>
                    <p className="text-sm text-neutral-600 mt-0.5 leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 rounded-2xl border border-neutral-200 p-5">
              <p className="text-sm text-neutral-600 leading-relaxed">
                The price shown is the <strong className="text-neutral-900">all-in landed
                price</strong> — vehicle, freight, customs duty, clearing and inland delivery to{' '}
                {slot.port}. No agent fees are added later.
              </p>
            </div>
          </div>

          {/* Reserve panel */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                    {slot.title}
                  </h1>
                  <p className="mt-1 text-sm text-neutral-500">{slot.trim}</p>
                </div>
                <span
                  className={[
                    'shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border',
                    soldOut
                      ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      : urgent
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-green-50 text-green-700 border-green-200',
                  ].join(' ')}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      soldOut ? 'bg-neutral-400' : urgent ? 'bg-red-600' : 'bg-green-600'
                    }`}
                  />
                  {soldOut
                    ? 'Fully booked'
                    : `${slot.remaining} ${slot.remaining === 1 ? 'slot' : 'slots'} left`}
                </span>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight text-neutral-900">
                {formatNairaExact(slot.fromPrice)}
              </p>
              <p className="text-sm text-neutral-500 mt-1">All-in, landed at {slot.port}</p>

              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-neutral-500">From</dt>
                  <dd className="text-neutral-900 font-medium mt-0.5">
                    {country ? `${country.flag} ` : ''}
                    {slot.source}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-neutral-500">Arrives</dt>
                  <dd className="text-neutral-900 font-medium mt-0.5">{slot.eta}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-neutral-500">Port</dt>
                  <dd className="text-neutral-900 font-medium mt-0.5">{slot.port}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-neutral-500">
                    Condition
                  </dt>
                  <dd className="text-neutral-900 font-medium mt-0.5">
                    {conditionLabels[slot.condition]}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 rounded-xl bg-neutral-50 border border-neutral-100 p-4">
                <p className="text-sm text-neutral-600">
                  Reserve with{' '}
                  <span className="font-semibold text-neutral-900">
                    {formatNairaExact(quote.amountDueNow)}
                  </span>{' '}
                  ({depositLabel('pre-order')}). The balance of{' '}
                  {formatNairaExact(quote.balance)} is only due once the car lands and you have
                  inspected it.
                </p>
              </div>

              {soldOut ? (
                <p className="mt-6 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-600 text-center">
                  Every slot on this run is taken
                </p>
              ) : (
                <Link
                  href={`/checkout?kind=pre-order&listing=${encodeURIComponent(slot.id)}`}
                  className="mt-6 flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3.5 font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  Reserve a slot
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              <p className="mt-4 text-xs text-neutral-500 text-center">
                Deposit refunded in full if you walk away at inspection.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
