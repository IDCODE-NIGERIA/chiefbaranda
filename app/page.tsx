import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Listings from '@/components/Listings';
import Marketplace from '@/components/Marketplace';

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <Listings />
      <Marketplace />
      <Footer />
    </div>
  );
}