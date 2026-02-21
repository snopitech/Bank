import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseIcon,
  PlayIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const RecurringPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    payeeName: '',
    payeeAccountNumber: '',
    payeeRoutingNumber: '',
    amount: '',
    frequency: 'MONTHLY',
    paymentDay: '15',
    startDate: '',
    endDate: '',
    category: 'OTHER',
    description: ''
  });

  // Fetch recurring payments on component mount
  useEffect(() => {
    fetchRecurringPayments();
  }, []);

  const fetchRecurringPayments = async () => {
    try {
      // TODO: Replace with actual account ID from context/state
      const accountId = 1; // This should come from selected account
      const response = await fetch(`/api/accounts/${accountId}/recurring`);
      if (!response.ok) throw new Error('Failed to fetch recurring payments');
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      setError(err.message);
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
    try {
      const accountId = 1; // This should come from selected account
      
      // Format the data
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        paymentDay: parseInt(formData.paymentDay),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };

      const url = editingPayment 
        ? `/api/accounts/${accountId}/recurring/${editingPayment.id}`
        : `/api/accounts/${accountId}/recurring`;
      
      const method = editingPayment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save recurring payment');
      }

      // Refresh the list
      await fetchRecurringPayments();
      
      // Reset form
      setShowForm(false);
      setEditingPayment(null);
      setFormData({
        payeeName: '',
        payeeAccountNumber: '',
        payeeRoutingNumber: '',
        amount: '',
        frequency: 'MONTHLY',
        paymentDay: '15',
        startDate: '',
        endDate: '',
        category: 'OTHER',
        description: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      payeeName: payment.payeeName,
      payeeAccountNumber: payment.payeeAccountNumber,
      payeeRoutingNumber: payment.payeeRoutingNumber || '',
      amount: payment.amount,
      frequency: payment.frequency,
      paymentDay: payment.paymentDay,
      startDate: payment.startDate ? payment.startDate.split('T')[0] : '',
      endDate: payment.endDate ? payment.endDate.split('T')[0] : '',
      category: payment.category || 'OTHER',
      description: payment.description || ''
    });
    setShowForm(true);
  };

  const handlePauseResume = async (payment) => {
    try {
      const accountId = 1;
      const action = payment.status === 'ACTIVE' ? 'pause' : 'resume';
      const response = await fetch(`/api/accounts/${accountId}/recurring/${payment.id}/${action}`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} payment`);
      }

      // Refresh the list
      await fetchRecurringPayments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this recurring payment?')) return;
    
    try {
      const accountId = 1;
      const response = await fetch(`/api/accounts/${accountId}/recurring/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel recurring payment');
      }

      // Refresh the list
      await fetchRecurringPayments();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getFrequencyLabel = (freq) => {
    const labels = {
      'WEEKLY': 'Weekly',
      'BIWEEKLY': 'Bi-Weekly',
      'MONTHLY': 'Monthly',
      'QUARTERLY': 'Quarterly',
      'YEARLY': 'Yearly'
    };
    return labels[freq] || freq;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'UTILITIES': 'bg-blue-100 text-blue-800',
      'RENT': 'bg-purple-100 text-purple-800',
      'SUBSCRIPTION': 'bg-green-100 text-green-800',
      'LOAN': 'bg-orange-100 text-orange-800',
      'INSURANCE': 'bg-indigo-100 text-indigo-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.OTHER;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recurring Payments</h2>
          <p className="text-sm text-gray-600 mt-1">
            Set up and manage automatic recurring payments
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Recurring Payment
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPayment ? 'Edit Recurring Payment' : 'Set Up New Recurring Payment'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payee Name *
                </label>
                <input
                  type="text"
                  name="payeeName"
                  value={formData.payeeName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="UTILITIES">Utilities</option>
                  <option value="RENT">Rent/Mortgage</option>
                  <option value="SUBSCRIPTION">Subscription</option>
                  <option value="LOAN">Loan Payment</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="payeeAccountNumber"
                  value={formData.payeeAccountNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number
                </label>
                <input
                  type="text"
                  name="payeeRoutingNumber"
                  value={formData.payeeRoutingNumber}
                  onChange={handleInputChange}
                  maxLength="9"
                  pattern="[0-9]{9}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Day *
                </label>
                <input
                  type="number"
                  name="paymentDay"
                  value={formData.paymentDay}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Day of month (1-31)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Monthly phone bill, Gym membership, etc."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPayment(null);
                  setFormData({
                    payeeName: '',
                    payeeAccountNumber: '',
                    payeeRoutingNumber: '',
                    amount: '',
                    frequency: 'MONTHLY',
                    paymentDay: '15',
                    startDate: '',
                    endDate: '',
                    category: 'OTHER',
                    description: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition"
              >
                {editingPayment ? 'Update' : 'Save'} Recurring Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recurring Payments List */}
      {payments.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <ArrowPathIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No recurring payments set up</h3>
          <p className="text-sm text-gray-600 mb-4">
            Set up automatic payments for bills, subscriptions, and more
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Set Up Recurring Payment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{payment.payeeName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(payment.category)}`}>
                          {payment.category}
                        </span>
                      </div>
                      {payment.description && (
                        <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-600">{getFrequencyLabel(payment.frequency)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Account:</span>
                      <span className="ml-2 text-gray-900">****{payment.payeeAccountNumber.slice(-4)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Next payment:</span>
                      <span className="ml-2 text-gray-900">{formatDate(payment.nextPaymentDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment day:</span>
                      <span className="ml-2 text-gray-900">{payment.paymentDay}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className={`flex items-center ${
                      payment.status === 'ACTIVE' ? 'text-green-600' : 
                      payment.status === 'PAUSED' ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {payment.status === 'ACTIVE' && (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Active
                        </>
                      )}
                      {payment.status === 'PAUSED' && (
                        <>
                          <PauseIcon className="h-4 w-4 mr-1" />
                          Paused
                        </>
                      )}
                      {payment.status === 'CANCELLED' && (
                        <>
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Cancelled
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  {payment.status !== 'CANCELLED' && (
                    <>
                      <button
                        onClick={() => handlePauseResume(payment)}
                        className={`p-2 rounded-lg transition ${
                          payment.status === 'ACTIVE' 
                            ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                        title={payment.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                      >
                        {payment.status === 'ACTIVE' ? (
                          <PauseIcon className="h-5 w-5" />
                        ) : (
                          <PlayIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(payment)}
                        className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Cancel"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringPayments;