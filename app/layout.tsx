import type { Metadata } from 'next';
import './globals.css';           
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'ChiefBaranda.ng - Buy & Sell with Confidence',
  description: 'Nigeria’s trusted marketplace for pre-order, categories, and becoming a seller.',
  keywords: ['chiefbaranda', 'marketplace', 'nigeria', 'pre-order', 'buy sell'],
  authors: [{ name: 'ChiefBaranda.ng' }],
  openGraph: {
    title: 'ChiefBaranda.ng',
    description: 'Buy, sell and pre-order on Nigeria’s trusted platform',
    images: [{ url: '/logo.png' }],   
  },
 
  icons: {
    icon: [
      '/logo.png',
    ],
    apple: [
      '/logo.png',
    ],
    shortcut: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <main className="min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </body>
    </html>
  );
}