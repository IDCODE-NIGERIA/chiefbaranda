import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getCar } from '@/lib/catalog';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import SaveCarButton from '@/components/SaveCarButton';
import { formatNairaExact, conditionLabels, conditionColors, safeImageSrc} from '@/lib/carData';
import { depositLabel, quoteOrder } from '@/lib/config';

export async function generateMetadata({
  params,
}: PageProps<'/cars/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const car = await getCar(id);

  if (!car) return { title: 'Car not found · ChiefBaranda' };

  return {
    title: `${car.title} · ChiefBaranda`,
    description: car.description,
    openGraph: { images: car.images.length ? [{ url: car.images[0] }] : undefined },
  };
}

export default async function CarPage({ params }: PageProps<'/cars/[id]'>) {
  const { id } = await params;
  const car = await getCar(id);

  if (!car) notFound();

  // Whether this buyer has already saved it, so the heart renders filled.
  const viewer = await getCurrentUser();
  const alreadySaved = viewer
    ? Boolean(
        await prisma.savedCar.findUnique({
          where: { userId_listingId: { userId: viewer.id, listingId: car.slug } },
        })
      )
    : false;

  const listingId = car.slug || car.id;
  const quote = quoteOrder({ price: car.price, kind: 'buy', plan: 'deposit' });
  const sold = car.status === 'sold';
  const tone = conditionColors[car.condition];

  const specs = [
    { label: 'Year', value: car.year?.toString() },
    { label: 'Mileage', value: car.mileage ? `${car.mileage.toLocaleString()} km` : null },
    { label: 'Transmission', value: car.transmission },
    { label: 'Fuel', value: car.fuel },
    { label: 'Colour', value: car.color },
    { label: 'Body type', value: car.type },
    { label: 'Location', value: car.location },
    { label: 'Chassis (VIN)', value: car.vin },
  ].filter((s) => s.value);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <nav className="text-sm text-neutral-500 mb-6">
          <Link href="/categories" className="hover:text-neutral-900">
            Categories
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">{car.title}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-neutral-100">
              <Image
                src={safeImageSrc(car.images[0])}
                alt={car.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
              <span
                className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tone.bg} ${tone.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                {conditionLabels[car.condition]}
              </span>
            </div>

            <h2 className="mt-10 text-lg font-semibold tracking-tight text-neutral-900">
              About this car
            </h2>
            <p className="mt-3 text-neutral-600 leading-relaxed">{car.description}</p>

            <h2 className="mt-10 text-lg font-semibold tracking-tight text-neutral-900">Specs</h2>
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-[11px] uppercase tracking-wider text-neutral-500">
                    {spec.label}
                  </dt>
                  <dd className="text-sm font-medium text-neutral-900 mt-1 capitalize break-words">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>

            {car.vin && (
              <p className="mt-8 text-sm text-neutral-500">
                Don&apos;t take our word for it —{' '}
                <Link href="/#vin" className="text-green-700 font-medium hover:underline">
                  run this VIN yourself
                </Link>{' '}
                and confirm the factory spec matches.
              </p>
            )}
          </div>

          {/* Buy panel */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-neutral-200 p-6">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{car.title}</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Sold by {car.sellerName}
                {car.sellerVerified && (
                  <span className="ml-2 inline-flex items-center gap-1 text-green-700 font-medium">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Verified
                  </span>
                )}
              </p>

              <p className="mt-5 text-3xl font-semibold tracking-tight text-neutral-900">
                {formatNairaExact(car.price)}
              </p>

              <div className="mt-5 rounded-xl bg-neutral-50 border border-neutral-100 p-4">
                <p className="text-sm text-neutral-600">
                  Pay{' '}
                  <span className="font-semibold text-neutral-900">
                    {formatNairaExact(quote.amountDueNow)}
                  </span>{' '}
                  ({depositLabel('buy')}) to lock this car. The remaining{' '}
                  {formatNairaExact(quote.balance)} is due after you inspect it — or spread it
                  monthly at checkout.
                </p>
              </div>

              {sold ? (
                <p className="mt-6 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-600 text-center">
                  This car has been sold
                </p>
              ) : (
                <Link
                  href={`/checkout?kind=buy&listing=${encodeURIComponent(listingId)}`}
                  className="mt-6 flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3.5 font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  Buy now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              <div className="mt-3">
                <SaveCarButton listingId={listingId} initialSaved={alreadySaved} />
              </div>

              <ul className="mt-6 space-y-2.5 text-sm text-neutral-600">
                {[
                  'Money held in escrow until you inspect',
                  'Full refund if the car is not as described',
                  'Inspect in Lagos, Abuja or Port Harcourt',
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
