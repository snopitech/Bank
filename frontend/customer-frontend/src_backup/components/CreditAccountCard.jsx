// src/components/CreditAccountCard.jsx
import React, { useState, useEffect } from "react";
import {
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function CreditAccountCard({ 
  account,
  balanceChange = 0,
  lastUpdated = null,
  onMakePayment,
  onRequestIncrease,
  onViewCards,
  onViewTransactions,
  onRevealAccount // New prop for revealing account number
}) {
  
  // State for showing/hiding account number
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [fullAccountNumber, setFullAccountNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [autoHideTimeout, setAutoHideTimeout] = useState(null);
  const [showCards, setShowCards] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  
  // Get account details
  const accountNumber = account?.accountNumber || "";
  const maskedAccountNumber = account?.maskedAccountNumber || accountNumber;
  const isActive = account?.status === 'ACTIVE';
  const isFrozen = account?.status === 'FROZEN';
  const isClosed = account?.status === 'CLOSED';
  
  // Calculate utilization percentage
  const utilization = account?.creditLimit > 0 
    ? ((account.currentBalance / account.creditLimit) * 100).toFixed(1)
    : 0;
  
  // Get next limit for increase requests
  const getNextLimit = () => {
    if (!account) return null;
    switch(account.increaseCount) {
      case 1: return 10000;
      case 2: return 15000;
      case 3: return 20000;
      default: return null;
    }
  };

  const nextLimit = getNextLimit();
  
  // Format account number for display
  const formatAccountNumber = () => {
    if (!accountNumber && !fullAccountNumber) return "Not available";
    
    if (showAccountNumber && fullAccountNumber) {
      return fullAccountNumber;
    } else if (showAccountNumber && accountNumber) {
      return accountNumber; // Fallback to original if full not available
    } else {
      // Show masked version
      if (maskedAccountNumber) return maskedAccountNumber;
      if (accountNumber.length <= 5) return accountNumber;
      const visiblePart = accountNumber.slice(0, 5);
      const maskedLength = Math.max(5, accountNumber.length - 5);
      const maskedPart = "•".repeat(maskedLength);
      return `${visiblePart} ${maskedPart}`;
    }
  };
  
  // Handle reveal account number
  const handleRevealAccountNumber = async () => {
    if (!isActive) return;
    
    if (!showAccountNumber) {
      // Call the API to get full account number
      setIsRevealing(true);
      try {
        if (onRevealAccount) {
          const fullNumber = await onRevealAccount(account);
          if (fullNumber) {
            setFullAccountNumber(fullNumber);
            setShowAccountNumber(true);
            setCopied(false);
            
            // Auto-hide after 10 seconds
            const timeout = setTimeout(() => {
              setShowAccountNumber(false);
              setFullAccountNumber("");
            }, 10000);
            
            setAutoHideTimeout(timeout);
          }
        } else {
          // Fallback if no reveal function provided
          setShowAccountNumber(true);
          setCopied(false);
          
          const timeout = setTimeout(() => {
            setShowAccountNumber(false);
          }, 10000);
          
          setAutoHideTimeout(timeout);
        }
      } catch (err) {
        console.error('Failed to reveal account number:', err);
        alert('Could not reveal account number. Please try again.');
      } finally {
        setIsRevealing(false);
      }
    } else {
      // Hide the account number
      setShowAccountNumber(false);
      setFullAccountNumber("");
      if (autoHideTimeout) {
        clearTimeout(autoHideTimeout);
        setAutoHideTimeout(null);
      }
    }
  };
  
  // Handle copy to clipboard
  const handleCopyAccountNumber = async () => {
    const numberToCopy = fullAccountNumber || accountNumber;
    if (!numberToCopy || !isActive) return;
    
    try {
      await navigator.clipboard.writeText(numberToCopy);
      setCopied(true);
      
      setTimeout(() => setCopied(false), 2000);
      
      // Extend the auto-hide timer when copied
      if (autoHideTimeout) {
        clearTimeout(autoHideTimeout);
      }
      const timeout = setTimeout(() => {
        setShowAccountNumber(false);
        setFullAccountNumber("");
      }, 5000);
      
      setAutoHideTimeout(timeout);
      
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimeout) clearTimeout(autoHideTimeout);
    };
  }, [autoHideTimeout]);
  
  // Format time ago
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

  // Get balance with animation
  const getBalanceWithAnimation = () => {
    const balance = account?.currentBalance || 0;
    
    if (balanceChange !== 0 && isActive) {
      return (
        <span className={`inline-block ${balanceChange > 0 ? 'text-red-600' : 'text-green-600'} animate-pulse`}>
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
        message: 'This credit account has been closed'
      };
    }
    if (isFrozen) {
      return {
        dot: 'bg-blue-500',
        text: 'text-blue-600',
        label: 'Frozen',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        message: 'Account frozen - no transactions allowed'
      };
    }
    return {
      dot: 'bg-green-500',
      text: 'text-green-600',
      label: 'Active',
      bg: 'bg-green-50',
      border: 'border-green-100',
      message: 'Account number protected • Click eye icon to reveal'
    };
  };

  const status = getStatusDisplay();

  // Get utilization color
  const getUtilizationColor = () => {
    if (utilization > 80) return 'bg-red-500';
    if (utilization > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 transition transform hover:scale-[1.02] hover:shadow-lg relative border-t-4 border-t-blue-600">
      
      {/* Balance Change Badge */}
      {balanceChange !== 0 && isActive && (
        <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
          balanceChange > 0 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : 'bg-green-100 text-green-800 border border-green-200'
        } animate-bounce`}>
          {balanceChange > 0 ? '▲' : '▼'} ${Math.abs(balanceChange).toFixed(2)}
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <CreditCardIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Credit Account</h3>
            <p className="text-xs text-gray-500">Credit Limit: ${account?.creditLimit?.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`flex items-center px-2 py-1 rounded-full ${status.bg} ${status.border}`}>
          <span className={`w-2 h-2 ${status.dot} rounded-full mr-1`}></span>
          <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Account Number Section */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-500 font-medium">Account Number</p>
            <div className="flex items-center space-x-1">
              {showAccountNumber && (fullAccountNumber || accountNumber) && isActive && (
                <button
                  onClick={handleCopyAccountNumber}
                  className={`text-xs px-2 py-1 rounded flex items-center transition ${
                    copied 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                  title="Copy to clipboard"
                  disabled={isRevealing}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              )}
              
              {accountNumber && isActive && (
                <button
                  onClick={handleRevealAccountNumber}
                  className={`text-gray-500 hover:text-blue-700 p-1 rounded-full hover:bg-gray-100 transition ${
                    isRevealing ? 'opacity-50 cursor-wait' : ''
                  }`}
                  title={showAccountNumber ? "Hide account number" : "Show account number"}
                  disabled={isRevealing}
                >
                  {isRevealing ? (
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : showAccountNumber ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded border ${
            !isActive 
              ? 'bg-gray-100 border-gray-300'
              : showAccountNumber 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`font-mono text-lg ${
              !isActive 
                ? 'text-gray-500'
                : showAccountNumber ? 'text-green-800' : 'text-gray-800'
            }`}>
              {formatAccountNumber()}
            </p>
            
            {showAccountNumber && isActive && (
              <div className="mt-2 flex items-center">
                <p className="text-xs text-green-700">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Auto-hides in 10 seconds
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Balance Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Balance</p>
            <p className={`text-2xl font-bold ${!isActive ? 'text-gray-500' : 'text-gray-900'}`}>
              {getBalanceWithAnimation()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Available Credit</p>
            <p className={`text-2xl font-bold ${!isActive ? 'text-gray-500' : 'text-green-600'}`}>
              ${account?.availableCredit?.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Credit Utilization Bar */}
        {isActive && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Credit Utilization</span>
              <span className={`font-medium ${
                utilization > 80 ? 'text-red-600' : utilization > 50 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {utilization}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUtilizationColor()}`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Cards Section */}
        {account?.cards && account.cards.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-500 font-medium">Cards</p>
              <button
                onClick={() => setShowCards(!showCards)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showCards ? 'Hide' : 'Show'} {account.cards.length} card{account.cards.length > 1 ? 's' : ''}
              </button>
            </div>
            
            {showCards && (
              <div className="space-y-2">
                {account.cards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          {card.cardType}
                        </p>
                        <p className="text-xs font-mono text-gray-500">
                          {card.maskedNumber}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      card.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700' 
                        : card.status === 'FROZEN'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Increase Eligibility */}
        {isActive && nextLimit && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowPathIcon className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-xs text-blue-800">
                  Eligible for increase to ${nextLimit.toLocaleString()}
                </span>
              </div>
              {onRequestIncrease && (
                <button
                  onClick={() => onRequestIncrease(account)}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                >
                  Request
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Payment Due (placeholder) */}
        {isActive && account?.paymentDueDay && (
          <div className="flex justify-between text-xs text-gray-600">
            <span>Payment due by the {account.paymentDueDay}th</span>
            <span className="font-medium">Min: ${account.minimumPaymentAmount}</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {onMakePayment && (
            <button
              onClick={() => onMakePayment(account)}
              disabled={!isActive}
              className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <BanknotesIcon className="h-3 w-3 mr-1" />
              Pay
            </button>
          )}
          
          {onViewCards && (
            <button
              onClick={() => onViewCards(account)}
              disabled={!isActive}
              className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-gray-800 text-white hover:bg-gray-900'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CreditCardIcon className="h-3 w-3 mr-1" />
              Cards
            </button>
          )}
          
          {onViewTransactions && (
            <button
              onClick={() => onViewTransactions(account)}
              disabled={!isActive}
              className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ArrowPathIcon className="h-3 w-3 mr-1" />
              Activity
            </button>
          )}
        </div>
        
        {/* Last Updated */}
        {lastUpdated && isActive && (
          <p className="text-xs text-gray-400 text-right mt-2">
            Updated {formatTimeAgo(lastUpdated)}
          </p>
        )}
      </div>
    </div>
  );
}