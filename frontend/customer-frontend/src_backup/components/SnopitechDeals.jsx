import React, { useRef } from 'react';

const SnopitechDeals = () => {
  const scrollRef = useRef(null);

  const deals = [
    {
      id: 1,
      merchant: "Snopitech IT Store",
      logo: "🖥️",
      offer: "15% cash back",
      description: "Refurbished IT equipment & laptops",
      category: "TECH",
      activated: true,
      terms: "Min $199 purchase",
      color: "blue"
    },
    {
      id: 2,
      merchant: "Amazon",
      logo: "🛒",
      offer: "5% cash back",
      description: "Electronics & accessories",
      category: "SHOPPING",
      activated: false,
      terms: "Online purchases only",
      color: "emerald"
    },
    {
      id: 3,
      merchant: "Best Buy",
      logo: "📺",
      offer: "3% cash back",
      description: "In-store & online electronics",
      category: "TECH",
      activated: true,
      terms: "Excludes gift cards",
      color: "indigo"
    },
    {
      id: 4,
      merchant: "Dell",
      logo: "💻",
      offer: "8% cash back",
      description: "Computers & accessories",
      category: "TECH",
      activated: false,
      terms: "Direct from Dell.com",
      color: "amber"
    },
    {
      id: 5,
      merchant: "Microsoft",
      logo: "🖱️",
      offer: "6% cash back",
      description: "Surface devices & software",
      category: "TECH",
      activated: true,
      terms: "Excludes Xbox",
      color: "cyan"
    },
    {
      id: 6,
      merchant: "Staples",
      logo: "📎",
      offer: "4% cash back",
      description: "Office supplies & tech",
      category: "OFFICE",
      activated: false,
      terms: "In-store only",
      color: "teal"
    },
    {
      id: 7,
      merchant: "Netflix",
      logo: "🎬",
      offer: "$20 credit",
      description: "New annual subscription",
      category: "ENTERTAINMENT",
      activated: true,
      terms: "First-time subscribers",
      color: "violet"
    },
    {
      id: 8,
      merchant: "Spotify",
      logo: "🎵",
      offer: "1 month free",
      description: "Premium subscription",
      category: "ENTERTAINMENT",
      activated: false,
      terms: "New customers only",
      color: "purple"
    }
  ];

  const categories = ["ALL", "TECH", "SHOPPING", "OFFICE", "ENTERTAINMENT"];
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [activatedDeals, setActivatedDeals] = React.useState([1, 3, 5, 7]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      if (direction === 'left') {
        scrollRef.current.scrollLeft -= scrollAmount;
      } else {
        scrollRef.current.scrollLeft += scrollAmount;
      }
    }
  };

  const handleActivateDeal = (dealId) => {
    if (activatedDeals.includes(dealId)) {
      setActivatedDeals(activatedDeals.filter(id => id !== dealId));
    } else {
      setActivatedDeals([...activatedDeals, dealId]);
    }
  };

  const filteredDeals = selectedCategory === "ALL" 
    ? deals 
    : deals.filter(deal => deal.category === selectedCategory);

  // Color mapping for gradients and buttons
  const colorConfig = {
    blue: {
      gradient: "from-blue-600 to-blue-800",
      button: "bg-blue-700 hover:bg-blue-800",
      light: "bg-blue-50"
    },
    emerald: {
      gradient: "from-emerald-600 to-emerald-800",
      button: "bg-emerald-700 hover:bg-emerald-800",
      light: "bg-emerald-50"
    },
    indigo: {
      gradient: "from-indigo-600 to-indigo-800",
      button: "bg-indigo-700 hover:bg-indigo-800",
      light: "bg-indigo-50"
    },
    amber: {
      gradient: "from-amber-600 to-amber-800",
      button: "bg-amber-700 hover:bg-amber-800",
      light: "bg-amber-50"
    },
    cyan: {
      gradient: "from-cyan-600 to-cyan-800",
      button: "bg-cyan-700 hover:bg-cyan-800",
      light: "bg-cyan-50"
    },
    teal: {
      gradient: "from-teal-600 to-teal-800",
      button: "bg-teal-700 hover:bg-teal-800",
      light: "bg-teal-50"
    },
    violet: {
      gradient: "from-violet-600 to-violet-800",
      button: "bg-violet-700 hover:bg-violet-800",
      light: "bg-violet-50"
    },
    purple: {
      gradient: "from-purple-600 to-purple-800",
      button: "bg-purple-700 hover:bg-purple-800",
      light: "bg-purple-50"
    }
  };

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🎯 Snopitech Deals</h2>
          <p className="text-gray-600 text-sm mt-1">Activate deals for automatic cash back</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Active deals</div>
          <div className="text-2xl font-bold text-gray-800">{activatedDeals.length}/{deals.length}</div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Scrollable Deals Container */}
      <div className="relative">
        {/* Left Scroll Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white border border-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        {/* Deals Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 pt-2 pl-1 pr-1"
          style={{ scrollBehavior: 'smooth' }}
        >
          {filteredDeals.map(deal => {
            const isActivated = activatedDeals.includes(deal.id);
            const config = colorConfig[deal.color] || colorConfig.blue;

            return (
              <div 
                key={deal.id}
                className="flex-shrink-0 w-60 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Deal Header */}
                <div className={`bg-gradient-to-r ${config.gradient} p-4 rounded-t-xl`}>
                  <div className="flex justify-between items-start">
                    <div className="text-2xl">{deal.logo}</div>
                    <span className="text-xs font-medium text-white bg-black/20 px-2 py-1 rounded">
                      {deal.category}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-base mt-3">{deal.merchant}</h3>
                  <div className="text-white text-xl font-bold mt-1">{deal.offer}</div>
                </div>

                {/* Deal Content */}
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">{deal.description}</p>
                  
                  {/* Terms */}
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-4">
                    {deal.terms}
                  </div>

                  {/* Activate Button */}
                  <button
                    onClick={() => handleActivateDeal(deal.id)}
                    className={`w-full py-2.5 text-white rounded-lg font-medium transition-colors text-sm ${
                      isActivated
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : config.button
                    }`}
                  >
                    {isActivated ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Activated
                      </span>
                    ) : (
                      'Activate Deal'
                    )}
                  </button>
                </div>

                {/* Status Indicator */}
                {isActivated && (
                  <div className={`text-xs font-medium px-4 py-2 text-center ${config.light} text-gray-700`}>
                    ✓ Cash back will be applied automatically
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white border border-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No deals in this category</h3>
          <p className="text-gray-500">Check back soon for new offers!</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4">Your Deal Earnings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="text-lg font-bold text-gray-800">$156.80</div>
            <div className="text-xs text-gray-500 mt-1">Total earned</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="text-lg font-bold text-gray-800">12</div>
            <div className="text-xs text-gray-500 mt-1">Deals used</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="text-lg font-bold text-gray-800">$42.50</div>
            <div className="text-xs text-gray-500 mt-1">Pending</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="text-lg font-bold text-gray-800">$15.00</div>
            <div className="text-xs text-gray-500 mt-1">From Snopitech</div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          Deals are automatically applied when you use your Snopitech card
        </p>
      </div>

      {/* CSS for hidden scrollbar */}
      <style jsx="true">{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default SnopitechDeals;