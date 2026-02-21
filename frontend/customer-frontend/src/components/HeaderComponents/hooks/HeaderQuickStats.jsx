// src/components/HeaderComponents/hooks/HeaderQuickStats.jsx
import useHeaderData from "./useHeaderData";

const HeaderQuickStats = () => {
  const { stats, loading } = useHeaderData();
  
  if (loading || !stats) {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 h-7 w-24 rounded"></div>
        ))}
      </div>
    );
  }
  
  // ⭐⭐⭐ FIX: Add null checks for stats properties
  return (
    <div className="flex items-center space-x-3 text-sm">
      {/* Each stat as a pill */}
      <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
        <span className="text-red-600 font-bold">$</span>
        <span className="font-bold text-gray-900">
          {/* ⭐⭐⭐ FIX: Add null check */}
          {stats.balance?.toLocaleString(undefined, { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
          }) || '0'}
        </span>
        <span className="text-xs text-gray-500">Balance</span>
      </div>
      
      <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
        <span className="text-red-600">↕</span>
        <span className="font-bold text-gray-900">
          {/* ⭐⭐⭐ FIX: Add null check */}
          {stats.todaysTransactions || 0}
        </span>
        <span className="text-xs text-gray-500">Today</span>
      </div>
      
      <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
        <span className="text-red-600">🏦</span>
        <span className="font-bold text-gray-900">
          {/* ⭐⭐⭐ FIX: Add null check */}
          {stats.totalAccounts || 0}
        </span>
        <span className="text-xs text-gray-500">Accounts</span>
      </div>
    </div>
  );
};

export default HeaderQuickStats;