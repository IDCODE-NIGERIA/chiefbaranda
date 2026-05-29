import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories · ChiefBaranda',
  description:
    'Browse cars by body type, fuel, and lifestyle — from city runabouts to long-haul SUVs. Verified Nigerian sellers only.',
};

type Category = {
  slug: string;
  name: string;
  blurb: string;
  count: number;
  fromPrice: number;
  image: string;
  tone: 'sand' | 'forest' | 'ink' | 'rust';
};

const categories: Category[] = [
  {
    slug: 'sedan',
    name: 'Sedans',
    blurb: 'Office-to-Lekki staples. Easy fuel, easy parking.',
    count: 412,
    fromPrice: 3_200_000,
    image: '/cs1.png',
    tone: 'forest',
  },
  {
    slug: 'suv',
    name: 'SUVs',
    blurb: 'Built for the bad roads between here and the village.',
    count: 287,
    fromPrice: 8_500_000,
    image: '/cs2.png',
    tone: 'ink',
  },
  {
    slug: 'truck',
    name: 'Pickups & Trucks',
    blurb: 'Work horses. Hilux, Tacoma, Ranger — the lot.',
    count: 96,
    fromPrice: 6_900_000,
    image: '/cs3.png',
    tone: 'rust',
  },
  {
    slug: 'coupe',
    name: 'Coupés',
    blurb: 'Weekend cars. The ones you wash on Saturday morning.',
    count: 54,
    fromPrice: 12_000_000,
    image: '/cs4.png',
    tone: 'sand',
  },
  {
    slug: 'hatchback',
    name: 'Hatchbacks',
    blurb: 'First-car energy. Cheap to feed, easy to flip.',
    count: 173,
    fromPrice: 2_400_000,
    image: '/list1.png',
    tone: 'sand',
  },
  {
    slug: 'van',
    name: 'Vans & Buses',
    blurb: 'School runs, logistics, church convoys.',
    count: 68,
    fromPrice: 5_500_000,
    image: '/list2.png',
    tone: 'forest',
  },
  {
    slug: 'electric',
    name: 'Electric & Hybrid',
    blurb: 'Skip the fuel queues. Charging in Lagos, Abuja, PH.',
    count: 31,
    fromPrice: 18_000_000,
    image: '/list3.png',
    tone: 'ink',
  },
  {
    slug: 'luxury',
    name: 'Luxury',
    blurb: 'When the project finally paid out.',
    count: 42,
    fromPrice: 28_000_000,
    image: '/list4.png',
    tone: 'rust',
  },
];

const lifestyle = [
  { label: 'Under ₦5m', href: '/categories/under-5m' },
  { label: 'First-time buyers', href: '/categories/first-car' },
  { label: 'Family of 5+', href: '/categories/family' },
  { label: 'Rideshare-ready', href: '/categories/rideshare' },
  { label: 'Tokunbo (Foreign-used)', href: '/categories/tokunbo' },
  { label: 'Brand new', href: '/categories/brand-new' },
];

const toneStyles: Record<Category['tone'], string> = {
  forest: 'from-emerald-100 to-emerald-50',
  ink: 'from-neutral-200 to-neutral-50',
  rust: 'from-orange-100 to-amber-50',
  sand: 'from-amber-100 to-stone-50',
};

function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}m`;
  return `₦${n.toLocaleString()}`;
}

export default function CategoriesPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-10 lg:pt-20 lg:pb-14">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <nav className="text-sm text-neutral-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-neutral-900">Home</Link>
              <span className="mx-2 text-neutral-300">/</span>
              <span className="text-neutral-900">Categories</span>
            </nav>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Home
            </Link>
          </div>

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
                Sorted by body type and the kind of day you&apos;re having. Every
                listing is from a verified seller — no agents in the middle, no
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

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            By body type
          </h2>
          <Link
            href="/listings"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-green-700"
          >
            See all listings
            <Arrow />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c, i) => (
            <CategoryCard key={c.slug} c={c} feature={i === 0} />
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-100 bg-neutral-50/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                Or shop by lifestyle
              </h2>
              <p className="mt-3 text-neutral-600">
                Not sure what fits? Start from how you&apos;ll use the car —
                we&apos;ll surface the right body types for you.
              </p>
            </div>

            <div className="lg:col-span-8 flex flex-wrap gap-3 self-start">
              {lifestyle.map((l) => (
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

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div className="rounded-2xl bg-neutral-950 text-white px-8 py-10 lg:px-14 lg:py-14 flex flex-col lg:flex-row lg:items-center gap-8 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
          />
          <div className="flex-1 relative">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-400 mb-3">
              Can&apos;t find it?
            </p>
            <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight max-w-xl">
              Tell us the spec. We&apos;ll find the car — or pre-order it.
            </h3>
            <p className="mt-3 text-neutral-300 max-w-xl">
              Some buyers come knowing they want a 2018 Camry SE, sand-coloured,
              under 80k miles. Tell us yours. We&apos;ll come back within 48 hours.
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

function CategoryCard({ c, feature }: { c: Category; feature?: boolean }) {
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

      <div className="p-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">{c.name}</h3>
          <p className="mt-1 text-sm text-neutral-600 leading-snug">{c.blurb}</p>
          <p className="mt-3 text-xs text-neutral-500">
            From <span className="font-semibold text-neutral-900">{formatNaira(c.fromPrice)}</span>
          </p>
        </div>
        <span className="mt-1 grid place-items-center h-9 w-9 rounded-full bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
          <Arrow small />
        </span>
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
