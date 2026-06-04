import Link from 'next/link';
import Image from 'next/image';

import { formatNaira, type PreOrderSlot } from '@/lib/carData';

export default function PreOrderCard({ s }: { s: PreOrderSlot }) {
  const urgent = s.remaining <= 2;
  return (
    <article className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:border-neutral-900 transition-colors flex flex-col">
      <div className="relative aspect-16/10 bg-linear-to-br from-neutral-100 to-neutral-50">
        <Image
          src={s.image}
          alt={`${s.title} ${s.trim}`}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
