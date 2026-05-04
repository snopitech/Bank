/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import HeaderTest from "./components/HeaderTest";
import Header from "./components/Header";
import AccountCard from "./components/AccountCard";
import BusinessAccountCard from "./components/BusinessAccountCard.jsx";
import CreditAccountCard from "./components/CreditAccountCard.jsx";
import SpendingAnalytics from "./components/SpendingAnalytics";
import TransactionHistory from "./components/TransactionHistory";
import RealTimeStatusBar from "./components/RealTimeStatusBar";
import QuickActions from "./components/QuickActions";
import PromotionalOffers from "./components/PromotionalOffers";
import SnopitechDeals from "./components/SnopitechDeals";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import TransferModal from "./components/TransferModal";
import InternalTransferModal from "./components/InternalTransferModal";
import PayBillsModal from "./components/PayBillsModal";
import CreditCardPaymentModal from "./components/CreditCardPaymentModal";
import TransactionDetailsModal from "./components/TransactionDetailsModal";
import AIFinancialAssistant from "./components/AIFinancialAssistant";
import { useContactModal } from "./ContactModalContext";
import ContactInlineForm from "./ContactInlineForm";
import LoanAccountCard from "./components/LoanAccountCard";
import { useNavigate } from 'react-router-dom';

const API_BASE = "";

export default function Dashboard() {
  const navigate = useNavigate();
  // ⭐⭐⭐ Contact Modal Hook - UPDATED
  const { toggleInlineForm, isInlineExpanded, inlineUserData, inlinePresetCategory, inlinePresetSubject } = useContactModal();
  
  // 1️⃣ ALL HOOKS AT THE TOP — ALWAYS SAFE
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showInternalTransferModal, setShowInternalTransferModal] = useState(false);
  const [showPayBillsModal, setShowPayBillsModal] = useState(false);

 const [checkingAccount, setCheckingAccount] = useState(null);
 const [savingsAccount, setSavingsAccount] = useState(null);
 const [businessAccounts, setBusinessAccounts] = useState([]);
 const [creditAccounts, setCreditAccounts] = useState([]);
 const [loanAccounts, setLoanAccounts] = useState([]); // Add this line
 const [increaseRequests, setIncreaseRequests] = useState([]);
 const [transactions, setTransactions] = useState([]);

  // ⭐ Account switcher
  const [selectedAccount, setSelectedAccount] = useState("CHECKING");

  // ⭐ Transaction details modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCreditPaymentModal, setShowCreditPaymentModal] = useState(false);
  const [selectedCreditAccount, setSelectedCreditAccount] = useState(null);
  // ⭐ Filters
  const [filterType, setFilterType] = useState("ALL");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");

  // ⭐⭐ NEW: Search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // ⭐⭐ Transaction pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // ⭐⭐ NEW: Statement download state
  const [showStatementDropdown, setShowStatementDropdown] = useState(false);
  const [downloadingStatement, setDownloadingStatement] = useState(false);
  const [expandedAccountInDropdown, setExpandedAccountInDropdown] = useState("CHECKING");

  // ⭐⭐ NEW: Transfer dropdown state
  const [showTransferDropdown, setShowTransferDropdown] = useState(false);
  const [transferType, setTransferType] = useState("");

  // ⭐⭐ NEW: Pay Bills dropdown state
  const [showPayBillsDropdown, setShowPayBillsDropdown] = useState(false);
  const [billCategory, setBillCategory] = useState("");

  // ⭐⭐ NEW: Real-time updates state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [previousBalances, setPreviousBalances] = useState({
    checking: 0,
    savings: 0
  });
  const [balanceChange, setBalanceChange] = useState({
    checking: 0,
    savings: 0
  });
  const [showBalanceNotification, setShowBalanceNotification] = useState(false);
  const [balanceNotification, setBalanceNotification] = useState("");
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("online");

  // ⭐⭐ NEW: Analytics state
  const [spendingData, setSpendingData] = useState({
    categories: [],
    monthlyTrend: [],
    topCategories: [],
    summary: {
      totalSpent: 0,
      averageTransaction: 0,
      largestTransaction: 0,
      transactionCount: 0
    }
  });

  // Refs for intervals
  const refreshIntervalRef = useRef(null);
  const balanceAnimationRef = useRef(null);

  // Simulated loading screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // User data
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const accounts = user?.accounts || [];

  const checkingMeta = accounts.find(
    (a) => a.accountType?.toUpperCase() === "CHECKING"
  );
  const savingsMeta = accounts.find(
    (a) => a.accountType?.toUpperCase() === "SAVINGS"
  );

  // ⭐⭐⭐ Handle Contact Support Click - UPDATED
  const handleContactSupport = () => {
    const userData = {
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    };
    
    const prefillData = {
      userData,
      presetSubject: "Dashboard Support Request",
    };
    
    console.log("Toggling inline contact form with data:", prefillData);
    toggleInlineForm(prefillData);
  };

  // Fetch functions
  const fetchChecking = async () => {
    if (!checkingMeta?.accountNumber) return null;
    const res = await fetch(
      `${API_BASE}/api/accounts/account-number?accountNumber=${checkingMeta.accountNumber}`
    );
    return await res.json();
  };

  const fetchSavings = async () => {
    if (!savingsMeta?.accountNumber) return null;
    const res = await fetch(
      `${API_BASE}/api/accounts/account-number?accountNumber=${savingsMeta.accountNumber}`
    );
    return await res.json();
  };

 const fetchBusinessAccounts = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user?.id) return [];
    
    const response = await fetch(`${API_BASE}/api/business/accounts/user/${user.id}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    
    // Transform to ensure balance field exists
    return data.map(business => ({
      ...business,
      balance: business.accountBalance || 0, // Map accountBalance to balance
      accountType: "BUSINESS_CHECKING"
    }));
  } catch (error) {
    console.error('Error fetching business accounts:', error);
    return [];
  }
};

const fetchCreditAccounts = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user?.id) return [];
    
    const response = await fetch(`${API_BASE}/api/credit/accounts/user/${user.id}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    console.log('Raw credit accounts:', data); // Check what the API returns
    
    // Transform to ensure balance field exists
    const transformed = data.map(credit => ({
      id: credit.id,
      accountNumber: credit.accountNumber,
      accountType: "CREDIT",
      balance: credit.currentBalance || 0,
      currentBalance: credit.currentBalance,
      creditLimit: credit.creditLimit,
      cards: credit.cards,
      maskedAccountNumber: credit.maskedAccountNumber,
      status: credit.status,
      active: credit.active,
      increaseCount: credit.increaseCount || 0  // ADD THIS LINE
    }));
    
    console.log('Transformed credit accounts:', transformed);
    transformed.forEach(acc => {
      console.log(`Account ${acc.id}: status=${acc.status}, active=${acc.active}`);
    });
    
    return transformed;
  } catch (error) {
    console.error('Error fetching credit accounts:', error);
    return [];
  }
};
 // Fetch credit increase requests for the user
const fetchCreditIncreaseRequests = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user?.id) return [];
    
    const response = await fetch(`${API_BASE}/api/credit/increase-requests/user/${user.id}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching increase requests:', error);
    return [];
  }
};

const fetchLoanAccounts = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user?.id) return [];
    
    const response = await fetch(`${API_BASE}/api/loan/accounts?userId=${user.id}`, {
      headers: { 'sessionId': user.sessionId }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching loan accounts:', error);
    return [];
  }
};

  // ✅ Get transactions for logged-in user by user ID
  const fetchTransactions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
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
      
      const accounts = user.accounts || [];
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

/**
 * Handle opening credit card payment modal
 */
const handleOpenCreditPayment = (account) => {
  setSelectedCreditAccount(account);
  setShowCreditPaymentModal(true);
};

  // ==================== CREDIT CARD ACTION FUNCTIONS ====================

  /**
   * Handle credit card payment
   * POST /api/credit/accounts/{id}/payments?userId={userId}
   */
  const handleCreditPayment = async (account) => {
    const amount = prompt(`Enter payment amount for credit account ending in ${account.maskedAccountNumber?.slice(-4)}:`);
    if (!amount) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/credit/accounts/${account.id}/payments?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment failed');
      }

      const data = await response.json();
      alert(`Payment of $${numAmount} successful! New balance: $${data.newBalance}`);
      refreshDashboard(); // Refresh to show updated balance
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * Handle credit limit increase request
   * POST /api/credit/accounts/{accountId}/increase-request?userId={userId}
   */
  const handleCreditIncreaseRequest = async (account) => {
    const nextLimit = account.increaseCount === 1 ? 10000 :
                     account.increaseCount === 2 ? 15000 :
                     account.increaseCount === 3 ? 20000 : null;
    
    if (!nextLimit) {
      alert('Maximum limit already reached');
      return;
    }

    const reason = prompt(`Request increase to $${nextLimit.toLocaleString()}?\n\nPlease provide a reason:`);
    if (!reason) return;

    try {
      const response = await fetch(`${API_BASE}/api/credit/accounts/${account.id}/increase-request?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requestedLimit: nextLimit,
          reason: reason 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      const data = await response.json();
      alert(`Increase request submitted! Request ID: ${data.requestId}`);
      refreshDashboard(); // Refresh to show the new request
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * Handle view cards - Navigate to Manage Cards page
   */
  const handleCreditViewCards = (account) => {
    // Navigate to the Accounts page with credit tab active
    // You can use window.location or React Router
    window.location.href = '/accounts?tab=credit';
  };

  /**
   * Handle view transactions
   * GET /api/credit/accounts/{accountId}/transactions?userId={userId}
   */
  const handleCreditViewTransactions = async (account) => {
    try {
      const response = await fetch(`${API_BASE}/api/credit/accounts/${account.id}/transactions?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const transactions = await response.json();
      
      if (transactions.length === 0) {
        alert('No transactions found for this credit account');
        return;
      }

      // Format and display transactions
      let message = `📊 Recent Transactions\n\n`;
      transactions.slice(0, 5).forEach(tx => {
        const date = new Date(tx.timestamp).toLocaleDateString();
        message += `${date} - ${tx.type}: $${tx.amount} ${tx.merchant ? `at ${tx.merchant}` : ''}\n`;
      });
      
      if (transactions.length > 5) {
        message += `\n... and ${transactions.length - 5} more`;
      }
      
      alert(message);
      
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * Handle reveal account number
   * POST /api/credit/accounts/{id}/reveal?userId={userId}
   */
  const handleCreditRevealAccount = async (account) => {
    // This will be handled inside CreditAccountCard component
    // But we need to pass a function that calls the API
    try {
      const response = await fetch(`${API_BASE}/api/credit/accounts/${account.id}/reveal?userId=${user.id}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to reveal account number');
      }

      const data = await response.json();
      return data.accountNumber; // Return the full account number
    } catch (err) {
      alert(err.message);
      return null;
    }
  };

  // ⭐⭐ NEW: Calculate spending analytics
  const calculateSpendingAnalytics = (transactionsList) => {
    const outgoingTransactions = transactionsList.filter(tx => 
      tx.type === "WITHDRAWAL" || 
      tx.type === "TRANSFER" || 
      tx.type === "BILL_PAYMENT"
    );

    const categoryTotals = {};
    const monthlySpending = {};
    const categoryCounts = {};
    
    let totalSpent = 0;
    let largestTransaction = 0;
    let transactionCount = outgoingTransactions.length;

    outgoingTransactions.forEach(tx => {
      const amount = tx.amount;
      const category = tx.category?.toUpperCase() || "OTHER";
      const date = new Date(tx.timestamp);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      monthlySpending[monthYear] = (monthlySpending[monthYear] || 0) + amount;
      
      totalSpent += amount;
      if (amount > largestTransaction) {
        largestTransaction = amount;
      }
    });

    const categories = Object.entries(categoryTotals)
      .map(([category, amount]) => {
        const categoryName = category === "FOOD" ? "Food & Dining" :
                           category === "SHOPPING" ? "Shopping" :
                           category === "BILLS" ? "Bills & Utilities" :
                           category === "ENTERTAINMENT" ? "Entertainment" :
                           category === "TRANSPORT" ? "Transportation" :
                           category === "HEALTHCARE" ? "Healthcare" :
                           category === "TRANSFER" ? "Transfers" : "Other";
        
        const categoryColors = {
          "Food & Dining": { bg: "bg-blue-500", text: "text-blue-700", icon: "🍔" },
          "Shopping": { bg: "bg-purple-500", text: "text-purple-700", icon: "🛍️" },
          "Bills & Utilities": { bg: "bg-yellow-500", text: "text-yellow-700", icon: "💡" },
          "Entertainment": { bg: "bg-pink-500", text: "text-pink-700", icon: "🎬" },
          "Transportation": { bg: "bg-green-500", text: "text-green-700", icon: "🚗" },
          "Healthcare": { bg: "bg-red-500", text: "text-red-700", icon: "🏥" },
          "Transfers": { bg: "bg-gray-500", text: "text-gray-700", icon: "💸" },
          "Other": { bg: "bg-gray-400", text: "text-gray-600", icon: "📦" }
        };
        
        const colors = categoryColors[categoryName] || categoryColors["Other"];
        
        return {
          id: category,
          name: categoryName,
          amount,
          count: categoryCounts[category] || 0,
          color: colors.bg,
          textColor: colors.text,
          icon: colors.icon,
          percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const monthlyTrend = Object.entries(monthlySpending)
      .map(([month, amount]) => ({
        month,
        amount,
        displayMonth: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    const topCategories = categories.slice(0, 5);

    setSpendingData({
      categories,
      monthlyTrend,
      topCategories,
      summary: {
        totalSpent,
        averageTransaction: transactionCount > 0 ? totalSpent / transactionCount : 0,
        largestTransaction,
        transactionCount
      }
    });
  };

  // ⭐⭐ NEW: Enhanced refresh dashboard with analytics
  const refreshDashboard = async (silent = false) => {
    if (!silent) {
      setIsRefreshing(true);
    }
    
    try {
      const oldCheckingBalance = checkingAccount?.balance || checkingMeta?.balance || 0;
      const oldSavingsBalance = savingsAccount?.balance || savingsMeta?.balance || 0;
      
  const [newChecking, newSavings, newTransactions, newBusinessAccounts, newCreditAccounts, newIncreaseRequests, newLoanAccounts] = await Promise.all([
  fetchChecking(),
  fetchSavings(),
  fetchTransactions(),
  fetchBusinessAccounts(),
  fetchCreditAccounts(),
  fetchCreditIncreaseRequests(),
  fetchLoanAccounts() // Add this
]);

  console.log('Loan accounts fetched:', newLoanAccounts); // ADD THIS LINE

setCheckingAccount(newChecking);
setSavingsAccount(newSavings);
setTransactions(newTransactions);
setBusinessAccounts(newBusinessAccounts);
setCreditAccounts(newCreditAccounts);
setIncreaseRequests(newIncreaseRequests);
setLoanAccounts(newLoanAccounts); // Make sure this line exists
setLastUpdated(new Date());
    
      setCheckingAccount(newChecking);
      setSavingsAccount(newSavings);
      setTransactions(newTransactions);
      setBusinessAccounts(newBusinessAccounts);
      setCreditAccounts(newCreditAccounts);
      setIncreaseRequests(newIncreaseRequests); 
      setLoanAccounts(newLoanAccounts);     
      setLastUpdated(new Date());
     
      const newCheckingBalance = newChecking?.balance || checkingMeta?.balance || 0;
      const newSavingsBalance = newSavings?.balance || savingsMeta?.balance || 0;
      
      const checkingChange = newCheckingBalance - oldCheckingBalance;
      const savingsChange = newSavingsBalance - oldSavingsBalance;
      
      setPreviousBalances({
        checking: oldCheckingBalance,
        savings: oldSavingsBalance
      });
      
      setBalanceChange({
        checking: checkingChange,
        savings: savingsChange
      });
      
      calculateSpendingAnalytics(newTransactions);
      
      if (Math.abs(checkingChange) > 0.01 || Math.abs(savingsChange) > 0.01) {
        showBalanceChangeNotification(checkingChange, savingsChange);
      }
      
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setConnectionStatus("offline");
    } finally {
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  };

  // ⭐⭐ NEW: Show balance change notification
  const showBalanceChangeNotification = (checkingChange, savingsChange) => {
    let message = "";
    
    if (checkingChange !== 0 && savingsChange !== 0) {
      message = `Balances updated: Checking ${checkingChange > 0 ? '+' : ''}$${checkingChange.toFixed(2)}, Savings ${savingsChange > 0 ? '+' : ''}$${savingsChange.toFixed(2)}`;
    } else if (checkingChange !== 0) {
      message = `Checking balance ${checkingChange > 0 ? 'increased' : 'decreased'} by $${Math.abs(checkingChange).toFixed(2)}`;
    } else if (savingsChange !== 0) {
      message = `Savings balance ${savingsChange > 0 ? 'increased' : 'decreased'} by $${Math.abs(savingsChange).toFixed(2)}`;
    }
    
    if (message) {
      setBalanceNotification(message);
      setShowBalanceNotification(true);
      
      setTimeout(() => {
        setShowBalanceNotification(false);
      }, 5000);
    }
  };

  // ⭐⭐ NEW: Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ⭐⭐ NEW: Manual refresh handler
  const handleManualRefresh = () => {
    refreshDashboard();
  };

  // ⭐⭐ NEW: Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    
    if (!autoRefreshEnabled) {
      startAutoRefresh();
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
  };

  // ⭐⭐ NEW: Start auto-refresh interval
  const startAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible' && autoRefreshEnabled) {
        refreshDashboard(true);
      }
    }, 60000);
  };

  // ⭐⭐ NEW: Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoRefreshEnabled) {
        refreshDashboard(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoRefreshEnabled]);

  // Fetch data on mount and setup auto-refresh
  useEffect(() => {
    refreshDashboard();
    startAutoRefresh();
    
    const handleOnline = () => {
      setConnectionStatus("online");
      refreshDashboard(true);
    };
    
    const handleOffline = () => {
      setConnectionStatus("offline");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (balanceAnimationRef.current) {
        clearInterval(balanceAnimationRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ⭐⭐ NEW: Refresh after modal actions
  useEffect(() => {
    if (showTransferModal === false || showPayBillsModal === false || showInternalTransferModal === false) {
      const timer = setTimeout(() => {
        refreshDashboard(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [showTransferModal, showPayBillsModal, showInternalTransferModal]);

  const routingNumber =
    checkingAccount?.routingNumber ||
    savingsAccount?.routingNumber ||
    checkingMeta?.routingNumber ||
    savingsMeta?.routingNumber ||
    "842917356";

  // ⭐⭐ NEW: Get account balance
  const getAccountBalance = (accountType) => {
    if (accountType === "CHECKING") {
      return checkingAccount?.balance || checkingMeta?.balance || 0;
    } else if (accountType === "SAVINGS") {
      return savingsAccount?.balance || savingsMeta?.balance || 0;
    } else if (accountType === "BUSINESS") {
      return businessAccounts[0]?.accountBalance || 0;
    } else if (accountType === "CREDIT") {
      return creditAccounts[0]?.currentBalance || 0;
    }
    return 0;
  };

  // ⭐⭐ NEW: Get balance change for account
  const getBalanceChange = (accountType) => {
    return accountType === "CHECKING" ? balanceChange.checking : balanceChange.savings;
  };

  // ⭐⭐ NEW: Get account nickname
  const getAccountNickname = (accountType) => {
    if (accountType === "CHECKING") {
      return checkingAccount?.nickname || checkingMeta?.nickname || "Everyday Checking";
    } else if (accountType === "SAVINGS") {
      return savingsAccount?.nickname || savingsMeta?.nickname || "Everyday Savings";
    } else if (accountType === "BUSINESS") {
      return businessAccounts[0]?.businessName || "Business Account";
    } else if (accountType === "CREDIT") {
      return "Credit Card";
    }
    return "Account";
  };

  // ⭐⭐ NEW: Get masked account number
  const getMaskedAccountNumber = (accountType) => {
    let accountNumber = "";
    
    if (accountType === "CHECKING") {
      accountNumber = checkingAccount?.accountNumber || checkingMeta?.accountNumber;
    } else if (accountType === "SAVINGS") {
      accountNumber = savingsAccount?.accountNumber || savingsMeta?.accountNumber;
    } else if (accountType === "BUSINESS") {
      accountNumber = businessAccounts[0]?.accountNumber;
    } else if (accountType === "CREDIT") {
      accountNumber = creditAccounts[0]?.maskedAccountNumber || creditAccounts[0]?.accountNumber;
    }
    
    if (!accountNumber) return "••••••";
    if (accountNumber.includes("****")) return accountNumber;
    return `••••${accountNumber.slice(-4)}`;
  };

  // ⭐⭐ NEW: Helper function to get date range based on period
  const getDateRangeForPeriod = (period) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch(period) {
      case '30days':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'currentMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'thisYear':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      case 'custom':
        if (filterStartDate && filterEndDate) {
          startDate = new Date(filterStartDate);
          endDate = new Date(filterEndDate);
        } else {
          startDate.setDate(today.getDate() - 30);
        }
        break;
      default:
        startDate.setDate(today.getDate() - 30);
    }
    
    return { startDate, endDate };
  };

  // ⭐⭐ NEW: Filter transactions by date range
  const filterTransactionsByDateRange = (transactionsList, startDate, endDate) => {
    return transactionsList.filter(tx => {
      const txDate = new Date(tx.timestamp);
      return txDate >= startDate && txDate <= endDate;
    });
  };
  // ⭐⭐ NEW: Get transactions for account type
  const getTransactionsForAccount = (accountType) => {
    return transactions.filter(tx => tx.accountType === accountType);
  };

 // ⭐⭐ UPDATED: Download statement for specific account - USING BACKEND API
const downloadCSVStatement = async (accountType, period) => {
  try {
    setDownloadingStatement(true);
    
    let accountId;
    if (accountType === "CHECKING") {
      accountId = checkingAccount?.id || checkingMeta?.id;
    } else if (accountType === "SAVINGS") {
      accountId = savingsAccount?.id || savingsMeta?.id;
    } else if (accountType === "BUSINESS") {
      accountId = businessAccounts[0]?.accountId;
    } else if (accountType === "CREDIT") {
      accountId = creditAccounts[0]?.id;
    }
    
    if (!accountId) {
      alert('Account not found');
      setDownloadingStatement(false);
      return;
    }

    // For credit cards, use the credit transaction endpoint
    if (accountType === "CREDIT") {
      console.log('📥 Fetching credit transactions for account:', accountId);
      
      const response = await fetch(
        `${API_BASE}/api/credit/accounts/${accountId}/transactions`
      );
      
      console.log('📊 Credit response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Credit fetch error:', errorText);
        throw new Error('Failed to fetch credit transactions');
      }
      
      const transactions = await response.json();
      console.log('💳 Credit transactions received:', transactions);
      
      if (!transactions || transactions.length === 0) {
        alert('No transactions found for this credit card');
        setDownloadingStatement(false);
        return;
      }
      
      // Create CSV from transactions
      let csvContent = "Date,Description,Amount,Type\n";
      transactions.forEach(tx => {
        const date = new Date(tx.timestamp).toLocaleDateString();
        csvContent += `${date},${tx.description || ''},${tx.amount},${tx.type}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credit_statement_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setDownloadingStatement(false);
      return; // Exit early for credit cards
    }

    // REGULAR ACCOUNT CODE - This will only run for CHECKING, SAVINGS, BUSINESS
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    
    if (period === 'lastMonth') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      year = lastMonth.getFullYear();
      month = lastMonth.getMonth() + 1;
    } else if (period === 'currentMonth') {
      year = today.getFullYear();
      month = today.getMonth() + 1;
    } else if (period === '30days') {
      year = today.getFullYear();
      month = today.getMonth() + 1;
    } else if (period === 'custom' && filterStartDate && filterEndDate) {
      const start = new Date(filterStartDate);
      year = start.getFullYear();
      month = start.getMonth() + 1;
    }
    
    const response = await fetch(
      `${API_BASE}/api/accounts/${accountId}/statements/export?year=${year}&month=${month}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to download statement');
    }
    
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `statement_${accountType.toLowerCase()}_${year}-${String(month).padStart(2, '0')}.pdf`;
    
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match) filename = match[1];
    }
    
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
    alert('Failed to download statement. Please try again.');
  } finally {
    setDownloadingStatement(false);
  }
};


  // ⭐⭐ UPDATED: Open statement in new tab for specific account - USING BACKEND API
  const openStatementInNewTab = async (accountType, period) => {
    try {
      setDownloadingStatement(true);
      
      let accountId;
      if (accountType === "CHECKING") {
        accountId = checkingAccount?.id || checkingMeta?.id;
      } else if (accountType === "SAVINGS") {
        accountId = savingsAccount?.id || savingsMeta?.id;
      } else if (accountType === "BUSINESS") {
        accountId = businessAccounts[0]?.accountId;
      } else if (accountType === "CREDIT") {
        accountId = creditAccounts[0]?.id;
      }
      
      if (!accountId) {
        alert('Account not found');
        setDownloadingStatement(false);
        return;
      }
      
      const today = new Date();
      let year = today.getFullYear();
      let month = today.getMonth() + 1;
      
      if (period === 'lastMonth') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        year = lastMonth.getFullYear();
        month = lastMonth.getMonth() + 1;
      } else if (period === 'currentMonth') {
        year = today.getFullYear();
        month = today.getMonth() + 1;
      } else if (period === '30days') {
        year = today.getFullYear();
        month = today.getMonth() + 1;
      } else if (period === 'custom' && filterStartDate && filterEndDate) {
        const start = new Date(filterStartDate);
        year = start.getFullYear();
        month = start.getMonth() + 1;
      }
      
      window.open(`${API_BASE}/api/accounts/${accountId}/statements/export?year=${year}&month=${month}`, '_blank');
      
    } catch (error) {
      console.error('Error opening statement:', error);
      alert('Failed to open statement. Please try again.');
    } finally {
      setDownloadingStatement(false);
    }
  };

  // ⭐⭐ NEW: Handle View Statements button click
  const handleViewStatementsClick = () => {
    setShowStatementDropdown(!showStatementDropdown);
    setShowTransferDropdown(false);
    setShowPayBillsDropdown(false);
    setExpandedAccountInDropdown(selectedAccount);
  };

  // ⭐⭐ NEW: Handle Transfer Money button click
  const handleTransferClick = () => {
    setShowTransferDropdown(!showTransferDropdown);
    setShowStatementDropdown(false);
    setShowPayBillsDropdown(false);
  };
// ⭐⭐ NEW: Handle Pay Bills button click - goes directly to modal
const handlePayBillsClick = () => {
  setShowPayBillsModal(true); // Directly open the modal
};

  // ⭐⭐ NEW: Open Transfer Modal with type
const openTransferModal = (type) => {
  setTransferType(type);
  setShowTransferDropdown(false);
  
  if (type === "betweenAccounts") {
    setShowInternalTransferModal(true);
  } else if (type === "zelle") {
    navigate('/zelle'); // This will take you to the new Zelle page
  } else {
    setShowTransferModal(true);
  }
};

  // ⭐⭐ NEW: Open Pay Bills Modal with category
  const openPayBillsModal = (category) => {
    setBillCategory(category);
    setShowPayBillsDropdown(false);
    setShowPayBillsModal(true);
  };

  // ⭐⭐ NEW: Toggle account expansion in dropdown
  const toggleAccountExpansion = (accountType) => {
    setExpandedAccountInDropdown(expandedAccountInDropdown === accountType ? null : accountType);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.statement-dropdown-container') && 
          !event.target.closest('.transfer-dropdown-container') &&
          !event.target.closest('.paybills-dropdown-container')) {
        setShowStatementDropdown(false);
        setShowTransferDropdown(false);
        setShowPayBillsDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Transaction Type Icons + Colors
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

  // Apply filters INCLUDING SEARCH
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
        const balanceMatch = tx.balanceAfter?.toString().includes(query);
        
        if (!descriptionMatch && !amountMatch && !typeMatch && !dateMatch && !balanceMatch) {
          return false;
        }
      }

      return true;
    });

  // Calculate pagination values
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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 animate-fadeIn">
      <Header name={user?.firstName || ""} />

      {/* Balance Update Notification */}
      {showBalanceNotification && (
        <div className="fixed top-20 right-4 z-50 animate-slideIn">
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">💸</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Balance Updated</h3>
                <p className="text-sm text-green-700 mt-1">{balanceNotification}</p>
              </div>
              <button
                onClick={() => setShowBalanceNotification(false)}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingScreen />
      ) : !user ? (
        <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
          No user found. Please log in again.
        </div>
      ) : (
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Real-time Status Bar */}
          <RealTimeStatusBar
            connectionStatus={connectionStatus}
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            formatTimeAgo={formatTimeAgo}
            autoRefreshEnabled={autoRefreshEnabled}
            toggleAutoRefresh={toggleAutoRefresh}
            handleManualRefresh={handleManualRefresh}
            balanceChange={balanceChange}
          />
          
          {/* Quick Contact Support Card with Inline Form */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-lg p-4 border border-blue-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Need Help?</h3>
                  <p className="text-sm text-gray-600">
                    Get quick assistance with your account, transactions, or dashboard features.
                  </p>
                </div>
                <button
                  onClick={handleContactSupport}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 shadow font-medium flex items-center ${
                    isInlineExpanded 
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
                  }`}
                >
                  <span className="mr-2">{isInlineExpanded ? '✕' : '📧'}</span>
                  {isInlineExpanded ? 'Close Support' : 'Contact Support'}
                </button>
              </div>
            </div>
            
            <ContactInlineForm
              isExpanded={isInlineExpanded}
              onClose={() => toggleInlineForm()}
              userData={inlineUserData}
              presetCategory={inlinePresetCategory}
              presetSubject={inlinePresetSubject}
            />
          </div>
          
          <HeaderTest />

          {/* Main Dashboard Content */}
          <div className="w-full mx-auto" style={{ maxWidth: '100%' }}>
            {/* Account summary - Enhanced layout with Business Accounts and Credit Accounts */}
            <section className="mb-8 sm:mb-10 md:mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Regular checking and savings cards */}
                <div className="relative bg-gradient-to-r from-blue-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100 transform hover:scale-[1.01] transition-transform duration-300">
                  <AccountCard
                    title="Everyday Checking"
                    account={checkingAccount || checkingMeta}
                    routingNumber={routingNumber}
                    balanceChange={balanceChange.checking}
                    lastUpdated={lastUpdated}
                    accountType="CHECKING"
                  />
                  {balanceChange.checking !== 0 && (
                    <div className={`absolute -top-2 -right-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                      balanceChange.checking > 0 
                        ? 'bg-green-100 text-green-800 animate-bounce' 
                        : 'bg-red-100 text-red-800 animate-bounce'
                    }`}>
                      {balanceChange.checking > 0 ? '▲' : '▼'} ${Math.abs(balanceChange.checking).toFixed(2)}
                    </div>
                  )}
                </div>
                
              {savingsAccount && (
  <div className="relative bg-gradient-to-r from-emerald-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-emerald-100 transform hover:scale-[1.01] transition-transform duration-300">
    <AccountCard
      title="Everyday Savings"
      account={savingsAccount}
      routingNumber={routingNumber}
      balanceChange={balanceChange.savings}
      lastUpdated={lastUpdated}
      accountType="SAVINGS"
    />
    {balanceChange.savings !== 0 && (
      <div className="absolute -top-2 -right-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg bg-green-100 text-green-800 animate-bounce">
        {balanceChange.savings > 0 ? '▲' : '▼'} ${Math.abs(balanceChange.savings).toFixed(2)}
      </div>
    )}
  </div>
)}

                {/* Business Accounts - if any exist */}
{businessAccounts.length > 0 && businessAccounts.map((business) => (
  <div key={business.id} className="relative bg-gradient-to-r from-purple-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-purple-100 transform hover:scale-[1.01] transition-transform duration-300 lg:col-span-2">
    <BusinessAccountCard
      business={business}
      routingNumber={routingNumber}
      lastUpdated={lastUpdated}
    />
    {business.verified && (
      <div className="absolute top-2 right-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
        ✅ Verified
      </div>
    )}
  </div>
))}

{/* Credit Accounts - ADD THIS SECTION RIGHT HERE */}
{creditAccounts && creditAccounts.length > 0 && creditAccounts.map((account) => (
  <div key={account.id} className="relative bg-gradient-to-r from-blue-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-200 transform hover:scale-[1.01] transition-transform duration-300 lg:col-span-2">
    <CreditAccountCard
      account={account}
      balanceChange={0}
      lastUpdated={lastUpdated}
      onMakePayment={handleOpenCreditPayment}
      onRequestIncrease={handleCreditIncreaseRequest}
      onViewCards={handleCreditViewCards}
      onViewTransactions={handleCreditViewTransactions}
      onRevealAccount={handleCreditRevealAccount}
    />
  </div>
))}


  {/* Loan Accounts - if any exist */}
{loanAccounts && loanAccounts.length > 0 && loanAccounts.map((loan) => (
  <div key={loan.id} className="lg:col-span-2">
    <LoanAccountCard loan={loan} onRefresh={refreshDashboard} />
  </div>
))}

              </div>
            </section>

            {/* Credit Increase Requests Status */}
            {increaseRequests.length > 0 && (
              <div className="mt-6 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Credit Limit Increase Requests</h3>
                <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-100">
                  {increaseRequests.map((request) => {
                    const statusColors = {
                      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
                      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
                      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' }
                    };
                    const status = statusColors[request.status] || statusColors.PENDING;
                    
                    return (
                      <div key={request.id} className="border-b border-gray-100 last:border-0 py-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                {status.icon} {request.status}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(request.submittedDate).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              Requesting increase from ${request.currentLimit?.toLocaleString()} to ${request.requestedLimit?.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Reason: {request.reason}</p>
                            
                            {request.status === 'REJECTED' && request.rejectionReason && (
                              <p className="text-xs text-red-600 mt-1">
                                Reason: {request.rejectionReason}
                              </p>
                            )}
                            
                            {request.status === 'APPROVED' && (
                              <p className="text-xs text-green-600 mt-1">
                                Approved on {new Date(request.reviewedDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          
                          {request.status === 'PENDING' && (
                            <div className="ml-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></span>
                                Pending Review
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Enhanced Quick Actions Section */}
            <section className="mb-8 sm:mb-10 md:mb-12">
              <QuickActions
                showTransferDropdown={showTransferDropdown}
                setShowTransferDropdown={setShowTransferDropdown}
                showPayBillsDropdown={showPayBillsDropdown}
                setShowPayBillsDropdown={setShowPayBillsDropdown}
                showStatementDropdown={showStatementDropdown}
                setShowStatementDropdown={setShowStatementDropdown}
                openTransferModal={openTransferModal}
                openPayBillsModal={openPayBillsModal}
                downloadingStatement={downloadingStatement}
                expandedAccountInDropdown={expandedAccountInDropdown}
                toggleAccountExpansion={toggleAccountExpansion}
                getAccountNickname={getAccountNickname}
                getMaskedAccountNumber={getMaskedAccountNumber}
                getAccountBalance={getAccountBalance}
                openStatementInNewTab={openStatementInNewTab}
                downloadCSVStatement={downloadCSVStatement}
                filterStartDate={filterStartDate}
                filterEndDate={filterEndDate}
                selectedAccount={selectedAccount}
                handleTransferClick={handleTransferClick}
                handlePayBillsClick={handlePayBillsClick}
                handleViewStatementsClick={handleViewStatementsClick}
                checkingAccount={checkingAccount || checkingMeta}
                savingsAccount={savingsAccount || savingsMeta}
                businessAccounts={businessAccounts}
                creditAccounts={creditAccounts}
              />
            </section>

            {/* Spending Analytics */}
            <section className="mb-8 sm:mb-10 md:mb-12">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <SpendingAnalytics spendingData={spendingData} />
              </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Column: Transaction History */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 h-full">
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
  businessAccounts={businessAccounts}
  creditAccounts={creditAccounts}
  loanAccounts={loanAccounts}
/>
                </div>
              </div>

              {/* Right Column: Promotions & Deals */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-r from-red-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-red-100">
                  <PromotionalOffers />
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
                  <SnopitechDeals />
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      <Footer />

      {/* Modals */}
      {showTransferModal && (
        <TransferModal
          accounts={accounts}
          transferType={transferType}
          onClose={() => setShowTransferModal(false)}
          onSuccess={refreshDashboard}
        />
      )}

    {showInternalTransferModal && (
  <InternalTransferModal
    accounts={[
      ...(checkingAccount ? [checkingAccount] : []),
      ...(savingsAccount ? [savingsAccount] : []),
      ...businessAccounts,
      ...creditAccounts
    ]}
    onClose={() => setShowInternalTransferModal(false)}
    onSuccess={refreshDashboard}
  />
)}
       
        {showCreditPaymentModal && selectedCreditAccount && (
  <CreditCardPaymentModal
    creditAccount={selectedCreditAccount}
    userAccounts={accounts}
    onClose={() => {
      setShowCreditPaymentModal(false);
      setSelectedCreditAccount(null);
    }}
    onSuccess={refreshDashboard}
  />
)}
 {showPayBillsModal && (
  <PayBillsModal
    accounts={[
      ...(checkingAccount ? [checkingAccount] : []),
      ...(savingsAccount ? [savingsAccount] : []),
      ...businessAccounts,
      ...creditAccounts
    ]}
    onClose={() => setShowPayBillsModal(false)}
    onSuccess={refreshDashboard}
  />
)}

      {showTransactionModal && (
        <TransactionDetailsModal
          tx={selectedTransaction}
          onClose={() => setShowTransactionModal(false)}
        />
      )}

      <AIFinancialAssistant 
        transactions={transactions}
        spendingData={spendingData}
      />
    </div>
  );
}