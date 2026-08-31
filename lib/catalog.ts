import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { seedCars } from '@/lib/seedCars';
import { preOrderSlots } from '@/lib/carData';
import type { Car, PreOrderSlotRow } from '@/lib/models/Car';
import type { OrderKind } from '@/lib/config';

/**
 * The catalogue is the bridge between the static content in `carData.ts` and
 * the database. Listings live in Postgres so stock levels can change and
 * orders can point at something real; the static arrays are only the seed.
 *
 * With no `DATABASE_URL` the browsing pages fall back to those static arrays
 * so the site is still workable during setup. Anything that writes — orders,
 * payments, accounts — refuses instead of pretending, so an unconfigured
 * deployment can never take someone's money.
 */

export { isDatabaseConfigured };

let warnedAboutFallback = false;

function fallbackWarning(): void {
  if (!warnedAboutFallback) {
    console.warn(
      '[catalog] DATABASE_URL is not set — serving the static catalogue. ' +
        'Ordering, accounts and payments are disabled until you configure a database.'
    );
    warnedAboutFallback = true;
  }
}

/** The seed fixtures shaped like database rows, for the fallback path. */
function staticCars(): Car[] {
  const now = new Date();
  return seedCars.map((car) => ({
    ...car,
    id: car.slug,
    sellerId: null,
    status: 'available' as const,
    expectedDelivery: null,
    mileage: car.mileage ?? null,
    year: car.year ?? null,
    color: car.color ?? null,
    transmission: car.transmission ?? null,
    fuel: car.fuel ?? null,
    location: car.location ?? null,
    vin: car.vin ?? null,
    createdAt: now,
    updatedAt: now,
  }));
}

function staticSlots(): PreOrderSlotRow[] {
  const now = new Date();
  return preOrderSlots.map((slot) => ({
    ...slot,
    active: true,
    createdAt: now,
    updatedAt: now,
  }));
}

export interface CarFilters {
  brand?: string;
  condition?: string;
  type?: string;
  featured?: boolean;
  q?: string;
  limit?: number;
}

export async function listCars(filters: CarFilters = {}): Promise<Car[]> {
  if (!isDatabaseConfigured()) {
    fallbackWarning();
    const q = filters.q?.toLowerCase();
    return staticCars()
      .filter(
        (car) =>
          (!filters.brand || car.brand === filters.brand) &&
          (!filters.condition || car.condition === filters.condition) &&
          (!filters.type || car.type === filters.type) &&
          (filters.featured === undefined || car.featured === filters.featured) &&
          (!q ||
            car.title.toLowerCase().includes(q) ||
            car.brand.toLowerCase().includes(q) ||
            car.description.toLowerCase().includes(q))
      )
      .slice(0, filters.limit ?? 60);
  }

  const cars = await prisma.car.findMany({
    where: {
      status: { not: 'sold' },
      ...(filters.brand ? { brand: filters.brand } : {}),
      ...(filters.condition ? { condition: filters.condition } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.featured !== undefined ? { featured: filters.featured } : {}),
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: 'insensitive' as const } },
              { description: { contains: filters.q, mode: 'insensitive' as const } },
              { brand: { contains: filters.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: filters.limit ?? 60,
  });

  return cars as Car[];
}

/** Look up by slug first, falling back to the primary key. */
export async function getCar(idOrSlug: string): Promise<Car | null> {
  if (!isDatabaseConfigured()) {
    fallbackWarning();
    return staticCars().find((car) => car.slug === idOrSlug) ?? null;
  }

  const car = await prisma.car.findFirst({
    where: { OR: [{ slug: idOrSlug }, { id: idOrSlug }] },
  });

  return (car as Car) ?? null;
}

/** Find a listing whose chassis number matches — powers the VIN cross-check. */
export async function findCarByVin(vin: string): Promise<Car | null> {
  if (!isDatabaseConfigured()) {
    fallbackWarning();
    return staticCars().find((car) => car.vin === vin.toUpperCase()) ?? null;
  }

  const car = await prisma.car.findFirst({ where: { vin: vin.toUpperCase() } });
  return (car as Car) ?? null;
}

export async function listPreOrderSlots(origin?: string): Promise<PreOrderSlotRow[]> {
  if (!isDatabaseConfigured()) {
    fallbackWarning();
    return staticSlots().filter((slot) => !origin || slot.origin === origin);
  }

  const slots = await prisma.preOrderSlot.findMany({
    where: { active: true, ...(origin ? { origin } : {}) },
    orderBy: { createdAt: 'asc' },
  });

  return slots as PreOrderSlotRow[];
}

export async function getPreOrderSlot(id: string): Promise<PreOrderSlotRow | null> {
  if (!isDatabaseConfigured()) {
    fallbackWarning();
    return staticSlots().find((slot) => slot.id === id) ?? null;
  }

  const slot = await prisma.preOrderSlot.findUnique({ where: { id } });
  return (slot as PreOrderSlotRow) ?? null;
}

/** Normalised view of anything a buyer can pay for. */
export interface Listing {
  kind: OrderKind;
  id: string;
  title: string;
  subtitle: string;
  image: string;
  price: number;
  available: boolean;
}

export async function findListing(kind: OrderKind, id: string): Promise<Listing | null> {
  if (kind === 'pre-order') {
    const slot = await getPreOrderSlot(id);
    if (!slot) return null;
    return {
      kind,
      id: slot.id,
      title: slot.title,
      subtitle: slot.trim,
      image: slot.image,
      price: slot.fromPrice,
      available: slot.active && slot.remaining > 0,
    };
  }

  const car = await getCar(id);
  if (!car) return null;
  return {
    kind,
    id: car.slug,
    title: car.title,
    subtitle: [car.year, car.condition].filter(Boolean).join(' · '),
    image: car.images[0] || '/logo.png',
    price: car.price,
    available: car.status !== 'sold',
  };
}

/**
 * Claim stock once a payment clears. Conditional updates so two buyers paying
 * at the same moment can't both take the last unit — `updateMany` with the
 * guard in the WHERE clause is atomic, and the row count tells us who won.
 */
export async function claimListing(kind: OrderKind, id: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;

  if (kind === 'pre-order') {
    const result = await prisma.preOrderSlot.updateMany({
      where: { id, remaining: { gt: 0 } },
      data: { remaining: { decrement: 1 } },
    });
    return result.count === 1;
  }

  const result = await prisma.car.updateMany({
    where: { slug: id, status: { not: 'sold' } },
    data: { status: 'reserved' },
  });

  return result.count === 1;
}
