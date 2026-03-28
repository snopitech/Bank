/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
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
  BanknotesIcon,
  ReceiptPercentIcon,
  DocumentDuplicateIcon,
  CreditCardIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const API_BASE = "";

const Statements = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [loanAccounts, setLoanAccounts] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [otherDocuments, setOtherDocuments] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [accountType, setAccountType] = useState('regular');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser") || '{}');
    setUser(userData);
    if (userData?.id) {
      fetchUserAccounts(userData.id);
      fetchCreditAccounts(userData.id);
      fetchLoanAccounts(userData.id, userData.sessionId);
    }
  }, []);

  const fetchUserAccounts = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/accounts/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchCreditAccounts = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/credit/accounts/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch credit accounts');
      const data = await response.json();
      setCreditAccounts(data);
    } catch (error) {
      console.error('Error fetching credit accounts:', error);
    }
  };

  const fetchLoanAccounts = async (userId, sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/api/loan/accounts`, {
        headers: { 'sessionId': sessionId }
      });
      if (!response.ok) throw new Error('Failed to fetch loan accounts');
      const data = await response.json();
      setLoanAccounts(data);
    } catch (error) {
      console.error('Error fetching loan accounts:', error);
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      fetchMonthlyData();
    }
  }, [selectedAccount, selectedYear, selectedMonth, accountType]);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      let data;
      
      if (accountType === 'credit') {
        // Fetch credit transactions
        response = await fetch(
          `${API_BASE}/api/credit/accounts/${selectedAccount}/transactions?userId=${user?.id}`
        );
        
        if (!response.ok) {
          setMonthlyData([]);
          setLoading(false);
          return;
        }
        
        data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // Filter by selected month/year
          const filtered = data.filter(t => {
            const date = new Date(t.timestamp);
            return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
          });
          
          const totalCredits = filtered.filter(t => t.type === 'CREDIT_TRANSFER' || t.type === 'PAYMENT').reduce((sum, t) => sum + t.amount, 0);
          const totalDebits = filtered.filter(t => t.type === 'PURCHASE').reduce((sum, t) => sum + t.amount, 0);
          
          setMonthlyData([{
            id: 1,
            month: months[selectedMonth],
            year: selectedYear,
            date: new Date().toISOString().split('T')[0],
            balance: data[0]?.balanceAfter || 0,
            transactions: filtered.length,
            totalCredits,
            totalDebits,
            transactionList: filtered
          }]);
        } else {
          setMonthlyData([]);
        }
        
      } else if (accountType === 'loan') {
        // Fetch loan payments
        response = await fetch(
          `${API_BASE}/api/loan/accounts/${selectedAccount}/payments`,
          { headers: { 'sessionId': user?.sessionId } }
        );
        
        if (!response.ok) {
          setMonthlyData([]);
          setLoading(false);
          return;
        }
        
        data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // Filter by selected month/year
          const filtered = data.filter(p => {
            const date = new Date(p.date || p.paymentDate || p.timestamp);
            return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
          });
          
          const totalPayments = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);
          
          setMonthlyData([{
            id: 1,
            month: months[selectedMonth],
            year: selectedYear,
            date: new Date().toISOString().split('T')[0],
            balance: filtered[0]?.balanceAfter || filtered[0]?.remainingBalance || 0,
            transactions: filtered.length,
            totalPayments,
            transactionList: filtered
          }]);
        } else {
          setMonthlyData([]);
        }
        
      } else {
        // Regular account statement
        response = await fetch(
          `${API_BASE}/api/accounts/${selectedAccount}/statements?year=${selectedYear}&month=${selectedMonth + 1}`
        );
        
        if (!response.ok) {
          setMonthlyData([]);
          setLoading(false);
          return;
        }
        
        data = await response.json();
        
        if (data) {
          setMonthlyData([{
            id: 1,
            month: months[selectedMonth],
            year: selectedYear,
            date: data.date || new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0],
            balance: data.closingBalance || 0,
            transactions: data.transactions?.length || 0,
            statementData: data
          }]);
        } else {
          setMonthlyData([]);
        }
      }
      
      // Mock other documents (same for all account types)
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
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    alert('Download feature coming soon for credit and loan accounts');
  };

  const handleView = () => {
    if (accountType === 'credit') {
      alert('Credit account transactions view coming soon!');
    } else if (accountType === 'loan') {
      alert('Loan payment history view coming soon!');
    } else {
      const params = new URLSearchParams();
      params.append('year', selectedYear);
      params.append('month', selectedMonth + 1);
      window.open(`${API_BASE}/api/accounts/${selectedAccount}/statements/export?${params.toString()}`, '_blank');
    }
  };

  const handleEmail = () => {
    alert('Email feature coming soon!');
  };

  const getAllAccounts = () => {
    const regularAccounts = accounts.map(acc => ({
      ...acc,
      accountTypeDisplay: acc.accountType,
      icon: 'bank'
    }));
    
    const credit = creditAccounts.map(acc => ({
      ...acc,
      accountTypeDisplay: 'Credit Card',
      icon: 'credit',
      balance: acc.currentBalance || 0
    }));
    
    const loan = loanAccounts.map(acc => ({
      ...acc,
      accountTypeDisplay: 'Loan',
      icon: 'loan',
      balance: acc.outstandingBalance || 0,
      interestRate: acc.interestRate
    }));
    
    return [...regularAccounts, ...credit, ...loan];
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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Account Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">Selected</span>
              )}
            </div>
            <p className="text-lg font-light text-gray-700">{formatCurrency(account.balance)}</p>
          </button>
        ))}

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
                <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">Selected</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-light text-gray-700">{formatCurrency(account.currentBalance)}</p>
              <p className="text-xs text-gray-500">Limit: {formatCurrency(account.creditLimit)}</p>
            </div>
          </button>
        ))}

        {loanAccounts.map((account) => (
          <button
            key={`loan-${account.id}`}
            onClick={() => {
              setSelectedAccount(account.id);
              setAccountType('loan');
            }}
            className={`text-left p-5 rounded-xl border transition-all ${
              selectedAccount === account.id && accountType === 'loan'
                ? 'bg-gray-50 border-gray-300 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <h3 className="font-medium text-gray-800">{account.nickname || 'Loan Account'}</h3>
                  <p className="text-sm text-gray-500">•••• {account.accountNumber?.slice(-4)}</p>
                </div>
              </div>
              {selectedAccount === account.id && accountType === 'loan' && (
                <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">Selected</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-light text-gray-700">{formatCurrency(account.outstandingBalance)}</p>
              <p className="text-xs text-gray-500">Rate: {account.interestRate}% APR</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
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
            onClick={fetchMonthlyData}
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

      {/* Data Display */}
      {!loading && selectedAccount && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">
                {accountType === 'credit' ? 'Transaction History' : accountType === 'loan' ? 'Loan Payment History' : 'Monthly Statements'}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {monthlyData.length > 0 ? (
                monthlyData.map((item) => (
                  <div key={item.id} className="px-5 py-4 hover:bg-gray-50 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {accountType === 'credit' ? (
                            <CreditCardIcon className="h-5 w-5 text-gray-500" />
                          ) : accountType === 'loan' ? (
                            <ChartBarIcon className="h-5 w-5 text-gray-500" />
                          ) : (
                            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {accountType === 'credit' 
                              ? `${item.month} ${item.year} Transactions`
                              : accountType === 'loan'
                              ? `${item.month} ${item.year} Loan Payments`
                              : `${item.month} ${item.year} Statement`}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {formatDate(item.date)}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <BanknotesIcon className="h-3 w-3 mr-1" />
                              Balance: {formatCurrency(item.balance)}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <ReceiptPercentIcon className="h-3 w-3 mr-1" />
                              {item.transactions} {accountType === 'loan' ? 'payments' : 'transactions'}
                            </span>
                          </div>
                          {accountType === 'credit' && item.totalCredits && (
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-emerald-600 flex items-center">
                                Credits: {formatCurrency(item.totalCredits)}
                              </span>
                              <span className="text-xs text-amber-600 flex items-center">
                                Debits: {formatCurrency(item.totalDebits)}
                              </span>
                            </div>
                          )}
                          {accountType === 'loan' && item.totalPayments && (
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-emerald-600 flex items-center">
                                Total Payments: {formatCurrency(item.totalPayments)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleView}
                          disabled={downloading}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleDownload}
                          disabled={downloading}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleEmail}
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
                      : accountType === 'loan'
                      ? `No loan payments available for ${months[selectedMonth]} ${selectedYear}`
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
                          onClick={handleView}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleDownload}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="Download PDF"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleEmail}
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