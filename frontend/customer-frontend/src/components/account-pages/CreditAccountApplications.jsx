// src/components/account-pages/CreditAccountApplications.jsx
import { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  HomeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const API_BASE = "";

const CreditAccountApplications = () => {
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [creditApplications, setCreditApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAccountForTransactions, setSelectedAccountForTransactions] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingStatement, setDownloadingStatement] = useState(false);
  const [statementPeriod, setStatementPeriod] = useState('30days');
  const [showFullNumbers, setShowFullNumbers] = useState({});
  
  // Credit form state
  const [creditFormData, setCreditFormData] = useState({
    reason: '',
    creditPurpose: '',
    requestedLimit: '5000',
    monthlyHousingPayment: '',
    yearsAtCurrentAddress: '',
    previousAddress: '',
    citizenshipStatus: 'US_CITIZEN',
    employmentStatus: '',
    employerName: '',
    occupation: '',
    yearsAtEmployer: '',
    annualIncome: '',
    agreeToTerms: false
  });

  // Get logged-in user
  const getLoggedInUser = () => {
    try {
      const userStr = localStorage.getItem('loggedInUser');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (err) {
      console.error('Error getting logged-in user:', err);
      return null;
    }
  };

  // Pre-fill form with user data when modal opens
  useEffect(() => {
    if (showCreditModal) {
      const user = getLoggedInUser();
      if (user) {
        setCreditFormData(prev => ({
          ...prev,
          employmentStatus: user.employmentStatus || '',
          annualIncome: user.annualIncome || ''
        }));
      }
    }
  }, [showCreditModal]);

  useEffect(() => {
    fetchCreditApplications();
    fetchCreditAccounts();
  }, []);

  const fetchCreditApplications = async () => {
    try {
      const user = getLoggedInUser();
      if (!user?.sessionId) {
        console.error('No sessionId found');
        return;
      }

      // ⭐ FIXED: Keep sessionId for applications endpoint (it's different from accounts)
      const response = await fetch(`${API_BASE}/api/credit/applications/my-applications`, {
        headers: { 'sessionId': user.sessionId }
      });
      if (!response.ok) throw new Error('Failed to fetch credit applications');
      const data = await response.json();
      setCreditApplications(data);
    } catch (err) {
      console.error('Error fetching credit applications:', err);
    }
  };

  // ⭐ FIXED: Updated to use the new endpoint without sessionId
  const fetchCreditAccounts = async () => {
    try {
      const user = getLoggedInUser();
      if (!user?.id) return;

      const response = await fetch(`${API_BASE}/api/credit/accounts/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch credit accounts');
      const data = await response.json();
      setCreditAccounts(data);
    } catch (err) {
      console.error('Error fetching credit accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!creditFormData.reason) {
      alert('Please provide a reason');
      return;
    }
    if (!creditFormData.creditPurpose) {
      alert('Please select a credit purpose');
      return;
    }
    if (!creditFormData.agreeToTerms) {
      alert('You must agree to the terms');
      return;
    }

    setActionLoading(true);
    try {
      const user = getLoggedInUser();
      
      const requestData = {
        reason: creditFormData.reason,
        creditPurpose: creditFormData.creditPurpose,
        requestedLimit: parseFloat(creditFormData.requestedLimit),
        monthlyHousingPayment: creditFormData.monthlyHousingPayment ? parseFloat(creditFormData.monthlyHousingPayment) : null,
        yearsAtCurrentAddress: creditFormData.yearsAtCurrentAddress ? parseInt(creditFormData.yearsAtCurrentAddress) : null,
        previousAddress: creditFormData.previousAddress || null,
        citizenshipStatus: creditFormData.citizenshipStatus,
        agreeToTerms: creditFormData.agreeToTerms
      };

      const response = await fetch(`${API_BASE}/api/credit/applications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'sessionId': user.sessionId
        },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit application');
      }

      await fetchCreditApplications();
      setShowCreditModal(false);
      resetForm();
      setSuccess('Credit card application submitted! A banker will review your application.');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setCreditFormData({
      reason: '',
      creditPurpose: '',
      requestedLimit: '5000',
      monthlyHousingPayment: '',
      yearsAtCurrentAddress: '',
      previousAddress: '',
      citizenshipStatus: 'US_CITIZEN',
      employmentStatus: '',
      employerName: '',
      occupation: '',
      yearsAtEmployer: '',
      annualIncome: '',
      agreeToTerms: false
    });
  };

  const viewDetails = (item) => {
    setSelectedAccount(item);
    setShowDetailsModal(true);
  };

  const viewTransactions = (account) => {
    setSelectedAccountForTransactions(account);
    setShowTransactionModal(true);
  };

  const toggleShowFullNumber = (accountId, e) => {
    e.stopPropagation();
    setShowFullNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending', icon: ClockIcon };
      case 'APPROVED':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', icon: CheckCircleIcon };
      case 'REJECTED':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: XCircleIcon };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status, icon: CreditCardIcon };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Credit Cards</h2>
          <p className="text-sm text-gray-500 mt-1">
            Apply for a credit card - applications are reviewed by our bankers
          </p>
        </div>
        <button
          onClick={() => setShowCreditModal(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition shadow-md"
        >
          <CreditCardIcon className="h-5 w-5 mr-2" />
          Apply for Credit Card
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Credit Cards List */}
      {creditApplications.length === 0 && creditAccounts.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
          <CreditCardIcon className="h-16 w-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Credit Cards Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Apply for a credit card to build credit and earn rewards. Applications are reviewed by our bankers.
          </p>
          <button
            onClick={() => setShowCreditModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition shadow-md"
          >
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Apply Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Credit Applications */}
          {creditApplications.map((app) => {
            const status = getStatusBadge(app.status);
            const StatusIcon = status.icon;

            return (
              <div key={app.id} className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Credit Card Application
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Requested: {formatCurrency(app.requestedLimit)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Reason</p>
                    <p className="text-sm text-gray-800">{app.reason}</p>
                  </div>

                  {app.status === 'APPROVED' && app.creditAccount && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                        <span className="text-xs text-gray-500">Account Number</span>
                        <span className="text-sm font-mono">{app.creditAccount.maskedAccountNumber}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Submitted: {formatDate(app.submittedDate)}</span>
                    {app.reviewedDate && (
                      <span>Reviewed: {formatDate(app.reviewedDate)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Credit Accounts (Approved) */}
          {creditAccounts.map((account) => (
            <div key={account.id} className="bg-white rounded-xl shadow-lg p-6 border border-green-100 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Credit Account
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Limit: {formatCurrency(account.creditLimit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(account.availableCredit)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                  <span className="text-xs text-gray-500">Account Number</span>
                  <span className="text-sm font-mono">{account.maskedAccountNumber}</span>
                </div>

                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500">Current Balance</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatCurrency(account.currentBalance)}
                  </span>
                </div>

                {/* Cards */}
                {account.cards && account.cards.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">Cards</p>
                    <div className="space-y-2">
                      {account.cards.map((card) => (
                        <div key={card.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">
                              {card.cardType}:
                            </span>
                            <span className="text-sm font-mono">{card.maskedNumber}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            card.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {card.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => viewDetails(account)}
                  className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 border border-gray-200 rounded-lg hover:bg-blue-50 transition"
                >
                  View Details
                </button>
                <button
                  onClick={() => viewTransactions(account)}
                  className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 border border-gray-200 rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Transactions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Credit Card Application Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Apply for Credit Card</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete the form below to apply
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Credit Card *
                  </label>
                  <textarea
                    name="reason"
                    value={creditFormData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us why you need a credit card"
                    required
                  />
                </div>

                {/* Credit Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Purpose *
                  </label>
                  <select
                    name="creditPurpose"
                    value={creditFormData.creditPurpose}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select purpose</option>
                    <option value="DEBT_CONSOLIDATION">Debt Consolidation</option>
                    <option value="HOME_IMPROVEMENT">Home Improvement</option>
                    <option value="MAJOR_PURCHASE">Major Purchase</option>
                    <option value="BUSINESS">Business</option>
                    <option value="EMERGENCY">Emergency Fund</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Requested Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested Credit Limit *
                  </label>
                  <select
                    name="requestedLimit"
                    value={creditFormData.requestedLimit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="5000">$5,000</option>
                    <option value="10000">$10,000</option>
                    <option value="15000">$15,000</option>
                    <option value="20000">$20,000</option>
                  </select>
                </div>

                {/* Terms Agreement */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={creditFormData.agreeToTerms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      required
                    />
                    <span className="ml-2 text-sm text-blue-800">
                      I agree to the terms and conditions and authorize the bank to obtain my credit report.
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditAccountApplications;