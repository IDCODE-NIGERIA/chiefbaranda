import Hero from '@/components/Hero';
import VinChecker from '@/components/VinChecker';
import Listings from '@/components/Listings';
import Marketplace from '@/components/Marketplace';

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
