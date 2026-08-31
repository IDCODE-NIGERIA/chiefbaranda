'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatNairaExact } from '@/lib/carData';

type VinListing = {
  id: string;
  title: string;
  price: number;
  image: string | null;
  condition: string;
  location: string | null;
  sellerName: string;
  sellerVerified: boolean;
  status: string;
  yearMismatch: boolean;
};

type VinResult = {
  vin: string;
  make: string | null;
  model: string | null;
  year: string | null;
  trim: string | null;
  bodyClass: string | null;
  vehicleType: string | null;
  fuelType: string | null;
  engineCylinders: string | null;
  displacementL: string | null;
  doors: string | null;
  driveType: string | null;
  transmission: string | null;
  manufacturer: string | null;
  plantCountry: string | null;
  partial: boolean;
  note: string | null;
  /** Set when this chassis number matches a car listed on ChiefBaranda. */
  listing: VinListing | null;
};

const specFields: { label: string; key: keyof VinResult }[] = [
  { label: 'Body type', key: 'bodyClass' },
  { label: 'Trim', key: 'trim' },
  { label: 'Fuel', key: 'fuelType' },
  { label: 'Drive', key: 'driveType' },
  { label: 'Transmission', key: 'transmission' },
  { label: 'Cylinders', key: 'engineCylinders' },
  { label: 'Engine (L)', key: 'displacementL' },
  { label: 'Doors', key: 'doors' },
  { label: 'Assembled in', key: 'plantCountry' },
  { label: 'Manufacturer', key: 'manufacturer' },
];

export default function VinChecker() {
  const [vin, setVin] = useState('');
  const [result, setResult] = useState<VinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/vin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.errors?.vin || json.error || 'Could not decode this VIN');
        return;
      }
      setResult(json.data as VinResult);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const specs = result
    ? specFields
        .map((f) => ({ label: f.label, value: result[f.key] as string | null }))
        .filter((s) => s.value)
    : [];

  return (
    <section id="vin" className="bg-neutral-50/60 border-y border-neutral-100 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Intro */}
          <div className="lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700/80 mb-3">
              Free VIN check
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
              Know the car before
              <br />
              you pay for it.
            </h2>
            <p className="mt-4 text-neutral-600 max-w-md">
              Enter the 17 character VIN from any listing and we&apos;ll decode the
              make, model, year and full factory spec so you can confirm a seller
              is telling the truth.
            </p>
          </div>

          {/* Tool */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="e.g. 1HGCM82633A004352"
                maxLength={17}
                autoComplete="off"
                spellCheck={false}
                className="flex-1 px-5 py-3.5 bg-white border border-neutral-200 rounded-2xl text-neutral-900 tracking-wide font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:font-sans placeholder:tracking-normal placeholder:text-neutral-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-medium transition-colors whitespace-nowrap"
              >
                {loading ? 'Checking…' : 'Check VIN'}
              </button>
            </form>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {result && (
              <div className="mt-5 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
                <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-neutral-100">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-neutral-500">
                      Decoded vehicle
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">
                      {[result.year, result.make, result.model]
                        .filter(Boolean)
                        .join(' ') || 'Unknown vehicle'}
                    </h3>
                    {result.vehicleType && (
                      <p className="text-sm text-neutral-500 mt-0.5">{result.vehicleType}</p>
                    )}
                  </div>
                  <span className="font-mono text-xs text-neutral-500 whitespace-nowrap mt-1">
                    {result.vin}
                  </span>
                </div>

                {result.listing ? (
                  <div className="border-b border-neutral-100 bg-green-50/50 px-6 py-5">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-green-800">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Listed on ChiefBaranda
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-neutral-900">{result.listing.title}</p>
                        <p className="text-sm text-neutral-600 mt-0.5">
                          {formatNairaExact(result.listing.price)}
                          {result.listing.location ? ` · ${result.listing.location}` : ''} ·{' '}
                          {result.listing.sellerName}
                          {result.listing.sellerVerified && ' (verified seller)'}
                        </p>
                      </div>

                      {result.listing.status === 'sold' ? (
                        <span className="rounded-full bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600">
                          Already sold
                        </span>
                      ) : (
                        <Link
                          href={`/cars/${result.listing.id}`}
                          className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          View listing
                        </Link>
                      )}
                    </div>

                    {result.listing.yearMismatch && (
                      <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                        Careful: the listing says a different model year than the factory
                        decode. Ask the seller about this before you pay.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="border-b border-neutral-100 px-6 py-4 text-sm text-neutral-500">
                    This chassis number is not on ChiefBaranda. If a seller claims otherwise,
                    treat it as a red flag.
                  </p>
                )}

                {specs.length > 0 && (
                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 px-6 py-5">
                    {specs.map((s) => (
                      <div key={s.label}>
                        <dt className="text-[11px] uppercase tracking-wider text-neutral-500">
                          {s.label}
                        </dt>
                        <dd className="text-sm font-medium text-neutral-900 mt-0.5">
                          {s.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {result.partial && result.note && (
                  <p className="px-6 pb-5 text-xs text-amber-700">
                    Note: {result.note}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
