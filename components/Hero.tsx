'use client';

import Link from 'next/link';

const Hero = () => {
  return (
    <section className="bg-white pt-10 pb-16 md:pt-12 md:pb-12">
      <div className="max-w-7xl mx-auto px-8">
        {/* Added items-stretch to ensure columns match height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
          
          {/* Left Side - Text + Controls Row */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                Buy, sell & pre-order <br />
                cars with <span className="text-green-600">confidence.</span>
              </h1>
              <p className="mt-3 text-lg text-gray-600">
                Pre Order Straight. No Middleman Problem
              </p>
            </div>

            {/* FLEX WRAPPER */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              
              {/* Column 1: Search + Buttons */}
              <div className="w-full max-w-md space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Search cars..."
                    className="flex-1 px-5 py-3.5 bg-gray-100 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
                  />
                  <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-2xl font-medium transition-colors whitespace-nowrap">
                    Search
                  </button>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href=""
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl font-medium text-center transition-colors"
                  >
                    Start Selling
                  </Link>
                  <Link
                    href=""
                    className="flex-1 border border-gray-300 hover:bg-gray-50 py-3.5 rounded-2xl font-medium text-gray-700 text-center transition-colors"
                  >
                    Browse Listing
                  </Link>
                </div>
              </div>

              {/* Column 2: Buy & Sell Image (hero1.png) */}
              <div className="flex-shrink-0 md:-translate-y-6 md:-translate-x-6">
                <img
                  src="/hero1.png"
                  alt="Buy and Sell Cards"
                  className="w-40 md:w-56 h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Cars Image (hero2.png) */}
          {/* Changed min-h to h-full and added overflow-hidden to keep it clean */}
          <div className="lg:col-span-5 self-stretch overflow-hidden rounded-3xl">
            <img
              src="/hero2.png"
              alt="Cars for sale"
              className="w-full h-full object-cover shadow-2xl"
            />
          </div>
        </div>

        {/* Bottom Trust Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
              ✓
            </div>
            <div>
              <p className="font-semibold text-gray-900">Verified Listing</p>
              <p className="text-sm text-gray-500 mt-1">Quality you can trust</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
              🔒
            </div>
            <div>
              <p className="font-semibold text-gray-900">Secured Payments</p>
              <p className="text-sm text-gray-500 mt-1">Escrow Protection</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
              ⚡
            </div>
            <div>
              <p className="font-semibold text-gray-900">Fast & Easy</p>
              <p className="text-sm text-gray-500 mt-1">Smooth transaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
