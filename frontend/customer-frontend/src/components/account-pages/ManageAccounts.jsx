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
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const API_BASE = "http://localhost:8080";

const ManageAccounts = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [accountDetails, setAccountDetails] = useState({});
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedFromAccount, setSelectedFromAccount] = useState(null);
  const [user, setUser] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser") || '{}');
    setUser(userData);
  }, []);

  // Fetch accounts when user is loaded
  useEffect(() => {
    if (user?.id) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/accounts/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountDetails = async (accountId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/accounts/${accountId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccountDetails(prev => ({ ...prev, [accountId]: data }));
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };

  const handleUpdateNickname = async (accountId) => {
    if (!editValue.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
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
    } catch (error) {
      console.error('Error updating nickname:', error);
    }
  };

  const handleCloseAccount = async (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    
    // Check if account has balance
    if (account.balance > 0) {
      alert(`Cannot close account with balance of ${formatCurrency(account.balance)}. Please transfer or withdraw all funds first.`);
      return;
    }
    
    if (!window.confirm('Are you sure you want to close this account? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/accounts/${accountId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Customer requested closure' })
      });
      
      if (response.ok) {
        alert('Account closed successfully');
        fetchAccounts(); // Refresh the list
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

  const handleExpand = (accountId) => {
    if (expandedId === accountId) {
      setExpandedId(null);
    } else {
      setExpandedId(accountId);
      if (!accountDetails[accountId]) {
        fetchAccountDetails(accountId);
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

  const getAccountIcon = (type) => {
    return type === 'CHECKING' ? (
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <CreditCardIcon className="h-5 w-5 text-blue-600" />
      </div>
    ) : (
      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
        <BuildingLibraryIcon className="h-5 w-5 text-emerald-600" />
      </div>
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
        <div>
          <h2 className="text-2xl font-light text-gray-800 mb-1">Manage Accounts</h2>
          <p className="text-sm text-gray-500">View and manage your bank accounts</p>
        </div>
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingLibraryIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No accounts found</h3>
          <p className="text-sm text-gray-500">You don't have any accounts yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div 
              key={account.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Account Summary Row */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getAccountIcon(account.accountType)}
                    
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        {editingId === account.id ? (
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
                              onClick={() => handleUpdateNickname(account.id)}
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
                            {account.nickname || (account.accountType === 'CHECKING' ? 'Everyday Checking' : 'Everyday Savings')}
                          </h3>
                        )}
                        
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                          account.accountType === 'CHECKING' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {account.accountType}
                        </span>
                        
                        {!editingId && (
                          <button
                            onClick={() => {
                              setEditingId(account.id);
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
                        Account {account.accountNumber}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-700 font-medium">
                          {formatCurrency(account.balance)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                          Routing: {account.routingNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleExpand(account.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                    title={expandedId === account.id ? 'Show less' : 'Show more'}
                  >
                    {expandedId === account.id ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === account.id && accountDetails[account.id] && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Account Features */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Account Features
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="space-y-2">
                          {accountDetails[account.id].features?.map((feature, idx) => (
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
                        Account Details
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Monthly Fee</span>
                          <span className="text-sm font-medium text-gray-800">
                            {accountDetails[account.id].monthlyFee}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Interest Rate</span>
                          <span className="text-sm font-medium text-gray-800">
                            {accountDetails[account.id].interestRate}
                          </span>
                        </div>
                        {accountDetails[account.id].overdraftProtection && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Overdraft Protection</span>
                            <span className="text-sm font-medium text-gray-800">
                              {accountDetails[account.id].overdraftProtection}
                            </span>
                          </div>
                        )}
                        {accountDetails[account.id].withdrawalLimit && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Withdrawal Limit</span>
                            <span className="text-sm font-medium text-gray-800">
                              {accountDetails[account.id].withdrawalLimit}
                            </span>
                          </div>
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
                            onNavigate('statements');
                          }
                        }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition flex items-center"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        View Statements
                      </button>
                      
                      {/* Transfer Money Button */}
                      <button 
                        onClick={() => handleTransfer(account)}
                        className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white flex items-center"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Transfer Money
                      </button>
                      
                      {/* Direct Deposit Info Button */}
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
                      
                      {/* CLOSE ACCOUNT BUTTON - Always visible for all accounts */}
                      <button 
                        onClick={() => handleCloseAccount(account.id)}
                        className="px-4 py-2 border border-red-200 hover:border-red-300 text-red-600 rounded-lg text-sm font-medium transition bg-red-50 flex items-center"
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Close Account
                      </button>
                    </div>
                    
                    {/* Warning for accounts with balance */}
                    {account.balance > 0 && (
                      <div className="mt-3 flex items-center text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        This account has a balance of {formatCurrency(account.balance)}. You must transfer or withdraw all funds before closing.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
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
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAccounts;