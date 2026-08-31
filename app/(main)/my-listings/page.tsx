import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { formatNairaExact, conditionLabels } from '@/lib/carData';
import type { Car } from '@/lib/models/Car';

export const metadata: Metadata = {
  title: 'My listings · ChiefBaranda',
};

export const dynamic = 'force-dynamic';

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/signin?redirect=/my-listings');

  if (user.userType !== 'seller') {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">You&apos;re not a seller yet</h1>
          <p className="text-neutral-600 leading-relaxed mb-6">
            Apply to sell on ChiefBaranda and, once we verify your shop, your listings
            will show up here.
          </p>
          <Link
            href="/become-seller"
            className="inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Apply to sell
          </Link>
        </div>
      </div>
    );
  }

  const listings = (await prisma.car.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: 'desc' },
  })) as Car[];

  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">
          Your listings
        </h1>
        <p className="mt-3 text-neutral-600">
          The cars you have on the marketplace, and how each one is doing.
        </p>

        {listings.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-neutral-200 px-6 py-14 text-center">
            <p className="text-neutral-900 font-medium">No listings yet</p>
            <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
              Your shop is approved. Our team uploads your first batch with you — send
              them photos and papers and they will go live here.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Talk to our team
            </Link>
          </div>
        ) : (
          <ul className="mt-10 space-y-4">
            {listings.map((car) => (
              <li
                key={car.id}
                className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl border border-neutral-200 p-5"
              >
                <div className="relative h-20 w-28 shrink-0 rounded-xl bg-neutral-100 overflow-hidden">
                  <Image
                    src={car.images[0] || '/logo.png'}
                    alt={car.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-neutral-900">
                    <Link
                      href={`/cars/${car.slug || car.id}`}
                      className="hover:text-green-700"
                    >
                      {car.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {conditionLabels[car.condition]} · {car.location || 'Nigeria'}
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <p className="font-semibold text-neutral-900">{formatNairaExact(car.price)}</p>
                  <p className="text-xs text-neutral-500 mt-0.5 capitalize">
                    {car.status || 'available'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
