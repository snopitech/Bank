/* eslint-disable no-unused-vars */
// src/pages/SettingsPage.jsx - FULLY UPDATED WITH PROFILE PAGE STYLING
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoadingScreen from "../components/LoadingScreen";
// ⭐ IMPORT Contact Modal Context and Inline Form
import { useContactModal } from "../ContactModalContext";
import ContactInlineForm from "../ContactInlineForm";

const API_BASE = "http://localhost:8080";

function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  
  // ⭐ Account states for all account types
  const [regularAccounts, setRegularAccounts] = useState([]);
  const [businessAccounts, setBusinessAccounts] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [loanAccounts, setLoanAccounts] = useState([]);
  
  // ⭐ ADD Contact Modal Hook
  const { toggleInlineForm, isInlineExpanded, inlineUserData, inlinePresetCategory, inlinePresetSubject } = useContactModal();
  
  // Password Change State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  
  // Email Change State
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState({ text: "", type: "" });
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  // General messages
  const [message, setMessage] = useState({ text: "", type: "" });

  // Simulated loading screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // ⭐ Handle Contact Support Click
  const handleContactSupport = (category = "ACCOUNT_ISSUE", subject = "Account Support Request") => {
    const userData = {
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      address: user?.addressLine1 || user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
    };
    
    const prefillData = {
      userData,
      presetSubject: subject,
      presetCategory: category
    };
    
    console.log("Toggling inline contact form with data:", prefillData);
    toggleInlineForm(prefillData);
  };

  // ⭐ Fetch all account types
  const fetchAllAccounts = async (userId) => {
    try {
      // Fetch regular accounts (from user object)
      const userResponse = await fetch(`${API_BASE}/api/users/${userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setRegularAccounts(userData.accounts || []);
      }
      // Fetch business accounts
       const businessResponse = await fetch(`${API_BASE}/api/business/accounts/user/${userId}`);
       if (businessResponse.ok) {
       const businessData = await businessResponse.json();
       console.log("Business accounts from API:", businessData);
       setBusinessAccounts(businessData || []);
       } else {
      console.log("Business accounts response not OK:", businessResponse.status);
       }
      // Fetch credit accounts
      const creditResponse = await fetch(`${API_BASE}/api/credit/accounts/user/${userId}`);
      if (creditResponse.ok) {
        const creditData = await creditResponse.json();
        setCreditAccounts(creditData || []);
      }
      
      // Fetch loan accounts
      const loanResponse = await fetch(`${API_BASE}/api/loan/accounts/user/${userId}`);
      if (loanResponse.ok) {
        const loanData = await loanResponse.json();
        setLoanAccounts(loanData || []);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!loggedInUser) {
          navigate("/login");
          return;
        }
        
        setUser(loggedInUser);
        // Fetch all account types
        fetchAllAccounts(loggedInUser.id);
        loadUserTransactions(loggedInUser.id);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  // ⭐ UPDATED: Simplified transaction loading using the correct API endpoint
  const loadUserTransactions = async (userId) => {
    try {
      setTransactionsLoading(true);
      
      // Direct call to get user transactions
      const transactionsResponse = await fetch(`${API_BASE}/api/users/${userId}/transactions`);
      
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      } else {
        console.error("Failed to load transactions:", transactionsResponse.status);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleRequestPasswordChange = async () => {
    if (!user?.email) {
      setPasswordMessage("Unable to find your email address");
      return;
    }

    try {
      setPasswordMessage("Sending password reset link...");
      
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: user.email })
      });
      
      if (response.ok) {
        setPasswordMessage("Password reset link sent to your email. Please check your inbox.");
        setShowPasswordChange(false);
        
        // Clear message after 5 seconds
        setTimeout(() => setPasswordMessage(""), 5000);
      } else {
        const error = await response.text();
        setPasswordMessage(error || "Failed to send password reset link");
      }
    } catch (error) {
      setPasswordMessage("Network error. Please try again.");
    }
  };

  const handleRequestEmailChange = async () => {
    if (!user?.email) {
      setEmailMessage({ text: "Unable to find your email address", type: "error" });
      return;
    }

    if (!newEmail) {
      setEmailMessage({ text: "Please enter a new email address", type: "error" });
      return;
    }

    if (newEmail === user.email) {
      setEmailMessage({ text: "New email must be different from current email", type: "error" });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailMessage({ text: "Please enter a valid email address", type: "error" });
      return;
    }

    try {
      setIsChangingEmail(true);
      setEmailMessage({ text: "Sending email change verification link...", type: "info" });
      
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const token = loggedInUser?.sessionId;
      const response = await fetch(`${API_BASE}/auth/change-email/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentEmail: user.email,
          newEmail: newEmail
        })
      });
      
      if (response.ok) {
        const message = await response.text();
        setEmailMessage({ 
          text: `Verification link sent to ${user.email}. Please check your inbox and click the link to continue.`, 
          type: "success" 
        });
        setShowEmailChange(false);
        setNewEmail("");
        
        // Clear success message after 5 seconds
        setTimeout(() => setEmailMessage({ text: "", type: "" }), 5000);
      } else {
        const error = await response.text();
        setEmailMessage({ text: error || "Failed to send email change verification", type: "error" });
      }
    } catch (error) {
      console.error("Email change error:", error);
      setEmailMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionTypeColor = (type) => {
    switch(type?.toUpperCase()) {
      case 'DEPOSIT': return 'bg-orange-100 text-orange-600';
      case 'WITHDRAWAL': return 'bg-pink-100 text-pink-600';
      case 'TRANSFER': return 'bg-amber-100 text-amber-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTransactionIcon = (type) => {
    switch(type?.toUpperCase()) {
      case 'DEPOSIT': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      );
      case 'WITHDRAWAL': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
      case 'TRANSFER': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
      default: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    }
  };

 // ⭐ UPDATED: Calculate total balance from all account types
const calculateTotalBalance = () => {
  const regularTotal = regularAccounts.reduce((total, account) => total + (account.balance || 0), 0);
  const creditTotal = creditAccounts.reduce((total, account) => total + (account.currentBalance || account.balance || 0), 0);
  const loanTotal = loanAccounts.reduce((total, account) => total + (account.balance || 0), 0);
  const businessTotal = businessAccounts.reduce((total, account) => total + (account.accountBalance || account.balance || 0), 0);
  return regularTotal + creditTotal + loanTotal + businessTotal;
};

 // ⭐ UPDATED: Calculate total accounts count from all types
const calculateTotalAccounts = () => {
  const regular = regularAccounts.length || 0;
  const credit = creditAccounts.length || 0;
  const loan = loanAccounts.length || 0;
  const business = businessAccounts.length || 0;
  
  console.log("Account counts - Regular:", regular, "Credit:", credit, "Loan:", loan, "Business:", business, "Total:", regular + credit + loan + business);
  
  return regular + credit + loan + business;
};

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        No user found. Please log in again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 animate-fadeIn">
      <Header name={user?.firstName || ""} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="bg-gradient-to-r from-orange-300 to-pink-300 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/40 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl sm:text-3xl text-gray-700">
                    {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Account Settings
                  </h1>
                  <p className="text-orange-700 text-sm sm:text-base">
                    Manage your security preferences and account details
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleGoToProfile}
                  className="bg-white text-orange-600 hover:bg-orange-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="bg-white text-orange-600 hover:bg-orange-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl sm:rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Balance</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2">{formatCurrency(calculateTotalBalance())}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-xl sm:rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Total Accounts</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2">{calculateTotalAccounts()}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl sm:rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Member Since</p>
                <p className="text-xl sm:text-2xl font-bold mt-2">{formatDate(user.memberSince)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* ⭐ HELP & SUPPORT SECTION - REDESIGNED WITH INLINE FORM */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Need Help with Your Account?</h3>
                  <p className="text-sm text-gray-600">
                    Get assistance with security settings, password reset, email changes, or any account-related issues.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleContactSupport("ACCOUNT_ISSUE", "Account Settings Support Request")}
                className={`mt-4 sm:mt-0 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 shadow-lg font-medium flex items-center ${
                  isInlineExpanded 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                    : 'bg-gradient-to-r from-orange-400 to-pink-400 text-white hover:from-orange-500 hover:to-pink-500 hover:shadow-xl'
                }`}
              >
                <span className="mr-2">{isInlineExpanded ? '✕' : '💬'}</span>
                {isInlineExpanded ? 'Close Support' : 'Get Support'}
              </button>
            </div>
            
            {/* Quick Support Options */}
            {!isInlineExpanded && (
              <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleContactSupport("FRAUD_SECURITY", "URGENT: Security Concern")}
                  className="flex items-center justify-center px-4 py-2.5 bg-white hover:bg-pink-50 text-gray-700 hover:text-pink-600 rounded-lg border border-gray-200 hover:border-pink-200 transition-colors text-sm font-medium"
                >
                  <span className="mr-2">🚨</span>
                  Report Security Issue
                </button>
                <button
                  onClick={() => handleContactSupport("TECHNICAL_SUPPORT", "Password/Login Issue")}
                  className="flex items-center justify-center px-4 py-2.5 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg border border-gray-200 hover:border-orange-200 transition-colors text-sm font-medium"
                >
                  <span className="mr-2">🔑</span>
                  Password Help
                </button>
                <button
                  onClick={() => handleContactSupport("ACCOUNT_ISSUE", "Email Change Issue")}
                  className="flex items-center justify-center px-4 py-2.5 bg-white hover:bg-amber-50 text-gray-700 hover:text-amber-600 rounded-lg border border-gray-200 hover:border-amber-200 transition-colors text-sm font-medium"
                >
                  <span className="mr-2">📧</span>
                  Email Support
                </button>
              </div>
            )}
          </div>
          
          {/* ⭐ INLINE CONTACT FORM */}
          <ContactInlineForm
            isExpanded={isInlineExpanded}
            onClose={() => toggleInlineForm()}
            userData={inlineUserData}
            presetCategory={inlinePresetCategory}
            presetSubject={inlinePresetSubject}
          />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Transaction History */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Transaction History Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Transactions</h2>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Showing {Math.min(transactions.length, 5)} of {transactions.length}
                </span>
              </div>
              
              {transactionsLoading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-400 mx-auto"></div>
                  <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-600 font-medium">Loading your transactions...</p>
                </div>
              ) : transactions.length > 0 ? (
                <>
                  {/* Scrollable Transactions Container */}
                  <div className="max-h-96 overflow-y-auto pr-1 sm:pr-2">
                    <div className="space-y-3 sm:space-y-4">
                      {transactions.slice(0, 10).map((transaction, index) => (
                        <div key={index} className="group bg-white hover:bg-orange-50 rounded-xl p-3 sm:p-4 border border-gray-200 hover:border-orange-300 transition-all duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3 sm:space-x-4">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${getTransactionTypeColor(transaction.type)}`}>
                                {getTransactionIcon(transaction.type)}
                              </div>
                              <div>
                                <p className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-orange-600">
                                  {transaction.description || `${transaction.type || 'Transaction'}`}
                                </p>
                                <div className="flex items-center space-x-2 sm:space-x-3 mt-1 sm:mt-2">
                                  <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                                    {transaction.type || 'TRANSACTION'}
                                  </span>
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    {formatDate(transaction.timestamp || transaction.transactionDate)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-base sm:text-xl font-bold ${
                                transaction.type?.toUpperCase() === 'DEPOSIT' ? 'text-orange-600' : 
                                transaction.type?.toUpperCase() === 'WITHDRAWAL' ? 'text-pink-600' : 
                                'text-gray-900'
                              }`}>
                                {transaction.type?.toUpperCase() === 'DEPOSIT' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                                Balance: {formatCurrency(transaction.balanceAfter)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {transactions.length > 10 && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-center">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Showing 10 of {transactions.length} transactions
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">No Transactions Found</h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                    Your transaction history will appear here once you start using your account.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Account Settings */}
          <div className="space-y-4 sm:space-y-6">
            {/* Password Change Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-pink-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Password Settings</h2>
                </div>
              </div>
              
              {passwordMessage && (
                <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl ${
                  passwordMessage.includes("sent") ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                  'bg-pink-50 text-pink-600 border border-pink-200'
                }`}>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 20 20">
                      {passwordMessage.includes("sent") ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      )}
                    </svg>
                    <p className="text-xs sm:text-sm">{passwordMessage}</p>
                  </div>
                </div>
              )}
              
              {!showPasswordChange ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-200">
                    <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">Last password change information is not available</p>
                    <p className="text-xs text-gray-500">For security reasons, we recommend changing your password regularly.</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="w-full px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white transition-all shadow-lg hover:shadow-xl"
                  >
                    Change Password
                  </button>
                  <div className="text-center">
                    <button
                      onClick={() => handleContactSupport("TECHNICAL_SUPPORT", "Password Change Issue")}
                      className="text-xs sm:text-sm text-pink-500 hover:text-pink-600 hover:underline"
                    >
                      Having trouble? Contact Support
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-200">
                    <div className="flex items-start mb-3">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mr-2 sm:mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm sm:text-base text-orange-600 font-medium">Password Reset Process</p>
                        <p className="text-xs sm:text-sm text-orange-500 mt-1">
                          We'll send a password reset link to your registered email address.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white rounded-lg border border-orange-100">
                      <p className="text-xs text-gray-600">Email address:</p>
                      <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 sm:space-x-4">
                    <button
                      onClick={handleRequestPasswordChange}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-medium rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white transition-all shadow-lg hover:shadow-xl"
                    >
                      Send Reset Link
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordMessage("");
                      }}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-medium rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Email Change Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-amber-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Email Settings</h2>
                </div>
              </div>
              
              {/* Email Message Display */}
              {emailMessage.text && (
                <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl ${
                  emailMessage.type === 'success' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                  emailMessage.type === 'error' ? 'bg-pink-50 text-pink-600 border border-pink-200' :
                  'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 20 20">
                      {emailMessage.type === 'success' ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : emailMessage.type === 'error' ? (
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-18 0 8 8 0 0118 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      )}
                    </svg>
                    <p className="text-xs sm:text-sm">{emailMessage.text}</p>
                  </div>
                </div>
              )}
              
              {!showEmailChange ? (
                // View Mode
                <div className="space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200">
                    <p className="text-xs text-gray-600 mb-1 sm:mb-2">Current Email Address</p>
                    <p className="text-base sm:text-xl font-bold text-gray-900">{user.email}</p>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Your email is used for login, notifications, and account recovery.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailChange(true)}
                    className="w-full px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white transition-all shadow-lg hover:shadow-xl"
                  >
                    Change Email Address
                  </button>
                  <div className="text-center">
                    <button
                      onClick={() => handleContactSupport("ACCOUNT_ISSUE", "Email Change Issue")}
                      className="text-xs sm:text-sm text-amber-500 hover:text-amber-600 hover:underline"
                    >
                      Need help changing your email? Contact Support
                    </button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-200">
                    <div className="flex items-start mb-3">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mr-2 sm:mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm sm:text-base text-orange-600 font-medium">Email Change Process</p>
                        <p className="text-xs sm:text-sm text-orange-500 mt-1">
                          Enter your new email address below. A verification link will be sent to your current email.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Current Email
                        </label>
                        <div className="p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm sm:text-base font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          New Email Address
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors bg-white"
                          placeholder="Enter your new email address"
                          disabled={isChangingEmail}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          You'll need to verify this change by clicking the link sent to your current email.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 sm:space-x-4">
                    <button
                      onClick={handleRequestEmailChange}
                      disabled={isChangingEmail || !newEmail}
                      className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-medium rounded-xl transition-all shadow-lg ${
                        isChangingEmail || !newEmail
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white hover:shadow-xl'
                      }`}
                    >
                      {isChangingEmail ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        "Send Verification"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowEmailChange(false);
                        setEmailMessage({ text: "", type: "" });
                        setNewEmail("");
                      }}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-medium rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default SettingsPage;