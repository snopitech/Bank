/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/components/account-pages/AccountSummary.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  GiftIcon,
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

import AccountCard from '../AccountCard';
import TransactionHistory from '../TransactionHistory';

const API_BASE = "http://localhost:8080";

const AccountSummary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hideBalances, setHideBalances] = useState(false);
  
  // Account states
  const [checkingAccount, setCheckingAccount] = useState(null);
  const [savingsAccount, setSavingsAccount] = useState(null);
  const [businessAccounts, setBusinessAccounts] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [loanAccounts, setLoanAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // Transaction states
  const [selectedAccount, setSelectedAccount] = useState("CHECKING");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const [interestEarned, setInterestEarned] = useState(0);
  const [nextStatementDate, setNextStatementDate] = useState("");

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("loggedInUser") || '{}');
  const accounts = user?.accounts || [];

  const checkingMeta = accounts.find(
    (a) => a.accountType?.toUpperCase() === "CHECKING"
  );
  const savingsMeta = accounts.find(
    (a) => a.accountType?.toUpperCase() === "SAVINGS"
  );

  const routingNumber =
    checkingAccount?.routingNumber ||
    savingsAccount?.routingNumber ||
    checkingMeta?.routingNumber ||
    savingsMeta?.routingNumber ||
    "N/A";

  const calculateNextStatementDate = () => {
    const today = new Date();
    let nextMonth = today.getMonth() + 1;
    let year = today.getFullYear();
    
    if (nextMonth > 11) {
      nextMonth = 0;
      year += 1;
    }
    
    const statementDate = new Date(year, nextMonth, 5);
    return statementDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateInterestEarned = () => {
    const savingsBalance = savingsAccount?.balance || savingsMeta?.balance || 0;
    return savingsBalance * 0.025;
  };

  // Fetch functions
  const fetchChecking = async () => {
    if (!checkingMeta?.accountNumber) return null;
    try {
      const res = await fetch(
        `${API_BASE}/api/accounts/account-number?accountNumber=${checkingMeta.accountNumber}`
      );
      return await res.json();
    } catch (error) {
      console.error('Error fetching checking:', error);
      return null;
    }
  };

  const fetchSavings = async () => {
    if (!savingsMeta?.accountNumber) return null;
    try {
      const res = await fetch(
        `${API_BASE}/api/accounts/account-number?accountNumber=${savingsMeta.accountNumber}`
      );
      return await res.json();
    } catch (error) {
      console.error('Error fetching savings:', error);
      return null;
    }
  };

  const fetchBusinessAccounts = async () => {
    try {
      if (!user?.id) return [];
      const response = await fetch(`${API_BASE}/api/business/accounts/user/${user.id}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map(business => ({
        ...business,
        balance: business.accountBalance || 0,
        accountType: "BUSINESS_CHECKING"
      }));
    } catch (error) {
      console.error('Error fetching business accounts:', error);
      return [];
    }
  };

  const fetchCreditAccounts = async () => {
    try {
      if (!user?.id) return [];
      const response = await fetch(`${API_BASE}/api/credit/accounts/user/${user.id}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map(credit => ({
        id: credit.id,
        accountNumber: credit.accountNumber,
        accountType: "CREDIT",
        balance: credit.currentBalance || 0,
        currentBalance: credit.currentBalance,
        creditLimit: credit.creditLimit,
        availableCredit: credit.availableCredit,
        maskedAccountNumber: credit.maskedAccountNumber,
        status: credit.status
      }));
    } catch (error) {
      console.error('Error fetching credit accounts:', error);
      return [];
    }
  };

  const fetchLoanAccounts = async () => {
    try {
      if (!user?.id) return [];
      
      const response = await fetch(`${API_BASE}/api/loan/accounts`, {
        headers: {
          'sessionId': user.sessionId
        }
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      return data.map(loan => ({
        id: loan.id,
        accountNumber: loan.maskedAccountNumber,
        accountType: "LOAN",
        balance: loan.outstandingBalance || 0,
        approvedAmount: loan.approvedAmount,
        interestRate: loan.interestRate,
        availableCredit: loan.approvedAmount - loan.outstandingBalance,
        maskedAccountNumber: loan.maskedAccountNumber
      }));
    } catch (error) {
      console.error('Error fetching loan accounts:', error);
      return [];
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!user?.id) return [];

      const response = await fetch(`${API_BASE}/api/users/${user.id}/transactions`);
      
      if (!response.ok) return [];
      
      const transactionsData = await response.json();
      
      const enrichedTransactions = transactionsData.map(tx => {
        const account = accounts.find(acc => acc.id === tx.accountId);
        return {
          ...tx,
          accountType: account?.accountType?.toUpperCase() || 
                       (tx.accountId === checkingMeta?.id ? "CHECKING" : 
                        tx.accountId === savingsMeta?.id ? "SAVINGS" : "UNKNOWN")
        };
      });
      
      enrichedTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return enrichedTransactions;
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  const loadAccountData = async () => {
    setLoading(true);
    try {
      const [checking, savings, business, credit, loan, transactionsData] = await Promise.all([
        fetchChecking(),
        fetchSavings(),
        fetchBusinessAccounts(),
        fetchCreditAccounts(),
        fetchLoanAccounts(),
        fetchTransactions()
      ]);
      
      setCheckingAccount(checking);
      setSavingsAccount(savings);
      setBusinessAccounts(business);
      setCreditAccounts(credit);
      setLoanAccounts(loan);
      setTransactions(transactionsData);
      
      setInterestEarned(calculateInterestEarned());
      setNextStatementDate(calculateNextStatementDate());
      
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, []);

  useEffect(() => {
    setInterestEarned(calculateInterestEarned());
  }, [savingsAccount, savingsMeta]);

  // Filter transactions
  const filteredTransactions = transactions
    .filter((tx) => {
      if (selectedAccount === "ALL") return true;
      if (selectedAccount === "CHECKING") return tx.accountType === "CHECKING";
      if (selectedAccount === "SAVINGS") return tx.accountType === "SAVINGS";
      if (selectedAccount === "BUSINESS") return tx.accountType === "BUSINESS";
      if (selectedAccount === "CREDIT") return tx.accountType === "CREDIT";
      if (selectedAccount === "LOAN") return tx.accountType === "LOAN";
      return tx.accountType === selectedAccount;
    })
    .filter((tx) => {
      if (filterType !== "ALL" && tx.type !== filterType) return false;
      if (filterStartDate) {
        const txDate = new Date(tx.timestamp);
        const start = new Date(filterStartDate);
        if (txDate < start) return false;
      }
      if (filterEndDate) {
        const txDate = new Date(tx.timestamp);
        const end = new Date(filterEndDate);
        if (txDate > end) return false;
      }
      if (filterMinAmount && tx.amount < parseFloat(filterMinAmount)) return false;
      if (filterMaxAmount && tx.amount > parseFloat(filterMaxAmount)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const descriptionMatch = tx.description?.toLowerCase().includes(query);
        const amountMatch = tx.amount.toString().includes(query);
        const typeMatch = tx.type?.toLowerCase().includes(query);
        const dateMatch = new Date(tx.timestamp)
          .toLocaleDateString()
          .toLowerCase()
          .includes(query);
        if (!descriptionMatch && !amountMatch && !typeMatch && !dateMatch) {
          return false;
        }
      }
      return true;
    });

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount, selectedAccount, searchQuery]);

  const clearAllFilters = () => {
    setFilterType("ALL");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterMinAmount("");
    setFilterMaxAmount("");
    setSearchQuery("");
  };

  const calculateTotalBalance = () => {
    const checking = checkingAccount?.balance || checkingMeta?.balance || 0;
    const savings = savingsAccount?.balance || savingsMeta?.balance || 0;
    const business = businessAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    return checking + savings + business;
  };

  const renderType = (tx) => {
    switch (tx.type) {
      case "DEPOSIT":
        return (
          <span className="flex items-center space-x-2 text-green-700 font-semibold">
            <span>⬇️</span>
            <span>Deposit</span>
          </span>
        );
      case "WITHDRAWAL":
        return (
          <span className="flex items-center space-x-2 text-red-700 font-semibold">
            <span>⬆️</span>
            <span>Withdrawal</span>
          </span>
        );
      case "TRANSFER":
        return (
          <span className="flex items-center space-x-2 text-orange-600 font-semibold">
            <span>↗️</span>
            <span>Transfer Out</span>
          </span>
        );
      case "TRANSFER_IN":
        return (
          <span className="flex items-center space-x-2 text-green-700 font-semibold">
            <span>↙️</span>
            <span>Transfer In</span>
          </span>
        );
      case "BILL_PAYMENT":
        return (
          <span className="flex items-center space-x-2 text-purple-700 font-semibold">
            <span>🧾</span>
            <span>Bill Payment</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-2 text-gray-700 font-semibold">
            <span>📄</span>
            <span>{tx.type}</span>
          </span>
        );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
        <p className="text-gray-500">Loading your accounts...</p>
      </div>
    );
  }

  const totalBalance = calculateTotalBalance();
  const memberSinceYear = user?.memberSince ? new Date(user.memberSince).getFullYear() : new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                ACCOUNT SUMMARY
              </span>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                Member since {memberSinceYear}
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Balance</p>
                <div className="flex items-center">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                    {hideBalances ? '••••••' : formatCurrency(totalBalance)}
                  </h1>
                  <button
                    onClick={() => setHideBalances(!hideBalances)}
                    className="ml-3 p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    {hideBalances ? <EyeSlashIcon className="h-5 w-5 text-gray-700" /> : <EyeIcon className="h-5 w-5 text-gray-700" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Interest Earned YTD</p>
            <p className="text-lg font-bold text-gray-800">
              {hideBalances ? '••••' : formatCurrency(interestEarned)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Next Statement</p>
            <p className="text-lg font-bold text-gray-800">{nextStatementDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Credit Score</p>
            <p className="text-lg font-bold text-gray-800">Coming Soon</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Rewards Points</p>
            <p className="text-lg font-bold text-gray-800">Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(checkingAccount || checkingMeta) && (
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-lg p-6 border border-blue-100">
            <AccountCard
              title="Everyday Checking"
              account={checkingAccount || checkingMeta}
              routingNumber={routingNumber}
              balanceChange={0}
              lastUpdated={new Date().toISOString()}
            />
          </div>
        )}

        {(savingsAccount || savingsMeta) && (
          <div className="bg-gradient-to-r from-emerald-50 to-white rounded-xl shadow-lg p-6 border border-emerald-100">
            <AccountCard
              title="Everyday Savings"
              account={savingsAccount || savingsMeta}
              routingNumber={routingNumber}
              balanceChange={0}
              lastUpdated={new Date().toISOString()}
            />
          </div>
        )}
      </div>

      {/* Business Accounts */}
      {businessAccounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Business Accounts</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {businessAccounts.map((business) => (
              <div key={business.id} className="bg-gradient-to-r from-purple-50 to-white rounded-xl shadow-lg p-6 border border-purple-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Account</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hideBalances ? '••••••' : formatCurrency(business.balance)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {business.maskedAccountNumber || business.accountNumber}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Accounts */}
      {creditAccounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Credit Cards</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {creditAccounts.map((credit) => (
              <div key={credit.id} className="bg-gradient-to-r from-purple-50 to-white rounded-xl shadow-lg p-6 border border-purple-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <CreditCardIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Credit Card</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hideBalances ? '••••••' : formatCurrency(credit.currentBalance || credit.balance)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Available: {hideBalances ? '••••••' : formatCurrency(credit.availableCredit || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Limit: {formatCurrency(credit.creditLimit || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loan Accounts */}
      {loanAccounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Loans</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loanAccounts.map((loan) => (
              <div key={loan.id} className="bg-gradient-to-r from-amber-50 to-white rounded-xl shadow-lg p-6 border border-amber-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <ChartBarIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loan Account</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hideBalances ? '••••••' : formatCurrency(loan.balance)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Available: {hideBalances ? '••••••' : formatCurrency(loan.availableCredit || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rate: {loan.interestRate || 2.5}% APR
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits & Rewards Section */}
      <div className="space-y-5 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-lg shadow-md">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Account Benefits & Rewards</h2>
          </div>
          <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-medium">
            Premium Tier • 5 Active Benefits
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-amber-100 p-2.5 rounded-lg group-hover:bg-amber-200 transition-colors">
                <GiftIcon className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-1 rounded-full">ACTIVE</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Cashback Rewards</h3>
            <p className="text-xs text-gray-500 mb-3">2% back on all purchases</p>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">This month</span>
              <span className="text-lg font-bold text-amber-600">$47.50</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">YTD: $312.40</span>
              <span className="text-amber-600 font-medium">Next: $75</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-2.5 rounded-lg group-hover:bg-green-200 transition-colors">
                <RocketLaunchIcon className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded-full">BONUS</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Savings Booster</h3>
            <p className="text-xs text-gray-500 mb-3">2.25% APY + 0.50% bonus</p>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Interest YTD</span>
              <span className="text-lg font-bold text-green-600">$124.32</span>
            </div>
            <div className="bg-green-100 rounded-lg p-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Bonus qualified</span>
                <span className="text-xs font-bold text-green-700">✓ $5,000+ balance</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-2.5 rounded-lg group-hover:bg-blue-200 transition-colors">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded-full">ENROLLED</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Overdraft Protection</h3>
            <p className="text-xs text-gray-500 mb-3">Linked to Savings account</p>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Coverage limit</span>
              <span className="text-lg font-bold text-blue-600">$500</span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              No fees this year
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-5 border border-purple-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 p-2.5 rounded-lg group-hover:bg-purple-200 transition-colors">
                <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs font-bold bg-purple-200 text-purple-800 px-2 py-1 rounded-full">READY</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Digital Wallet</h3>
            <p className="text-xs text-gray-500 mb-3">Apple Pay, Google Pay, Samsung Pay</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-white px-2 py-1.5 rounded-lg border border-gray-300 font-mono shadow-sm">•••• 2213</span>
              <span className="text-xs bg-white px-2 py-1.5 rounded-lg border border-gray-300 font-mono shadow-sm">•••• 5582</span>
            </div>
            <p className="text-xs text-purple-600 font-medium">2 cards added</p>
          </div>
        </div>
      </div>

      {/* Transaction History - Uses the same component as Dashboard */}
      <TransactionHistory
        transactions={transactions}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStartDate={filterStartDate}
        setFilterStartDate={setFilterStartDate}
        filterEndDate={filterEndDate}
        setFilterEndDate={setFilterEndDate}
        filterMinAmount={filterMinAmount}
        setFilterMinAmount={setFilterMinAmount}
        filterMaxAmount={filterMaxAmount}
        setFilterMaxAmount={setFilterMaxAmount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        transactionsPerPage={transactionsPerPage}
        renderType={renderType}
        clearAllFilters={clearAllFilters}
        filteredTransactions={filteredTransactions}
        currentTransactions={currentTransactions}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        checkingAccount={checkingAccount || checkingMeta}
        savingsAccount={savingsAccount || savingsMeta}
        loanAccounts={loanAccounts}
        businessAccounts={businessAccounts}
        creditAccounts={creditAccounts}
      />
    </div>
  );
};

export default AccountSummary;