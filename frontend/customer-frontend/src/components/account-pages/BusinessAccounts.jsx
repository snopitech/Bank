import { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const BusinessAccounts = () => {
  const [businessAccounts, setBusinessAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showOpenAccountModal, setShowOpenAccountModal] = useState(false);
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
  
  // Form state for opening new account
  const [formData, setFormData] = useState({
    businessName: '',
    ein: '',
    businessType: 'LLC',
    industry: 'TECHNOLOGY',
    yearsInOperation: '',
    annualRevenue: '',
    numberOfEmployees: '',
    businessAddress: '',
    businessAddress2: '',
    businessCity: '',
    businessState: '',
    businessZipCode: '',
    businessCountry: 'USA',
    businessPhone: '',
    businessEmail: '',
    website: '',
    legalStructure: 'LLC',
    estimatedMonthlyVolume: '',
    estimatedMonthlyTransactions: '',
    requestDebitCard: true
  });

  // Business types and industries
  const [businessTypes, setBusinessTypes] = useState([]);
  const [industries, setIndustries] = useState([]);

  // Get logged-in user ID
  const getLoggedInUserId = () => {
    try {
      const userStr = localStorage.getItem('loggedInUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
      return null;
    } catch (err) {
      console.error('Error getting logged-in user:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchBusinessAccounts();
    fetchBusinessTypes();
    fetchIndustries();
  }, []);

  const fetchBusinessAccounts = async () => {
    try {
      const userId = getLoggedInUserId();
      if (!userId) {
        setError('Please log in to view business accounts');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/business/accounts/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch business accounts');
      const data = await response.json();
      setBusinessAccounts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (accountId) => {
    setTransactionsLoading(true);
    try {
      const response = await fetch(`/api/accounts/${accountId}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchBusinessTypes = async () => {
    try {
      const response = await fetch('/api/business/accounts/types');
      if (!response.ok) throw new Error('Failed to fetch business types');
      const data = await response.json();
      setBusinessTypes(data);
    } catch (err) {
      console.error('Error fetching business types:', err);
    }
  };

  const fetchIndustries = async () => {
    try {
      const response = await fetch('/api/business/accounts/industries');
      if (!response.ok) throw new Error('Failed to fetch industries');
      const data = await response.json();
      setIndustries(data);
    } catch (err) {
      console.error('Error fetching industries:', err);
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
    
    if (!formData.businessName || !formData.ein || !formData.annualRevenue || 
        !formData.yearsInOperation || !formData.numberOfEmployees) {
      alert('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const userId = getLoggedInUserId();
      const requestData = {
        ...formData,
        userId,
        yearsInOperation: parseInt(formData.yearsInOperation),
        annualRevenue: parseFloat(formData.annualRevenue),
        numberOfEmployees: parseInt(formData.numberOfEmployees),
        estimatedMonthlyVolume: formData.estimatedMonthlyVolume ? parseFloat(formData.estimatedMonthlyVolume) : null,
        estimatedMonthlyTransactions: formData.estimatedMonthlyTransactions ? parseInt(formData.estimatedMonthlyTransactions) : null,
        initialDeposit: 0
      };

      const response = await fetch('/api/business/accounts/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to submit application');
      }

      await fetchBusinessAccounts();
      setShowOpenAccountModal(false);
      resetForm();
      setSuccess('Business account application submitted! A banker will review your application.');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      businessName: '',
      ein: '',
      businessType: 'LLC',
      industry: 'TECHNOLOGY',
      yearsInOperation: '',
      annualRevenue: '',
      numberOfEmployees: '',
      businessAddress: '',
      businessAddress2: '',
      businessCity: '',
      businessState: '',
      businessZipCode: '',
      businessCountry: 'USA',
      businessPhone: '',
      businessEmail: '',
      website: '',
      legalStructure: 'LLC',
      estimatedMonthlyVolume: '',
      estimatedMonthlyTransactions: '',
      requestDebitCard: true
    });
  };

  const viewDetails = (account) => {
    setSelectedAccount(account);
    setShowDetailsModal(true);
  };

  const viewTransactions = (account) => {
    setSelectedAccountForTransactions(account);
    fetchTransactions(account.accountId);
    setShowTransactionModal(true);
  };

  const toggleShowFullNumber = (accountId, e) => {
    e.stopPropagation();
    setShowFullNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const downloadStatement = async (accountId, period) => {
    setDownloadingStatement(true);
    try {
      const today = new Date();
      let year = today.getFullYear();
      let month = today.getMonth() + 1;
      
      if (period === 'lastMonth') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        year = lastMonth.getFullYear();
        month = lastMonth.getMonth() + 1;
      }
      
      const response = await fetch(
        `/api/accounts/${accountId}/statements/export?year=${year}&month=${month}`
      );
      
      if (!response.ok) throw new Error('Failed to download statement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business_statement_${year}-${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading statement:', err);
      alert('Failed to download statement');
    } finally {
      setDownloadingStatement(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'DEPOSIT': return '⬇️';
      case 'WITHDRAWAL': return '⬆️';
      case 'TRANSFER': return '↗️';
      case 'TRANSFER_IN': return '↙️';
      case 'BILL_PAYMENT': return '🧾';
      default: return '📄';
    }
  };

  const getTransactionColor = (type) => {
    switch(type) {
      case 'DEPOSIT': return 'text-green-600';
      case 'WITHDRAWAL': return 'text-red-600';
      case 'TRANSFER': return 'text-orange-600';
      case 'TRANSFER_IN': return 'text-green-600';
      case 'BILL_PAYMENT': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status, verified) => {
    if (status === 'APPROVED' && verified) {
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', icon: CheckCircleIcon };
    } else if (status === 'APPROVED' && !verified) {
      return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Approved - Pending Verification', icon: ClockIcon };
    } else if (status === 'PENDING') {
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Review', icon: ClockIcon };
    } else if (status === 'REJECTED') {
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: XCircleIcon };
    } else if (status === 'CLOSED') {
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Closed', icon: XCircleIcon };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-800', label: status, icon: BuildingOfficeIcon };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Business Accounts</h2>
          <p className="text-sm text-gray-500 mt-1">
            Apply for a business account - applications are reviewed by our bankers
          </p>
        </div>
        <button
          onClick={() => setShowOpenAccountModal(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-sm font-medium transition shadow-md"
        >
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          Apply for Business Account
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

      {/* Business Accounts List */}
      {businessAccounts.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
          <BuildingOfficeIcon className="h-16 w-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Business Accounts Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Apply for a business account to separate your business finances. Applications are reviewed by our bankers.
          </p>
          <button
            onClick={() => setShowOpenAccountModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition shadow-md"
          >
            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
            Apply Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {businessAccounts.map((account) => {
            const status = getStatusBadge(account.status, account.verified);
            const StatusIcon = status.icon;
            const isApproved = account.status === 'APPROVED' && account.verified;
            const isPending = account.status === 'PENDING';
            const isRejected = account.status === 'REJECTED';
            const showNumber = showFullNumbers[account.id];

            return (
              <div key={account.id} className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 transform hover:scale-[1.02] transition-all duration-300">
                {/* Header with Status */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {account.businessName}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {account.businessType} • {account.industry}
                    </p>
                  </div>
                  {isApproved && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className="text-xl font-bold text-purple-700">
                        {formatCurrency(account.accountBalance || 0)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Application/Account Details */}
                <div className="space-y-3">
                  {/* EIN - Always show */}
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500">EIN</span>
                    <span className="text-sm font-mono">{account.maskedEin}</span>
                  </div>

                  {/* Account Number - Only for approved accounts */}
                  {isApproved && account.accountNumber && (
                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                      <span className="text-xs text-gray-500">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                          {showNumber ? account.accountNumber : `${account.accountNumber.slice(0, 5)}•••••${account.accountNumber.slice(-4)}`}
                        </span>
                        <button
                          onClick={(e) => toggleShowFullNumber(account.id, e)}
                          className="text-gray-400 hover:text-purple-600"
                        >
                          {showNumber ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Business Card - Only for approved accounts */}
                  {isApproved && account.maskedCardNumber && (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500">Business Card</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{account.maskedCardNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          account.cardStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {account.cardStatus}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason - Only for rejected accounts */}
                  {isRejected && account.rejectionReason && (
                    <div className="p-2 bg-red-50 rounded-lg text-xs text-red-700">
                      <span className="font-medium">Reason: </span>
                      {account.rejectionReason}
                    </div>
                  )}

                  {/* Business Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2">
                    <div className="flex items-center">
                      <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" />
                      {account.businessCity}, {account.businessState}
                    </div>
                    {account.businessPhone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                        {account.businessPhone}
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Revenue:</span>
                      {formatCurrency(account.annualRevenue)}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Employees:</span>
                      {account.numberOfEmployees}
                    </div>
                  </div>

                  {/* Annual Revenue and Years in Operation */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Years:</span> {account.yearsInOperation}
                    </div>
                    {account.estimatedMonthlyVolume && (
                      <div>
                        <span className="font-medium">Est. Monthly:</span> {formatCurrency(account.estimatedMonthlyVolume)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => viewDetails(account)}
                    className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 border border-gray-200 rounded-lg hover:bg-purple-50 transition"
                  >
                    View Details
                  </button>
                  
                  {isApproved && (
                    <>
                      <button
                        onClick={() => viewTransactions(account)}
                        className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 border border-gray-200 rounded-lg hover:bg-purple-50 transition flex items-center justify-center"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        Transactions
                      </button>
                      <select
                        value={statementPeriod}
                        onChange={(e) => {
                          setStatementPeriod(e.target.value);
                          downloadStatement(account.accountId, e.target.value);
                        }}
                        disabled={downloadingStatement}
                        className="px-2 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600"
                      >
                        <option value="30days">30 Days</option>
                        <option value="currentMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                      </select>
                    </>
                  )}
                </div>

                {/* Submitted Date */}
                <div className="mt-2 text-xs text-gray-400 text-right">
                  Submitted: {new Date(account.createdDate).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Open Account Modal */}
      {showOpenAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Apply for Business Account</h3>
                  <p className="text-sm text-gray-500 mt-1">All fields marked * are required</p>
                </div>
                <button
                  onClick={() => {
                    setShowOpenAccountModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Scrollable Form */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Business Name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  {/* EIN */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      EIN (Tax ID) *
                    </label>
                    <input
                      type="text"
                      name="ein"
                      value={formData.ein}
                      onChange={handleInputChange}
                      placeholder="XX-XXXXXXX"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Business Type *
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    >
                      {businessTypes.map(type => (
                        <option key={type.code} value={type.code}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Industry *
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    >
                      {industries.map(ind => (
                        <option key={ind.code} value={ind.code}>
                          {ind.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Legal Structure */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Legal Structure *
                    </label>
                    <select
                      name="legalStructure"
                      value={formData.legalStructure}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    >
                      <option value="LLC">LLC</option>
                      <option value="CORPORATION">Corporation</option>
                      <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                      <option value="PARTNERSHIP">Partnership</option>
                      <option value="NONPROFIT">Non-Profit</option>
                    </select>
                  </div>

                  {/* Years in Operation */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Years in Operation *
                    </label>
                    <input
                      type="number"
                      name="yearsInOperation"
                      value={formData.yearsInOperation}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  {/* Annual Revenue */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Annual Revenue ($) *
                    </label>
                    <input
                      type="number"
                      name="annualRevenue"
                      value={formData.annualRevenue}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  {/* Number of Employees */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Number of Employees *
                    </label>
                    <input
                      type="number"
                      name="numberOfEmployees"
                      value={formData.numberOfEmployees}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  {/* Estimated Monthly Volume */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Est. Monthly Volume ($)
                    </label>
                    <input
                      type="number"
                      name="estimatedMonthlyVolume"
                      value={formData.estimatedMonthlyVolume}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                    />
                  </div>

                  {/* Estimated Monthly Transactions */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Est. Monthly Transactions
                    </label>
                    <input
                      type="number"
                      name="estimatedMonthlyTransactions"
                      value={formData.estimatedMonthlyTransactions}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                    />
                  </div>

                  {/* Business Address */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Business Address *
                    </label>
                    <input
                      type="text"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      name="businessAddress2"
                      value={formData.businessAddress2}
                      onChange={handleInputChange}
                      placeholder="Address Line 2 (Optional)"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="businessCity"
                      value={formData.businessCity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="businessState"
                      value={formData.businessState}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="businessZipCode"
                      value={formData.businessZipCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="businessCountry"
                      value={formData.businessCountry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  {/* Contact Info */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Business Phone
                    </label>
                    <input
                      type="text"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleInputChange}
                      placeholder="business@example.com"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="www.example.com"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                    />
                  </div>

                  {/* Request Debit Card */}
                  <div className="col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="requestDebitCard"
                        checked={formData.requestDebitCard}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Request business debit card (issued upon approval)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Application Info */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs text-purple-700 flex items-start">
                    <ShieldCheckIcon className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                    <span>
                      Your application will be reviewed by a banker. You'll be notified once your account is approved.
                      Accounts open with $0.00 balance.
                    </span>
                  </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOpenAccountModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Business Account Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedAccount(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {/* Details content - same as before */}
              <p className="text-gray-500">Details view implementation</p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {showTransactionModal && selectedAccountForTransactions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedAccountForTransactions.businessName}
                  </h3>
                  <p className="text-sm text-gray-500">Transaction History</p>
                </div>
                <button
                  onClick={() => {
                    setShowTransactionModal(false);
                    setSelectedAccountForTransactions(null);
                    setTransactions([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {transactionsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-700 mb-1">No Transactions Yet</h4>
                  <p className="text-sm text-gray-500">
                    Transactions will appear here once you start using your business account
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(tx.timestamp)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {tx.description}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center text-sm ${getTransactionColor(tx.type)}`}>
                              <span className="mr-1">{getTransactionIcon(tx.type)}</span>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${
                            tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' ? '+' : '-'}
                            {formatCurrency(Math.abs(tx.amount))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-800">
                            {formatCurrency(tx.balanceAfter)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessAccounts;