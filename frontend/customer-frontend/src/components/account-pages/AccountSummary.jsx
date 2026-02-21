// src/components/account-pages/AccountSummary.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  SparklesIcon,
  GiftIcon,
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  TagIcon,
  TrophyIcon,
  BoltIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// Import your existing components
import AccountCard from '../AccountCard';

const API_BASE = "http://localhost:8080";

const AccountSummary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  
  // Account states
  const [checkingAccount, setCheckingAccount] = useState(null);
  const [savingsAccount, setSavingsAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Account switcher for transactions
  const [selectedAccount, setSelectedAccount] = useState("CHECKING");
  
  // Transaction filter states
  const [filterType, setFilterType] = useState("ALL");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

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

  // Fetch functions
  const fetchChecking = async () => {
    if (!checkingMeta?.accountNumber) return null;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE}/api/accounts/account-number?accountNumber=${checkingMeta.accountNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
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
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE}/api/accounts/account-number?accountNumber=${savingsMeta.accountNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return await res.json();
    } catch (error) {
      console.error('Error fetching savings:', error);
      return null;
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID found');
        return [];
      }

      const response = await fetch(`${API_BASE}/api/users/${user.id}/transactions`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.error('User not found');
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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

  // Load all data
  const loadAccountData = async () => {
    setLoading(true);
    try {
      const [checking, savings, transactionsData] = await Promise.all([
        fetchChecking(),
        fetchSavings(),
        fetchTransactions()
      ]);
      
      setCheckingAccount(checking);
      setSavingsAccount(savings);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAccountData();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions
    .filter((tx) => tx.accountType === selectedAccount)
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

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset page when filters change
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

  // Render transaction type
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mb-4"></div>
        <p className="text-gray-500">Loading your accounts...</p>
      </div>
    );
  }

  const totalBalance = (checkingAccount?.balance || checkingMeta?.balance || 0) + 
                      (savingsAccount?.balance || savingsMeta?.balance || 0);

  return (
    <div className="space-y-6">
      {/* Header with Total Wealth */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                ACCOUNT SUMMARY
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                Member since {new Date().getFullYear() - 2}
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Balance</p>
                <div className="flex items-center">
                  <h1 className="text-4xl md:text-5xl font-bold">
                    {hideBalances ? '••••••' : formatCurrency(totalBalance)}
                  </h1>
                  <button
                    onClick={() => setHideBalances(!hideBalances)}
                    className="ml-3 p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition"
                  >
                    {hideBalances ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-4 md:mt-0">
            <button className="bg-white text-red-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all flex items-center shadow-lg">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Transfer
            </button>
            <button className="bg-white text-red-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all flex items-center shadow-lg">
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Deposit
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <p className="text-xs opacity-90 mb-1">Interest Earned YTD</p>
            <p className="text-lg font-bold">{hideBalances ? '••••' : '$1,247.32'}</p>
          </div>
          <div>
            <p className="text-xs opacity-90 mb-1">Next Statement</p>
            <p className="text-lg font-bold">Mar 5, 2026</p>
          </div>
          <div>
            <p className="text-xs opacity-90 mb-1">Credit Score</p>
            <div className="flex items-center">
              <p className="text-lg font-bold">742</p>
              <span className="ml-2 text-xs bg-green-400 text-green-900 px-2 py-0.5 rounded-full">Good</span>
            </div>
          </div>
          <div>
            <p className="text-xs opacity-90 mb-1">Rewards Points</p>
            <p className="text-lg font-bold">12,450</p>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHECKING ACCOUNT */}
        <div className="relative bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-lg p-6 border border-blue-100 transform hover:scale-[1.01] transition-transform duration-300">
          <AccountCard
            title="Everyday Checking"
            account={checkingAccount || checkingMeta}
            routingNumber={routingNumber}
            balanceChange={125.50}
            lastUpdated={new Date().toISOString()}
          />
        </div>

        {/* SAVINGS ACCOUNT */}
        <div className="relative bg-gradient-to-r from-emerald-50 to-white rounded-xl shadow-lg p-6 border border-emerald-100 transform hover:scale-[1.01] transition-transform duration-300">
          <AccountCard
            title="Everyday Savings"
            account={savingsAccount || savingsMeta}
            routingNumber={routingNumber}
            balanceChange={12.47}
            lastUpdated={new Date().toISOString()}
          />
        </div>
      </div>

      {/* Benefits & Rewards Section */}
      <div className="space-y-5">
        {/* Section Header */}
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

        {/* Benefits Cards Grid - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Benefit 1: Cashback Rewards */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-amber-100 p-2.5 rounded-lg group-hover:bg-amber-200 transition-colors">
                <GiftIcon className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                ACTIVE
              </span>
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

          {/* Benefit 2: High-Yield Savings */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-2.5 rounded-lg group-hover:bg-green-200 transition-colors">
                <RocketLaunchIcon className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded-full">
                BONUS
              </span>
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

          {/* Benefit 3: Overdraft Protection */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-2.5 rounded-lg group-hover:bg-blue-200 transition-colors">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                ENROLLED
              </span>
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

          {/* Benefit 4: Digital Wallet */}
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-5 border border-purple-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 p-2.5 rounded-lg group-hover:bg-purple-200 transition-colors">
                <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs font-bold bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                READY
              </span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Digital Wallet</h3>
            <p className="text-xs text-gray-500 mb-3">Apple Pay, Google Pay, Samsung Pay</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-white px-2 py-1.5 rounded-lg border border-gray-300 font-mono shadow-sm">
                •••• 2213
              </span>
              <span className="text-xs bg-white px-2 py-1.5 rounded-lg border border-gray-300 font-mono shadow-sm">
                •••• 5582
              </span>
            </div>
            <p className="text-xs text-purple-600 font-medium">2 cards added</p>
          </div>
        </div>

        {/* Exclusive Offers & Perks Section - 3 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-2">
          {/* Referral Program */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all group">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2.5 rounded-lg group-hover:bg-red-200 transition-colors">
                <UserGroupIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-gray-800">Refer & Earn</h3>
                <p className="text-xs text-gray-500">Get $50 per referral</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Share your link and you both get $50 when they open an account.</p>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
              <span className="text-xs font-mono text-gray-700 truncate max-w-[180px]">
                snopitech.com/r/{user?.firstName?.toLowerCase() || 'friend'}123
              </span>
              <button className="text-red-600 hover:text-red-700 text-xs font-medium bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition">
                Copy
              </button>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-600">Your referrals</span>
              <span className="font-bold text-gray-900">3</span>
            </div>
          </div>

          {/* Tier Benefits */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-2.5 rounded-lg">
                <TrophyIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-gray-800">Premium Tier</h3>
                <p className="text-xs text-gray-500">Your status: Gold</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Next tier: Platinum</span>
                <span className="text-xs font-bold text-amber-600">$2,450 to go</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">Current benefits</p>
                  <p className="text-sm font-bold text-gray-800">8</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">Unlock at next tier</p>
                  <p className="text-sm font-bold text-gray-800">+4</p>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Savings Tip */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-md border border-indigo-100 p-5 hover:shadow-lg transition-all">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-2.5 rounded-lg">
                <BoltIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-gray-800">Smart Tip</h3>
                <p className="text-xs text-gray-500">Personalized for you</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-indigo-200">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-indigo-700">💰</span> You're only <span className="font-bold text-indigo-700">$450</span> away from Platinum tier. Increase your monthly savings by $150 to unlock in 3 months.
              </p>
            </div>
            <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition shadow-md">
              Set Savings Goal
            </button>
          </div>
        </div>

        {/* Exclusive Deals Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-3 md:mb-0">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <TagIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Exclusive Cardmember Offers</h3>
                <p className="text-white/90 text-sm">Save big at top brands with your Snopitech card</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-white text-red-700 px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition shadow-md">
                View Offers
              </button>
              <button className="border border-white text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-white/10 transition">
                Learn More
              </button>
            </div>
          </div>
          <div className="flex mt-4 space-x-4 overflow-x-auto pb-1">
            <span className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full whitespace-nowrap">15% off Uber</span>
            <span className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full whitespace-nowrap">5% cashback on groceries</span>
            <span className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full whitespace-nowrap">$50 statement credit</span>
            <span className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full whitespace-nowrap">2x points on dining</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            View All
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* Account Switcher */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setSelectedAccount("CHECKING")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedAccount === "CHECKING"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Everyday Checking
          </button>
          <button
            onClick={() => setSelectedAccount("SAVINGS")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedAccount === "SAVINGS"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Everyday Savings
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filterType === "ALL"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("DEPOSIT")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filterType === "DEPOSIT"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setFilterType("WITHDRAWAL")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filterType === "WITHDRAWAL"
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            Withdrawals
          </button>
          <button
            onClick={() => setFilterType("TRANSFER")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filterType === "TRANSFER"
                ? "bg-orange-600 text-white"
                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
            }`}
          >
            Transfers
          </button>
          <button
            onClick={() => setFilterType("BILL_PAYMENT")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filterType === "BILL_PAYMENT"
                ? "bg-purple-600 text-white"
                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            }`}
          >
            Bills
          </button>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {renderType(tx)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {tx.description || "—"}
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-semibold ${
                      tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN"
                        ? "text-green-600"
                        : "text-gray-800"
                    }`}>
                      {tx.type === "WITHDRAWAL" || tx.type === "TRANSFER" || tx.type === "BILL_PAYMENT"
                        ? `-$${tx.amount.toFixed(2)}`
                        : `$${tx.amount.toFixed(2)}`}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">
                      ${tx.balanceAfter.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 px-4 text-center text-gray-500">
                    {searchQuery || filterType !== "ALL" ? (
                      <div>
                        <p className="mb-2">No transactions match your search.</p>
                        <button
                          onClick={clearAllFilters}
                          className="text-red-600 hover:text-red-700 font-semibold underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      "No recent transactions"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > transactionsPerPage && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                let pageNum;
                if (totalPages <= 3) {
                  pageNum = i + 1;
                } else if (currentPage <= 2) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 1) {
                  pageNum = totalPages - 2 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSummary;