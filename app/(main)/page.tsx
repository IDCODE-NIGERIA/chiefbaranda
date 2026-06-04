import Hero from '@/components/Hero';
import VinChecker from '@/components/VinChecker';
import Listings from '@/components/Listings';
import InTransit from '@/components/InTransit';
import Marketplace from '@/components/Marketplace';

export default function Home() {
  return (
    <div>
      <Hero />
      <VinChecker />
      <Listings />
      <InTransit />
      <Marketplace />
    </div>
  );
}
