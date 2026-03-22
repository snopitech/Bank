import React from 'react';

const RealTimeStatusBar = ({
  connectionStatus,
  lastUpdated,
  isRefreshing,
  formatTimeAgo,
  autoRefreshEnabled,
  toggleAutoRefresh,
  handleManualRefresh,
  balanceChange
}) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4 mb-3 md:mb-0">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              connectionStatus === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}></div>
            <span className="text-sm font-medium">
              {connectionStatus === "online" ? "Live" : "Offline"}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Last updated:</span> {formatTimeAgo(lastUpdated)}
          </div>
          {isRefreshing && (
            <div className="flex items-center text-blue-600">
              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Updating...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <button
              onClick={toggleAutoRefresh}
              className={`text-sm px-3 py-1 rounded-full flex items-center ${
                autoRefreshEnabled 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{autoRefreshEnabled ? '🔵' : '⚪'}</span>
              Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center text-sm bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 rounded-full transition"
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <span className="mr-1">🔄</span>
                Refresh Now
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Balance Change Indicators */}
      {(balanceChange.checking !== 0 || balanceChange.savings !== 0) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {balanceChange.checking !== 0 && (
              <div className={`flex items-center justify-between p-2 rounded ${
                balanceChange.checking > 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <span className="text-sm font-medium">Checking Account</span>
                <span className={`text-sm font-bold ${
                  balanceChange.checking > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {balanceChange.checking > 0 ? '+' : ''}${Math.abs(balanceChange.checking).toFixed(2)}
                </span>
              </div>
            )}
            {balanceChange.savings !== 0 && (
              <div className={`flex items-center justify-between p-2 rounded ${
                balanceChange.savings > 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <span className="text-sm font-medium">Savings Account</span>
                <span className={`text-sm font-bold ${
                  balanceChange.savings > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {balanceChange.savings > 0 ? '+' : ''}${Math.abs(balanceChange.savings).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeStatusBar;