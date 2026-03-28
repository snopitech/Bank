// src/components/account-pages/StopFuturePayments.jsx
import { useState, useEffect } from 'react';
import {
  ClockIcon,
  CalendarIcon,
  ArrowPathIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  XCircleIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const API_BASE = "";

const StopFuturePayments = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    payeeName: '',
    amount: '',
    frequency: 'monthly',
    startDate: '',
    endDate: '',
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

  // Fetch recurring payments when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchRecurringPayments(selectedAccount);
    }
  }, [selectedAccount]);

  const fetchRecurringPayments = async (accountId) => {
    try {
      setLoading(true);
      // This would be your actual API endpoint
      const response = await fetch(`${API_BASE}/api/accounts/${accountId}/recurring-payments`);
      if (!response.ok) throw new Error('Failed to fetch recurring payments');
      const data = await response.json();
      setRecurringPayments(data);
    } catch (error) {
      console.error('Error fetching recurring payments:', error);
      // Mock data for now
      setRecurringPayments([
        {
          id: 1,
          payeeName: 'Netflix',
          amount: 15.99,
          frequency: 'monthly',
          nextDate: '2026-03-15',
          status: 'ACTIVE',
          accountNumber: '****2213'
        },
        {
          id: 2,
          payeeName: 'Gym Membership',
          amount: 49.99,
          frequency: 'monthly',
          nextDate: '2026-03-01',
          status: 'ACTIVE',
          accountNumber: '****2213'
        },
        {
          id: 3,
          payeeName: 'Electric Bill',
          amount: 85.50,
          frequency: 'monthly',
          nextDate: '2026-02-28',
          status: 'PENDING',
          accountNumber: '****2213'
        }
      ]);
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
      const response = await fetch(`${API_BASE}/api/accounts/${selectedAccount}/stop-future-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payeeName: formData.payeeName,
          amount: Number(formData.amount),
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to stop future payment');
      }

      setFormData({
        payeeName: '',
        amount: '',
        frequency: 'monthly',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setShowForm(false);
      fetchRecurringPayments(selectedAccount);
      alert('Future payment stopped successfully!');
    } catch (error) {
      console.error('Error stopping payment:', error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRecurring = async (paymentId) => {
    if (!confirm('Are you sure you want to cancel this recurring payment?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/accounts/${selectedAccount}/recurring-payment/${paymentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel payment');
      }

      fetchRecurringPayments(selectedAccount);
      alert('Recurring payment cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling payment:', error);
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

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'weekly': 'Weekly',
      'biweekly': 'Every 2 weeks',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly'
    };
    return labels[frequency] || frequency;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"><CheckCircleIcon className="h-3 w-3 mr-1" /> Active</span>;
      case 'PENDING':
        return <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"><ClockIcon className="h-3 w-3 mr-1" /> Pending</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"><XCircleIcon className="h-3 w-3 mr-1" /> Cancelled</span>;
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
            <h2 className="text-2xl font-light text-gray-800 mb-1">Stop Future Payments</h2>
            <p className="text-sm text-gray-500">Manage and cancel recurring payments</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <ClockIcon className="h-6 w-6 text-gray-600" />
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
            {showForm ? 'Cancel' : 'Stop New Future Payment'}
          </button>
        </div>
      )}

      {/* New Stop Future Payment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Stop Future Payment</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payee Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Payee/Merchant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="payeeName"
                  value={formData.payeeName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  placeholder="e.g., Netflix, Gym, Utilities"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    placeholder="50.00"
                  />
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 weeks</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              {/* End Date (Optional) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Reason for Stopping
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                placeholder="Why are you stopping this payment?"
              />
            </div>

            {/* Fee Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 flex items-start">
                <BanknotesIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                A fee of $25.00 may apply for stopping future payments. Check with your bank for details.
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
                  Processing...
                </>
              ) : (
                'Stop Future Payment'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Recurring Payments List */}
      {selectedAccount && !showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Active Recurring Payments</h3>
            <button
              onClick={() => fetchRecurringPayments(selectedAccount)}
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
          ) : recurringPayments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recurringPayments.map((payment) => (
                <div key={payment.id} className="px-5 py-4 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        payment.status === 'ACTIVE' ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        <ArrowPathIcon className={`h-5 w-5 ${
                          payment.status === 'ACTIVE' ? 'text-emerald-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-800">
                            {payment.payeeName}
                          </h4>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          <p className="text-xs text-gray-500 flex items-center">
                            <BanknotesIcon className="h-3 w-3 mr-1" />
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {getFrequencyLabel(payment.frequency)}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Next: {formatDate(payment.nextDate)}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <BuildingLibraryIcon className="h-3 w-3 mr-1" />
                            {payment.accountNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {payment.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleCancelRecurring(payment.id)}
                        className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition flex items-center justify-center"
                      >
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <ClockIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recurring payments found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
              >
                <PlusCircleIcon className="h-4 w-4 mr-1" />
                Stop a future payment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StopFuturePayments;