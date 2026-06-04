import Link from 'next/link';

const shipments = [
  { car: '2024 Lexus RX 350', route: 'Long Beach → Lagos', eta: 'Arrives in 11 days' },
  { car: '2023 Toyota Hilux', route: 'Jebel Ali → Tin Can', eta: 'Arrives in 18 days' },
  { car: '2022 BMW X5 xDrive40i', route: 'Bremerhaven → PH', eta: 'Arrives in 24 days' },
];

export default function InTransit() {
  return (
    <section className="bg-neutral-50/60 border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-3">
              In transit right now
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
              Cars already on the
              <br />
              way to Nigeria.
            </h2>
            <p className="mt-4 text-neutral-600 max-w-md">
              These are pre-ordered units shipping in as we speak. Reserve a slot now
              and track yours from the port all the way to our yard.
            </p>
            <Link
              href="/pre-orders"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Browse pre-orders
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 lg:p-8">
              <ul className="space-y-5">
                {shipments.map((s) => (
                  <li key={s.car} className="flex items-center gap-4">
                    <span className="grid place-items-center h-10 w-10 rounded-full bg-green-50 text-green-700 shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1" />
                        <path d="M4 18l-2-6h20l-2 6" />
                        <path d="M12 10V4M9 4h6" />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{s.car}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{s.route}</p>
                    </div>
                    <span className="text-xs font-medium text-neutral-600 whitespace-nowrap">{s.eta}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pre-orders/tracking"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-green-700"
              >
                Track a shipment
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
