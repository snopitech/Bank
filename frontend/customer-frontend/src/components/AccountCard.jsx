import React, { useState, useEffect } from "react";

export default function AccountCard({ 
  title, 
  account, 
  routingNumber,
  balanceChange = 0,
  lastUpdated = null
}) {
  
  // State for showing/hiding account number
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoHideTimeout, setAutoHideTimeout] = useState(null);
  
  // Get account number and status
  const accountNumber = account?.accountNumber || "";
  const isClosed = account?.closed === true;
  const isDisabled = account?.disabled === true;
  const isActive = !isClosed && !isDisabled;
  
  // Format account number for display
  const formatAccountNumber = () => {
    if (!accountNumber) return "Not available";
    
    if (showAccountNumber) {
      // Show full account number
      return accountNumber;
    } else {
      // Show first 5 digits, mask the rest (minimum 5 masked characters)
      if (accountNumber.length <= 5) {
        return accountNumber;
      }
      const visiblePart = accountNumber.slice(0, 5);
      const maskedLength = Math.max(5, accountNumber.length - 5);
      const maskedPart = "•".repeat(maskedLength);
      return `${visiblePart} ${maskedPart}`;
    }
  };
  
  // Handle eye icon click
  const handleRevealAccountNumber = () => {
    if (!isActive) return; // Don't allow revealing for closed or disabled accounts
    
    if (!showAccountNumber) {
      // Show account number
      setShowAccountNumber(true);
      setCopied(false);
      
      // Auto-hide after 10 seconds
      const timeout = setTimeout(() => {
        setShowAccountNumber(false);
      }, 10000);
      
      setAutoHideTimeout(timeout);
    } else {
      // Hide account number
      setShowAccountNumber(false);
      if (autoHideTimeout) {
        clearTimeout(autoHideTimeout);
        setAutoHideTimeout(null);
      }
    }
  };
  
  // Handle copy to clipboard
  const handleCopyAccountNumber = async () => {
    if (!accountNumber || !isActive) return;
    
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      
      // Reset copied status after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      // Auto-hide account number after copy (optional)
      const timeout = setTimeout(() => {
        setShowAccountNumber(false);
      }, 5000);
      
      if (autoHideTimeout) {
        clearTimeout(autoHideTimeout);
      }
      setAutoHideTimeout(timeout);
      
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = accountNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimeout) {
        clearTimeout(autoHideTimeout);
      }
    };
  }, [autoHideTimeout]);
  
  // Format time ago for last updated
  const formatTimeAgo = (date) => {
    if (!date) return "";
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get current balance with animation class
  const getBalanceWithAnimation = () => {
    const balance = account?.balance || 0;
    
    // If there's a recent balance change, add animation class (only for active accounts)
    if (balanceChange !== 0 && isActive) {
      return (
        <span className={`inline-block ${balanceChange > 0 ? 'text-green-600' : 'text-red-600'} animate-pulse`}>
          ${balance.toFixed(2)}
        </span>
      );
    }
    
    return `$${balance.toFixed(2)}`;
  };

  // Get status display
  const getStatusDisplay = () => {
    if (isClosed) {
      return {
        dot: 'bg-gray-400',
        text: 'text-gray-600',
        label: 'Closed',
        bg: 'bg-gray-100',
        border: 'border-gray-200',
        message: 'This account has been closed'
      };
    }
    if (isDisabled) {
      return {
        dot: 'bg-orange-500',
        text: 'text-orange-600',
        label: 'Disabled',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        message: 'Account temporarily disabled'
      };
    }
    return {
      dot: 'bg-green-500',
      text: 'text-green-600',
      label: 'Active',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      message: 'Account number protected • Click eye icon to reveal'
    };
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-white rounded-lg shadow p-6 transition transform hover:scale-[1.02] hover:shadow-lg relative">
      
      {/* Balance Change Badge - only for active accounts */}
      {balanceChange !== 0 && isActive && (
        <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
          balanceChange > 0 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        } animate-bounce`}>
          {balanceChange > 0 ? '▲' : '▼'} ${Math.abs(balanceChange).toFixed(2)}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-red-700 mb-4">
        {title}
        {isClosed && <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">Closed</span>}
        {isDisabled && <span className="ml-2 text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded-full">Disabled</span>}
      </h3>
      
      <div className="space-y-4">
        {/* Account Number Section with Security Features */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-500 font-medium">Account Number</p>
            <div className="flex items-center space-x-1">
              {showAccountNumber && accountNumber && isActive && (
                <button
                  onClick={handleCopyAccountNumber}
                  className={`text-xs px-2 py-1 rounded flex items-center transition ${
                    copied 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <span className="mr-1">✓</span>
                      Copied!
                    </>
                  ) : (
                    <>
                      <span className="mr-1">📋</span>
                      Copy
                    </>
                  )}
                </button>
              )}
              
              {accountNumber && isActive && (
                <button
                  onClick={handleRevealAccountNumber}
                  className="text-gray-500 hover:text-red-700 p-1 rounded-full hover:bg-gray-100 transition"
                  title={showAccountNumber ? "Hide account number" : "Show account number"}
                >
                  {showAccountNumber ? (
                    <span className="flex items-center">
                      <span className="mr-1">👁️‍🗨️</span>
                      <span className="text-xs">Hide</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-1">👁️</span>
                      <span className="text-xs">Show</span>
                    </span>
                  )}
                </button>
              )}

              {!isActive && (
                <span className="text-xs text-gray-400">
                  {isClosed ? 'Account Closed' : 'Account Disabled'}
                </span>
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded border ${
            !isActive 
              ? isClosed ? 'bg-gray-100 border-gray-300' : 'bg-orange-50 border-orange-200'
              : showAccountNumber 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`font-mono text-lg ${
              !isActive 
                ? isClosed ? 'text-gray-500' : 'text-orange-600'
                : showAccountNumber ? 'text-green-800' : 'text-gray-800'
            }`}>
              {formatAccountNumber()}
            </p>
            
            {showAccountNumber && isActive && (
              <div className="mt-2 flex items-center">
                <div className="flex-1">
                  <p className="text-xs text-green-700">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    Account number visible • Auto-hides in 10 seconds
                  </p>
                </div>
                <button
                  onClick={() => setShowAccountNumber(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Hide now
                </button>
              </div>
            )}
            
            {!showAccountNumber && accountNumber && isActive && (
              <p className="text-xs text-gray-500 mt-1">
                First 5 digits shown for security
              </p>
            )}

            {!isActive && (
              <p className="text-xs mt-1 text-gray-500">
                {isClosed ? 'This account has been closed' : 'Account temporarily disabled'}
              </p>
            )}
          </div>
        </div>
        
        {/* Balance Section */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-500 font-medium">Available Balance</p>
            {lastUpdated && isActive && (
              <p className="text-xs text-gray-400">
                Updated {formatTimeAgo(lastUpdated)}
              </p>
            )}
          </div>
          <p className={`text-2xl font-bold mt-1 ${
            !isActive ? 'text-gray-500' : 'text-gray-900'
          }`}>
            {getBalanceWithAnimation()}
          </p>
          
          {/* Balance Change Indicator */}
          {balanceChange !== 0 && isActive && (
            <p className={`text-sm mt-1 ${balanceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balanceChange > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(balanceChange).toFixed(2)}
            </p>
          )}

          {!isActive && (
            <p className="text-sm mt-1 text-gray-500">
              {isClosed ? 'Final balance at closure' : 'Account access restricted'}
            </p>
          )}
        </div>
        
        {/* Routing Number Section */}
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">Routing Number</p>
          <div className={`p-3 rounded border ${
            !isActive 
              ? isClosed ? 'bg-gray-100 border-gray-300' : 'bg-orange-50 border-orange-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`font-mono ${
              !isActive 
                ? isClosed ? 'text-gray-500' : 'text-orange-600'
                : 'text-gray-800'
            }`}>{routingNumber}</p>
            <p className={`text-xs mt-1 ${
              !isActive 
                ? isClosed ? 'text-gray-400' : 'text-orange-500'
                : 'text-gray-500'
            }`}>
              Used for direct deposits and wire transfers
            </p>
          </div>
        </div>
        
        {/* Additional Account Info */}
        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Account Type</p>
              <p className={`font-medium ${!isActive ? 'text-gray-500' : 'text-gray-800'}`}>
                {title.includes('Checking') ? 'Checking' : 'Savings'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <div className="flex items-center">
                <span className={`w-2 h-2 ${status.dot} rounded-full mr-2`}></span>
                <span className={`${status.text} font-medium`}>{status.label}</span>
              </div>
            </div>
          </div>
          
          {/* Status Message */}
          <div className={`mt-3 p-2 rounded border ${status.bg} ${status.border}`}>
            <div className="flex items-center">
              <span className={`${isActive ? 'text-blue-600' : isClosed ? 'text-gray-600' : 'text-orange-600'} mr-2`}>
                {isActive ? '🔒' : isClosed ? '🔒' : '⚠️'}
              </span>
              <span className={`text-xs ${status.text}`}>
                {status.message}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}