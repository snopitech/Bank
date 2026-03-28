// src/components/account-pages/StopCheck.jsx
import { useState, useEffect } from 'react';
import {
  StopCircleIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const API_BASE = "";

const StopCheck = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [stopPayments, setStopPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    checkNumber: '',
    payeeName: '',
    amount: '',
    checkDate: '',
    reason: ''
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
      
      // Show all accounts but stop payments only for checking
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stop payments when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchStopPayments(selectedAccount);
    }
  }, [selectedAccount]);

  const fetchStopPayments = async (accountId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/accounts/${accountId}/stop-payments`);
      if (!response.ok) throw new Error('Failed to fetch stop payments');
      const data = await response.json();
      setStopPayments(data);
    } catch (error) {
      console.error('Error fetching stop payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE}/api/accounts/${selectedAccount}/stop-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkNumber: formData.checkNumber,
          payeeName: formData.payeeName || null,
          amount: formData.amount ? Number(formData.amount) : null,
          checkDate: formData.checkDate || null,
          reason: formData.reason || 'Customer request'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place stop payment');
      }

      const newStopPayment = await response.json();
      
      // Reset form and refresh list
      setFormData({
        checkNumber: '',
        payeeName: '',
        amount: '',
        checkDate: '',
        reason: ''
      });
      setShowForm(false);
      fetchStopPayments(selectedAccount);
      
      alert('Stop payment placed successfully!');
    } catch (error) {
      console.error('Error placing stop payment:', error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = async (stopPaymentId) => {
    if (!confirm('Are you sure you want to release this stop payment?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/accounts/${selectedAccount}/stop-payment/${stopPaymentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to release stop payment');
      }

      // Refresh the list
      fetchStopPayments(selectedAccount);
      alert('Stop payment released successfully!');
    } catch (error) {
      console.error('Error releasing stop payment:', error);
      alert(error.message);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"><CheckCircleIcon className="h-3 w-3 mr-1" /> Active</span>;
      case 'RELEASED':
        return <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"><XCircleIcon className="h-3 w-3 mr-1" /> Released</span>;
      case 'EXPIRED':
        return <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"><ClockIcon className="h-3 w-3 mr-1" /> Expired</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{status}</span>;
    }
  };

  const selectedAccountDetails = accounts.find(a => a.id === selectedAccount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-gray-800 mb-1">Stop a Check</h2>
            <p className="text-sm text-gray-500">Place or manage stop payments on checks</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <StopCircleIcon className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Account Selector */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <h3 className="font-medium text-gray-800">{account.nickname || `${account.accountType} Account`}</h3>
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
          <p className="text-gray-700">No accounts found.</p>
        </div>
      )}

      {/* Action Buttons */}
      {selectedAccount && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center"
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Place New Stop Payment'}
          </button>
        </div>
      )}

      {/* New Stop Payment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Place Stop Payment</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Check Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Check Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="checkNumber"
                  value={formData.checkNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  placeholder="e.g., 1001"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    placeholder="500.00"
                  />
                </div>
              </div>

              {/* Payee Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Payee Name (Optional)
                </label>
                <input
                  type="text"
                  name="payeeName"
                  value={formData.payeeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  placeholder="John Doe"
                />
              </div>

              {/* Check Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Check Date (Optional)
                </label>
                <input
                  type="date"
                  name="checkDate"
                  value={formData.checkDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Reason (Optional)
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                placeholder="Why are you placing this stop payment?"
              />
            </div>

            {/* Fee Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 flex items-start">
                <BanknotesIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                A fee of $35.00 will be charged for this stop payment. The stop payment will remain active for 6 months.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Placing Stop Payment...
                </>
              ) : (
                'Place Stop Payment'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Stop Payments List */}
      {selectedAccount && !showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Active Stop Payments</h3>
            <button
              onClick={() => fetchStopPayments(selectedAccount)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition"
              title="Refresh"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          ) : stopPayments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stopPayments.map((stop) => (
                <div key={stop.id} className="px-5 py-4 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        stop.status === 'ACTIVE' ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        <StopCircleIcon className={`h-5 w-5 ${
                          stop.status === 'ACTIVE' ? 'text-emerald-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-800">
                            Check #{stop.checkNumber}
                          </h4>
                          {getStatusBadge(stop.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {stop.payeeName && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <UserIcon className="h-3 w-3 mr-1" />
                              {stop.payeeName}
                            </p>
                          )}
                          {stop.amount > 0 && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <BanknotesIcon className="h-3 w-3 mr-1" />
                              {formatCurrency(stop.amount)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {formatDate(stop.requestDate)}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Expires: {formatDate(stop.expirationDate)}
                          </p>
                        </div>
                        {stop.reason && (
                          <p className="text-xs text-gray-500 mt-2 flex items-start">
                            <DocumentTextIcon className="h-3 w-3 mr-1 mt-0.5" />
                            {stop.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {stop.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleRelease(stop.id)}
                        className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition flex items-center justify-center"
                      >
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Release
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <StopCircleIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No stop payments found for this account</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
              >
                <PlusCircleIcon className="h-4 w-4 mr-1" />
                Place your first stop payment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StopCheck;