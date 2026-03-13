/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoadingScreen from "../components/LoadingScreen";

const API_BASE = "http://localhost:8080";

function AlertsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  
  // Alert states
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  // ============== API CALLS ==============

  // Fetch all alerts
  const fetchAlerts = async () => {
    if (!user?.id) return;
    
    try {
      setApiLoading(true);
      const response = await fetch(`${API_BASE}/api/alerts/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match your component's expected format
        const transformedAlerts = data.map(alert => ({
          id: alert.id,
          type: alert.type?.toLowerCase() || 'notice',
          priority: alert.priority?.toLowerCase() || 'medium',
          title: alert.title,
          message: alert.message,
          date: alert.timestamp,
          read: alert.isRead || false,  // ⭐ IMPORTANT: Use isRead from backend
          icon: alert.icon || getDefaultIcon(alert.type),
          color: alert.color || getDefaultColor(alert.type),
          account: alert.accountNumber ? `****${alert.accountNumber.slice(-4)}` : null,
          accountId: alert.accountId,
          action: alert.actionText,
          actionUrl: alert.actionUrl
        }));
        setAlerts(transformedAlerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setApiLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/alerts/user/${user.id}/unread/count`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/${id}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === id ? { ...alert, read: true } : alert
        ));
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  // Mark as unread
  const markAsUnread = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/${id}/unread`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === id ? { ...alert, read: false } : alert
        ));
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error marking alert as unread:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/alerts/user/${user.id}/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete single alert
  const deleteAlert = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/${id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  // Delete selected alerts
  const deleteSelected = async () => {
    if (!user?.id || selectedAlerts.size === 0) return;
    
    try {
      const alertIds = Array.from(selectedAlerts);
      const response = await fetch(`${API_BASE}/api/alerts/batch?userId=${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertIds)
      });
      
      if (response.ok) {
        setAlerts(prev => prev.filter(alert => !selectedAlerts.has(alert.id)));
        setSelectedAlerts(new Set());
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error deleting selected alerts:", error);
    }
  };

  // ============== HELPER FUNCTIONS ==============

  const getDefaultIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'transaction': return '💰';
      case 'security': return '🔒';
      case 'account': return '🏦';
      case 'notice': return '📢';
      case 'credit': return '💳';
      case 'business': return '🏢';
      case 'loan': return '📊';
      default: return '📌';
    }
  };

  const getDefaultColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'transaction': return 'blue';
      case 'security': return 'red';
      case 'account': return 'green';
      case 'notice': return 'purple';
      case 'credit': return 'purple';
      case 'business': return 'green';
      case 'loan': return 'orange';
      default: return 'gray';
    }
  };

  const getAccountTypeFromMessage = (message) => {
    const msg = message?.toLowerCase() || '';
    if (msg.includes('credit')) return 'credit';
    if (msg.includes('business')) return 'business';
    if (msg.includes('loan')) return 'loan';
    return 'regular';
  };

  // ============== UI HELPER FUNCTIONS ==============

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getAlertTypeLabel = (type) => {
    switch(type) {
      case 'transaction': return 'Transaction';
      case 'security': return 'Security';
      case 'account': return 'Account';
      case 'notice': return 'Notice';
      case 'credit': return 'Credit Card';
      case 'business': return 'Business';
      case 'loan': return 'Loan';
      default: return type;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-pink-50 text-pink-600 border-pink-200';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'low': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getAlertColor = (color) => {
    switch(color) {
      case 'red': return 'bg-pink-50 border-pink-200';
      case 'orange': return 'bg-orange-50 border-orange-200';
      case 'green': return 'bg-green-50 border-green-200';
      case 'blue': return 'bg-blue-50 border-blue-200';
      case 'purple': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertIconColor = (color) => {
    switch(color) {
      case 'red': return 'bg-pink-100 text-pink-500';
      case 'orange': return 'bg-orange-100 text-orange-500';
      case 'green': return 'bg-green-100 text-green-500';
      case 'blue': return 'bg-blue-100 text-blue-500';
      case 'purple': return 'bg-purple-100 text-purple-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const toggleSelectAlert = (id) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAlerts(newSelected);
  };

  const selectAll = () => {
    if (selectedAlerts.size === filteredAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(filteredAlerts.map(alert => alert.id)));
    }
  };

  // ============== FILTERING ==============

  useEffect(() => {
    let result = alerts;
    
    if (filter !== "all") {
      if (filter === "unread") {
        result = result.filter(alert => !alert.read);
      } else if (filter === "credit") {
        result = result.filter(alert => 
          alert.message?.toLowerCase().includes('credit') ||
          alert.type?.toLowerCase() === 'credit'
        );
      } else if (filter === "business") {
        result = result.filter(alert => 
          alert.message?.toLowerCase().includes('business') ||
          alert.type?.toLowerCase() === 'business'
        );
      } else if (filter === "loan") {
        result = result.filter(alert => 
          alert.message?.toLowerCase().includes('loan') ||
          alert.type?.toLowerCase() === 'loan'
        );
      } else {
        result = result.filter(alert => alert.type === filter);
      }
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(alert => 
        alert.title.toLowerCase().includes(term) ||
        alert.message.toLowerCase().includes(term) ||
        (alert.account && alert.account.toLowerCase().includes(term))
      );
    }
    
    setFilteredAlerts(result);
  }, [alerts, filter, searchTerm]);

  // ============== INITIALIZATION ==============

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!userData) {
      navigate("/login");
      return;
    }
    
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (user?.id) {
      fetchAlerts();
      fetchUnreadCount();
    }
  }, [user]);

  // ============== NAVIGATION ==============

  const handleBackToDashboard = () => navigate("/dashboard");
  const handleGoToProfile = () => navigate("/profile");
  const handleGoToSettings = () => navigate("/settings");

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 animate-fadeIn">
        <Header name={""} />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h3>
            <p className="text-gray-600 mb-6">Please login again to view alerts</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-pink-400 hover:bg-pink-500 text-white font-medium rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 animate-fadeIn">
      <Header name={user?.firstName || ""} />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Alerts & Notifications</h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">Stay informed about your account activity and security</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGoToProfile}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white transition-all shadow-sm hover:shadow flex items-center"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={handleGoToSettings}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white transition-all shadow-sm hover:shadow flex items-center"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
              <button
                onClick={handleBackToDashboard}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors shadow-sm hover:shadow flex items-center"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
            </div>
          </div>
          
          {/* Quick Stats - Updated to include all account types */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-xs sm:text-sm font-medium">Unread</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">{unreadCount}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {unreadCount > 0 ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">Transaction</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                    {alerts.filter(a => a.type === 'transaction').length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg sm:text-xl md:text-2xl">💰</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm font-medium">Credit Card</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                    {alerts.filter(a => a.message?.toLowerCase().includes('credit')).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg sm:text-xl md:text-2xl">💳</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-medium">Business</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                    {alerts.filter(a => a.message?.toLowerCase().includes('business')).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg sm:text-xl md:text-2xl">🏢</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-xs sm:text-sm font-medium">Loan</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                    {alerts.filter(a => a.message?.toLowerCase().includes('loan')).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg sm:text-xl md:text-2xl">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs sm:text-sm font-medium">Security</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                    {alerts.filter(a => a.type === 'security').length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg sm:text-xl md:text-2xl">🔒</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls Bar */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  filter === "all" 
                    ? "bg-orange-400 text-white shadow" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center ${
                  filter === "unread" 
                    ? "bg-pink-400 text-white shadow" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-white text-pink-400 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter("transaction")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  filter === "transaction" 
                    ? "bg-blue-400 text-white shadow" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Transaction
              </button>
              <button
                onClick={() => setFilter("credit")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  filter === "credit" 
                    ? "bg-purple-400 text-white shadow" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Credit
              </button>
              <button
                onClick={() => setFilter("business")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  filter === "business" 
                    ? "bg-green-400 text-white shadow" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Business
              </button>
              <button
                onClick={() => setFilter("loan")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  filter === "loan" 
                    ? "bg-amber-400 text-white shadow" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Loan
              </button>
              <button
                onClick={() => setFilter("security")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  filter === "security" 
                    ? "bg-orange-400 text-white shadow" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setFilter("account")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  filter === "account" 
                    ? "bg-green-400 text-white shadow" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setFilter("notice")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  filter === "notice" 
                    ? "bg-purple-400 text-white shadow" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Notices
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search alerts..."
                  className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 w-full md:w-48 lg:w-64 text-sm"
                />
                <svg className="absolute left-2.5 sm:left-3 top-1.5 sm:top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Bulk Actions */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedAlerts.size === filteredAlerts.length && filteredAlerts.length > 0}
                onChange={selectAll}
                className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 rounded border-gray-300 focus:ring-orange-300"
              />
              <span className="ml-2 text-xs sm:text-sm text-gray-700">
                {selectedAlerts.size > 0 
                  ? `${selectedAlerts.size} selected` 
                  : "Select all"}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={markAllAsRead}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-orange-400 hover:bg-orange-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={alerts.every(a => a.read)}
              >
                Mark All as Read
              </button>
              <button
                onClick={deleteSelected}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-pink-400 hover:bg-pink-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedAlerts.size === 0}
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {apiLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
            <p className="mt-2 text-gray-600">Loading alerts...</p>
          </div>
        )}
        
        {/* Alerts List */}
        {!apiLoading && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8 sm:mb-12">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                {filter === "all" ? "All Alerts" : 
                 filter === "unread" ? "Unread Alerts" : 
                 filter === "credit" ? "Credit Card Alerts" :
                 filter === "business" ? "Business Account Alerts" :
                 filter === "loan" ? "Loan Account Alerts" :
                 `${getAlertTypeLabel(filter)} Alerts`}
                <span className="text-gray-600 text-sm sm:text-lg font-normal ml-1 sm:ml-2">
                  ({filteredAlerts.length})
                </span>
              </h2>
            </div>
            
            <div className="p-4 sm:p-6">
              {filteredAlerts.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {filteredAlerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className={`rounded-lg sm:rounded-xl border transition-all duration-200 ${getAlertColor(alert.color)} ${
                        !alert.read ? 'ring-1 ring-orange-300' : ''
                      }`}
                    >
                      <div className="p-3 sm:p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={selectedAlerts.has(alert.id)}
                              onChange={() => toggleSelectAlert(alert.id)}
                              className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 rounded border-gray-300 focus:ring-orange-300 mt-0.5 sm:mt-1"
                            />
                            
                            {/* Icon */}
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${getAlertIconColor(alert.color)} flex-shrink-0`}>
                              <span className="text-sm sm:text-base md:text-xl">{alert.icon}</span>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 truncate">{alert.title}</h3>
                                {!alert.read && (
                                  <span className="px-1.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-600 rounded-full whitespace-nowrap">
                                    NEW
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getPriorityColor(alert.priority)} whitespace-nowrap`}>
                                  {alert.priority.toUpperCase()}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full whitespace-nowrap">
                                  {getAccountTypeFromMessage(alert.message) === 'credit' ? '💳 Credit' :
                                   getAccountTypeFromMessage(alert.message) === 'business' ? '🏢 Business' :
                                   getAccountTypeFromMessage(alert.message) === 'loan' ? '📊 Loan' :
                                   getAlertTypeLabel(alert.type)}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{alert.message}</p>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 sm:mt-4 space-y-2 sm:space-y-0">
                                <div className="flex items-center flex-wrap gap-2 sm:gap-4">
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    {formatDate(alert.date)}
                                  </span>
                                  {alert.account && (
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                      Account: {alert.account}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                  {!alert.read ? (
                                    <button
                                      onClick={() => markAsRead(alert.id)}
                                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-orange-400 hover:bg-orange-500 text-white transition-colors whitespace-nowrap"
                                    >
                                      Mark as Read
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => markAsUnread(alert.id)}
                                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors whitespace-nowrap"
                                    >
                                      Mark as Unread
                                    </button>
                                  )}
                                  
                                  {alert.action && (
                                    <button 
                                      onClick={() => alert.actionUrl && navigate(alert.actionUrl)}
                                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white transition-colors whitespace-nowrap"
                                    >
                                      {alert.action}
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => deleteAlert(alert.id)}
                                    className="p-1 sm:p-1.5 text-gray-400 hover:text-pink-500 transition-colors"
                                    aria-label="Delete alert"
                                  >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 md:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">No Alerts Found</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
                    {searchTerm 
                      ? `No alerts match "${searchTerm}". Try a different search term.`
                      : `You're all caught up! No ${filter !== 'all' ? filter : ''} alerts to show.`
                    }
                  </p>
                  {(searchTerm || filter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilter('all');
                      }}
                      className="px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-medium rounded-lg transition-all text-sm sm:text-base"
                    >
                      View All Alerts
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default AlertsPage;