import type { Condition } from '@/lib/carData';

/**
 * Validation shared by the admin create and update routes, so a car can never
 * be saved through one path in a shape the other would reject.
 */

export const CONDITIONS: Condition[] = ['brand-new', 'foreign-used', 'nigerian-used'];
export const CAR_STATUSES = ['available', 'reserved', 'sold'] as const;
export const TRANSMISSIONS = ['manual', 'automatic'] as const;
export const FUELS = ['petrol', 'diesel', 'hybrid', 'electric'] as const;
export const BODY_TYPES = [
  'sedan', 'suv', 'truck', 'coupe', 'hatchback', 'van', 'electric', 'luxury',
] as const;

export interface CarInput {
  title: string;
  brand: string;
  condition: Condition;
  type: string;
  price: number;
  description: string;
  images: string[];
  sellerName: string;
  sellerVerified: boolean;
  featured: boolean;
  status: string;
  location?: string | null;
  vin?: string | null;
  mileage?: number | null;
  year?: number | null;
  color?: string | null;
  transmission?: string | null;
  fuel?: string | null;
}

/** Turn a title into a URL slug, e.g. "Toyota Camry 2020" -> toyota-camry-2020. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * An image src `next/image` can actually render: a site-relative path, or an
 * absolute http(s) URL. Anything else is rejected before it can be stored.
 */
export function isRenderableImage(src: string): boolean {
  if (src.startsWith('/')) return !src.startsWith('//');
  try {
    const url = new URL(src);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function validateCar(
  body: Record<string, unknown>,
  { partial = false }: { partial?: boolean } = {}
): { errors: Record<string, string>; data: Partial<CarInput> } {
  const errors: Record<string, string> = {};
  const data: Partial<CarInput> = {};

  const has = (key: string) => body[key] !== undefined;
  const required = (key: string) => !partial || has(key);

  if (required('title')) {
    const title = String(body.title ?? '').trim();
    if (!title) errors.title = 'Give the car a title';
    else if (title.length > 120) errors.title = 'Keep the title under 120 characters';
    else data.title = title;
  }

  if (required('brand')) {
    const brand = String(body.brand ?? '').trim();
    if (!brand) errors.brand = 'Pick a brand';
    else data.brand = brand;
  }

  if (required('condition')) {
    const condition = String(body.condition ?? '');
    if (!CONDITIONS.includes(condition as Condition)) errors.condition = 'Pick a condition';
    else data.condition = condition as Condition;
  }

  if (required('type')) {
    const type = String(body.type ?? '').trim();
    if (!type) errors.type = 'Pick a body type';
    else data.type = type;
  }

  if (required('price')) {
    const price = asNumber(body.price);
    if (price === null) errors.price = 'Enter the price';
    else if (price <= 0) errors.price = 'Price must be more than zero';
    else if (price > 2_000_000_000) errors.price = 'That price is out of range';
    else data.price = Math.round(price);
  }

  if (required('description')) {
    const description = String(body.description ?? '').trim();
    if (!description) errors.description = 'Describe the car';
    else data.description = description;
  }

  if (required('images')) {
    const images = Array.isArray(body.images) ? body.images.filter(Boolean).map(String) : [];
    if (images.length === 0) {
      errors.images = 'Add at least one photo';
    } else if (!images.every(isRenderableImage)) {
      // next/image throws on a malformed src, which would take down every page
      // the car appears on — including the home page. Reject it here instead.
      errors.images = 'Photos must be an uploaded image or a full http(s) URL';
    } else {
      data.images = images;
    }
  }

  if (required('sellerName')) {
    const sellerName = String(body.sellerName ?? '').trim();
    if (!sellerName) errors.sellerName = 'Who is selling this car?';
    else data.sellerName = sellerName;
  }

  if (has('status')) {
    const status = String(body.status);
    if (!(CAR_STATUSES as readonly string[]).includes(status)) errors.status = 'Unknown status';
    else data.status = status;
  }

  if (has('transmission') && body.transmission) {
    const t = String(body.transmission);
    if (!(TRANSMISSIONS as readonly string[]).includes(t)) errors.transmission = 'Unknown transmission';
    else data.transmission = t;
  } else if (has('transmission')) {
    data.transmission = null;
  }

  if (has('fuel') && body.fuel) {
    const f = String(body.fuel);
    if (!(FUELS as readonly string[]).includes(f)) errors.fuel = 'Unknown fuel type';
    else data.fuel = f;
  } else if (has('fuel')) {
    data.fuel = null;
  }

  if (has('year')) {
    const year = asNumber(body.year);
    if (year !== null && (year < 1950 || year > new Date().getFullYear() + 2)) {
      errors.year = 'Enter a realistic year';
    } else data.year = year;
  }

  if (has('mileage')) {
    const mileage = asNumber(body.mileage);
    if (mileage !== null && mileage < 0) errors.mileage = 'Mileage cannot be negative';
    else data.mileage = mileage;
  }

  if (has('vin')) {
    const vin = String(body.vin ?? '').trim().toUpperCase();
    if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      errors.vin = 'A VIN is 17 characters, with no I, O or Q';
    } else data.vin = vin || null;
  }

  if (has('location')) data.location = String(body.location ?? '').trim() || null;
  if (has('color')) data.color = String(body.color ?? '').trim() || null;
  if (has('sellerVerified')) data.sellerVerified = Boolean(body.sellerVerified);
  if (has('featured')) data.featured = Boolean(body.featured);

  return { errors, data };
}
