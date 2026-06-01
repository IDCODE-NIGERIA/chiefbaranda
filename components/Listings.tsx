'use client';

const Listings = () => {
  const featured = [
    { id: 1, img: '/list1.png', name: 'Toyota Camry 2020', price: '₦ 17,000,000', loc: 'Abuja, Nigeria', tag: 'Verified' },
    { id: 2, img: '/list2.png', name: 'Toyota Camry 2016', price: '₦ 7,500,000', loc: 'Lagos, Nigeria', tag: 'Verified' },
    { id: 3, img: '/list3.png', name: 'Benz', price: '₦ 45,500,000', loc: 'Coming Soon', tag: 'Pre order' },
    { id: 4, img: '/list4.png', name: 'Benz', price: '₦ 48,500,000', loc: 'Coming Soon', tag: 'Pre order' },
  ];

  const comingSoon = [
    { id: 1, img: '/cs1.png', name: 'G Wagon', date: 'Expected May 2026' },
    { id: 2, img: '/cs2.png', name: 'Range Rover', date: 'Expected May 2026' },
    { id: 3, img: '/cs3.png', name: 'Maybach', date: 'Expected May 2026' },
    { id: 4, img: '/cs4.png', name: 'BMW', date: 'Expected May 2026' },
  ];

  return (
    // Main section background set to pure white
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-8 space-y-20">
        
        {/* Featured Listing Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Featured Listing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((car) => (
              <div key={car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative h-48">
                  <img src={car.img} alt={car.name} className="w-full h-full object-cover" />
                  <span className={`absolute bottom-3 left-3 px-4 py-1.5 rounded-xl text-xs font-semibold text-white ${car.tag === 'Verified' ? 'bg-green-800' : 'bg-green-950'}`}>
                    {car.tag}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{car.name}</h3>
                    <p className="text-sm font-bold text-gray-900 mt-1">{car.price}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                      <span>{car.loc === 'Coming Soon' ? '⏱️' : '📍'}</span>
                      {car.loc}
                    </div>
                    <button className="bg-green-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-800 transition-colors">
                      {car.tag === 'Pre order' ? 'Pre order' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-green-700">Coming Soon</h2>
          {/* Outer Bordered Container */}
          <div className="border border-gray-200 rounded-3xl p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {comingSoon.map((car) => (
                <div key={car.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm items-center">
                  <img src={car.img} alt={car.name} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-gray-900 text-sm">{car.name}</h3>
                    <p className="text-[11px] text-gray-500 font-semibold">{car.date}</p>
                    <button className="bg-green-800 text-white w-full py-2 rounded-xl text-[11px] font-bold mt-3 hover:bg-green-700 transition-all">
                      Notify me
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Listings;
