// src/components/account-pages/DownloadActivity.jsx
import { useState, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ClockIcon,
  CalendarIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const API_BASE = "http://localhost:8080";

const DownloadActivity = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [dateRange, setDateRange] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser") || '{}');
    setUser(userData);
    if (userData?.id) {
      fetchUserAccounts(userData.id);
      fetchDownloadHistory(userData.id);
    }
  }, []);

  // Fetch user accounts
  const fetchUserAccounts = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/accounts/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
    }
  };

  // Fetch download history
  const fetchDownloadHistory = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/accounts/download-history/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch download history');
      const data = await response.json();
      
      // Transform the data to match the component's expected format
      const formattedHistory = data.map(item => ({
        id: item.id,
        date: item.downloadDate.split('T')[0],
        accountName: item.account?.nickname || `${item.account?.accountType} Account`,
        format: item.fileFormat,
        transactionCount: item.transactionCount,
        filename: item.fileName,
        fileSize: item.formattedFileSize
      }));
      
      setDownloadHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching download history:', error);
      setDownloadHistory([]);
    }
  };

  // Fetch transactions when preview is enabled
  useEffect(() => {
    if (previewMode && selectedAccount) {
      fetchTransactions();
    }
  }, [previewMode, selectedAccount, dateRange, customStartDate, customEndDate, selectedFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add date range
      if (dateRange === 'custom') {
        if (customStartDate) params.append('startDate', customStartDate);
        if (customEndDate) params.append('endDate', customEndDate);
      } else {
        params.append('range', dateRange);
      }
      
      // Add transaction type filter
      if (selectedFilter !== 'all') {
        // Convert filter to match backend expected format
        let typeParam = selectedFilter;
        if (selectedFilter === 'deposits') typeParam = 'DEPOSIT';
        if (selectedFilter === 'withdrawals') typeParam = 'WITHDRAWAL';
        if (selectedFilter === 'transfers') typeParam = 'TRANSFER';
        params.append('type', typeParam);
      }
      
      const response = await fetch(
        `${API_BASE}/api/accounts/${selectedAccount}/transactions?${params.toString()}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedAccount || transactions.length === 0) return;

    try {
      setDownloading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('format', selectedFormat);
      
      if (dateRange === 'custom') {
        if (customStartDate) params.append('startDate', customStartDate);
        if (customEndDate) params.append('endDate', customEndDate);
      } else {
        params.append('range', dateRange);
      }
      
      if (selectedFilter !== 'all') {
        // Convert filter to match backend expected format
        let typeParam = selectedFilter;
        if (selectedFilter === 'deposits') typeParam = 'DEPOSIT';
        if (selectedFilter === 'withdrawals') typeParam = 'WITHDRAWAL';
        if (selectedFilter === 'transfers') typeParam = 'TRANSFER';
        params.append('type', typeParam);
      }
      
      // Trigger download
      const response = await fetch(
        `${API_BASE}/api/accounts/${selectedAccount}/transactions/export?${params.toString()}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download transactions');
      }
      
      // Get filename from Content-Disposition header or create one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `transactions_${selectedAccount}_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Refresh download history
      if (user?.id) {
        fetchDownloadHistory(user.id);
      }
      
    } catch (error) {
      console.error('Error downloading transactions:', error);
      setError(error.message);
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalDebits = () => {
    return transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getTotalCredits = () => {
    return transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getAccountLabel = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.nickname || `${account.accountType} Account` : 'Account';
  };

  const getAccountNumber = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? `•••• ${account.accountNumber?.slice(-4)}` : '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
        <div>
          <h2 className="text-2xl font-light text-gray-800 mb-1">Download Account Activity</h2>
          <p className="text-sm text-gray-500">Export your transaction history in various formats</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Account Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Select Account</h3>
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccount(account.id)}
                className={`text-left p-4 rounded-lg border transition-all ${
                  selectedAccount === account.id
                    ? 'bg-gray-50 border-gray-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-800">
                    {account.nickname || `${account.accountType} Account`}
                  </span>
                  {selectedAccount === account.id && (
                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">•••• {account.accountNumber?.slice(-4)}</p>
                <p className="text-sm text-gray-700 mt-2">{formatCurrency(account.balance)}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No accounts found</div>
        )}
      </div>

      {/* Date Range Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Date Range</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: '30days', label: 'Last 30 Days' },
              { value: '60days', label: 'Last 60 Days' },
              { value: '90days', label: 'Last 90 Days' },
              { value: 'year', label: 'This Year' },
              { value: 'custom', label: 'Custom Range' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  dateRange === option.value
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Format & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Format Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Export Format</h3>
          <div className="space-y-3">
            {[
              { value: 'csv', label: 'CSV (Excel Compatible)', icon: TableCellsIcon, desc: 'Best for spreadsheets' },
              { value: 'pdf', label: 'PDF Document', icon: DocumentTextIcon, desc: 'Printable statement format' },
              { value: 'qfx', label: 'QFX (Quicken)', icon: DocumentArrowDownIcon, desc: 'For Quicken software' },
              { value: 'ofx', label: 'OFX (Microsoft Money)', icon: DocumentArrowDownIcon, desc: 'For Microsoft Money' }
            ].map((format) => (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value)}
                className={`w-full flex items-start p-3 rounded-lg border transition ${
                  selectedFormat === format.value
                    ? 'border-gray-400 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <format.icon className={`h-5 w-5 mr-3 ${
                  selectedFormat === format.value ? 'text-gray-700' : 'text-gray-400'
                }`} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">{format.label}</p>
                  <p className="text-xs text-gray-500">{format.desc}</p>
                </div>
                {selectedFormat === format.value && (
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Filter Transactions</h3>
          <div className="space-y-3">
            {[
              { value: 'all', label: 'All Transactions', count: 'All activity' },
              { value: 'deposits', label: 'Only Deposits', count: 'Credits only' },
              { value: 'withdrawals', label: 'Only Withdrawals', count: 'Debits only' },
              { value: 'transfers', label: 'Only Transfers', count: 'Between accounts' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition ${
                  selectedFilter === filter.value
                    ? 'border-gray-400 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm text-gray-800">{filter.label}</span>
                <span className="text-xs text-gray-500">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          disabled={!selectedAccount}
          className="flex-1 px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          {previewMode ? 'Hide Preview' : 'Preview Transactions'}
        </button>
        <button
          onClick={handleDownload}
          disabled={!selectedAccount || transactions.length === 0 || downloading}
          className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {downloading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download {selectedFormat.toUpperCase()}
            </>
          )}
        </button>
      </div>

      {/* Preview Section */}
      {previewMode && selectedAccount && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h3 className="font-medium text-gray-800">Transaction Preview</h3>
              {loading && <ArrowPathIcon className="h-4 w-4 text-gray-400 animate-spin" />}
            </div>
            {!loading && transactions.length > 0 && (
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">
                  Credits: <span className="text-emerald-600 font-medium">{formatCurrency(getTotalCredits())}</span>
                </span>
                <span className="text-gray-600">
                  Debits: <span className="text-red-500 font-medium">{formatCurrency(getTotalDebits())}</span>
                </span>
                <span className="text-gray-600">
                  Transactions: <span className="font-medium">{transactions.length}</span>
                </span>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {formatDateTime(tx.timestamp || tx.date)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-800">{tx.description}</td>
                      <td className={`px-5 py-3 text-sm text-right font-medium ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-gray-800'
                      }`}>
                        {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No transactions found for the selected criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Download History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-gray-800">Recent Downloads</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {downloadHistory.length > 0 ? (
            downloadHistory.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <DocumentArrowDownIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-800">{item.filename}</p>
                    <p className="text-xs text-gray-500">
                      {item.accountName} • {item.transactionCount} transactions • {item.format} • {item.fileSize}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-400">{item.date}</span>
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => window.open(`${API_BASE}/api/accounts/download-history/${item.id}`, '_blank')}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-4 text-center text-sm text-gray-500">
              No download history yet
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 border border-gray-200">
        <p className="flex items-center">
          <ClockIcon className="h-3 w-3 mr-1" />
          Downloads are available for up to 7 days. For older statements, visit the Statements page.
        </p>
      </div>
    </div>
  );
};

export default DownloadActivity;