export type Condition = 'brand-new' | 'foreign-used' | 'nigerian-used';

export type Brand = {
  slug: string;
  name: string;
  tagline: string;
};

export const brands: Brand[] = [
  { slug: 'toyota', name: 'Toyota', tagline: 'The roads were built for these' },
  { slug: 'honda', name: 'Honda', tagline: 'Reliable and fuel friendly' },
  { slug: 'mercedes-benz', name: 'Mercedes-Benz', tagline: 'When you want to be noticed' },
  { slug: 'bmw', name: 'BMW', tagline: 'Driving performance, refined' },
  { slug: 'lexus', name: 'Lexus', tagline: 'Toyota luxury without the pretense' },
  { slug: 'hyundai', name: 'Hyundai', tagline: 'Good value, solid build' },
  { slug: 'kia', name: 'Kia', tagline: 'Affordable and well equipped' },
  { slug: 'land-rover', name: 'Land Rover', tagline: 'Built for the worst roads' },
  { slug: 'range-rover', name: 'Range Rover', tagline: 'Luxury meets off road' },
  { slug: 'ford', name: 'Ford', tagline: 'Work trucks and city runners' },
  { slug: 'peugeot', name: 'Peugeot', tagline: 'The old faithful' },
  { slug: 'innoson', name: 'Innoson', tagline: 'Made in Nigeria, for Nigeria' },
  { slug: 'nissan', name: 'Nissan', tagline: 'From Almera to Pathfinder' },
  { slug: 'volkswagen', name: 'Volkswagen', tagline: 'German engineering, everyday use' },
  { slug: 'audi', name: 'Audi', tagline: 'Understated luxury' },
  { slug: 'porsche', name: 'Porsche', tagline: 'For the ones who earned it' },
  { slug: 'jeep', name: 'Jeep', tagline: 'Off road and proud' },
  { slug: 'mitsubishi', name: 'Mitsubishi', tagline: 'Tough and low maintenance' },
  { slug: 'mazda', name: 'Mazda', tagline: 'Smooth ride, clean design' },
  { slug: 'chevrolet', name: 'Chevrolet', tagline: 'Muscle and practicality' },
  { slug: 'gac', name: 'GAC', tagline: 'New player, turning heads' },
];

export type BodyType = {
  slug: string;
  name: string;
  blurb: string;
  count: number;
  fromPrice: number;
  image: string;
  tone: 'sand' | 'forest' | 'ink' | 'rust';
};

export const bodyTypes: BodyType[] = [
  {
    slug: 'sedan',
    name: 'Sedans',
    blurb: 'The everyday car. Easy on fuel, easy to park.',
    count: 412,
    fromPrice: 3_200_000,
    image: '/cs1.png',
    tone: 'forest',
  },
  {
    slug: 'suv',
    name: 'SUVs',
    blurb: 'Handles bad roads and still looks good doing it.',
    count: 287,
    fromPrice: 8_500_000,
    image: '/cs2.png',
    tone: 'ink',
  },
  {
    slug: 'truck',
    name: 'Pickups and Trucks',
    blurb: 'Hilux, Tacoma, Ranger. The workhorses.',
    count: 96,
    fromPrice: 6_900_000,
    image: '/cs3.png',
    tone: 'rust',
  },
  {
    slug: 'coupe',
    name: 'Coupes',
    blurb: 'The weekend car. The one you wash on Saturday.',
    count: 54,
    fromPrice: 12_000_000,
    image: '/cs4.png',
    tone: 'sand',
  },
  {
    slug: 'hatchback',
    name: 'Hatchbacks',
    blurb: 'Great first car. Cheap to run, easy to resell.',
    count: 173,
    fromPrice: 2_400_000,
    image: '/list1.png',
    tone: 'sand',
  },
  {
    slug: 'van',
    name: 'Vans and Buses',
    blurb: 'School runs, deliveries, group travel.',
    count: 68,
    fromPrice: 5_500_000,
    image: '/list2.png',
    tone: 'forest',
  },
  {
    slug: 'electric',
    name: 'Electric and Hybrid',
    blurb: 'No fuel queues. Charging available in Lagos, Abuja, PH.',
    count: 31,
    fromPrice: 18_000_000,
    image: '/list3.png',
    tone: 'ink',
  },
  {
    slug: 'luxury',
    name: 'Luxury',
    blurb: 'For when the project finally pays out.',
    count: 42,
    fromPrice: 28_000_000,
    image: '/list4.png',
    tone: 'rust',
  },
];

export const conditionLabels: Record<Condition, string> = {
  'brand-new': 'Brand New',
  'foreign-used': 'Foreign Used',
  'nigerian-used': 'Nigerian Used',
};

export const conditionColors: Record<Condition, { bg: string; text: string; dot: string }> = {
  'brand-new': { bg: 'bg-green-50 border-green-200', text: 'text-green-800', dot: 'bg-green-600' },
  'foreign-used': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', dot: 'bg-blue-600' },
  'nigerian-used': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', dot: 'bg-amber-600' },
};

export type OriginCountry = {
  slug: string;
  name: string;
  flag: string;
  blurb: string;
};

export const originCountries: OriginCountry[] = [
  { slug: 'japan', name: 'Japan', flag: '🇯🇵', blurb: 'Clean, low-mileage and famously reliable.' },
  { slug: 'usa', name: 'USA', flag: '🇺🇸', blurb: 'Big engines, full options, sharp prices.' },
  { slug: 'dubai', name: 'Dubai (UAE)', flag: '🇦🇪', blurb: 'GCC-spec SUVs built for the heat.' },
  { slug: 'china', name: 'China', flag: '🇨🇳', blurb: 'New models and EVs at real value.' },
  { slug: 'turkey', name: 'Turkey', flag: '🇹🇷', blurb: 'European-spec runarounds, easy on fuel.' },
];

export type PreOrderSlot = {
  id: string;
  title: string;
  trim: string;
  brand: string;
  origin: string;
  condition: Condition;
  image: string;
  fromPrice: number;
  deposit: number;
  eta: string;
  port: 'Lagos' | 'Abuja' | 'Port Harcourt';
  remaining: number;
  source: string;
};

export const preOrderSlots: PreOrderSlot[] = [
  {
    id: 'rav4-2023',
    title: 'Toyota RAV4',
    trim: '2023 XLE Hybrid',
    brand: 'toyota',
    origin: 'japan',
    condition: 'foreign-used',
    image: '/cs2.png',
    fromPrice: 32_900_000,
    deposit: 3_000_000,
    eta: '5 to 7 weeks',
    port: 'Lagos',
    remaining: 5,
    source: 'Yokohama, Japan',
  },
  {
    id: 'lexus-rx-2023',
    title: 'Lexus RX 350',
    trim: '2023 F Sport',
    brand: 'lexus',
    origin: 'japan',
    condition: 'foreign-used',
    image: '/list3.png',
    fromPrice: 62_000_000,
    deposit: 6_000_000,
    eta: '6 to 8 weeks',
    port: 'Lagos',
    remaining: 2,
    source: 'Nagoya, Japan',
  },
  {
    id: 'camry-2024',
    title: 'Toyota Camry',
    trim: '2024 SE',
    brand: 'toyota',
    origin: 'usa',
    condition: 'foreign-used',
    image: '/cs1.png',
    fromPrice: 24_500_000,
    deposit: 2_000_000,
    eta: '4 to 6 weeks',
    port: 'Lagos',
    remaining: 3,
    source: 'Houston, TX',
  },
  {
    id: 'civic-2023',
    title: 'Honda Civic',
    trim: '2023 Sport Touring',
    brand: 'honda',
    origin: 'usa',
    condition: 'foreign-used',
    image: '/cs4.png',
    fromPrice: 27_800_000,
    deposit: 2_500_000,
    eta: '4 to 6 weeks',
    port: 'Lagos',
    remaining: 4,
    source: 'Atlanta, GA',
  },
  {
    id: 'hilux-2024',
    title: 'Toyota Hilux',
    trim: '2024 Adventure 4x4',
    brand: 'toyota',
    origin: 'dubai',
    condition: 'brand-new',
    image: '/cs3.png',
    fromPrice: 41_000_000,
    deposit: 4_500_000,
    eta: '6 to 8 weeks',
    port: 'Port Harcourt',
    remaining: 2,
    source: 'Dubai, UAE',
  },
  {
    id: 'patrol-2023',
    title: 'Nissan Patrol',
    trim: '2023 LE Platinum',
    brand: 'nissan',
    origin: 'dubai',
    condition: 'foreign-used',
    image: '/list4.png',
    fromPrice: 78_000_000,
    deposit: 8_000_000,
    eta: '6 to 9 weeks',
    port: 'Lagos',
    remaining: 1,
    source: 'Dubai, UAE',
  },
  {
    id: 'gac-gs3-2024',
    title: 'GAC GS3 Emzoom',
    trim: '2024 GS3',
    brand: 'gac',
    origin: 'china',
    condition: 'brand-new',
    image: '/list1.png',
    fromPrice: 21_500_000,
    deposit: 2_000_000,
    eta: '7 to 9 weeks',
    port: 'Lagos',
    remaining: 6,
    source: 'Guangzhou, China',
  },
  {
    id: 'gac-aion-2024',
    title: 'GAC Aion Y',
    trim: '2024 Electric',
    brand: 'gac',
    origin: 'china',
    condition: 'brand-new',
    image: '/list2.png',
    fromPrice: 29_000_000,
    deposit: 3_000_000,
    eta: '8 to 10 weeks',
    port: 'Lagos',
    remaining: 4,
    source: 'Shenzhen, China',
  },
  {
    id: 'fiat-egea-2023',
    title: 'Fiat Egea',
    trim: '2023 Sedan',
    brand: 'fiat',
    origin: 'turkey',
    condition: 'foreign-used',
    image: '/cs2.png',
    fromPrice: 14_500_000,
    deposit: 1_500_000,
    eta: '5 to 7 weeks',
    port: 'Lagos',
    remaining: 5,
    source: 'Istanbul, Turkey',
  },
  {
    id: 'renault-clio-2024',
    title: 'Renault Clio',
    trim: '2024 Touch',
    brand: 'renault',
    origin: 'turkey',
    condition: 'brand-new',
    image: '/list1.png',
    fromPrice: 16_900_000,
    deposit: 1_800_000,
    eta: '6 to 8 weeks',
    port: 'Lagos',
    remaining: 3,
    source: 'Bursa, Turkey',
  },
];

export const lifestyleFilters = [
  { label: 'Under \u20A65m', href: '/categories/under-5m' },
  { label: 'First time buyers', href: '/categories/first-car' },
  { label: 'Family of 5+', href: '/categories/family' },
  { label: 'Rideshare ready', href: '/categories/rideshare' },
  { label: 'Tokunbo (Foreign used)', href: '/categories/tokunbo' },
  { label: 'Brand new only', href: '/categories/brand-new' },
];

export function formatNaira(n: number): string {
  if (n >= 1_000_000) {
    const millions = n / 1_000_000;
    const formatted = n % 1_000_000 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return `\u20A6${formatted}m`;
  }
  return `\u20A6${n.toLocaleString()}`;
}
