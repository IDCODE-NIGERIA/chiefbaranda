'use client';

const TrustAndCTA = () => {
  const features = [
    {
      title: "Verified Listing",
      desc: "We verify sellers and listing for your peace of mind.",
      icon: "✓"
    },
    {
      title: "Escrow Protection",
      desc: "Your money is held securely until delivery is confirmed.",
      icon: "🔒"
    },
    {
      title: "Fraud Protection",
      desc: "Advanced system to detect and prevent fraud and scam.",
      icon: "⚠️"
    },
    {
      title: "Secure Messaging",
      desc: "Chat safely within our platform your privacy matters.",
      icon: "💬"
    }
  ];

  return (
    <section className="bg-white py-16 px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Trust Section */}
        <div className="text-center space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Built for safe transactions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-gray-200 rounded-xl overflow-hidden">
            {features.map((item, index) => (
              <div 
                key={index} 
                className={`p-8 flex items-start gap-4 bg-white ${
                  index !== features.length - 1 ? 'lg:border-r border-gray-200' : ''
                } ${index < 2 ? 'border-b lg:border-b-0' : ''}`}
              >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                  {item.icon}
                </div>
                <div className="text-left space-y-1">
                  <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner Section - Slimmer and more compact */}
        <div className="max-w-5xl mx-auto"> {/* Controls the overall width of the banner */}
        <div className="relative bg-green-100 rounded-2xl px-10 py-8 md:py-10 overflow-hidden border border-green-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10">
            
            {/* Text Content */}
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-green-600">
                Ready to Pre-Order?
                </h2>
                <p className="text-gray-600 text-sm font-medium">
                Join thousands of buyers and avoid middle-man problem today.
                </p>
            </div>

            {/* Button - Centered relative to the text row */}
            <div className="mt-6 md:mt-0 md:mr-40"> 
                <button className="bg-green-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-green-800 transition-colors">
                Pre-Order Now
                </button>
            </div>
            </div>

            {/* House Image (image2.png) - Scaled down */}
            <div className="absolute right-0 bottom-0 hidden lg:block">
            <img 
                src="/image 2.png" 
                alt="Sell your house" 
                className="w-48 h-32 object-contain object-right-bottom" 
            />
            </div>
        </div>
        </div>


      </div>
    </section>
  );
};

export default TrustAndCTA;
