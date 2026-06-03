import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import {
  preOrderSlots,
  originCountries,
  formatNaira,
  type PreOrderSlot,
} from '@/lib/carData';

export const metadata: Metadata = {
  title: 'Pre-orders · ChiefBaranda',
  description:
    'Pre-order your next car directly from verified dealers and importers. No agents, no middleman markup. Deposit small, pick up in Lagos, Abuja or PH.',
};

const steps = [
  {
    n: '01',
    title: 'Tell us the car',
    body: 'Pick from open slots or send the exact spec year, trim, mileage band, colour. We confirm what we can find and at what price within 48 hours.',
  },
  {
    n: '02',
    title: 'Lock it with a deposit',
    body: 'A small deposit (usually 8–12% of the price) reserves the unit. Funds sit in escrow with our partner bank until the car lands.',
  },
  {
    n: '03',
    title: 'We ship and clear',
    body: 'You get tracking updates from port to port. Customs duty, terminal charges and inland delivery are all itemised no surprise bills.',
  },
  {
    n: '04',
    title: 'Inspect, then pay the balance',
    body: 'You inspect at our Lagos, Abuja or PH yard. If anything is off, walk away your deposit is refunded. Otherwise, balance unlocks the keys.',
  },
];

const faqs = [
  {
    q: 'What if the car doesn’t arrive in the condition promised?',
    a: 'Every pre-order is covered by our condition guarantee. If the unit arrives outside the agreed grade, you can walk away during inspection and the deposit is refunded in full within 5 business days.',
  },
  {
    q: 'Who holds my deposit?',
    a: 'Deposits are held in a dedicated escrow account with Providus Bank. ChiefBaranda cannot touch the funds until you sign off at inspection or until a refund is triggered.',
  },
  {
    q: 'Can I pre-order a car that isn’t on the list?',
    a: 'Yes. Most of our pre-orders are bespoke. Send the spec and we’ll source it from our partners in the US, UAE, UK and Germany.',
  },
  {
    q: 'How is the final price calculated?',
    a: 'The price you see on this page is the all-in landed price vehicle + freight + customs duty + clearing + inland delivery. No hidden agent fees.',
  },
];

export default async function PreOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const activeCountry = originCountries.find((c) => c.slug === from);
  const visibleSlots = activeCountry
    ? preOrderSlots.filter((s) => s.origin === activeCountry.slug)
    : preOrderSlots;

  return (
    <div className="bg-white">
      <section className="relative border-b border-neutral-100 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 30%, #16a34a 0%, transparent 50%), radial-gradient(circle at 85% 70%, #0a0a0a 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-12 lg:pt-20 lg:pb-16">

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-800 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                14 active slots this week
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
                Order the car.
                <br />
                Skip the <span className="text-green-600">middleman.</span>
              </h1>
              <p className="mt-5 text-lg text-neutral-600 max-w-xl">
                Reserve directly from verified importers. Deposit small, track the
                ship in real time, inspect before you pay the balance. The way it
                should have been all along.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#open-slots"
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  See open slots
                  <Arrow />
                </a>
                <Link
                  href="/pre-orders/custom"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-800 hover:border-neutral-900"
                >
                  Request a custom spec
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 mb-4">
                  In transit right now
                </p>
                <ul className="space-y-4">
                  <ShipRow
                    car="2024 Lexus RX 350"
                    route="Long Beach → Lagos"
                    eta="Arrives in 11 days"
                  />
                  <ShipRow
                    car="2023 Toyota Hilux"
                    route="Jebel Ali → Tin Can"
                    eta="Arrives in 18 days"
                  />
                  <ShipRow
                    car="2022 BMW X5 xDrive40i"
                    route="Bremerhaven → PH"
                    eta="Arrives in 24 days"
                  />
                </ul>
                <Link
                  href="/pre-orders/tracking"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-green-700"
                >
                  Track a shipment
                  <Arrow small />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-3">
                How it works
              </p>
              <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
                Four steps. No phone calls at midnight.
              </h2>
              <p className="mt-4 text-neutral-600">
                We&apos;ve done this many times. Every step is itemized so you
                can see exactly where your money is and what happens next.
              </p>
            </div>

            <ol className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="rounded-xl border border-neutral-200 p-6 hover:border-neutral-900 transition-colors"
                >
                  <p className="font-mono text-xs text-green-700 mb-3">{s.n}</p>
                  <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="open-slots" className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20 scroll-mt-24">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-neutral-900">
              {activeCountry ? `Open slots from ${activeCountry.name}` : 'Open slots'}
            </h2>
            <p className="mt-2 text-neutral-600">
              Spots refresh every Monday. Prices are the all-in landed cost.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Sort:</span>
            <button type="button" className="font-medium text-neutral-900 underline decoration-green-600 decoration-2 underline-offset-4">
              Earliest ETA
            </button>
            <span className="text-neutral-300">·</span>
            <button type="button" className="text-neutral-500 hover:text-neutral-900">Price</button>
          </div>
        </div>

        {/* Filter by where the car ships from */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/pre-orders#open-slots"
            className={[
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              !activeCountry
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400',
            ].join(' ')}
          >
            All countries
          </Link>
          {originCountries.map((c) => {
            const isActive = c.slug === activeCountry?.slug;
            return (
              <Link
                key={c.slug}
                href={`/pre-orders?from=${c.slug}#open-slots`}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400',
                ].join(' ')}
              >
                <span>{c.flag}</span>
                {c.name}
              </Link>
            );
          })}
        </div>

        {visibleSlots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleSlots.map((s) => (
              <SlotCard key={s.id} s={s} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-neutral-500">
              No open slots from {activeCountry?.name} right now.
            </p>
            <Link
              href="/pre-orders#open-slots"
              className="mt-3 inline-block text-sm font-medium text-green-700 hover:text-green-800 underline underline-offset-2"
            >
              See all countries
            </Link>
          </div>
        )}
      </section>

      <section className="border-y border-neutral-100 bg-neutral-50/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Honest questions, honest answers.
            </h2>
            <p className="mt-3 text-neutral-600">
              If you don&apos;t see your question, send us a WhatsApp on{' '}
              <a
                href="https://wa.me/2348000000000"
                className="text-neutral-900 underline underline-offset-2 hover:text-green-700"
              >
                +234 800 0000 000
              </a>
              .
            </p>
          </div>

          <div className="lg:col-span-8 divide-y divide-neutral-200">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-neutral-900 pr-4">{f.q}</h3>
                  <span className="mt-1 grid place-items-center h-7 w-7 rounded-full border border-neutral-300 text-neutral-600 group-open:bg-neutral-900 group-open:text-white group-open:border-neutral-900 transition-colors shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-45 transition-transform">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-neutral-600 leading-relaxed pr-12">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div className="rounded-2xl border border-neutral-200 p-8 lg:p-12 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div className="flex-1">
            <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight text-neutral-900">
              Still on the fence?
            </h3>
            <p className="mt-2 text-neutral-600 max-w-xl">
              Book a 15-minute call with our sourcing team. We&apos;ll walk you
              through what&apos;s available in your budget and what to actually
              avoid this quarter.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/book-call"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Book a call
              <Arrow />
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-800 hover:border-neutral-900"
            >
              Browse categories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SlotCard({ s }: { s: PreOrderSlot }) {
  const urgent = s.remaining <= 2;
  return (
    <article className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:border-neutral-900 transition-colors flex flex-col">
      <div className="relative aspect-16/10 bg-linear-to-br from-neutral-100 to-neutral-50">
        <Image
          src={s.image}
          alt={`${s.title} — ${s.trim}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain p-5 group-hover:scale-[1.03] transition-transform duration-500"
        />
        <span
          className={[
            'absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
            urgent ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white/90 backdrop-blur text-neutral-700',
          ].join(' ')}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${urgent ? 'bg-red-600' : 'bg-green-600'}`} />
          {s.remaining} {s.remaining === 1 ? 'slot' : 'slots'} left
        </span>
        <span className="absolute top-4 right-4 rounded-full bg-neutral-900/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-white">
          {s.eta}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-neutral-900">{s.title}</h3>
            <p className="text-sm text-neutral-500 mt-0.5">{s.trim}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-neutral-500">All-in</dt>
            <dd className="font-semibold text-neutral-900 mt-0.5">{formatNaira(s.fromPrice)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-neutral-500">Deposit</dt>
            <dd className="font-semibold text-neutral-900 mt-0.5">{formatNaira(s.deposit)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-neutral-500">From</dt>
            <dd className="text-neutral-700 mt-0.5">{s.source}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-neutral-500">Port</dt>
            <dd className="text-neutral-700 mt-0.5">{s.port}</dd>
          </div>
        </dl>

        <Link
          href={`/pre-orders/${s.id}`}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Reserve a slot
          <Arrow small />
        </Link>
      </div>
    </article>
  );
}

function ShipRow({ car, route, eta }: { car: string; route: string; eta: string }) {
  return (
    <li className="flex items-center gap-4">
      <span className="grid place-items-center h-10 w-10 rounded-full bg-green-50 text-green-700 shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1" />
          <path d="M4 18l-2-6h20l-2 6" />
          <path d="M12 10V4M9 4h6" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 truncate">{car}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{route}</p>
      </div>
      <span className="text-xs font-medium text-neutral-600 whitespace-nowrap">{eta}</span>
    </li>
  );
}

function Arrow({ small = false }: { small?: boolean }) {
  const s = small ? 14 : 16;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
