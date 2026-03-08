// src/components/account-pages/Statements.jsx
import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  EnvelopeIcon,
  EyeIcon,
  ClockIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  DocumentDuplicateIcon,
  CreditCardIcon  // ADDED for credit accounts
} from '@heroicons/react/24/outline';

const API_BASE = "http://localhost:8080";

const Statements = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]); // ADDED
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statements, setStatements] = useState([]);
  const [monthlyStatements, setMonthlyStatements] = useState([]);
  const [otherDocuments, setOtherDocuments] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [accountType, setAccountType] = useState('regular'); // ADDED: 'regular' or 'credit'

  // Get user from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser") || '{}');
    setUser(userData);
    if (userData?.id) {
      fetchUserAccounts(userData.id);
      fetchCreditAccounts(userData.id); // ADDED
    }
  }, []);

  // Fetch user accounts (checking/savings/business)
  const fetchUserAccounts = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/accounts/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
    }
  };

  // ADDED: Fetch credit accounts
  const fetchCreditAccounts = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/credit/accounts/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch credit accounts');
      const data = await response.json();
      setCreditAccounts(data);
    } catch (error) {
      console.error('Error fetching credit accounts:', error);
      // Don't set error for credit accounts - they might not exist
    }
  };

  // Fetch statements when account, year, or month changes
  useEffect(() => {
    if (selectedAccount) {
      fetchStatements();
    }
  }, [selectedAccount, selectedYear, selectedMonth, accountType]);

  const fetchStatements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      // ADDED: Different endpoints for regular vs credit accounts
      if (accountType === 'credit') {
        response = await fetch(
          `${API_BASE}/api/credit/accounts/${selectedAccount}/transactions?userId=${user?.id}`
        );
      } else {
        response = await fetch(
          `${API_BASE}/api/accounts/${selectedAccount}/statements?year=${selectedYear}&month=${selectedMonth + 1}`
        );
      }
      
      if (!response.ok) throw new Error('Failed to fetch statements');
      
      const data = await response.json();
      
      // Transform the data based on account type
      const monthly = [];
      
      if (accountType === 'credit') {
        // Process credit transactions as statements
        if (Array.isArray(data) && data.length > 0) {
          // Group transactions by month for credit accounts
          const totalCredits = data.filter(t => t.type === 'CREDIT_TRANSFER' || t.type === 'PAYMENT').reduce((sum, t) => sum + t.amount, 0);
          const totalDebits = data.filter(t => t.type === 'PURCHASE').reduce((sum, t) => sum + t.amount, 0);
          
          monthly.push({
            id: 1,
            month: months[selectedMonth],
            year: selectedYear,
            date: new Date().toISOString().split('T')[0],
            balance: data[0]?.balanceAfter || 0,
            transactions: data.length,
            pdfAvailable: true,
            type: 'monthly',
            statementData: data,
            totalCredits,
            totalDebits
          });
        }
      } else {
        // Process regular account statement
        if (data) {
          monthly.push({
            id: 1,
            month: months[selectedMonth],
            year: selectedYear,
            date: data.date || new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0],
            balance: data.closingBalance || 0,
            transactions: data.transactions?.length || 0,
            pdfAvailable: true,
            type: 'monthly',
            statementData: data
          });
        }
      }
      
      setMonthlyStatements(monthly);
      
      // Mock other documents (same for both account types)
      const mockOtherDocs = [
        {
          id: 5,
          year: selectedYear - 1,
          type: 'annual_tax',
          label: `${selectedYear - 1} 1099-INT Tax Statement`,
          date: `${selectedYear}-01-31`,
          pdfAvailable: true,
          documentType: 'tax'
        },
        {
          id: 6,
          year: selectedYear - 1,
          type: 'annual_summary',
          label: `${selectedYear - 1} Annual Account Summary`,
          date: `${selectedYear}-01-15`,
          pdfAvailable: true,
          documentType: 'summary'
        }
      ];
      
      setOtherDocuments(mockOtherDocs);
      
    } catch (error) {
      console.error('Error fetching statements:', error);
      setError('Failed to load statements');
      setMonthlyStatements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (statementId, type) => {
    try {
      setDownloading(true);
      
      let response;
      
      // ADDED: Different download endpoints for credit accounts
      if (accountType === 'credit') {
        // For credit accounts, download transactions as CSV
        response = await fetch(
          `${API_BASE}/api/credit/accounts/${selectedAccount}/transactions/export?userId=${user?.id}&format=csv`
        );
      } else {
        // For regular accounts, download PDF statement
        const params = new URLSearchParams();
        params.append('year', selectedYear);
        params.append('month', selectedMonth + 1);
        
        response = await fetch(
          `${API_BASE}/api/accounts/${selectedAccount}/statements/export?${params.toString()}`
        );
      }
      
      if (!response.ok) throw new Error('Failed to download statement');
      
      // Get filename
      const contentDisposition = response.headers.get('Content-Disposition');
      const account = getAllAccounts().find(a => a.id === selectedAccount);
      const accountSuffix = account?.accountNumber?.slice(-4) || selectedAccount;
      
      let filename;
      if (accountType === 'credit') {
        filename = `credit_statement_${accountSuffix}_${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}.csv`;
      } else {
        filename = `statement_${accountSuffix}_${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}.pdf`;
      }
      
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
      
    } catch (error) {
      console.error('Error downloading statement:', error);
      setError('Failed to download statement');
    } finally {
      setDownloading(false);
    }
  };

  const handleView = async (statementId) => {
    try {
      if (accountType === 'credit') {
        // For credit accounts, maybe show transactions in a modal or new tab
        alert('Credit account transactions view coming soon!');
      } else {
        // Open PDF in new tab for regular accounts
        const params = new URLSearchParams();
        params.append('year', selectedYear);
        params.append('month', selectedMonth + 1);
        
        window.open(`${API_BASE}/api/accounts/${selectedAccount}/statements/export?${params.toString()}`, '_blank');
      }
    } catch (error) {
      console.error('Error viewing statement:', error);
      setError('Failed to view statement');
    }
  };

  const handleEmail = (statementId) => {
    alert('Email feature coming soon!');
  };

  // ADDED: Combine regular and credit accounts for display
  const getAllAccounts = () => {
    const regularAccounts = accounts.map(acc => ({
      ...acc,
      accountTypeDisplay: acc.accountType,
      icon: 'bank'
    }));
    
    const credit = creditAccounts.map(acc => ({
      ...acc,
      accountTypeDisplay: 'Credit Card',
      icon: 'credit'
    }));
    
    return [...regularAccounts, ...credit];
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getAccountLabel = (accountId) => {
    const account = getAllAccounts().find(a => a.id === accountId);
    if (!account) return 'Account';
    
    if (account.icon === 'credit') {
      return account.nickname || 'Credit Card';
    }
    return account.nickname || `${account.accountType} Account`;
  };

  const getAccountNumber = (accountId) => {
    const account = getAllAccounts().find(a => a.id === accountId);
    return account ? `•••• ${account.accountNumber?.slice(-4)}` : '';
  };

  const getAccountBalance = (accountId) => {
    const account = getAllAccounts().find(a => a.id === accountId);
    if (!account) return 0;
    
    if (account.icon === 'credit') {
      return account.currentBalance || 0;
    }
    return account.balance || 0;
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header with soft gradient */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-gray-800 mb-1">Statements & Documents</h2>
            <p className="text-sm text-gray-500">View and download your account statements</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Paperless statements enabled</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Account Selector - with credit card support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Regular Accounts */}
        {accounts.map((account) => (
          <button
            key={`regular-${account.id}`}
            onClick={() => {
              setSelectedAccount(account.id);
              setAccountType('regular');
            }}
            className={`text-left p-5 rounded-xl border transition-all ${
              selectedAccount === account.id && accountType === 'regular'
                ? 'bg-gray-50 border-gray-300 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-800">{account.nickname || `${account.accountType} Account`}</h3>
                <p className="text-sm text-gray-500">•••• {account.accountNumber?.slice(-4)}</p>
              </div>
              {selectedAccount === account.id && accountType === 'regular' && (
                <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <p className="text-lg font-light text-gray-700">{formatCurrency(account.balance)}</p>
          </button>
        ))}

        {/* Credit Accounts - ADDED */}
        {creditAccounts.map((account) => (
          <button
            key={`credit-${account.id}`}
            onClick={() => {
              setSelectedAccount(account.id);
              setAccountType('credit');
            }}
            className={`text-left p-5 rounded-xl border transition-all ${
              selectedAccount === account.id && accountType === 'credit'
                ? 'bg-gray-50 border-gray-300 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <h3 className="font-medium text-gray-800">{account.nickname || 'Credit Card'}</h3>
                  <p className="text-sm text-gray-500">•••• {account.accountNumber?.slice(-4)}</p>
                </div>
              </div>
              {selectedAccount === account.id && accountType === 'credit' && (
                <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-light text-gray-700">{formatCurrency(account.currentBalance)}</p>
              <p className="text-xs text-gray-500">Limit: {formatCurrency(account.creditLimit)}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters - clean and simple */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Year</label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Month</label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <button
            onClick={fetchStatements}
            disabled={!selectedAccount || loading}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center justify-center md:w-auto w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
            View Statements
          </button>
        </div>
      </div>

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

      {/* Statements List */}
      {!loading && selectedAccount && (
        <div className="space-y-6">
          {/* Monthly Statements Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">
                {accountType === 'credit' ? 'Transaction History' : 'Monthly Statements'}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {monthlyStatements.length > 0 ? (
                monthlyStatements.map((statement) => (
                  <div key={statement.id} className="px-5 py-4 hover:bg-gray-50 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {accountType === 'credit' ? (
                            <CreditCardIcon className="h-5 w-5 text-gray-500" />
                          ) : (
                            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {accountType === 'credit' 
                              ? `${months[selectedMonth]} ${selectedYear} Transactions`
                              : `${months[selectedMonth]} ${selectedYear} Statement`}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {formatDate(statement.date)}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <BanknotesIcon className="h-3 w-3 mr-1" />
                              {accountType === 'credit' ? 'Balance: ' : 'Balance: '}
                              {formatCurrency(statement.balance)}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <ReceiptPercentIcon className="h-3 w-3 mr-1" />
                              {statement.transactions} transactions
                            </span>
                          </div>
                          {accountType === 'credit' && statement.totalCredits && (
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-emerald-600 flex items-center">
                                Credits: {formatCurrency(statement.totalCredits)}
                              </span>
                              <span className="text-xs text-amber-600 flex items-center">
                                Debits: {formatCurrency(statement.totalDebits)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(statement.id)}
                          disabled={downloading}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(statement.id, accountType === 'credit' ? 'csv' : 'pdf')}
                          disabled={downloading}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                          title={accountType === 'credit' ? "Download CSV" : "Download PDF"}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEmail(statement.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="Email"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <DocumentTextIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {accountType === 'credit' 
                      ? `No transactions available for ${months[selectedMonth]} ${selectedYear}`
                      : `No statement available for ${months[selectedMonth]} ${selectedYear}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Other Documents Section */}
          {otherDocuments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-800">Other Documents</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {otherDocuments.map((doc) => (
                  <div key={doc.id} className="px-5 py-4 hover:bg-gray-50 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{doc.label}</h4>
                          <p className="text-xs text-gray-500 mt-1">Issued: {formatDate(doc.date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(doc.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc.id, 'pdf')}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="Download PDF"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEmail(doc.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="Email"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition flex items-center justify-between">
              <span className="text-sm text-gray-700">Request a new statement</span>
              <DocumentTextIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition flex items-center justify-between">
              <span className="text-sm text-gray-700">Switch to paperless</span>
              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition flex items-center justify-between">
              <span className="text-sm text-gray-700">Print statement</span>
              <PrinterIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statements;