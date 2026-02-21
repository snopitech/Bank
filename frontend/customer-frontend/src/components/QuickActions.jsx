import React, { useState } from 'react';

const QuickActions = ({
  showTransferDropdown,
  setShowTransferDropdown,
  showPayBillsDropdown,
  setShowPayBillsDropdown,
  showStatementDropdown,
  setShowStatementDropdown,
  openTransferModal,
  openPayBillsModal,
  downloadingStatement,
  expandedAccountInDropdown,
  toggleAccountExpansion,
  getAccountNickname,
  getMaskedAccountNumber,
  getAccountBalance,
  openStatementInNewTab,
  downloadCSVStatement,
  filterStartDate,
  filterEndDate,
  selectedAccount,
  handleTransferClick,
  handlePayBillsClick,
  handleViewStatementsClick,
  checkingAccount,
  savingsAccount,
  businessAccounts = []
}) => {
  // State for showing full account numbers (eye icon toggle)
  const [showFullNumbers, setShowFullNumbers] = useState({});

  // Neutral color mapping for different actions
  const actionColors = {
    transfer: 'from-gray-600 to-gray-700',
    payBills: 'from-gray-600 to-gray-700',
    deposit: 'from-gray-600 to-gray-700',
    statements: 'from-gray-600 to-gray-700'
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
    }
  };

  // Build unified accounts array
  const allAccounts = [
    // Add checking if it exists
    ...(checkingAccount ? [{
      id: 'checking',
      type: 'CHECKING',
      accountNumber: checkingAccount.accountNumber,
      balance: checkingAccount.balance,
      nickname: getAccountNickname('CHECKING'),
      originalType: 'CHECKING'
    }] : []),
    
    // Add savings if it exists
    ...(savingsAccount ? [{
      id: 'savings',
      type: 'SAVINGS',
      accountNumber: savingsAccount.accountNumber,
      balance: savingsAccount.balance,
      nickname: getAccountNickname('SAVINGS'),
      originalType: 'SAVINGS'
    }] : []),
    
    // Add all business accounts
    ...businessAccounts.map(biz => ({
      id: `business-${biz.id}`,
      type: 'BUSINESS',
      accountNumber: biz.accountNumber,
      balance: biz.accountBalance,
      nickname: biz.businessName,
      originalType: 'BUSINESS',
      originalId: biz.id,
      accountId: biz.accountId
    }))
  ];

  const toggleShowFullNumber = (accountId, e) => {
    e.stopPropagation();
    setShowFullNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const formatAccountNumber = (account, showFull) => {
    if (!account.accountNumber) return 'Not available';
    if (showFull) return account.accountNumber;
    
    // Show first 5 digits, mask the rest
    if (account.accountNumber.length <= 5) return account.accountNumber;
    const visiblePart = account.accountNumber.slice(0, 5);
    const maskedLength = Math.max(5, account.accountNumber.length - 5);
    const maskedPart = '•'.repeat(maskedLength);
    return `${visiblePart} ${maskedPart}`;
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
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
                    <span>Selected: {selectedAccount === "CHECKING" ? "Checking" : selectedAccount === "SAVINGS" ? "Savings" : "Business"}</span>
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
                    <span>From: {selectedAccount === "CHECKING" ? "Checking" : selectedAccount === "SAVINGS" ? "Savings" : "Business"}</span>
                    <span>Schedule payments</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deposit Check Button */}
        <button className={`w-full bg-gradient-to-r ${actionColors.deposit} text-white py-3 rounded-lg shadow hover:shadow-lg transition transform hover:scale-[1.03] active:scale-[0.97] font-semibold`}>
          📥 Deposit Check
        </button>

        {/* View Statements Button with Dynamic Dropdown */}
        <div className="statement-dropdown-container relative">
          <button
            onClick={handleViewStatementsClick}
            className={`w-full bg-gradient-to-r ${actionColors.statements} text-white py-3 rounded-lg shadow hover:shadow-lg transition transform hover:scale-[1.03] active:scale-[0.97] font-semibold flex items-center justify-center`}
            disabled={downloadingStatement}
          >
            {downloadingStatement ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                📄 View Statements
                <svg className={`ml-2 w-4 h-4 transition-transform ${showStatementDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </>
            )}
          </button>

          {/* Dynamic Dropdown Menu - Shows ALL accounts */}
          {showStatementDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden min-w-[350px] max-h-[500px] overflow-y-auto">
              <div className="p-2">
                {/* Header */}
                <div className={`px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r ${actionColors.statements} rounded-t mb-2 sticky top-0`}>
                  📄 Download Statements
                </div>
                
                {/* Dynamically render each account */}
                {allAccounts.map((account) => {
                  const config = accountTypeConfig[account.type];
                  const isExpanded = expandedAccountInDropdown === account.id;
                  const showFull = showFullNumbers[account.id];
                  
                  return (
                    <div key={account.id} className={`mb-2 ${isExpanded ? `${config.bgLight} rounded-lg` : ''}`}>
                      <button
                        onClick={() => toggleAccountExpansion(account.id)}
                        className={`w-full text-left px-3 py-3 rounded-t-lg flex justify-between items-center ${
                          isExpanded 
                            ? `${config.bgLight} border-b ${config.border}` 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${selectedAccount === account.originalType ? config.color : 'bg-gray-300'}`}></div>
                          <div>
                            <div className="font-medium text-gray-800">{account.nickname}</div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <span>{formatAccountNumber(account, showFull)}</span>
                              <button
                                onClick={(e) => toggleShowFullNumber(account.id, e)}
                                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                                title={showFull ? "Hide account number" : "Show full account number"}
                              >
                                {showFull ? '👁️' : '👁️‍🗨️'}
                              </button>
                              <span className="ml-2">• {config.label}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">${account.balance?.toFixed(2) || '0.00'}</div>
                          <div className="text-xs text-gray-500">
                            {isExpanded ? '▲' : '▼'}
                          </div>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="px-3 py-2 border-t border-gray-100">
                          {/* View Statement Options */}
                          <div className="mb-3">
                            <div className="flex items-center text-gray-700 mb-2">
                              <span className="mr-2">👁️</span>
                              <span className="text-sm font-medium">View Statement (New Tab)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                onClick={() => openStatementInNewTab(account.originalType, '30days', account.originalId)}
                                className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                              >
                                <span className="mr-2">📅</span>
                                Last 30 Days
                              </button>
                              <button
                                onClick={() => openStatementInNewTab(account.originalType, 'currentMonth', account.originalId)}
                                className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                              >
                                <span className="mr-2">📅</span>
                                Current Month
                              </button>
                              <button
                                onClick={() => openStatementInNewTab(account.originalType, 'lastMonth', account.originalId)}
                                className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                              >
                                <span className="mr-2">📅</span>
                                Last Month
                              </button>
                              <button
                                onClick={() => {
                                  if (filterStartDate && filterEndDate) {
                                    openStatementInNewTab(account.originalType, 'custom', account.originalId);
                                  } else {
                                    alert('Please set custom dates in the filter section first.');
                                  }
                                }}
                                className={`text-left px-3 py-2 text-sm rounded flex items-center ${
                                  filterStartDate && filterEndDate 
                                    ? 'text-gray-700 hover:bg-gray-50' 
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!filterStartDate || !filterEndDate}
                              >
                                <span className="mr-2">🎯</span>
                                Custom Range
                              </button>
                            </div>
                          </div>
                          
                          {/* Download CSV Options */}
                          <div>
                            <div className="flex items-center text-gray-700 mb-2">
                              <span className="mr-2">⬇️</span>
                              <span className="text-sm font-medium">Download as CSV</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                onClick={() => downloadCSVStatement(account.originalType, '30days', account.originalId)}
                                className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                              >
                                <span className="mr-2">📅</span>
                                Last 30 Days
                              </button>
                              <button
                                onClick={() => downloadCSVStatement(account.originalType, 'currentMonth', account.originalId)}
                                className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                              >
                                <span className="mr-2">📅</span>
                                Current Month
                              </button>
                              <button
                                onClick={() => downloadCSVStatement(account.originalType, 'lastMonth', account.originalId)}
                                className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                              >
                                <span className="mr-2">📅</span>
                                Last Month
                              </button>
                              <button
                                onClick={() => {
                                  if (filterStartDate && filterEndDate) {
                                    downloadCSVStatement(account.originalType, 'custom', account.originalId);
                                  } else {
                                    alert('Please set custom dates in the filter section first.');
                                  }
                                }}
                                className={`text-left px-3 py-2 text-sm rounded flex items-center ${
                                  filterStartDate && filterEndDate 
                                    ? 'text-gray-700 hover:bg-gray-50' 
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!filterStartDate || !filterEndDate}
                              >
                                <span className="mr-2">🎯</span>
                                Custom Range
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Footer */}
                <div className="px-3 py-2 text-xs text-gray-500 border-t mt-3 sticky bottom-0 bg-white">
                  <div className="flex justify-between">
                    <span>
                      <span className="inline-block w-2 h-2 rounded-full mr-1 bg-green-500"></span>
                      Currently selected
                    </span>
                    <span>Total Accounts: {allAccounts.length}</span>
                  </div>
                  <div className="mt-1 text-center">
                    👁️ Click eye icon to show/hide full account number
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