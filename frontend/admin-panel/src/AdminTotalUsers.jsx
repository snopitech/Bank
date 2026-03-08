import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8080";

const AdminTotalUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Styles object - moved to the top before any conditional returns
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px 30px',
      marginBottom: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    backButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    statLabel: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '5px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333'
    },
    filters: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      display: 'flex',
      gap: '15px',
      flexWrap: 'wrap'
    },
    searchInput: {
      flex: 1,
      minWidth: '250px',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px'
    },
    filterSelect: {
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '150px',
      background: 'white'
    },
    tableContainer: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '15px',
      borderBottom: '2px solid #f0f0f0',
      color: '#666',
      fontSize: '14px',
      fontWeight: '600'
    },
    td: {
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '14px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    },
    viewButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      marginTop: '20px'
    },
    pageButton: {
      background: 'white',
      border: '1px solid #e0e0e0',
      padding: '8px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    activePageButton: {
      background: '#667eea',
      color: 'white',
      border: '1px solid #667eea'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '1px solid #f0f0f0'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#999'
    },
    userInfo: {
      background: '#f9f9f9',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px dashed #e0e0e0'
    },
    infoLabel: {
      color: '#666',
      fontSize: '13px'
    },
    infoValue: {
      fontWeight: '500',
      color: '#333'
    },
    accountCard: {
      background: '#f9f9f9',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px'
    },
    accountType: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      marginRight: '8px'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    loadingSpinner: {
      border: '4px solid rgba(255,255,255,0.3)',
      borderTop: '4px solid white',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    },
    errorContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    retryButton: {
      background: 'white',
      color: '#667eea',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '20px'
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
      const response = await fetch(`${API_BASE}/api/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const userStatus = user.accounts?.some(a => !a.closed && !a.disabled) ? 'ACTIVE' : 'INACTIVE';
    const matchesStatus = filterStatus === 'ALL' || userStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.accounts?.some(a => !a.closed && !a.disabled)).length;
  const usersWithAccounts = users.filter(u => u.accounts?.length > 0).length;
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

  const getStatusColor = (user) => {
    const hasActiveAccounts = user.accounts?.some(a => !a.closed && !a.disabled);
    const hasAnyAccounts = user.accounts?.length > 0;
    
    if (!hasAnyAccounts) return { bg: '#6b728020', color: '#6b7280', label: 'No Accounts' };
    if (hasActiveAccounts) return { bg: '#10b98120', color: '#10b981', label: 'Active' };
    return { bg: '#f59e0b20', color: '#f59e0b', label: 'Inactive' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error Loading Users</h2>
        <p>{error}</p>
        <button style={styles.retryButton} onClick={fetchUsers}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>User Management</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Users</div>
          <div style={styles.statValue}>{totalUsers.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Active Users</div>
          <div style={styles.statValue}>{activeUsers.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Accounts</div>
          <div style={styles.statValue}>{totalAccounts.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Balance</div>
          <div style={styles.statValue}>{formatCurrency(totalBalance)}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Search by name, email, customer ID, or phone..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          style={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Users</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Customer ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Member Since</th>
              <th style={styles.th}>Accounts</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => {
              const status = getStatusColor(user);
              const accountCount = user.accounts?.length || 0;
              
              return (
                <tr key={user.id}>
                  <td style={styles.td}>
                    <span style={{ fontFamily: 'monospace' }}>{user.customerId}</span>
                  </td>
                  <td style={styles.td}>
                    <strong>{user.firstName} {user.lastName}</strong>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.phone || 'N/A'}</td>
                  <td style={styles.td}>{formatDate(user.memberSince)}</td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '600' }}>{accountCount}</span>
                    {accountCount > 0 && (
                      <span style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>
                        ({user.accounts?.filter(a => !a.closed).length} active)
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: status.bg,
                      color: status.color
                    }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.viewButton}
                      onClick={() => handleViewUser(user)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <span style={{ fontSize: '14px', color: '#666' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              style={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div style={styles.modalOverlay} onClick={() => setShowUserModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>User Details</h2>
              <button style={styles.closeButton} onClick={() => setShowUserModal(false)}>×</button>
            </div>

            <div style={styles.userInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Customer ID:</span>
                <span style={styles.infoValue}>{selectedUser.customerId}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Name:</span>
                <span style={styles.infoValue}>{selectedUser.firstName} {selectedUser.lastName}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{selectedUser.email}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Phone:</span>
                <span style={styles.infoValue}>{selectedUser.phone || 'N/A'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Member Since:</span>
                <span style={styles.infoValue}>{formatDate(selectedUser.memberSince)}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Address:</span>
                <span style={styles.infoValue}>
                  {selectedUser.addressLine1 ? 
                    `${selectedUser.addressLine1}, ${selectedUser.city}, ${selectedUser.state} ${selectedUser.zipCode}` 
                    : 'Not provided'}
                </span>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Accounts</h3>
            
            {selectedUser.accounts && selectedUser.accounts.length > 0 ? (
              selectedUser.accounts.map((account) => {
                const accountType = account.accountType === 'BUSINESS_CHECKING' ? 'BUSINESS' : account.accountType;
                const accountStatus = account.closed ? 'Closed' : account.disabled ? 'Disabled' : 'Active';
                
                return (
                  <div key={account.id} style={styles.accountCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <span style={{
                          ...styles.accountType,
                          background: accountType === 'CHECKING' ? '#3b82f620' : 
                                     accountType === 'SAVINGS' ? '#10b98120' : '#8b5cf620',
                          color: accountType === 'CHECKING' ? '#3b82f6' : 
                                accountType === 'SAVINGS' ? '#10b981' : '#8b5cf6'
                        }}>
                          {accountType}
                        </span>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {account.accountNumber}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: account.closed ? '#6b728020' : 
                                   account.disabled ? '#f59e0b20' : '#10b98120',
                        color: account.closed ? '#6b7280' : 
                              account.disabled ? '#f59e0b' : '#10b981'
                      }}>
                        {accountStatus}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>Balance: <strong>{formatCurrency(account.balance)}</strong></span>
                      {account.nickname && <span style={{ color: '#666' }}>{account.nickname}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No accounts found for this user
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTotalUsers;