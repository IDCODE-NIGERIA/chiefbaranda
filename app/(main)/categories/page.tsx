'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BrandDropdown from '@/components/BrandDropdown';
import ConditionTabs from '@/components/ConditionTabs';
import {
  bodyTypes,
  brands,
  lifestyleFilters,
  formatNaira,
  conditionLabels,
  conditionColors,
  type BodyType,
  type Condition,
} from '../../../lib/carData';

const toneStyles: Record<BodyType['tone'], string> = {
  forest: 'from-emerald-100 to-emerald-50',
  ink: 'from-neutral-200 to-neutral-50',
  rust: 'from-orange-100 to-amber-50',
  sand: 'from-amber-100 to-stone-50',
};

// Simulated condition availability per body type for client-side demo.
// In production this comes from the database.
const bodyTypeConditions: Record<string, Condition[]> = {
  sedan: ['brand-new', 'foreign-used', 'nigerian-used'],
  suv: ['brand-new', 'foreign-used', 'nigerian-used'],
  truck: ['brand-new', 'foreign-used'],
  coupe: ['foreign-used', 'nigerian-used'],
  hatchback: ['brand-new', 'foreign-used', 'nigerian-used'],
  van: ['foreign-used', 'nigerian-used'],
  electric: ['brand-new', 'foreign-used'],
  luxury: ['brand-new', 'foreign-used'],
};

export default function CategoriesPage() {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<'all' | Condition>('all');

  const filteredCategories = useMemo(() => {
    let result = bodyTypes;

    if (selectedCondition !== 'all') {
      result = result.filter((bt) => {
        const conditions = bodyTypeConditions[bt.slug] || [];
        return conditions.includes(selectedCondition);
      });
    }

    return result;
  }, [selectedCondition]);

  const activeBrand = brands.find((b) => b.slug === selectedBrand);

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-10 lg:pt-20 lg:pb-14">

          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-3">
                Browse the lot
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
                Find a car that fits the
                <br />
                way you actually <span className="text-green-600">drive.</span>
              </h1>
              <p className="mt-5 text-lg text-neutral-600 max-w-2xl">
                Sorted by body type and the kind of car you need. Every listing
                is from a verified seller with no agents in the middle and no
                inflated prices.
              </p>
            </div>

            <div className="lg:col-span-4 grid grid-cols-3 gap-4">
              <Stat n="1,163" label="live listings" />
              <Stat n="92" label="cities covered" />
              <Stat n="48h" label="avg. response" />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-neutral-100 bg-neutral-50/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <BrandDropdown value={selectedBrand} onChange={setSelectedBrand} />
              <ConditionTabs active={selectedCondition} onChange={setSelectedCondition} />
            </div>

            {(selectedBrand || selectedCondition !== 'all') && (
              <button
                type="button"
                onClick={() => { setSelectedBrand(''); setSelectedCondition('all'); }}
                className="text-sm text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>

          {activeBrand && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-white border border-neutral-200 px-4 py-3">
              <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-700">
                {activeBrand.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{activeBrand.name}</p>
                <p className="text-xs text-neutral-500">{activeBrand.tagline}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pre-order promo */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 lg:pt-16">
        <Link
          href="/pre-orders"
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-neutral-200 bg-linear-to-br from-emerald-50 to-white px-6 py-6 lg:px-8 hover:border-neutral-900 transition-colors"
        >
          <div className="flex items-start gap-4">
            <span className="grid place-items-center h-12 w-12 shrink-0 rounded-full bg-green-600 text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1" />
                <path d="M4 18l-2-6h20l-2 6" />
                <path d="M12 10V4M9 4h6" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-1">
                Not in stock yet?
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold tracking-tight text-neutral-900">
                Pre-order it directly from verified importers
              </h2>
              <p className="mt-1 text-sm text-neutral-600 max-w-xl">
                Deposit small, track the shipment, inspect before you pay the
                balance. No agents, no middleman markup.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white group-hover:bg-neutral-800 whitespace-nowrap">
            Browse pre-orders
            <Arrow small />
          </span>
        </Link>
      </section>

      {/* Body Type Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              {selectedBrand ? `${activeBrand?.name} by body type` : 'By body type'}
            </h2>
            {selectedCondition !== 'all' && (
              <p className="mt-1 text-sm text-neutral-500">
                Showing {conditionLabels[selectedCondition].toLowerCase()} listings only
              </p>
            )}
          </div>
          <Link
            href="/listings"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-green-700"
          >
            See all listings
            <Arrow />
          </Link>
        </div>

        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((c, i) => (
              <CategoryCard key={c.slug} c={c} feature={i === 0} conditions={bodyTypeConditions[c.slug] || []} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <p className="text-neutral-500">No categories match your filters.</p>
            <button
              type="button"
              onClick={() => { setSelectedBrand(''); setSelectedCondition('all'); }}
              className="mt-3 text-sm font-medium text-green-700 hover:text-green-800 underline underline-offset-2"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Lifestyle */}
      <section className="border-t border-neutral-100 bg-neutral-50/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                Or shop by lifestyle
              </h2>
              <p className="mt-3 text-neutral-600">
                Not sure what fits? Start from how you will use the car and
                we will surface the right body types for you.
              </p>
            </div>

            <div className="lg:col-span-8 flex flex-wrap gap-3 self-start">
              {lifestyleFilters.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-800 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                >
                  {l.label}
                  <Arrow small />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div className="rounded-2xl bg-neutral-950 text-white px-8 py-10 lg:px-14 lg:py-14 flex flex-col lg:flex-row lg:items-center gap-8 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
          />
          <div className="flex-1 relative">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-400 mb-3">
              Can not find it?
            </p>
            <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight max-w-xl">
              Tell us the spec. We will find the car or pre-order it for you.
            </h3>
            <p className="mt-3 text-neutral-300 max-w-xl">
              Some buyers come knowing they want a 2018 Camry SE, sand colour,
              under 80k miles. Tell us yours. We will come back within 48 hours.
            </p>
          </div>
          <div className="flex gap-3 relative">
            <Link
              href="/pre-orders"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
            >
              Start a pre-order
              <Arrow />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="border-l-2 border-green-600 pl-3">
      <p className="text-2xl font-semibold text-neutral-900">{n}</p>
      <p className="text-xs text-neutral-500 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function CategoryCard({ c, feature, conditions }: { c: BodyType; feature?: boolean; conditions: Condition[] }) {
  return (
    <Link
      href={`/categories/${c.slug}`}
      className={[
        'group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white hover:border-neutral-900 transition-colors',
        feature ? 'sm:col-span-2 lg:col-span-2 lg:row-span-1' : '',
      ].join(' ')}
    >
      <div
        className={`relative aspect-16/10 bg-linear-to-br ${toneStyles[c.tone]} ${
          feature ? 'lg:aspect-16/7' : ''
        }`}
      >
        <Image
          src={c.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain p-6 group-hover:scale-[1.03] transition-transform duration-500"
        />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-neutral-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
          {c.count} listed
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">{c.name}</h3>
            <p className="mt-1 text-sm text-neutral-600 leading-snug">{c.blurb}</p>
          </div>
          <span className="mt-1 grid place-items-center h-9 w-9 rounded-full bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors shrink-0">
            <Arrow small />
          </span>
        </div>

        {/* Condition badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {conditions.map((cond) => (
            <span
              key={cond}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${conditionColors[cond].bg} ${conditionColors[cond].text}`}
            >
              <span className={`h-1 w-1 rounded-full ${conditionColors[cond].dot}`} />
              {conditionLabels[cond]}
            </span>
          ))}
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          From <span className="font-semibold text-neutral-900">{formatNaira(c.fromPrice)}</span>
        </p>
      </div>
    </Link>
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
