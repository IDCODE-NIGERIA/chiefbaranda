import type { Condition } from '@/lib/carData';
import type { Fuel, Transmission } from '@/lib/models/Car';

/**
 * Starter inventory for cars already on the ground in Nigeria.
 *
 * Seeded into the `cars` table by `prisma/seed.ts` so the buy flow has real,
 * purchasable listings, and used directly as the fallback catalogue when no
 * database is configured. Once sellers list through the platform this is just
 * the initial fixture.
 */

export type SeedCar = {
  slug: string;
  title: string;
  brand: string;
  condition: Condition;
  type: string;
  price: number;
  sellerName: string;
  sellerVerified: boolean;
  description: string;
  images: string[];
  preOrder: boolean;
  mileage?: number;
  year?: number;
  color?: string;
  transmission?: Transmission;
  fuel?: Fuel;
  featured: boolean;
  location?: string;
  vin?: string;
};

export const seedCars: SeedCar[] = [
  {
    slug: 'toyota-camry-2020-abuja',
    title: 'Toyota Camry 2020',
    brand: 'toyota',
    condition: 'foreign-used',
    type: 'sedan',
    price: 17_000_000,
    sellerName: 'Baranda Motors Abuja',
    sellerVerified: true,
    description:
      'Clean 2020 Camry SE, foreign used, accident free with full service history. Duty fully paid, papers complete. Inspected at our Abuja yard.',
    images: ['/list1.png'],
    preOrder: false,
    mileage: 48_000,
    year: 2020,
    color: 'Silver',
    transmission: 'automatic',
    fuel: 'petrol',
    featured: true,
    location: 'Abuja',
    vin: '4T1G11AK5LU123456',
  },
  {
    slug: 'toyota-camry-2016-lagos',
    title: 'Toyota Camry 2016',
    brand: 'toyota',
    condition: 'nigerian-used',
    type: 'sedan',
    price: 7_500_000,
    sellerName: 'Chief Autos Lagos',
    sellerVerified: true,
    description:
      'Well maintained 2016 Camry, Nigerian used, first body. AC chilling, engine and gearbox sound. Buy and drive.',
    images: ['/list2.png'],
    preOrder: false,
    mileage: 112_000,
    year: 2016,
    color: 'Black',
    transmission: 'automatic',
    fuel: 'petrol',
    featured: true,
    location: 'Lagos',
    vin: '4T1BF1FK6GU987654',
  },
  {
    slug: 'mercedes-benz-glk-2015-lagos',
    title: 'Mercedes-Benz GLK 350',
    brand: 'mercedes-benz',
    condition: 'foreign-used',
    type: 'suv',
    price: 15_800_000,
    sellerName: 'Chief Autos Lagos',
    sellerVerified: true,
    description:
      'Tokunbo GLK 350, 4Matic, panoramic roof, full leather interior. Recently cleared, custom duty paid.',
    images: ['/list3.png'],
    preOrder: false,
    mileage: 89_000,
    year: 2015,
    color: 'White',
    transmission: 'automatic',
    fuel: 'petrol',
    featured: true,
    location: 'Lagos',
    vin: 'WDCGG5HB0FG321098',
  },
  {
    slug: 'mercedes-benz-e350-2019-abuja',
    title: 'Mercedes-Benz E350',
    brand: 'mercedes-benz',
    condition: 'foreign-used',
    type: 'sedan',
    price: 28_500_000,
    sellerName: 'Baranda Motors Abuja',
    sellerVerified: true,
    description:
      'E350 with AMG styling package, burmester sound, ambient lighting. Direct tokunbo, nothing to fix.',
    images: ['/list4.png'],
    preOrder: false,
    mileage: 61_000,
    year: 2019,
    color: 'Grey',
    transmission: 'automatic',
    fuel: 'petrol',
    featured: true,
    location: 'Abuja',
    vin: 'WDDZF4JB0KA456789',
  },
  {
    slug: 'toyota-hilux-2021-ph',
    title: 'Toyota Hilux 2021',
    brand: 'toyota',
    condition: 'foreign-used',
    type: 'truck',
    price: 34_000_000,
    sellerName: 'Delta Motors PH',
    sellerVerified: true,
    description:
      'Double cabin Hilux 4x4, diesel engine, perfect for site work and long distance. Tyres almost new.',
    images: ['/cs3.png'],
    preOrder: false,
    mileage: 72_000,
    year: 2021,
    color: 'White',
    transmission: 'manual',
    fuel: 'diesel',
    featured: false,
    location: 'Port Harcourt',
    vin: 'MR0FZ29G001234567',
  },
  {
    slug: 'honda-accord-2018-lagos',
    title: 'Honda Accord 2018',
    brand: 'honda',
    condition: 'nigerian-used',
    type: 'sedan',
    price: 12_200_000,
    sellerName: 'Chief Autos Lagos',
    sellerVerified: false,
    description:
      'Accord 1.5 turbo, registered and used in Lagos only. Fuel efficient, low maintenance. Negotiable.',
    images: ['/cs1.png'],
    preOrder: false,
    mileage: 95_000,
    year: 2018,
    color: 'Blue',
    transmission: 'automatic',
    fuel: 'petrol',
    featured: false,
    location: 'Lagos',
    vin: '1HGCV1F34JA112233',
  },
  {
    slug: 'lexus-rx350-2017-lagos',
    title: 'Lexus RX 350',
    brand: 'lexus',
    condition: 'foreign-used',
    type: 'suv',
    price: 26_500_000,
    sellerName: 'Baranda Motors Abuja',
    sellerVerified: true,
    description:
      'RX 350 F Sport, full option, reverse camera, heated seats. One of the cleanest on the market right now.',
    images: ['/cs2.png'],
    preOrder: false,
    mileage: 77_000,
    year: 2017,
    color: 'Pearl White',
    transmission: 'automatic',
    fuel: 'petrol',
    featured: false,
    location: 'Lagos',
    vin: '2T2BZMCA1HC334455',
  },
  {
    slug: 'innoson-g5-2023-enugu',
    title: 'Innoson G5',
    brand: 'innoson',
    condition: 'brand-new',
    type: 'suv',
    price: 19_500_000,
    sellerName: 'Innoson Certified Dealer',
    sellerVerified: true,
    description:
      'Brand new Innoson G5 straight from the Nnewi plant. Full warranty, locally serviceable, spare parts readily available.',
    images: ['/cs4.png'],
    preOrder: false,
    mileage: 0,
    year: 2023,
    color: 'Red',
    transmission: 'automatic',
    fuel: 'petrol',
    featured: false,
    location: 'Enugu',
    vin: 'NGIVM5G23P0011223',
  },
];
