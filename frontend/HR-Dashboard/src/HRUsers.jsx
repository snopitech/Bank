import { useState, useEffect } from 'react';

const API_BASE = "";

const HRUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showClearTransactionsModal, setShowClearTransactionsModal] = useState(false);
  const [showCloseCreditAccountModal, setShowCloseCreditAccountModal] = useState(false);
  const [showFreezeCreditAccountModal, setShowFreezeCreditAccountModal] = useState(false);
  const [showUnfreezeCreditAccountModal, setShowUnfreezeCreditAccountModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');

  // Get sessionId from localStorage (needed for admin operations)
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
  
const fetchUsers = async () => {
  setLoading(true);
  setError(null);
  try {
    // Fetch regular users
    const response = await fetch(`${API_BASE}/api/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    
    // For each user, fetch their credit accounts AND business accounts
    const usersWithAllAccounts = await Promise.all(
      data.map(async (user) => {
        try {
          // Fetch credit accounts
          const creditAccounts = await fetchCreditAccounts(user.id);
          
          // Fetch business accounts separately to get the business IDs
          const businessAccountsResponse = await fetch(`${API_BASE}/api/business/accounts/user/${user.id}`);
          let businessAccounts = [];
          if (businessAccountsResponse.ok) {
            businessAccounts = await businessAccountsResponse.json();
          }
          
          // Merge business accounts with regular accounts
          const regularAccounts = user.accounts || [];
          
          // For each business account in the regular accounts, add the businessId
          const enhancedRegularAccounts = regularAccounts.map(acc => {
            if (acc.accountType === 'BUSINESS_CHECKING') {
              // Find matching business account to get its ID
              const matchingBusiness = businessAccounts.find(b => b.accountId === acc.id);
              if (matchingBusiness) {
                return {
                  ...acc,
                  businessAccountId: matchingBusiness.id // Add the business ID
                };
              }
            }
            return acc;
          });
          
          return {
            ...user,
            accounts: enhancedRegularAccounts,
            creditAccounts: creditAccounts || [],
            businessAccounts: businessAccounts || [] // Keep for reference
          };
        } catch (err) {
          console.error(`Error fetching accounts for user ${user.id}:`, err);
          return {
            ...user,
            accounts: user.accounts || [],
            creditAccounts: []
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

  // Fetch credit accounts using the same endpoint as customer dashboard
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

  const loadMoreUsers = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`${API_BASE}/api/users?page=${nextPage}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch more users');
      const newUsers = await response.json();
      
      // Fetch credit accounts for new users
      const newUsersWithCredit = await Promise.all(
        newUsers.map(async (user) => {
          try {
            const creditAccounts = await fetchCreditAccounts(user.id);
            return {
              ...user,
              creditAccounts: creditAccounts || []
            };
          } catch (err) {
            return {
              ...user,
              creditAccounts: []
            };
          }
        })
      );
      
      if (newUsersWithCredit.length === 0) {
        setHasMore(false);
      } else {
        setUsers(prev => [...prev, ...newUsersWithCredit]);
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
  const totalAccounts = users.reduce((acc, u) => 
    acc + (u.accounts?.length || 0) + (u.creditAccounts?.length || 0), 0
  );
  const totalBalance = users.reduce((acc, u) => 
    acc + (u.accounts?.reduce((sum, a) => sum + a.balance, 0) || 0) + 
    (u.creditAccounts?.reduce((sum, a) => sum + a.currentBalance, 0) || 0), 0
  );
  const businessAccounts = users.reduce((acc, u) => 
    acc + (u.accounts?.filter(a => a.accountType === 'BUSINESS_CHECKING').length || 0), 0
  );
  const creditAccounts = users.reduce((acc, u) => 
    acc + (u.creditAccounts?.length || 0), 0
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    
    if (!window.confirm(`⚠️ PERMANENTLY DELETE account ending in ${selectedAccount.accountNumber?.slice(-4) || selectedAccount.maskedAccountNumber?.slice(-4)}? This action CANNOT be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const sessionId = getSessionId();
      
      // Determine which API to use based on account type
      const isBusiness = selectedAccount.accountType === 'BUSINESS_CHECKING';
      const isCredit = selectedAccount.type === 'CREDIT' || selectedAccount.creditLimit !== undefined;
      
      let url;
      let options = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      };

      if (isCredit) {
        // ⭐ CORRECT: HR delete endpoint for credit accounts
        url = `${API_BASE}/api/credit/hr/credit/accounts/${selectedAccount.id}`;
        options.headers['sessionId'] = sessionId;
      }
        else if (isBusiness) {
  // ⭐ FIXED: Use businessAccountId instead of account id
  console.log('Business account being deleted:', selectedAccount); // ADD THIS
  const businessId = selectedAccount.businessAccountId || selectedAccount.businessId || selectedAccount.id;
  console.log('Using business ID:', businessId); // ADD THIS
  url = `${API_BASE}/api/business/accounts/${businessId}`;


      } else {
        // ⭐ CORRECT: Delete regular account (checking/savings)
        url = `${API_BASE}/api/accounts/${selectedAccount.id}`;
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }

      // Refresh user data
      await fetchUsers();
      
      setShowDeleteAccountModal(false);
      alert(`Account has been permanently deleted.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
      setSelectedAccount(null);
    }
  };

  const handleFreezeCreditAccount = async () => {
    if (!selectedAccount) return;
    
    if (!freezeReason.trim()) {
      alert('Please provide a reason for freezing');
      return;
    }

    setActionLoading(true);
    try {
      const sessionId = getSessionId();
      
      // ⭐ FIXED: Correct URL with double credit
      const response = await fetch(`${API_BASE}/api/credit/admin/credit/accounts/${selectedAccount.id}/freeze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'sessionId': sessionId
        },
        body: JSON.stringify({
          reason: freezeReason
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to freeze account');
      }

      // Refresh user data
      await fetchUsers();
      
      setShowFreezeCreditAccountModal(false);
      setFreezeReason('');
      alert(`Credit account has been frozen.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfreezeCreditAccount = async () => {
    if (!selectedAccount) return;

    setActionLoading(true);
    try {
      const sessionId = getSessionId();
      
      // ⭐ FIXED: Correct URL with double credit
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

      // Refresh user data
      await fetchUsers();
      
      setShowUnfreezeCreditAccountModal(false);
      alert(`Credit account has been unfrozen.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCreditAccount = async () => {
    if (!selectedAccount) return;

    setActionLoading(true);
    try {
      const sessionId = getSessionId();
      
      // ⭐ FIXED: Correct URL with double credit
      const response = await fetch(`${API_BASE}/api/credit/admin/credit/accounts/${selectedAccount.id}/close`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'sessionId': sessionId
        },
        body: JSON.stringify({
          reason: 'Closed by HR'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to close account');
      }

      // Refresh user data
      await fetchUsers();
      
      setShowCloseCreditAccountModal(false);
      alert(`Credit account has been closed.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user with proper order and error handling
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    const accountCount = (selectedUser.accounts?.length || 0) + (selectedUser.creditAccounts?.length || 0);
    if (!window.confirm(`⚠️ PERMANENTLY DELETE USER ${selectedUser.firstName} ${selectedUser.lastName} with ${accountCount} account(s)? This action CANNOT be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const sessionId = getSessionId();
      
      // FIRST: Delete credit accounts (if any) - using HR delete endpoint
      if (selectedUser.creditAccounts && selectedUser.creditAccounts.length > 0) {
        for (const account of selectedUser.creditAccounts) {
          const response = await fetch(`${API_BASE}/api/credit/hr/credit/accounts/${account.id}`, {
            method: 'DELETE',
            headers: { 'sessionId': sessionId }
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to delete credit account: ${error.error || 'Unknown error'}`);
          }
        }
      }
      
      // SECOND: Delete business accounts first (they have foreign key constraints)
      if (selectedUser.accounts && selectedUser.accounts.length > 0) {
        for (const account of selectedUser.accounts) {
          if (account.accountType === 'BUSINESS_CHECKING') {
            const response = await fetch(`${API_BASE}/api/business/accounts/${account.id}`, {
              method: 'DELETE'
            });
            if (!response.ok) {
              const error = await response.json();
              throw new Error(`Failed to delete business account: ${error.error || 'Unknown error'}`);
            }
          }
        }
        
        // THIRD: Delete regular accounts (checking/savings)
        for (const account of selectedUser.accounts) {
          if (account.accountType !== 'BUSINESS_CHECKING') {
            const response = await fetch(`${API_BASE}/api/accounts/${account.id}`, {
              method: 'DELETE'
            });
            if (!response.ok) {
              const error = await response.json();
              throw new Error(`Failed to delete regular account: ${error.error || 'Unknown error'}`);
            }
          }
        }
      }
      
      // FINALLY: Delete the user
      const userResponse = await fetch(`${API_BASE}/api/users/${selectedUser.id}`, {
        method: 'DELETE'
      });
      
      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(`Failed to delete user: ${error.error || 'Unknown error'}`);
      }
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== selectedUser.id));
      
      setShowDeleteUserModal(false);
      setShowUserModal(false);
      alert(`User ${selectedUser.firstName} ${selectedUser.lastName} and all associated accounts have been permanently deleted.`);
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearTransactions = async () => {
    if (!selectedAccount) return;
    
    if (!window.confirm(`Clear ALL transaction history for account ending in ${selectedAccount.accountNumber?.slice(-4) || selectedAccount.maskedAccountNumber?.slice(-4)}? This action CANNOT be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const sessionId = getSessionId();
      const isCredit = selectedAccount.type === 'CREDIT' || selectedAccount.creditLimit !== undefined;
      
      let url;
      let options = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      };

    if (isCredit) {
  // ⭐ FIXED: Added missing /credit in the path
  url = `${API_BASE}/api/credit/admin/credit/accounts/${selectedAccount.id}/transactions/clear`;
  options.headers['sessionId'] = sessionId;
} 
      else {
        // Clear regular account transactions (checking/savings/business)
        const accountNumber = selectedAccount.accountNumber || selectedAccount.maskedAccountNumber?.replace('****', '');
        url = `${API_BASE}/api/transactions/clear/by-account-number?accountNumber=${accountNumber}`;
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear transactions');
      }

      setShowClearTransactionsModal(false);
      alert(`Transaction history has been cleared.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
      setSelectedAccount(null);
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
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
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
          style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
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
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>HR User Management</h1>
          <button 
            onClick={() => window.history.back()}
            style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 24px' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Total Users</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{totalUsers}</div>
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
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Credit Cards</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{creditAccounts}</div>
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

        {/* HR Warning Banner */}
        <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#b91c1c', marginBottom: '4px' }}>HR Actions - Use with Caution</h3>
              <p style={{ fontSize: '14px', color: '#b91c1c' }}>
                You have permission to permanently delete accounts and users. These actions cannot be undone.
              </p>
            </div>
          </div>
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
              const accountCount = (user.accounts?.length || 0) + (user.creditAccounts?.length || 0);
              const userBalance = (user.accounts?.reduce((sum, a) => sum + a.balance, 0) || 0) + 
                                (user.creditAccounts?.reduce((sum, a) => sum + a.currentBalance, 0) || 0);
              
              return (
                <div 
                  key={user.id} 
                  style={{ 
                    minWidth: '300px',
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
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
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                      background: '#667eea20', 
                      color: '#667eea' 
                    }}>
                      HR Access
                    </span>
                    <span style={{ fontSize: '12px', color: '#667eea' }}>View Details →</span>
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
                <div style={{ border: '2px solid #f3f3f3', borderTop: '2px solid #667eea', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite' }}></div>
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
              </div>
            </div>

            {/* Accounts */}
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Regular Accounts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedUser.accounts?.map(account => {
                  const accountType = account.accountType === 'BUSINESS_CHECKING' ? 'BUSINESS' : account.accountType;
                  
                  return (
                    <div key={account.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{getAccountIcon(account.accountType)}</span>
                          <span style={{ fontWeight: '600' }}>{accountType}</span>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{account.accountNumber}</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>{formatCurrency(account.balance)}</div>
                      
                      {/* HR Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowDeleteAccountModal(true);
                          }}
                          style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          🗑️ Delete Account
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowClearTransactionsModal(true);
                          }}
                          style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          🧹 Clear Transactions
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!selectedUser.accounts || selectedUser.accounts.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: '6px', color: '#6b7280' }}>
                    No regular accounts found
                  </div>
                )}
              </div>

              {/* Credit Accounts Section */}
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '24px 0 16px 0' }}>Credit Accounts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedUser.creditAccounts?.map(account => (
                  <div key={account.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', background: '#f0f9ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{getAccountIcon(null, true)}</span>
                        <span style={{ fontWeight: '600' }}>CREDIT CARD</span>
                        <span style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          background: account.status === 'ACTIVE' ? '#10b98120' : 
                                     account.status === 'FROZEN' ? '#f59e0b20' : 
                                     '#6b728020',
                          color: account.status === 'ACTIVE' ? '#10b981' : 
                                 account.status === 'FROZEN' ? '#f59e0b' : 
                                 '#6b7280'
                        }}>
                          {account.status}
                        </span>
                      </div>
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
                    
                    {/* Credit Account HR Actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {account.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowFreezeCreditAccountModal(true);
                          }}
                          style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          ❄️ Freeze
                        </button>
                      )}
                      {account.status === 'FROZEN' && (
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowUnfreezeCreditAccountModal(true);
                          }}
                          style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          🔓 Unfreeze
                        </button>
                      )}
                      {account.status !== 'CLOSED' && (
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowCloseCreditAccountModal(true);
                          }}
                          style={{ padding: '6px 12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          🔒 Close
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowDeleteAccountModal(true);
                        }}
                        style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        🗑️ Delete
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowClearTransactionsModal(true);
                        }}
                        style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        🧹 Clear Transactions
                      </button>
                    </div>
                  </div>
                ))}
                {(!selectedUser.creditAccounts || selectedUser.creditAccounts.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: '6px', color: '#6b7280' }}>
                    No credit accounts found
                  </div>
                )}
              </div>

              {/* Delete User Button */}
              <div style={{ marginTop: '24px', padding: '16px', background: '#fee2e2', borderRadius: '6px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#b91c1c', marginBottom: '12px' }}>Danger Zone</h4>
                <button
                  onClick={() => setShowDeleteUserModal(true)}
                  style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                >
                  🗑️ Delete User Permanently
                </button>
                <p style={{ fontSize: '12px', color: '#b91c1c', marginTop: '8px' }}>
                  This will delete the user and ALL their accounts. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && selectedAccount && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>⚠️ Permanently Delete Account</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              You are about to permanently delete {selectedAccount.accountType || 'Credit'} account ending in {selectedAccount.accountNumber?.slice(-4) || selectedAccount.maskedAccountNumber?.slice(-4)}.
            </p>
            
            <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
              <p style={{ color: '#b91c1c', fontSize: '13px', margin: 0 }}>
                ⚠️ This action CANNOT be undone. The account will be permanently removed from the database.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                style={{ padding: '8px 16px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Credit Account Modal */}
      {showFreezeCreditAccountModal && selectedAccount && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>Freeze Credit Account</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Freeze credit account ending in {selectedAccount.maskedAccountNumber?.slice(-4)}?
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>Reason for freezing:</label>
              <input
                type="text"
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                placeholder="e.g., Suspicious activity, Lost card, etc."
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowFreezeCreditAccountModal(false);
                  setFreezeReason('');
                }}
                style={{ padding: '8px 16px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleFreezeCreditAccount}
                style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={actionLoading || !freezeReason.trim()}
              >
                {actionLoading ? 'Freezing...' : 'Freeze Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unfreeze Credit Account Modal */}
      {showUnfreezeCreditAccountModal && selectedAccount && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>Unfreeze Credit Account</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Unfreeze credit account ending in {selectedAccount.maskedAccountNumber?.slice(-4)}?
            </p>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUnfreezeCreditAccountModal(false)}
                style={{ padding: '8px 16px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUnfreezeCreditAccount}
                style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Unfreezing...' : 'Unfreeze Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Credit Account Modal */}
      {showCloseCreditAccountModal && selectedAccount && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>Close Credit Account</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Close credit account ending in {selectedAccount.maskedAccountNumber?.slice(-4)}?
            </p>
            
            {selectedAccount.currentBalance > 0 && (
              <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
                <p style={{ color: '#b91c1c', fontSize: '13px', margin: 0 }}>
                  ⚠️ Account has outstanding balance of {formatCurrency(selectedAccount.currentBalance)}. Close anyway?
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCloseCreditAccountModal(false)}
                style={{ padding: '8px 16px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCloseCreditAccount}
                style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Closing...' : 'Yes, Close Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteUserModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>⚠️ Permanently Delete User</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              You are about to permanently delete user <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> with {(selectedUser.accounts?.length || 0) + (selectedUser.creditAccounts?.length || 0)} account(s).
            </p>
            
            <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
              <p style={{ color: '#b91c1c', fontSize: '13px', margin: 0 }}>
                ⚠️ This action CANNOT be undone. The user and ALL their accounts will be permanently removed from the database.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteUserModal(false)}
                style={{ padding: '8px 16px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Transactions Modal */}
      {showClearTransactionsModal && selectedAccount && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>Clear Transaction History</h3>
            
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Clear ALL transaction history for account ending in {selectedAccount.accountNumber?.slice(-4) || selectedAccount.maskedAccountNumber?.slice(-4)}? This action CANNOT be undone.
            </p>
            
            <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
              <p style={{ color: '#b91c1c', fontSize: '13px', margin: 0 }}>
                ⚠️ This action CANNOT be undone. All transaction records will be permanently deleted.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowClearTransactionsModal(false);
                  setSelectedAccount(null);
                }}
                style={{ padding: '8px 16px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearTransactions}
                style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Clearing...' : 'Yes, Clear All'}
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

export default HRUsers;
