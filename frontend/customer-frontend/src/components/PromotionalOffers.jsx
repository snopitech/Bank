import React, { useRef } from 'react';

const PromotionalOffers = () => {
  const scrollRef = useRef(null);

  const promotions = [
    {
      id: 1,
      title: "Checking Bonus",
      subtitle: "$300",
      description: "Open Premium Checking with direct deposit",
      icon: "💎",
      gradient: "from-blue-600 to-blue-800",
      tag: "NEW",
      cta: "Apply",
      color: "blue"
    },
    {
      id: 2,
      title: "High-Yield Savings",
      subtitle: "4.25% APY",
      description: "Earn competitive rates on savings",
      icon: "📈",
      gradient: "from-emerald-600 to-emerald-800",
      tag: "TOP RATE",
      cta: "Open Account",
      color: "emerald"
    },
    {
      id: 3,
      title: "Credit Card",
      subtitle: "0% Intro APR",
      description: "21 months on purchases & transfers",
      icon: "💳",
      gradient: "from-indigo-600 to-indigo-800",
      tag: "PREMIUM",
      cta: "Check Offer",
      color: "indigo"
    },
    {
      id: 4,
      title: "Home Loan",
      subtitle: "Rate Match",
      description: "We'll match any competitor's rate",
      icon: "🏠",
      gradient: "from-amber-600 to-amber-800",
      tag: "GUARANTEE",
      cta: "Get Quote",
      color: "amber"
    },
    {
      id: 5,
      title: "Auto Loan",
      subtitle: "3.99% APR",
      description: "Low rates on new & used vehicles",
      icon: "🚗",
      gradient: "from-cyan-600 to-cyan-800",
      tag: "SPECIAL",
      cta: "Apply Now",
      color: "cyan"
    },
    {
      id: 6,
      title: "Business Banking",
      subtitle: "2 Months Free",
      description: "Free business checking services",
      icon: "💼",
      gradient: "from-gray-700 to-gray-900",
      tag: "BUSINESS",
      cta: "Learn More",
      color: "gray"
    },
    {
      id: 7,
      title: "CD Special",
      subtitle: "4.50% APY",
      description: "12-month certificate of deposit",
      icon: "💰",
      gradient: "from-teal-600 to-teal-800",
      tag: "FIXED",
      cta: "Invest",
      color: "teal"
    },
    {
      id: 8,
      title: "Mobile Bonus",
      subtitle: "$25 Cash",
      description: "5 mobile check deposits this month",
      icon: "📱",
      gradient: "from-violet-600 to-violet-800",
      tag: "BONUS",
      cta: "Earn Now",
      color: "violet"
    }
  ];

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

  // Button color mapping based on promotion color
  const getButtonClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-700 hover:bg-blue-800',
      emerald: 'bg-emerald-700 hover:bg-emerald-800',
      indigo: 'bg-indigo-700 hover:bg-indigo-800',
      amber: 'bg-amber-700 hover:bg-amber-800',
      cyan: 'bg-cyan-700 hover:bg-cyan-800',
      gray: 'bg-gray-800 hover:bg-gray-900',
      teal: 'bg-teal-700 hover:bg-teal-800',
      violet: 'bg-violet-700 hover:bg-violet-800'
    };
    return colorMap[color] || 'bg-gray-800 hover:bg-gray-900';
  };

  return (
    <section className="mb-10">
      {/* Header with subtle colors */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🌟 Promotional Offers</h2>
          <p className="text-gray-600 text-sm mt-1">Special rates and exclusive bonuses</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{promotions.length}</span> available offers
          </div>
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        </div>
      </div>

      {/* Scrollable Container */}
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

        {/* Promotions Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 pt-2 pl-1 pr-1"
          style={{ scrollBehavior: 'smooth' }}
        >
          {promotions.map(promo => (
            <div 
              key={promo.id}
              className="flex-shrink-0 w-60 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              {/* Promo Header with Gradient */}
              <div className={`bg-gradient-to-r ${promo.gradient} p-4 rounded-t-xl`}>
                <div className="flex justify-between items-start">
                  <div className="text-2xl">{promo.icon}</div>
                  <span className="text-xs font-medium text-white bg-black/20 px-2 py-1 rounded">
                    {promo.tag}
                  </span>
                </div>
                <h3 className="text-white font-bold text-base mt-3">{promo.title}</h3>
                <div className="text-white text-xl font-bold mt-1">{promo.subtitle}</div>
              </div>

              {/* Promo Content */}
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{promo.description}</p>
                
                <button className={`w-full py-2.5 text-white rounded-lg font-medium transition-colors text-sm ${getButtonClass(promo.color)}`}>
                  {promo.cta}
                </button>
              </div>
            </div>
          ))}
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

      {/* Scroll Progress Indicator */}
      <div className="flex justify-center space-x-1.5 mt-6">
        {[1, 2, 3, 4].map((dot) => (
          <div key={dot} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
        ))}
      </div>

      {/* Instructions */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          Scroll or use arrows to browse offers • All offers subject to approval
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

export default PromotionalOffers;