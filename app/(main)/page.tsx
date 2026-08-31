import Hero from '@/components/Hero';
import VinChecker from '@/components/VinChecker';
import Listings from '@/components/Listings';
import Marketplace from '@/components/Marketplace';

// Featured listings and slot counts come from the database on every request,
// so this page can't be prerendered at build time.
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div>
      <Hero />
      <VinChecker />
      <Listings />
      <Marketplace />
    </div>
  );
}
