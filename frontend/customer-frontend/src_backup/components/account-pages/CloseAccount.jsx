import { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const CloseAccount = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [closureResult, setClosureResult] = useState(null);
  
  // Step 2 states
  const [closureReason, setClosureReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [confirmations, setConfirmations] = useState({
    fundsTransferred: false,
    autoPaymentsCancelled: false,
    understandPermanent: false
  });
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  
  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      // TODO: Replace with actual user ID from context/state
      const userId = 1; // This should come from auth context
      const response = await fetch(`/api/accounts/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      // Filter out already closed accounts
      const activeAccounts = data.filter(acc => !acc.closed);
      setAccounts(activeAccounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const handleCloseAccount = async () => {
    if (!selectedAccount) return;

    try {
      setLoading(true);
      
      // Use the custom reason if "Other" is selected
      const finalReason = closureReason === 'OTHER' 
        ? customReason 
        : getReasonText(closureReason);

      const response = await fetch(`/api/accounts/${selectedAccount.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: finalReason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to close account');
      }

      const result = await response.json();
      setClosureResult(result);
      setSuccess(true);
      setCurrentStep(3);
      
      // Refresh accounts list to show closed account
      await fetchAccounts();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedAccount || !window.confirm('⚠️ Permanently delete this account? This action CANNOT be undone!')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      setSuccess(true);
      setClosureResult({
        message: 'Account permanently deleted',
        accountId: selectedAccount.id,
        permanent: true
      });
      setCurrentStep(3);
      await fetchAccounts();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getReasonText = (reason) => {
    const reasons = {
      'SWITCHING_BANKS': 'Switching to another bank',
      'TOO_MANY_FEES': 'Too many fees',
      'MOVING': 'Moving to a different area',
      'NOT_NEEDED': 'Account not needed',
      'POOR_SERVICE': 'Poor customer service',
      'OTHER': customReason || 'Other reason'
    };
    return reasons[reason] || reason;
  };

  const canProceedToStep2 = () => {
    return selectedAccount && selectedAccount.balance === 0;
  };

  const canProceedToStep3 = () => {
    const allConfirmationsChecked = Object.values(confirmations).every(v => v === true);
    const accountNumberMatch = confirmAccountNumber === selectedAccount?.accountNumber.slice(-4);
    const reasonSelected = closureReason && (closureReason !== 'OTHER' || customReason.trim());
    
    return allConfirmationsChecked && accountNumberMatch && reasonSelected;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAccountIcon = (type) => {
    return type === 'CHECKING' ? BanknotesIcon : CreditCardIcon;
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedAccount(null);
    setClosureReason('');
    setCustomReason('');
    setConfirmations({
      fundsTransferred: false,
      autoPaymentsCancelled: false,
      understandPermanent: false
    });
    setConfirmAccountNumber('');
    setError(null);
  };

  if (loading && currentStep !== 3) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Close an Account</h2>
        <p className="text-sm text-gray-600 mt-1">
          Follow the steps below to close your account
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1 last:flex-none">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step 
                    ? 'bg-red-700 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? '✓' : step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-red-700' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-600">Select Account</span>
          <span className="text-gray-600">Verification</span>
          <span className="text-gray-600">Confirmation</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Step 1: Account Selection */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Warning Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  <li>Accounts with a balance cannot be closed</li>
                  <li>Cancel all automatic payments before closing</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Account List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Account to Close</h3>
            {accounts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No active accounts available to close</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => {
                  const Icon = getAccountIcon(account.accountType);
                  const hasBalance = account.balance > 0;
                  
                  return (
                    <div
                      key={account.id}
                      onClick={() => !hasBalance && handleAccountSelect(account)}
                      className={`border rounded-lg p-4 cursor-pointer transition ${
                        selectedAccount?.id === account.id
                          ? 'border-red-700 bg-red-50'
                          : hasBalance
                          ? 'border-gray-200 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-6 w-6 ${
                            selectedAccount?.id === account.id
                              ? 'text-red-700'
                              : 'text-gray-400'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">
                              {account.accountType} Account
                              {account.nickname && ` - ${account.nickname}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              ****{account.accountNumber?.slice(-4)} • {formatCurrency(account.balance)}
                            </p>
                          </div>
                        </div>
                        {hasBalance && (
                          <span className="text-xs text-red-600 font-medium">
                            Balance must be $0
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedToStep2()}
              className={`px-6 py-2 rounded-lg text-white font-medium transition ${
                canProceedToStep2()
                  ? 'bg-red-700 hover:bg-red-800'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Verification & Details */}
      {currentStep === 2 && selectedAccount && (
        <div className="space-y-6">
          {/* Selected Account Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Closing Account:</p>
            <p className="font-medium text-gray-900">
              {selectedAccount.accountType} • ****{selectedAccount.accountNumber?.slice(-4)}
            </p>
          </div>

          {/* Reason for Closing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Closing *
            </label>
            <select
              value={closureReason}
              onChange={(e) => setClosureReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select a reason</option>
              <option value="SWITCHING_BANKS">Switching to another bank</option>
              <option value="TOO_MANY_FEES">Too many fees</option>
              <option value="MOVING">Moving to a different area</option>
              <option value="NOT_NEEDED">Account not needed</option>
              <option value="POOR_SERVICE">Poor customer service</option>
              <option value="OTHER">Other (please specify)</option>
            </select>
          </div>

          {/* Custom Reason */}
          {closureReason === 'OTHER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify reason *
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your reason"
              />
            </div>
          )}

          {/* Confirmations */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={confirmations.fundsTransferred}
                onChange={(e) => setConfirmations(prev => ({ ...prev, fundsTransferred: e.target.checked }))}
                className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                I have transferred or withdrawn all funds from this account
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={confirmations.autoPaymentsCancelled}
                onChange={(e) => setConfirmations(prev => ({ ...prev, autoPaymentsCancelled: e.target.checked }))}
                className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                I have cancelled all automatic payments and direct deposits
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={confirmations.understandPermanent}
                onChange={(e) => setConfirmations(prev => ({ ...prev, understandPermanent: e.target.checked }))}
                className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                I understand that closing an account is permanent and cannot be undone
              </span>
            </label>
          </div>

          {/* Account Number Confirmation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type the last 4 digits of your account number to confirm *
            </label>
            <input
              type="text"
              value={confirmAccountNumber}
              onChange={(e) => setConfirmAccountNumber(e.target.value)}
              maxLength="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Last 4 digits"
            />
            <p className="mt-1 text-xs text-gray-500">
              Account ending in: {selectedAccount.accountNumber?.slice(-4)}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>
            <div className="space-x-3">
              <button
                onClick={handlePermanentDelete}
                className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition"
              >
                Permanently Delete
              </button>
              <button
                onClick={handleCloseAccount}
                disabled={!canProceedToStep3()}
                className={`px-6 py-2 rounded-lg text-white font-medium transition ${
                  canProceedToStep3()
                    ? 'bg-red-700 hover:bg-red-800'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Close Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 3 && success && closureResult && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Account Successfully {closureResult.permanent ? 'Deleted' : 'Closed'}!
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-6">
            <p className="text-sm text-gray-600 mb-2">Account Details:</p>
            <p className="font-medium text-gray-900">
              {selectedAccount?.accountType} • ****{selectedAccount?.accountNumber?.slice(-4)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Closed on: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-sm text-gray-600">
              Closure ID: #CL-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}{String(new Date().getDate()).padStart(2, '0')}-{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}
            </p>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <button
              onClick={() => {
                // Generate and download closure statement
                alert('Download closure statement - PDF generation would happen here');
              }}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Download Closure Statement
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Return to Dashboard
            </button>
            
            <button
              onClick={resetForm}
              className="w-full text-sm text-red-700 hover:text-red-800"
            >
              Close Another Account
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Need help? <a href="#" className="text-red-700 hover:underline">Contact Support</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default CloseAccount;