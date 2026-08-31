import Link from 'next/link';
import Image from 'next/image';

import InTransit from './InTransit';
import NotifyMeButton from './NotifyMeButton';
import { listCars, listPreOrderSlots } from '@/lib/catalog';
import { formatNairaExact, conditionLabels, safeImageSrc} from '@/lib/carData';

/**
 * Featured inventory on the home page. Server component — reads live listings
 * and open pre-order slots straight from the catalogue.
 */
export default async function Listings() {
  const [featured, slots] = await Promise.all([
    listCars({ featured: true, limit: 4 }),
    listPreOrderSlots(),
  ]);

  const comingSoon = slots.slice(0, 4);

  return (
    <>
      {/* Featured Listing Section */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Listing</h2>
            <Link
              href="/categories"
              className="text-sm font-medium text-green-700 hover:underline"
            >
              See all
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="text-gray-500">No listings are live right now. Check back shortly.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((car) => {
                // Static fallback listings have no _id, so the slug is the
                // stable identity here.
                const id = car.slug || car.id;
                const href = `/cars/${id}`;
                return (
                  <article
                    key={id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
                  >
                    <Link href={href} className="relative h-48 block">
                      <Image
                        src={safeImageSrc(car.images[0])}
                        alt={car.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover"
                      />
                      <span className="absolute bottom-3 left-3 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-green-800">
                        {car.sellerVerified ? 'Verified' : conditionLabels[car.condition]}
                      </span>
                    </Link>

                    <div className="p-5 space-y-4 flex-1 flex flex-col">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          <Link href={href} className="hover:text-green-700 transition-colors">
                            {car.title}
                          </Link>
                        </h3>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {formatNairaExact(car.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-auto">
                        <span className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                          📍 {car.location || 'Nigeria'}
                        </span>
                        <Link
                          href={href}
                          className="bg-green-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-800 transition-colors"
                        >
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <InTransit />

      {/* Coming Soon Section */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-green-700">Coming Soon</h2>
            <Link
              href="/pre-orders"
              className="text-sm font-medium text-green-700 hover:underline"
            >
              All pre-orders
            </Link>
          </div>

          <div className="border border-gray-200 rounded-3xl p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {comingSoon.map((slot) => (
                <div
                  key={slot.id}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm items-center"
                >
                  <Link href={`/pre-orders/${slot.id}`} className="relative h-24 w-24 shrink-0">
                    <Image
                      src={safeImageSrc(slot.image)}
                      alt={slot.title}
                      fill
                      sizes="96px"
                      className="object-cover rounded-xl"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      <Link href={`/pre-orders/${slot.id}`} className="hover:text-green-700">
                        {slot.title}
                      </Link>
                    </h3>
                    <p className="text-[11px] text-gray-500 font-semibold">
                      Arrives in {slot.eta}
                    </p>
                    <NotifyMeButton listingId={slot.id} listingTitle={slot.title} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
