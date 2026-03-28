import { useState, useEffect } from 'react';

const API_BASE = "";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [closureReason, setClosureReason] = useState('');
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [freezeReason, setFreezeReason] = useState('');
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showUnfreezeModal, setShowUnfreezeModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Get sessionId from localStorage
  const getSessionId = () => {
    try {
      const userStr = localStorage.getItem('loggedInUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.sessionId;
      }
      return null;
    } catch (err) {
      console.error('Error getting sessionId:', err);
      return null;
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchCreditAccounts = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/credit/accounts/user/${userId}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching credit accounts:', error);
      return [];
    }
  };

  const fetchBusinessAccounts = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/business/accounts/user/${userId}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching business accounts:', error);
      return [];
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      
      const usersWithAllAccounts = await Promise.all(
        data.map(async (user) => {
          try {
            const [creditAccounts, businessAccounts] = await Promise.all([
              fetchCreditAccounts(user.id),
              fetchBusinessAccounts(user.id)
            ]);
            
            return {
              ...user,
              creditAccounts: creditAccounts || [],
              businessAccounts: businessAccounts || []
            };
          } catch (err) {
            return {
              ...user,
              creditAccounts: [],
              businessAccounts: []
            };
          }
        })
      );
      
      setUsers(usersWithAllAccounts);
      setHasMore(usersWithAllAccounts.length >= 20);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreUsers = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`${API_BASE}/api/users?page=${nextPage}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch more users');
      const newUsers = await response.json();
      
      const newUsersWithAllAccounts = await Promise.all(
        newUsers.map(async (user) => {
          try {
            const [creditAccounts, businessAccounts] = await Promise.all([
              fetchCreditAccounts(user.id),
              fetchBusinessAccounts(user.id)
            ]);
            
            return {
              ...user,
              creditAccounts: creditAccounts || [],
              businessAccounts: businessAccounts || []
            };
          } catch (err) {
            return {
              ...user,
              creditAccounts: [],
              businessAccounts: []
            };
          }
        })
      );
      
      if (newUsersWithAllAccounts.length === 0) {
        setHasMore(false);
      } else {
        setUsers(prev => [...prev, ...newUsersWithAllAccounts]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Error loading more users:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => 
    u.accounts?.some(a => !a.closed && !a.disabled) || 
    u.creditAccounts?.some(a => a.status === 'ACTIVE') ||
    u.businessAccounts?.some(a => a.status === 'APPROVED' && !a.disabled)
  ).length;
  const totalAccounts = users.reduce((acc, u) => 
    acc + (u.accounts?.length || 0) + (u.creditAccounts?.length || 0) + (u.businessAccounts?.length || 0), 0
  );
  const totalBalance = users.reduce((acc, u) => 
    acc + (u.accounts?.reduce((sum, a) => sum + a.balance, 0) || 0) + 
    (u.creditAccounts?.reduce((sum, a) => sum + a.currentBalance, 0) || 0) +
    (u.businessAccounts?.reduce((sum, a) => sum + a.accountBalance, 0) || 0), 0
  );

  // Calculate additional metrics
  const avgBalancePerUser = totalUsers > 0 ? totalBalance / totalUsers : 0;
  const accountsPerUser = totalUsers > 0 ? (totalAccounts / totalUsers).toFixed(1) : 0;
  const businessAccountsCount = users.reduce((acc, u) => 
    acc + (u.businessAccounts?.length || 0), 0
  );
  const creditAccountsCount = users.reduce((acc, u) => 
    acc + (u.creditAccounts?.length || 0), 0
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDisableAccount = async (account) => {
    if (!window.confirm(`Disable ${account.accountType} account ending in ${account.accountNumber?.slice(-4) || account.maskedAccountNumber?.slice(-4)}?`)) return;
    
    setActionLoading(true);
    try {
      const isCredit = account.creditLimit !== undefined;
      
      if (isCredit) {
        const sessionId = getSessionId();
        const response = await fetch(`${API_BASE}/api/credit/admin/credit/accounts/${account.id}/freeze`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'sessionId': sessionId
          },
          body: JSON.stringify({ reason: 'Disabled by admin' })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to disable account');
        }
      } else if (account.accountType === 'BUSINESS' || account.businessName) {
        const response = await fetch(`${API_BASE}/api/business/accounts/${account.id}/disable?reason=Disabled+by+admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to disable business account');
        }
      } else {
        const response = await fetch(`${API_BASE}/api/accounts/${account.id}/disable`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to disable account');
        }
      }

      await fetchUsers();
      alert(`Account has been disabled.`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnableAccount = async (account) => {
    if (!window.confirm(`Enable ${account.accountType || 'Credit'} account ending in ${account.accountNumber?.slice(-4) || account.maskedAccountNumber?.slice(-4)}?`)) return;
    
    setActionLoading(true);
    try {
      const isCredit = account.creditLimit !== undefined;
      
      if (isCredit) {
        const sessionId = getSessionId();
        const response = await fetch(`${API_BASE}/api/credit/admin/credit/accounts/${account.id}/unfreeze`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'sessionId': sessionId
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to enable account');
        }
      } else if (account.accountType === 'BUSINESS' || account.businessName) {
        const response = await fetch(`${API_BASE}/api/business/accounts/${account.id}/enable`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to enable business account');
        }
      } else {
        const response = await fetch(`${API_BASE}/api/accounts/${account.id}/enable`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to enable account');
        }
      }

      await fetchUsers();
      alert(`Account has been enabled.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseClick = (account) => {
    setSelectedAccount(account);
    setShowClosureModal(true);
  };

  const handleCloseAccount = async () => {
  if (!closureReason) {
    alert('Please select a reason');
    return;
  }

  setActionLoading(true);
  try {
    const isCredit = selectedAccount.creditLimit !== undefined;
    
    if (isCredit) {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/credit/admin/credit/accounts/${selectedAccount.id}/close`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'sessionId': sessionId
        },
        body: JSON.stringify({ reason: closureReason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to close account');
      }
    } else if (selectedAccount.accountType === 'BUSINESS' || selectedAccount.businessName) {
      const response = await fetch(`${API_BASE}/api/business/accounts/${selectedAccount.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: closureReason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to close business account');
      }
    } else {
      // Regular CHECKING/SAVINGS account
      const response = await fetch(`${API_BASE}/api/accounts/${selectedAccount.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: closureReason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to close account');
      }
    }

    await fetchUsers();
    setShowClosureModal(false);
    alert(`Account has been closed.`);
  } catch (err) {
    alert(err.message);
  } finally {
    setActionLoading(false);
  }
};

  const handleFreezeClick = (account) => {
    setSelectedAccount(account);
    setFreezeReason('');
    setShowFreezeModal(true);
  };

  const handleFreezeAccount = async () => {
    if (!freezeReason) {
      alert('Please enter a reason');
      return;
    }

    setActionLoading(true);
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/credit/admin/credit/accounts/${selectedAccount.id}/freeze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'sessionId': sessionId
        },
        body: JSON.stringify({ reason: freezeReason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to freeze account');
      }

      await fetchUsers();
      setShowFreezeModal(false);
      alert(`Credit account has been frozen.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfreezeClick = (account) => {
    setSelectedAccount(account);
    setShowUnfreezeModal(true);
  };

  const handleUnfreezeAccount = async () => {
    setActionLoading(true);
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/credit/admin/credit/accounts/${selectedAccount.id}/unfreeze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'sessionId': sessionId
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unfreeze account');
      }

      await fetchUsers();
      setShowUnfreezeModal(false);
      alert(`Credit account has been unfrozen.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // NEW: Handle unlock user account
  const handleUnlockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unlock this user account?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/admin/unlock-user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unlock user');
      }

      await fetchUsers(); // Refresh user list
      alert('User account unlocked successfully');
      
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return '#10b981';
      case 'ACTIVE': return '#10b981';
      case 'Disabled': return '#f59e0b';
      case 'FROZEN': return '#f59e0b';
      case 'Closed': return '#6b7280';
      case 'CLOSED': return '#6b7280';
      case 'Pending': return '#f59e0b';
      case 'Suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getAccountIcon = (type, isCredit = false) => {
    if (isCredit) return '💳';
    switch(type) {
      case 'CHECKING': return '🏦';
      case 'SAVINGS': return '💰';
      case 'BUSINESS_CHECKING': return '🏢';
      default: return '💳';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollWidth - scrollLeft - clientWidth < 100 && hasMore && !loadingMore) {
      loadMoreUsers();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '16px' }}>Error: {error}</div>
        <button 
          onClick={fetchUsers}
          style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 0 24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 30px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>User Management</h1>
          <button 
            onClick={() => window.history.back()}
            style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 24px' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Total Users</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{totalUsers}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Active Users</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{activeUsers}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Total Accounts</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{totalAccounts}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Total Balance</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{formatCurrency(totalBalance)}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Avg Balance</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{formatCurrency(avgBalancePerUser)}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Business Accounts</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{businessAccountsCount}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <input
            type="text"
            placeholder="🔍 Search users by name or email..."
            style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Horizontal Scrollable Users Gallery */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>User Gallery</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Scroll right →</span>
            </div>
          </div>
          
          <div 
            style={{ 
              display: 'flex', 
              gap: '16px', 
              overflowX: 'auto', 
              padding: '8px 4px 16px 4px',
              scrollBehavior: 'smooth'
            }}
            onScroll={handleScroll}
          >
            {filteredUsers.map(user => {
              const fullName = `${user.firstName} ${user.lastName}`;
              const accountCount = (user.accounts?.length || 0) + (user.creditAccounts?.length || 0) + (user.businessAccounts?.length || 0);
              const hasActiveRegular = user.accounts?.some(a => !a.closed && !a.disabled);
              const hasActiveCredit = user.creditAccounts?.some(a => a.status === 'ACTIVE');
              const hasActiveBusiness = user.businessAccounts?.some(a => a.status === 'APPROVED' && !a.disabled);
              const userStatus = (hasActiveRegular || hasActiveCredit || hasActiveBusiness) ? 'Active' : 'Inactive';
              const userBalance = (user.accounts?.reduce((sum, a) => sum + a.balance, 0) || 0) + 
                                (user.creditAccounts?.reduce((sum, a) => sum + a.currentBalance, 0) || 0) +
                                (user.businessAccounts?.reduce((sum, a) => sum + a.accountBalance, 0) || 0);
              
              return (
                <div 
                  key={user.id} 
                  style={{ 
                    minWidth: '280px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, boxShadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                  }}
                  onClick={() => handleViewUser(user)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '24px', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold', 
                      fontSize: '18px',
                      marginRight: '12px'
                    }}>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: '16px' }}>{fullName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '2px' }}>Accounts</div>
                      <div style={{ fontWeight: '600', fontSize: '16px' }}>{accountCount}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '2px' }}>Balance</div>
                      <div style={{ fontWeight: '600', fontSize: '16px', color: '#10b981' }}>{formatCurrency(userBalance)}</div>
                    </div>
                  </div>
                  
                  {user.creditAccounts?.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '10px', 
                        background: '#6366f120', 
                        color: '#6366f1' 
                      }}>
                        💳 {user.creditAccounts.length} Credit Card(s)
                      </span>
                    </div>
                  )}

                  {user.businessAccounts?.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '10px', 
                        background: '#8b5cf620', 
                        color: '#8b5cf6' 
                      }}>
                        🏢 {user.businessAccounts.length} Business Account(s)
                      </span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                      background: userStatus === 'Active' ? '#10b98120' : '#6b728020', 
                      color: userStatus === 'Active' ? '#10b981' : '#6b7280' 
                    }}>
                      {userStatus}
                    </span>
                    <span style={{ fontSize: '12px', color: '#3b82f6' }}>View Details →</span>
                  </div>
                </div>
              );
            })}
            
            {loadingMore && (
              <div style={{ 
                minWidth: '100px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#6b7280'
              }}>
                <div style={{ border: '2px solid #f3f3f3', borderTop: '2px solid #3b82f6', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite' }}></div>
              </div>
            )}
            
            {!hasMore && (
              <div style={{ 
                minWidth: '150px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#6b7280',
                fontSize: '13px'
              }}>
                End of list
              </div>
            )}
          </div>
        </div>

        {/* Cool Footer Section */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '32px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '32px' }}>
            {/* About Section */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#94a3b8' }}>About User Management</h3>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '16px' }}>
                This dashboard provides comprehensive tools for managing all bank customers. From viewing user details to managing accounts and handling closures, everything is designed for efficiency and security. Credit card accounts are now fully integrated.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ background: '#334155', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>📊 Real-time data</span>
                <span style={{ background: '#334155', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>🔒 Secure actions</span>
                <span style={{ background: '#334155', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>💳 Credit cards</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#94a3b8' }}>Quick Stats</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#cbd5e1' }}>Accounts per user</span>
                  <span style={{ fontWeight: '600', color: 'white' }}>{accountsPerUser}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#cbd5e1' }}>Business accounts</span>
                  <span style={{ fontWeight: '600', color: 'white' }}>{businessAccountsCount}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#cbd5e1' }}>Credit cards</span>
                  <span style={{ fontWeight: '600', color: 'white' }}>{creditAccountsCount}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#cbd5e1' }}>Active rate</span>
                  <span style={{ fontWeight: '600', color: 'white' }}>{((activeUsers / totalUsers) * 100).toFixed(1)}%</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#94a3b8' }}>Quick Actions</h3>
              <button style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '8px', background: '#334155', border: 'none', borderRadius: '6px', color: '#cbd5e1', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>
                📋 Generate Report
              </button>
              <button style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '8px', background: '#334155', border: 'none', borderRadius: '6px', color: '#cbd5e1', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>
                📧 Email All Users
              </button>
              <button style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '8px', background: '#334155', border: 'none', borderRadius: '6px', color: '#cbd5e1', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>
                📊 Export Data
              </button>
            </div>

            {/* Support */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#94a3b8' }}>Need Help?</h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '12px' }}>
                Contact support for assistance with user management.
              </p>
              <div style={{ background: '#334155', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>📞 +1 (713) 870-1132</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>✉️ snopitech@gmail.com</div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              © 2026 SnopitechBank Admin Panel. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none' }}>Security</a>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '8px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            {/* Modal Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            {/* User Info */}
            <div style={{ padding: '20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div><span style={{ color: '#6b7280' }}>Email:</span> {selectedUser.email}</div>
                <div><span style={{ color: '#6b7280' }}>Phone:</span> {selectedUser.phone || 'N/A'}</div>
                <div><span style={{ color: '#6b7280' }}>Customer ID:</span> {selectedUser.customerId}</div>
                <div><span style={{ color: '#6b7280' }}>Member Since:</span> {new Date(selectedUser.memberSince).toLocaleDateString()}</div>
                {/* Add this to show lock status */}
                {selectedUser.accountLocked && (
                  <div style={{ gridColumn: 'span 2', marginTop: '10px', padding: '10px', background: '#fee2e2', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#b91c1c', fontWeight: '600' }}>🔒 Account Locked</span>
                      <button
                        onClick={() => handleUnlockUser(selectedUser.id)}
                        style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Unlock Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Regular Accounts - FIXED: Filter out BUSINESS accounts */}
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Regular Accounts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedUser.accounts?.filter(account => account.accountType !== 'BUSINESS_CHECKING').map(account => {
                  const accountType = account.accountType === 'BUSINESS_CHECKING' ? 'BUSINESS' : account.accountType;
                  const accountStatus = account.closed ? 'Closed' : account.disabled ? 'Disabled' : 'Active';
                  
                  return (
                    <div key={account.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{getAccountIcon(account.accountType)}</span>
                          <span style={{ fontWeight: '600' }}>{accountType}</span>
                        </div>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          background: account.closed ? '#6b728020' : account.disabled ? '#f59e0b20' : '#10b98120', 
                          color: account.closed ? '#6b7280' : account.disabled ? '#f59e0b' : '#10b981' 
                        }}>
                          {accountStatus}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{account.accountNumber}</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>{formatCurrency(account.balance)}</div>
                      
                      {/* Action Buttons */}
                      {!account.closed && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                         {!account.disabled ? (
                          <button
                            onClick={() => handleDisableAccount(account)}
                            style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                            disabled={actionLoading}
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnableAccount(account)}
                            style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                            disabled={actionLoading}
                          >
                            Enable
                          </button>
                        )}
                          <button
                            onClick={() => handleCloseClick(account)}
                            style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                            disabled={actionLoading}
                          >
                            Close
                          </button>
                        </div>
                      )}
                      {account.closed && (
                        <div style={{ color: '#6b7280', fontSize: '12px', fontStyle: 'italic' }}>Account closed</div>
                      )}
                    </div>
                  );
                })}
                {(!selectedUser.accounts || selectedUser.accounts.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: '6px', color: '#6b7280' }}>
                    No regular accounts found
                  </div>
                )}
              </div>

              {/* Business Accounts Section - FIXED: Use accountId for API calls */}
              {selectedUser.businessAccounts?.length > 0 && (
                <>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '24px 0 16px 0' }}>Business Accounts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedUser.businessAccounts.map(business => (
                      <div key={business.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', background: '#f9f9ff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>🏢</span>
                            <span style={{ fontWeight: '600' }}>{business.businessName}</span>
                          </div>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '11px',
                            background: business.disabled ? '#f59e0b20' : 
                                       business.status === 'APPROVED' ? '#10b98120' : 
                                       business.status === 'PENDING' ? '#f59e0b20' : '#6b728020',
                            color: business.disabled ? '#f59e0b' : 
                                   business.status === 'APPROVED' ? '#10b981' : 
                                   business.status === 'PENDING' ? '#f59e0b' : '#6b7280'
                          }}>
                            {business.disabled ? 'Disabled' : business.status}
                          </span>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                          Business ID: {business.id}
                        </div>
                        <div style={{ fontSize: '14px', color: '#111827', marginBottom: '8px' }}>
                          {business.businessName} • {business.industry}
                        </div>
                        {business.accountId && (
                          <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                            <span style={{ color: '#6b7280' }}>Linked Account: </span>
                            {business.accountNumber || '****'}
                          </div>
                        )}
                        
                        {/* Action Buttons - USING accountId for API calls */}
                        {business.status !== 'CLOSED' && business.accountId && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                
{!business.disabled ? (
  <button
    onClick={() => {
      handleDisableAccount({
        ...business,
        accountType: 'BUSINESS',
        accountNumber: business.accountNumber,
        id: business.id, // Use business.id (9) instead of accountId (29)
        creditLimit: undefined
      })
    }}
    style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
    disabled={actionLoading}
  >
    Disable
  </button>
) : (
  <button
    onClick={() => {
      handleEnableAccount({
        ...business,
        accountType: 'BUSINESS',
        accountNumber: business.accountNumber,
        id: business.id, // Use business.id (9) instead of accountId (29)
        creditLimit: undefined
      })
    }}
    style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
    disabled={actionLoading}
  >
    Enable
  </button>
)}
                           <button
  onClick={() => handleCloseClick({
    ...business,
    creditLimit: undefined,
    id: business.id, // Change to business.id (9)
    accountType: 'BUSINESS'
  })}
  style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
  disabled={actionLoading}
>
  Close
</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Credit Accounts Section */}
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '24px 0 16px 0' }}>Credit Accounts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedUser.creditAccounts?.map(account => {
                  const accountStatus = account.status === 'CLOSED' ? 'Closed' : 
                                      account.status === 'FROZEN' ? 'Frozen' : 'Active';
                  
                  return (
                    <div key={account.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', background: '#f0f9ff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{getAccountIcon(null, true)}</span>
                          <span style={{ fontWeight: '600' }}>CREDIT CARD</span>
                        </div>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          background: account.status === 'ACTIVE' ? '#10b98120' : 
                                     account.status === 'FROZEN' ? '#f59e0b20' : 
                                     '#6b728020',
                          color: account.status === 'ACTIVE' ? '#10b981' : 
                                 account.status === 'FROZEN' ? '#f59e0b' : 
                                 '#6b7280'
                        }}>
                          {accountStatus}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{account.maskedAccountNumber}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Limit</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatCurrency(account.creditLimit)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Balance</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: account.currentBalance > 0 ? '#ef4444' : '#10b981' }}>
                            {formatCurrency(account.currentBalance)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Credit Account Actions */}
                      {account.status !== 'CLOSED' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {account.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleFreezeClick(account)}
                              style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                              disabled={actionLoading}
                            >
                              Freeze
                            </button>
                          )}
                          {account.status === 'FROZEN' && (
                            <button
                              onClick={() => handleUnfreezeClick(account)}
                              style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                              disabled={actionLoading}
                            >
                              Unfreeze
                            </button>
                          )}
                          <button
                            onClick={() => handleCloseClick(account)}
                            style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                            disabled={actionLoading}
                          >
                            Close
                          </button>
                        </div>
                      )}
                      {account.status === 'CLOSED' && (
                        <div style={{ color: '#6b7280', fontSize: '12px', fontStyle: 'italic' }}>Account closed</div>
                      )}
                    </div>
                  );
                })}
                {(!selectedUser.creditAccounts || selectedUser.creditAccounts.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: '6px', color: '#6b7280' }}>
                    No credit accounts found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Closure Modal */}
      {showClosureModal && selectedAccount && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>Close Account</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Closing {selectedAccount.creditLimit ? 'credit' : ''} account ending in {selectedAccount.accountNumber?.slice(-4) || selectedAccount.maskedAccountNumber?.slice(-4)}. This action cannot be undone.
            </p>
            
            <select
              style={{ width: '100%', padding: '8px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
              value={closureReason}
              onChange={(e) => setClosureReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              <option value="MANAGEMENT_DECISION">Management Decision</option>
              <option value="POLICY_VIOLATION">Policy Violation</option>
              <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
              <option value="INACTIVITY">Extended Inactivity</option>
              <option value="OTHER">Other</option>
            </select>

            <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
              <p style={{ color: '#b91c1c', fontSize: '13px', margin: 0 }}>
                ⚠️ User will receive an email notification at {selectedUser?.email}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowClosureModal(false)}
                style={{ padding: '8px 16px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCloseAccount}
                style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={actionLoading || !closureReason}
              >
                {actionLoading ? 'Processing...' : 'Close Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Modal */}
      {showFreezeModal && selectedAccount && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>Freeze Credit Account</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Freeze credit account ending in {selectedAccount.maskedAccountNumber?.slice(-4)}?
            </p>
            
            <input
              type="text"
              placeholder="Reason for freezing"
              style={{ width: '100%', padding: '8px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
              value={freezeReason}
              onChange={(e) => setFreezeReason(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowFreezeModal(false)}
                style={{ padding: '8px 16px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleFreezeAccount}
                style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={actionLoading || !freezeReason}
              >
                {actionLoading ? 'Freezing...' : 'Freeze Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unfreeze Modal */}
      {showUnfreezeModal && selectedAccount && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>Unfreeze Credit Account</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Unfreeze credit account ending in {selectedAccount.maskedAccountNumber?.slice(-4)}?
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUnfreezeModal(false)}
                style={{ padding: '8px 16px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUnfreezeAccount}
                style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Unfreezing...' : 'Unfreeze Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          ::-webkit-scrollbar {
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #888;
            borderRadius: '4px',
          }}
          
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
    </div>
  );
};

export default AdminUsers;
