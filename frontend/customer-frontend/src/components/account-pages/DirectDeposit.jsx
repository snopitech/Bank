import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const DirectDeposit = () => {
  const [directDeposits, setDirectDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [formData, setFormData] = useState({
    employerName: '',
    employerRoutingNumber: '',
    employerAccountNumber: '',
    depositAmount: '',
    frequency: 'BIWEEKLY',
    isPrimaryDeposit: false,
    depositType: 'PAYROLL'
  });

  // Fetch direct deposits on component mount
  useEffect(() => {
    fetchDirectDeposits();
  }, []);

  const fetchDirectDeposits = async () => {
    try {
      // TODO: Replace with actual account ID from context/state
      const accountId = 1; // This should come from selected account
      const response = await fetch(`/api/accounts/${accountId}/direct-deposit`);
      if (!response.ok) throw new Error('Failed to fetch direct deposits');
      const data = await response.json();
      setDirectDeposits(data);
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
      const url = editingDeposit 
        ? `/api/accounts/${accountId}/direct-deposit/${editingDeposit.id}`
        : `/api/accounts/${accountId}/direct-deposit`;
      
      const method = editingDeposit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save direct deposit');
      }

      // Refresh the list
      await fetchDirectDeposits();
      
      // Reset form
      setShowForm(false);
      setEditingDeposit(null);
      setFormData({
        employerName: '',
        employerRoutingNumber: '',
        employerAccountNumber: '',
        depositAmount: '',
        frequency: 'BIWEEKLY',
        isPrimaryDeposit: false,
        depositType: 'PAYROLL'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (deposit) => {
    setEditingDeposit(deposit);
    setFormData({
      employerName: deposit.employerName,
      employerRoutingNumber: deposit.employerRoutingNumber,
      employerAccountNumber: deposit.employerAccountNumber,
      depositAmount: deposit.depositAmount,
      frequency: deposit.frequency,
      isPrimaryDeposit: deposit.isPrimaryDeposit,
      depositType: deposit.depositType
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this direct deposit?')) return;
    
    try {
      const accountId = 1;
      const response = await fetch(`/api/accounts/${accountId}/direct-deposit/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel direct deposit');
      }

      // Refresh the list
      await fetchDirectDeposits();
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
      'SEMI_MONTHLY': 'Semi-Monthly'
    };
    return labels[freq] || freq;
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
          <h2 className="text-2xl font-bold text-gray-900">Direct Deposit</h2>
          <p className="text-sm text-gray-600 mt-1">
            Set up and manage direct deposits to your account
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Direct Deposit
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
            {editingDeposit ? 'Edit Direct Deposit' : 'Set Up New Direct Deposit'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Name *
                </label>
                <input
                  type="text"
                  name="employerName"
                  value={formData.employerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Routing Number *
                </label>
                <input
                  type="text"
                  name="employerRoutingNumber"
                  value={formData.employerRoutingNumber}
                  onChange={handleInputChange}
                  required
                  maxLength="9"
                  pattern="[0-9]{9}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Account Number *
                </label>
                <input
                  type="text"
                  name="employerAccountNumber"
                  value={formData.employerAccountNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Amount *
                </label>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
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
                  <option value="SEMI_MONTHLY">Semi-Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Type
                </label>
                <select
                  name="depositType"
                  value={formData.depositType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="PAYROLL">Payroll</option>
                  <option value="BENEFITS">Benefits</option>
                  <option value="PENSION">Pension</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPrimaryDeposit"
                id="isPrimaryDeposit"
                checked={formData.isPrimaryDeposit}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isPrimaryDeposit" className="ml-2 text-sm text-gray-700">
                Set as primary deposit account
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingDeposit(null);
                  setFormData({
                    employerName: '',
                    employerRoutingNumber: '',
                    employerAccountNumber: '',
                    depositAmount: '',
                    frequency: 'BIWEEKLY',
                    isPrimaryDeposit: false,
                    depositType: 'PAYROLL'
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
                {editingDeposit ? 'Update' : 'Save'} Direct Deposit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Direct Deposits List */}
      {directDeposits.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No direct deposits set up</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add your employer or benefits provider to start receiving direct deposits
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Set Up Direct Deposit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {directDeposits.map((deposit) => (
            <div
              key={deposit.id}
              className={`bg-white border rounded-lg p-6 ${
                deposit.isPrimaryDeposit ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              {deposit.isPrimaryDeposit && (
                <div className="mb-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Primary Deposit
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{deposit.employerName}</h3>
                      <p className="text-sm text-gray-600">{deposit.depositType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(deposit.depositAmount)}</p>
                      <p className="text-sm text-gray-600">{getFrequencyLabel(deposit.frequency)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Routing #:</span>
                      <span className="ml-2 text-gray-900">{deposit.employerRoutingNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Account #:</span>
                      <span className="ml-2 text-gray-900">****{deposit.employerAccountNumber.slice(-4)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Next deposit: {formatDate(deposit.nextDepositDate)}
                    </div>
                    <div className={`flex items-center ${
                      deposit.active ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {deposit.active ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          {deposit.status}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(deposit)}
                    className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(deposit.id)}
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

export default DirectDeposit;