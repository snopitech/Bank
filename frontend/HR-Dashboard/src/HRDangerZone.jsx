import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HRDangerZone = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [actionResult, setActionResult] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Search users as user types
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = users.filter(user => 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.customerId?.toLowerCase().includes(term)
    );
    setSearchResults(results);
  }, [searchTerm, users]);

  const handleClearAllTransactions = async () => {
    setLoading(true);
    setActionResult(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/transactions/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to clear transactions');
      }

      setActionResult({
        type: 'success',
        message: '✅ All transaction history has been cleared successfully.'
      });
      setShowClearAllModal(false);
    } catch (err) {
      setActionResult({
        type: 'error',
        message: `❌ Error: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

 const handleDeleteUser = async () => {
  if (!selectedUser || confirmText !== 'PERMANENTLY DELETE') return;
  
  setLoading(true);
  setActionResult(null);
  
  try {
    console.log("🔍 Attempting to delete user ID:", selectedUser.id);
    
    const response = await fetch(`http://localhost:8080/api/users/${selectedUser.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log("📡 Response status:", response.status);
    
    const errorText = await response.text();
    console.log("📝 Response body:", errorText);

    if (!response.ok) {
      throw new Error(errorText || 'Failed to delete user');
    }

    setActionResult({
      type: 'success',
      message: `✅ User ${selectedUser.firstName} ${selectedUser.lastName} has been permanently deleted.`
    });
    
    // Remove deleted user from list
    setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
    setShowDeleteUserModal(false);
    setSelectedUser(null);
    setSearchTerm('');
    setConfirmText('');
  } catch (err) {
    console.error("❌ Delete error:", err);
    setActionResult({
      type: 'error',
      message: `❌ Error: ${err.message}`
    });
  } finally {
    setLoading(false);
  }
};
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    content: {
      padding: '24px'
    },
    header: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px 30px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    backButton: {
      padding: '8px 16px',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    warningBanner: {
      background: '#fee2e2',
      border: '2px solid #ef4444',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      textAlign: 'center'
    },
    warningIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    warningTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#b91c1c',
      marginBottom: '8px'
    },
    warningText: {
      fontSize: '16px',
      color: '#b91c1c',
      marginBottom: '16px'
    },
    dangerCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e5e7eb'
    },
    cardIcon: {
      fontSize: '32px'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#111827'
    },
    cardDescription: {
      color: '#6b7280',
      fontSize: '14px',
      lineHeight: '1.6',
      marginBottom: '20px'
    },
    dangerButton: {
      padding: '12px 24px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    searchSection: {
      marginBottom: '20px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '12px'
    },
    searchResults: {
      maxHeight: '300px',
      overflowY: 'auto',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      background: '#f9fafb'
    },
    searchResultItem: {
      padding: '12px 16px',
      borderBottom: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'background 0.2s',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    selectedUser: {
      background: '#e0f2fe',
      border: '2px solid #3b82f6'
    },
    userInfo: {
      flex: 1
    },
    userName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827'
    },
    userEmail: {
      fontSize: '14px',
      color: '#6b7280'
    },
    userId: {
      fontSize: '12px',
      color: '#9ca3af',
      fontFamily: 'monospace'
    },
    deleteButton: {
      padding: '12px 24px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      width: '100%',
      marginTop: '16px',
      opacity: 0.5
    },
    deleteButtonActive: {
      opacity: 1,
      background: '#dc2626'
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
      padding: '24px',
      width: '90%',
      maxWidth: '400px'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '12px'
    },
    modalText: {
      color: '#6b7280',
      fontSize: '14px',
      marginBottom: '20px'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    cancelButton: {
      padding: '8px 16px',
      background: '#e5e7eb',
      color: '#111827',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    confirmButton: {
      padding: '8px 16px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    resultAlert: {
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px',
      fontSize: '14px'
    },
    successAlert: {
      background: '#d1fae5',
      border: '1px solid #10b981',
      color: '#065f46'
    },
    errorAlert: {
      background: '#fee2e2',
      border: '1px solid #ef4444',
      color: '#b91c1c'
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    statLabel: {
      color: '#6b7280',
      fontSize: '12px',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            <span>⚠️</span> Danger Zone
          </h1>
          <button 
            style={styles.backButton}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Users</div>
            <div style={styles.statValue}>{users.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Accounts</div>
            <div style={styles.statValue}>
              {users.reduce((acc, u) => acc + (u.accounts?.length || 0), 0)}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Balance</div>
            <div style={styles.statValue}>
              ${users.reduce((acc, u) => acc + (u.accounts?.reduce((sum, a) => sum + a.balance, 0) || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Main Warning Banner */}
        <div style={styles.warningBanner}>
          <div style={styles.warningIcon}>⚠️</div>
          <h2 style={styles.warningTitle}>Extreme Caution Required</h2>
          <p style={styles.warningText}>
            The actions on this page are irreversible and affect the entire banking system.
            These operations cannot be undone and will permanently delete data.
          </p>
        </div>

        {/* Action Result Alert */}
        {actionResult && (
          <div style={{
            ...styles.resultAlert,
            ...(actionResult.type === 'success' ? styles.successAlert : styles.errorAlert)
          }}>
            {actionResult.message}
          </div>
        )}

        {/* Clear All Transactions Card */}
        <div style={styles.dangerCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🧹</span>
            <h3 style={styles.cardTitle}>Clear ALL Transaction History</h3>
          </div>
          <p style={styles.cardDescription}>
            This action will permanently delete EVERY transaction record from the entire banking system.
            All accounts will show zero transaction history. This operation cannot be undone.
          </p>
          <button
            style={styles.dangerButton}
            onClick={() => setShowClearAllModal(true)}
            onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
            disabled={loading}
          >
            {loading ? 'Processing...' : '🧹 Clear ALL Transactions'}
          </button>
        </div>

        {/* Delete User Card */}
        <div style={styles.dangerCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🗑️</span>
            <h3 style={styles.cardTitle}>Delete User</h3>
          </div>
          <p style={styles.cardDescription}>
            Search for a user by name or email, then permanently delete them and ALL their associated accounts.
            This action cannot be undone.
          </p>
          
          <div style={styles.searchSection}>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="🔍 Search by name, email, or customer ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchResults.length > 0 && (
              <div style={styles.searchResults}>
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    style={{
                      ...styles.searchResultItem,
                      ...(selectedUser?.id === user.id ? styles.selectedUser : {})
                    }}
                    onClick={() => setSelectedUser(user)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = selectedUser?.id === user.id ? '#e0f2fe' : '#f9fafb'}
                  >
                    <div style={styles.userInfo}>
                      <div style={styles.userName}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={styles.userEmail}>{user.email}</div>
                      <div style={styles.userId}>ID: {user.id} • {user.customerId}</div>
                    </div>
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: user.accounts?.length > 0 ? '#10b98120' : '#6b728020',
                        color: user.accounts?.length > 0 ? '#10b981' : '#6b7280'
                      }}>
                        {user.accounts?.length || 0} accounts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && searchResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                No users found matching "{searchTerm}"
              </div>
            )}
          </div>

          {selectedUser && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Selected User:</h4>
              <p><strong>{selectedUser.firstName} {selectedUser.lastName}</strong> • {selectedUser.email}</p>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                {selectedUser.accounts?.length || 0} account(s) • Balance: ${selectedUser.accounts?.reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
              </p>
            </div>
          )}

          <button
            style={{
              ...styles.deleteButton,
              ...(selectedUser ? styles.deleteButtonActive : {})
            }}
            onClick={() => {
              if (!selectedUser) {
                alert('Please select a user first');
                return;
              }
              setShowDeleteUserModal(true);
            }}
            onMouseEnter={(e) => {
              if (selectedUser) e.currentTarget.style.background = '#dc2626';
            }}
            onMouseLeave={(e) => {
              if (selectedUser) e.currentTarget.style.background = '#ef4444';
            }}
            disabled={loading || !selectedUser}
          >
            {loading ? 'Processing...' : '🗑️ Delete Selected User'}
          </button>
        </div>

        {/* Security Note */}
        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          padding: '20px',
          color: 'white',
          marginTop: '24px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#94a3b8' }}>
            🔒 Security Audit Log
          </h4>
          <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '8px' }}>
            All actions in the Danger Zone are logged and monitored. HR administrators are responsible
            for any destructive operations performed.
          </p>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Last audit: {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Clear All Transactions Modal */}
      {showClearAllModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>⚠️ Clear ALL Transactions?</h3>
            <p style={styles.modalText}>
              You are about to permanently delete EVERY transaction record in the entire banking system.
              This affects ALL accounts and CANNOT be undone.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowClearAllModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmButton}
                onClick={handleClearAllTransactions}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Yes, Clear Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteUserModal && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>🗑️ Permanently Delete User?</h3>
            <p style={styles.modalText}>
              You are about to delete <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> 
              {' '}({selectedUser.email}) and ALL their associated accounts.
              This action CANNOT be undone.
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>
                Type <strong style={{ color: '#ef4444' }}>PERMANENTLY DELETE</strong> to confirm
              </label>
              <input
                type="text"
                style={styles.searchInput}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="PERMANENTLY DELETE"
              />
            </div>

            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowDeleteUserModal(false);
                  setConfirmText('');
                }}
              >
                Cancel
              </button>
              <button
                style={styles.confirmButton}
                onClick={handleDeleteUser}
                disabled={loading || confirmText !== 'PERMANENTLY DELETE'}
              >
                {loading ? 'Processing...' : 'Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDangerZone;