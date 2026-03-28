/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const QuickActions = ({
  showTransferDropdown,
  setShowTransferDropdown,
  showPayBillsDropdown,
  setShowPayBillsDropdown,
  openTransferModal,
  openPayBillsModal,
  selectedAccount,
  handleTransferClick,
  handlePayBillsClick,
  checkingAccount,
  savingsAccount,
  businessAccounts = [],
  creditAccounts = [],
  loanAccounts = []
}) => {
  // State for showing full account numbers (eye icon toggle)
  const [showFullNumbers, setShowFullNumbers] = useState({});

  // Neutral color mapping for different actions
  const actionColors = {
    transfer: 'from-gray-600 to-gray-700',
    payBills: 'from-gray-600 to-gray-700'
  };

  // Account type display names and colors
  const accountTypeConfig = {
    CHECKING: { 
      label: 'Checking', 
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700'
    },
    SAVINGS: { 
      label: 'Savings', 
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700'
    },
    BUSINESS: { 
      label: 'Business', 
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700'
    },
    CREDIT: { 
      label: 'Credit', 
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700'
    },
    LOAN: { 
      label: 'Loan', 
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700'
    }
  };

  // Get account nickname helper (simplified)
  const getAccountNickname = (type) => {
    if (type === 'CHECKING') return 'Everyday Checking';
    if (type === 'SAVINGS') return 'Everyday Savings';
    if (type === 'BUSINESS') return 'Business Account';
    if (type === 'CREDIT') return 'Credit Card';
    if (type === 'LOAN') return 'Loan Account';
    return 'Account';
  };

  // Build unified accounts array (just for reference, not used in dropdowns)
  const allAccounts = [
    ...(checkingAccount ? [{
      id: 'checking',
      type: 'CHECKING',
      nickname: getAccountNickname('CHECKING')
    }] : []),
    ...(savingsAccount ? [{
      id: 'savings',
      type: 'SAVINGS',
      nickname: getAccountNickname('SAVINGS')
    }] : []),
    ...businessAccounts.map(biz => ({
      id: `business-${biz.id}`,
      type: 'BUSINESS',
      nickname: biz.businessName
    })),
    ...creditAccounts.map(credit => ({
      id: `credit-${credit.id}`,
      type: 'CREDIT',
      nickname: 'Credit Card'
    })),
    ...loanAccounts.map(loan => ({
      id: `loan-${loan.id}`,
      type: 'LOAN',
      nickname: 'Loan Account'
    }))
  ];

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 relative">
        {/* Transfer Money Button with Dropdown */}
        <div className="transfer-dropdown-container relative">
          <button
            onClick={handleTransferClick}
            className={`w-full bg-gradient-to-r ${actionColors.transfer} text-white py-3 rounded-lg shadow hover:shadow-lg transition transform hover:scale-[1.03] active:scale-[0.97] font-semibold flex items-center justify-center`}
          >
            💸 Transfer Money
            <svg className={`ml-2 w-4 h-4 transition-transform ${showTransferDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {/* Transfer Dropdown Menu */}
          {showTransferDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden min-w-[280px]">
              <div className="p-2">
                <div className={`px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r ${actionColors.transfer} rounded-t mb-2`}>
                  💸 Transfer Money
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={() => openTransferModal("betweenAccounts")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <span className="mr-2">🔄</span>
                    Between My Accounts
                    <span className="ml-auto text-xs text-gray-500">Instant</span>
                  </button>
                  
                  <button
                    onClick={() => openTransferModal("toOtherBank")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <span className="mr-2">🏦</span>
                    To Another Bank
                    <span className="ml-auto text-xs text-gray-500">1-3 days</span>
                  </button>
                  
                  <button
                    onClick={() => openTransferModal("zelle")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <span className="mr-2">⚡</span>
                    Send with Zelle®
                    <span className="ml-auto text-xs text-gray-500">Instant</span>
                  </button>
                  
                  <button
                    onClick={() => openTransferModal("wire")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <span className="mr-2">💳</span>
                    Wire Transfer
                    <span className="ml-auto text-xs text-gray-500">Same day</span>
                  </button>
                  
                  <button
                    onClick={() => openTransferModal("international")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <span className="mr-2">🌎</span>
                    International Transfer
                    <span className="ml-auto text-xs text-gray-500">2-5 days</span>
                  </button>
                </div>
                
                <div className="px-3 py-2 text-xs text-gray-500 border-t mt-2">
                  <div className="flex justify-between">
                    <span>From: {selectedAccount === "CHECKING" ? "Checking" : selectedAccount === "SAVINGS" ? "Savings" : selectedAccount === "CREDIT" ? "Credit" : selectedAccount === "LOAN" ? "Loan" : "Business"}</span>
                    <span>Fee: $0 for internal</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pay Bills Button with Dropdown */}
        <div className="paybills-dropdown-container relative">
          <button
            onClick={handlePayBillsClick}
            className={`w-full bg-gradient-to-r ${actionColors.payBills} text-white py-3 rounded-lg shadow hover:shadow-lg transition transform hover:scale-[1.03] active:scale-[0.97] font-semibold flex items-center justify-center`}
          >
            📋 Pay Bills
            <svg className={`ml-2 w-4 h-4 transition-transform ${showPayBillsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {/* Pay Bills Dropdown Menu */}
          {showPayBillsDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden min-w-[280px]">
              <div className="p-2">
                <div className={`px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r ${actionColors.payBills} rounded-t mb-2`}>
                  📋 Pay Bills
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={() => openPayBillsModal("utilities")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <span className="mr-2">💡</span>
                    Utilities
                    <span className="ml-auto text-xs text-gray-500">Electric, Water, Gas</span>
                  </button>
                  
                  <button
                    onClick={() => openPayBillsModal("creditCards")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <span className="mr-2">💳</span>
                    Credit Cards
                    <span className="ml-auto text-xs text-gray-500">Visa, Mastercard, Amex</span>
                  </button>
                  
                  <button
                    onClick={() => openPayBillsModal("loans")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <span className="mr-2">🏠</span>
                    Loans & Mortgages
                    <span className="ml-auto text-xs text-gray-500">Auto, Home, Personal</span>
                  </button>
                  
                  <button
                    onClick={() => openPayBillsModal("insurance")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <span className="mr-2">🛡️</span>
                    Insurance
                    <span className="ml-auto text-xs text-gray-500">Health, Auto, Home</span>
                  </button>
                  
                  <button
                    onClick={() => openPayBillsModal("subscriptions")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <span className="mr-2">📺</span>
                    Subscriptions
                    <span className="ml-auto text-xs text-gray-500">Netflix, Spotify, etc.</span>
                  </button>
                  
                  <button
                    onClick={() => openPayBillsModal("addPayee")}
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center border-t border-gray-100 mt-1 pt-2"
                  >
                    <span className="mr-2">➕</span>
                    Add New Payee
                    <span className="ml-auto text-xs text-gray-500">New biller</span>
                  </button>
                </div>
                
                <div className="px-3 py-2 text-xs text-gray-500 border-t mt-2">
                  <div className="flex justify-between">
                    <span>From: {selectedAccount === "CHECKING" ? "Checking" : selectedAccount === "SAVINGS" ? "Savings" : selectedAccount === "CREDIT" ? "Credit" : selectedAccount === "LOAN" ? "Loan" : "Business"}</span>
                    <span>Schedule payments</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;