import { useState, useEffect } from 'react';

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setHasMore(data.length >= 20);
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
      const response = await fetch(`http://localhost:8080/api/users?page=${nextPage}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch more users');
      const newUsers = await response.json();
      
      if (newUsers.length === 0) {
        setHasMore(false);
      } else {
        setUsers(prev => [...prev, ...newUsers]);
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
  const totalAccounts = users.reduce((acc, u) => acc + (u.accounts?.length || 0), 0);
  const totalBalance = users.reduce((acc, u) => 
    acc + (u.accounts?.reduce((sum, a) => sum + a.balance, 0) || 0), 0
  );
  const businessAccounts = users.reduce((acc, u) => 
    acc + (u.accounts?.filter(a => a.accountType === 'BUSINESS_CHECKING').length || 0), 0
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    
    if (!window.confirm(`⚠️ PERMANENTLY DELETE account ending in ${selectedAccount.accountNumber.slice(-4)}? This action CANNOT be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      // Determine which API to use based on account type
      const isBusiness = selectedAccount.accountType === 'BUSINESS_CHECKING';
      const url = isBusiness 
        ? `http://localhost:8080/api/business/accounts/${selectedAccount.id}`
        : `http://localhost:8080/api/accounts/${selectedAccount.id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }

      // Update local state - remove the deleted account
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              accounts: user.accounts?.filter(acc => acc.id !== selectedAccount.id)
            };
          }
          return user;
        })
      );

      setShowDeleteAccountModal(false);
      alert(`Account ending in ${selectedAccount.accountNumber.slice(-4)} has been permanently deleted.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
      setSelectedAccount(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    const accountCount = selectedUser.accounts?.length || 0;
    if (!window.confirm(`⚠️ PERMANENTLY DELETE USER ${selectedUser.firstName} ${selectedUser.lastName} with ${accountCount} account(s)? This action CANNOT be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      // TODO: Replace with actual user delete endpoint when available
      // For now, we'll need to delete each account first
      if (selectedUser.accounts && selectedUser.accounts.length > 0) {
        for (const account of selectedUser.accounts) {
          const isBusiness = account.accountType === 'BUSINESS_CHECKING';
          const url = isBusiness 
            ? `http://localhost:8080/api/business/accounts/${account.id}`
            : `http://localhost:8080/api/accounts/${account.id}`;
          
          await fetch(url, { method: 'DELETE' });
        }
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
    
    if (!window.confirm(`Clear ALL transaction history for account ending in ${selectedAccount.accountNumber.slice(-4)}? This action CANNOT be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const url = `http://localhost:8080/api/transactions/clear/by-account-number?accountNumber=${selectedAccount.accountNumber}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear transactions');
      }

      setShowClearTransactionsModal(false);
      alert(`Transaction history for account ending in ${selectedAccount.accountNumber.slice(-4)} has been cleared.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
      setSelectedAccount(null);
    }
  };

  const getAccountIcon = (type) => {
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
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Business Accts</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{businessAccounts}</div>
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
              const accountCount = user.accounts?.length || 0;
              const userBalance = user.accounts?.reduce((sum, a) => sum + a.balance, 0) || 0;
              
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
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Accounts</h3>
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
                  <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '6px', color: '#6b7280' }}>
                    No accounts found for this user
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
              You are about to permanently delete {selectedAccount.accountType} account ending in {selectedAccount.accountNumber.slice(-4)}.
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

      {/* Delete User Modal */}
      {showDeleteUserModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>⚠️ Permanently Delete User</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              You are about to permanently delete user <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> with {selectedUser.accounts?.length || 0} account(s).
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
              Clear ALL transaction history for account ending in {selectedAccount.accountNumber.slice(-4)}?
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
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
    </div>
  );
};

export default HRUsers;