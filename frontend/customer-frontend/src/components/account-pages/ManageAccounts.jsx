/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
// src/components/account-pages/ManageAccounts.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BuildingLibraryIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const API_BASE = "";

const ManageAccounts = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [loanAccounts, setLoanAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [accountDetails, setAccountDetails] = useState({});
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedFromAccount, setSelectedFromAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, regular, credit, loan

  // Get user from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser") || '{}');
    setUser(userData);
  }, []);

  // Fetch all accounts when user is loaded
  useEffect(() => {
    if (user?.id) {
      fetchAllAccounts();
    }
  }, [user]);

 const fetchAllAccounts = async () => {
    setLoading(true);
    try {
      // Fetch regular accounts (checking/savings)
      const token = localStorage.getItem('token');
      const accountsResponse = await fetch(`${API_BASE}/api/accounts/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        console.log("✅ Regular accounts fetched:", accountsData);
        setAccounts(accountsData);
      } else {
        console.log("❌ Regular accounts response not OK:", accountsResponse.status);
      }

      // Fetch credit accounts
      const creditResponse = await fetch(`${API_BASE}/api/credit/accounts/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (creditResponse.ok) {
        const creditData = await creditResponse.json();
        console.log("✅ Credit accounts fetched:", creditData);
        setCreditAccounts(creditData);
      } else {
        console.log("❌ Credit accounts response not OK:", creditResponse.status);
      }

      // Fetch loan accounts - NO sessionId header (fixed)
      const loanResponse = await fetch(`${API_BASE}/api/loan/accounts?userId=${user.id}`);
      
      if (loanResponse.ok) {
        const loanData = await loanResponse.json();
        console.log("✅ Loan accounts fetched:", loanData);
        setLoanAccounts(loanData);
      } else {
        console.log("❌ Loan accounts response not OK:", loanResponse.status);
        const errorText = await loanResponse.text();
        console.log("Error response:", errorText);
      }

    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountDetails = async (accountId, accountType) => {
    try {
      const token = localStorage.getItem('token');
      
      if (accountType === 'credit') {
        const response = await fetch(`${API_BASE}/api/credit/accounts/${accountId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAccountDetails(prev => ({ ...prev, [`credit-${accountId}`]: data }));
        }
      } else if (accountType === 'loan') {
        const response = await fetch(`${API_BASE}/api/loan/accounts/${accountId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAccountDetails(prev => ({ ...prev, [`loan-${accountId}`]: data }));
        }
      } else {
        const response = await fetch(`${API_BASE}/api/accounts/${accountId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAccountDetails(prev => ({ ...prev, [accountId]: data }));
        }
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };

  const handleUpdateNickname = async (accountId, accountType) => {
    if (!editValue.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (accountType === 'credit') {
        const response = await fetch(`${API_BASE}/api/credit/accounts/${accountId}/nickname`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ nickname: editValue })
        });
        
        if (response.ok) {
          const updatedAccount = await response.json();
          setCreditAccounts(creditAccounts.map(acc => 
            acc.id === accountId ? updatedAccount : acc
          ));
          setEditingId(null);
          setEditValue('');
        }
      } else if (accountType === 'loan') {
        const response = await fetch(`${API_BASE}/api/loan/accounts/${accountId}/nickname`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ nickname: editValue })
        });
        
        if (response.ok) {
          const updatedAccount = await response.json();
          setLoanAccounts(loanAccounts.map(acc => 
            acc.id === accountId ? updatedAccount : acc
          ));
          setEditingId(null);
          setEditValue('');
        }
      } else {
        const response = await fetch(`${API_BASE}/api/accounts/${accountId}/nickname`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ nickname: editValue })
        });
        
        if (response.ok) {
          const updatedAccount = await response.json();
          setAccounts(accounts.map(acc => 
            acc.id === accountId ? updatedAccount : acc
          ));
          setEditingId(null);
          setEditValue('');
        }
      }
    } catch (error) {
      console.error('Error updating nickname:', error);
    }
  };

  const handleCloseAccount = async (accountId, accountType, balance = 0) => {
    // Check if account has balance
    if (balance > 0) {
      alert(`Cannot close account with balance of ${formatCurrency(balance)}. Please transfer or withdraw all funds first.`);
      return;
    }
    
    if (!window.confirm('Are you sure you want to close this account? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (accountType === 'credit') {
        response = await fetch(`${API_BASE}/api/credit/accounts/${accountId}/close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: 'Customer requested closure' })
        });
      } else if (accountType === 'loan') {
        response = await fetch(`${API_BASE}/api/loan/accounts/${accountId}/close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: 'Customer requested closure' })
        });
      } else {
        response = await fetch(`${API_BASE}/api/accounts/${accountId}/close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: 'Customer requested closure' })
        });
      }
      
      if (response.ok) {
        alert('Account closed successfully');
        fetchAllAccounts(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Error closing account: ' + error.error);
      }
    } catch (error) {
      console.error('Error closing account:', error);
      alert('Failed to close account');
    }
  };

  const handleTransfer = (fromAccount) => {
    setSelectedFromAccount(fromAccount);
    setShowTransferModal(true);
  };

  const handleMakePayment = (account) => {
    if (onNavigate) {
      onNavigate('make-payment', { account });
    }
  };

  const handleViewTransactions = (accountId, accountType) => {
    if (onNavigate) {
      onNavigate('transactions', { accountId, accountType });
    }
  };

  const handleExpand = (accountId, accountType) => {
    const uniqueId = `${accountType}-${accountId}`;
    if (expandedId === uniqueId) {
      setExpandedId(null);
    } else {
      setExpandedId(uniqueId);
      if (!accountDetails[uniqueId]) {
        fetchAccountDetails(accountId, accountType);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAccountIcon = (type, accountType) => {
    if (accountType === 'credit') {
      return (
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <CreditCardIcon className="h-5 w-5 text-purple-600" />
        </div>
      );
    } else if (accountType === 'loan') {
      return (
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <ChartBarIcon className="h-5 w-5 text-amber-600" />
        </div>
      );
    } else if (type === 'CHECKING') {
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <CreditCardIcon className="h-5 w-5 text-blue-600" />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <BuildingLibraryIcon className="h-5 w-5 text-emerald-600" />
        </div>
      );
    }
  };

  const getAccountTypeBadge = (type, accountType) => {
    if (accountType === 'credit') {
      return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700">CREDIT CARD</span>;
    } else if (accountType === 'loan') {
      return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700">LOAN</span>;
    } else if (type === 'CHECKING') {
      return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">CHECKING</span>;
    } else {
      return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">SAVINGS</span>;
    }
  };

// Combine all accounts for display based on active tab
const getAllAccounts = () => {
    const regularWithType = accounts.map(acc => ({ ...acc, accountCategory: 'regular' }));
    const creditWithType = creditAccounts.map(acc => ({ ...acc, accountCategory: 'credit' }));
    const loanWithType = loanAccounts.map(acc => ({ ...acc, accountCategory: 'loan' }));
    
    console.log("Regular accounts with type:", regularWithType);
    console.log("Credit accounts with type:", creditWithType);
    console.log("Loan accounts with type:", loanWithType);
    
    let all = [...regularWithType, ...creditWithType, ...loanWithType];
    
    // Filter based on active tab
    if (activeTab === 'regular') {
      all = regularWithType;
    } else if (activeTab === 'credit') {
      all = creditWithType;
    } else if (activeTab === 'loan') {
      all = loanWithType;
    }
    
    console.log("All accounts after filter:", all);
    return all;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  const allAccounts = getAllAccounts();
  const regularCount = accounts.length;
  const creditCount = creditAccounts.length;
  const loanCount = loanAccounts.length;
  const totalCount = regularCount + creditCount + loanCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
        <div>
          <h2 className="text-2xl font-light text-gray-800 mb-1">Manage Accounts</h2>
          <p className="text-sm text-gray-500">View and manage all your accounts including credit cards and loans</p>
        </div>
      </div>

      {/* Account Type Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'all' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Accounts ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('regular')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'regular' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          Checking & Savings ({regularCount})
        </button>
        <button
          onClick={() => setActiveTab('credit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'credit' 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
          }`}
        >
          Credit Cards ({creditCount})
        </button>
        <button
          onClick={() => setActiveTab('loan')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'loan' 
              ? 'bg-amber-600 text-white' 
              : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
          }`}
        >
          Loans ({loanCount})
        </button>
      </div>

      {/* Accounts List */}
      {allAccounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingLibraryIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No accounts found</h3>
          <p className="text-sm text-gray-500">
            {activeTab === 'credit' ? "You don't have any credit cards yet." :
             activeTab === 'loan' ? "You don't have any loans yet." :
             "You don't have any accounts yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allAccounts.map((account) => {
            const uniqueId = `${account.accountCategory}-${account.id}`;
            const isCredit = account.accountCategory === 'credit';
            const isLoan = account.accountCategory === 'loan';
            
            return (
              <div 
                key={uniqueId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Account Summary Row */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getAccountIcon(account.accountType, account.accountCategory)}
                      
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          {editingId === uniqueId ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-800 focus:border-gray-800"
                                placeholder="Enter nickname"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateNickname(account.id, account.accountCategory)}
                                className="p-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditValue('');
                                }}
                                className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <h3 className="text-lg font-medium text-gray-800">
                              {account.nickname || 
                               (isCredit ? 'Credit Card' : 
                                isLoan ? 'Loan Account' :
                                account.accountType === 'CHECKING' ? 'Everyday Checking' : 'Everyday Savings')}
                            </h3>
                          )}
                          
                          {getAccountTypeBadge(account.accountType, account.accountCategory)}
                          
                          {!editingId && (
                            <button
                              onClick={() => {
                                setEditingId(uniqueId);
                                setEditValue(account.nickname || '');
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                              title="Edit nickname"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-2">
                          Account {account.accountNumber || account.maskedAccountNumber}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          {isCredit ? (
                            <>
                              <span className="text-gray-700 font-medium">
                                Balance: {formatCurrency(account.currentBalance || account.balance || 0)}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">
                                Available: {formatCurrency(account.availableCredit || 0)}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">
                                Limit: {formatCurrency(account.creditLimit || 0)}
                              </span>
                            </>
                          ) : isLoan ? (
                            <>
                             <span className="text-gray-700 font-medium">
                             Balance: {formatCurrency(account.outstandingBalance || 0)}
                             </span>
                             <span className="text-gray-400">•</span>
                             <span className="text-gray-500">
                             Available: {formatCurrency((account.approvedAmount - account.outstandingBalance) || 0)}
                             </span>
                             <span className="text-gray-400">•</span>
                             <span className="text-gray-500">
                             Rate: {account.interestRate || 2.5}% APR
                             </span>
                             </>
                          ) : (
                            <>
                              <span className="text-gray-700 font-medium">
                                {formatCurrency(account.balance)}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">
                                Routing: {account.routingNumber}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleExpand(account.id, account.accountCategory)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                      title={expandedId === uniqueId ? 'Show less' : 'Show more'}
                    >
                      {expandedId === uniqueId ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === uniqueId && accountDetails[uniqueId] && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Account Features */}
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                          {isCredit ? 'Card Features' : isLoan ? 'Loan Details' : 'Account Features'}
                        </h4>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="space-y-2">
                            {isCredit && accountDetails[uniqueId].features?.map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-600">
                                <CheckCircleIcon className="h-4 w-4 text-purple-500 mr-2" />
                                {feature}
                              </div>
                            ))}
                            {isLoan && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Term:</span>
                                  <span className="font-medium text-gray-800">{accountDetails[uniqueId].term || '60 months'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Next Payment:</span>
                                  <span className="font-medium text-gray-800">{formatDate(accountDetails[uniqueId].nextPaymentDate)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Payment Amount:</span>
                                  <span className="font-medium text-gray-800">{formatCurrency(accountDetails[uniqueId].monthlyPayment || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Remaining Payments:</span>
                                  <span className="font-medium text-gray-800">{accountDetails[uniqueId].remainingPayments || 0}</span>
                                </div>
                              </>
                            )}
                            {!isCredit && !isLoan && accountDetails[account.id]?.features?.map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-600">
                                <CheckCircleIcon className="h-4 w-4 text-emerald-500 mr-2" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Account Details */}
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                          {isCredit ? 'Card Details' : isLoan ? 'Loan Terms' : 'Account Details'}
                        </h4>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                          {isCredit ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">APR</span>
                                <span className="text-sm font-medium text-gray-800">{accountDetails[uniqueId].apr || '18.99%'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Payment Due</span>
                                <span className="text-sm font-medium text-gray-800">{accountDetails[uniqueId].paymentDueDate || '15th of each month'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Min Payment</span>
                                <span className="text-sm font-medium text-gray-800">{formatCurrency(accountDetails[uniqueId].minimumPayment || 35)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Rewards</span>
                                <span className="text-sm font-medium text-gray-800">{accountDetails[uniqueId].rewards || '1.5% cash back'}</span>
                              </div>
                            </>
                          ) : isLoan ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Interest Rate</span>
                                <span className="text-sm font-medium text-gray-800">{account.interestRate || 0}% APR</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Origination Date</span>
                                <span className="text-sm font-medium text-gray-800">{formatDate(account.originationDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Maturity Date</span>
                                <span className="text-sm font-medium text-gray-800">{formatDate(account.maturityDate)}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Monthly Fee</span>
                                <span className="text-sm font-medium text-gray-800">{accountDetails[account.id]?.monthlyFee || '$0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Interest Rate</span>
                                <span className="text-sm font-medium text-gray-800">{accountDetails[account.id]?.interestRate || '0.01%'}</span>
                              </div>
                              {accountDetails[account.id]?.overdraftProtection && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Overdraft Protection</span>
                                  <span className="text-sm font-medium text-gray-800">{accountDetails[account.id].overdraftProtection}</span>
                                </div>
                              )}
                              {accountDetails[account.id]?.withdrawalLimit && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Withdrawal Limit</span>
                                  <span className="text-sm font-medium text-gray-800">{accountDetails[account.id].withdrawalLimit}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Quick Actions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {/* View Statements Button */}
                        <button 
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate('statements', { accountId: account.id, accountType: account.accountCategory });
                            }
                          }}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition flex items-center"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          View Statements
                        </button>
                        
                        {/* View Transactions Button */}
                        <button 
                          onClick={() => handleViewTransactions(account.id, account.accountCategory)}
                          className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white flex items-center"
                        >
                          <ClockIcon className="h-4 w-4 mr-2" />
                          View Transactions
                        </button>
                        
                        {/* Make Payment Button - for credit and loan accounts */}
                        {(isCredit || isLoan) && (
                          <button 
                            onClick={() => handleMakePayment(account)}
                            className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white flex items-center"
                          >
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                            Make Payment
                          </button>
                        )}
                        
                        {/* Transfer Button - for regular accounts */}
                        {!isCredit && !isLoan && (
                          <button 
                            onClick={() => handleTransfer(account)}
                            className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white flex items-center"
                          >
                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                            Transfer Money
                          </button>
                        )}
                        
                        {/* Direct Deposit Info Button - for regular accounts */}
                        {!isCredit && !isLoan && (
                          <button 
                            onClick={() => {
                              alert(
                                `To set up direct deposit, use:\n\n` +
                                `Routing Number: ${account.routingNumber}\n` +
                                `Account Number: ${account.accountNumber}\n\n` +
                                `You can provide these details to your employer or for any direct deposit setup.`
                              );
                            }}
                            className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white flex items-center"
                          >
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                            Direct Deposit Info
                          </button>
                        )}
                        
                        {/* CLOSE ACCOUNT BUTTON - For all accounts with different warnings */}
                        <button 
                          onClick={() => handleCloseAccount(account.id, account.accountCategory, account.balance || account.currentBalance || 0)}
                          className="px-4 py-2 border border-red-200 hover:border-red-300 text-red-600 rounded-lg text-sm font-medium transition bg-red-50 flex items-center"
                        >
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Close Account
                        </button>
                      </div>
                      
                      {/* Warning for accounts with balance */}
                      {(account.balance > 0 || account.currentBalance > 0) && !isCredit && !isLoan && (
                        <div className="mt-3 flex items-center text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          This account has a balance of {formatCurrency(account.balance)}. You must transfer or withdraw all funds before closing.
                        </div>
                      )}
                      
                      {/* Warning for credit accounts with balance */}
                      {isCredit && account.currentBalance > 0 && (
                        <div className="mt-3 flex items-center text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          This credit card has a balance of {formatCurrency(account.currentBalance)}. You must pay off the balance before closing.
                        </div>
                      )}
                      
                      {/* Warning for loan accounts with balance */}
                      {isLoan && account.balance > 0 && (
                        <div className="mt-3 flex items-center text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          This loan has an outstanding balance of {formatCurrency(account.balance)}. Contact us to discuss loan payoff options.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer Modal - Simple version */}
      {showTransferModal && selectedFromAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Transfer Money</h3>
            <p className="text-sm text-gray-600 mb-4">
              From: {selectedFromAccount.nickname || selectedFromAccount.accountType} ({selectedFromAccount.accountNumber})
            </p>
            <p className="text-sm text-gray-500 mb-4">
              For transfers between your accounts, please use the Dashboard.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  navigate('/dashboard');
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">Account Management</h4>
            <p className="text-xs text-blue-600">
              You can rename your accounts, view account features, and access account-specific actions.
              Account nicknames are only visible to you. Use the Dashboard for transfers between your accounts.
              For credit cards and loans, you can make payments and view transaction history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAccounts;