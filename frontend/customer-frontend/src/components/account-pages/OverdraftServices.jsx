// src/components/account-pages/OverdraftServices.jsx
import { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const API_BASE = "http://localhost:8080";

const OverdraftServices = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [overdraftSettings, setOverdraftSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    overdraftEnabled: false,
    overdraftLimit: 0,
    autoSweepEnabled: false,
    sweepAccountId: ''
  });
  const [user, setUser] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser") || '{}');
    setUser(userData);
    if (userData?.id) {
      fetchUserAccounts(userData.id);
    }
  }, []);

  // Fetch user accounts
  const fetchUserAccounts = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/accounts/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      
      // Filter only checking accounts (overdraft only available for checking)
      const checkingAccounts = data.filter(acc => acc.accountType === 'CHECKING');
      setAccounts(checkingAccounts);
      
      if (checkingAccounts.length > 0) {
        setSelectedAccount(checkingAccounts[0].id);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch overdraft settings when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchOverdraftSettings(selectedAccount);
    }
  }, [selectedAccount]);

  const fetchOverdraftSettings = async (accountId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/accounts/${accountId}/overdraft`);
      if (!response.ok) throw new Error('Failed to fetch overdraft settings');
      const data = await response.json();
      
      setOverdraftSettings(data);
      setFormData({
        overdraftEnabled: data.overdraftEnabled,
        overdraftLimit: data.overdraftLimit,
        autoSweepEnabled: data.autoSweepEnabled,
        sweepAccountId: data.sweepAccountId || ''
      });
    } catch (error) {
      console.error('Error fetching overdraft settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE}/api/accounts/${selectedAccount}/overdraft`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overdraftEnabled: formData.overdraftEnabled,
          overdraftLimit: formData.overdraftEnabled ? Number(formData.overdraftLimit) : 0,
          autoSweepEnabled: formData.autoSweepEnabled,
          sweepAccountId: formData.sweepAccountId ? Number(formData.sweepAccountId) : null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update overdraft settings');
      }

      const updated = await response.json();
      setOverdraftSettings(updated);
      
      // Show success message (you can add a toast notification here)
      alert('Overdraft settings updated successfully!');
    } catch (error) {
      console.error('Error updating overdraft:', error);
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const selectedAccountDetails = accounts.find(a => a.id === selectedAccount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-gray-800 mb-1">Overdraft Services</h2>
            <p className="text-sm text-gray-500">Manage overdraft protection for your checking accounts</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <ShieldCheckIcon className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Account Selector */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account.id)}
              className={`text-left p-5 rounded-xl border transition-all ${
                selectedAccount === account.id
                  ? 'bg-gray-50 border-gray-300 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-800">{account.nickname || 'Checking Account'}</h3>
                  <p className="text-sm text-gray-500">•••• {account.accountNumber?.slice(-4)}</p>
                </div>
                {selectedAccount === account.id && (
                  <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-lg font-light text-gray-700">{formatCurrency(account.balance)}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-700">No checking accounts found. Overdraft protection is only available for checking accounts.</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      )}

      {/* Overdraft Settings Form */}
      {!loading && selectedAccount && overdraftSettings && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Overdraft Protection Settings</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Current Balance Info */}
            {selectedAccountDetails && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800">
                      Current balance: <span className="font-medium">{formatCurrency(selectedAccountDetails.balance)}</span>
                    </p>
                    {overdraftSettings.overdraftEnabled && (
                      <p className="text-sm text-blue-800 mt-1">
                        Available overdraft: <span className="font-medium">{formatCurrency(overdraftSettings.availableOverdraft)}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enable Overdraft */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">Enable Overdraft Protection</h4>
                <p className="text-sm text-gray-500">Allow transactions that exceed your available balance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="overdraftEnabled"
                  checked={formData.overdraftEnabled}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
              </label>
            </div>

            {/* Overdraft Limit */}
            {formData.overdraftEnabled && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Overdraft Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="overdraftLimit"
                    value={formData.overdraftLimit}
                    onChange={handleInputChange}
                    min="0"
                    step="50"
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    placeholder="500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Interest rate: <span className="font-medium">{overdraftSettings.interestRate}%</span> (based on limit)
                </p>
              </div>
            )}

            {/* Auto Sweep */}
            {formData.overdraftEnabled && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Auto-Sweep Protection</h4>
                    <p className="text-sm text-gray-500">Automatically transfer funds from savings when overdraft is used</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoSweepEnabled"
                      checked={formData.autoSweepEnabled}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                  </label>
                </div>

                {formData.autoSweepEnabled && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Sweep from Account
                    </label>
                    <select
                      name="sweepAccountId"
                      value={formData.sweepAccountId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    >
                      <option value="">Select an account</option>
                      {accounts.filter(a => a.id !== selectedAccount).map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.nickname || 'Savings Account'} (•••• {acc.accountNumber?.slice(-4)}) - {formatCurrency(acc.balance)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Fee Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Important Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
                  Overdraft fee: $35 per transaction when overdraft is used
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
                  Maximum of 4 overdraft fees per day
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
                  Interest charged daily on overdraft balance
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={updating}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {updating ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OverdraftServices;