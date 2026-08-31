import Link from 'next/link';
import type { Metadata } from 'next';

import CheckoutForm from '@/components/CheckoutForm';
import { findListing } from '@/lib/catalog';
import { getCurrentUser } from '@/lib/session';
import type { OrderKind } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Checkout · ChiefBaranda',
  description: 'Confirm your details and pay your deposit securely.',
};

// Stock levels change per request, so never prerender this.
export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  searchParams,
}: PageProps<'/checkout'>) {
  const { kind: rawKind, listing: listingId } = await searchParams;

  const kind: OrderKind = rawKind === 'pre-order' ? 'pre-order' : 'buy';
  const [listing, user] = await Promise.all([
    typeof listingId === 'string' ? findListing(kind, listingId) : null,
    getCurrentUser(),
  ]);

  if (!listing) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">
            We couldn&apos;t find that car
          </h1>
          <p className="text-neutral-600 leading-relaxed mb-6">
            The listing may have been sold or taken down. Browse what&apos;s
            available right now instead.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/categories"
              className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Browse cars
            </Link>
            <Link
              href="/pre-orders"
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              See pre-orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!listing.available) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">
            {listing.title} is no longer available
          </h1>
          <p className="text-neutral-600 leading-relaxed mb-6">
            Someone got there first. We can source the same spec on a pre-order
            if you still want it.
          </p>
          <Link
            href="/pre-orders"
            className="inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Pre-order this model
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CheckoutForm
      listing={listing}
      prefill={
        user
          ? {
              fullName: `${user.firstName} ${user.lastName}`,
              email: user.email,
              phone: user.phone,
              address: user.address ?? '',
              city: user.city ?? '',
              state: user.state ?? '',
            }
          : undefined
      }
    />
  );
}
