import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-0">
          
          {/* Logo + Description */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo.png" 
                alt="ChiefBaranda Logo" 
                className="h-24 w-auto"
              />
              <span className="text-2xl font-bold text-gray-900">ChiefBaranda.com</span>
            </div>
            
            <p className="text-gray-600 leading-relaxed max-w-md">
              A trusted marketplace for buying, selling <br /> and pre-ordering used and new items.
            </p>
          </div>

          {/* Marketplace */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Marketplace</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/categories" className="hover:text-green-600 transition-colors">All Categories</Link></li>
              <li><Link href="/featured" className="hover:text-green-600 transition-colors">Featured Listings</Link></li>
              <li><Link href="/pre-orders" className="hover:text-green-600 transition-colors">Pre orders</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-green-600 transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-green-600 transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-green-600 transition-colors">Blogs</Link></li>
              <li><Link href="/press" className="hover:text-green-600 transition-colors">Press</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/help" className="hover:text-green-600 transition-colors">Help Center</Link></li>
              <li><Link href="/safety" className="hover:text-green-600 transition-colors">Safety Tips</Link></li>
              <li><Link href="/contact" className="hover:text-green-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/privacy" className="hover:text-green-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-green-600 transition-colors">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Subscribe to our newsletter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get the latest updates and offers delivered to your email.
            </p>
            
            <div className="flex text-gray-900">
              <input 
                type="email" 
                placeholder="Enter your email..." 
                className="flex-1 px-0 py-3 border border-gray-300 rounded-l-full text-sm focus:outline-none focus:border-green-500"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white px-2 rounded-r-full transition-colors">
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          ©2026 Chief Baranda.com. All right reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;