import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "";

const AdminUnlockUser = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmUnlock, setConfirmUnlock] = useState(false);

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setActionResult({ type: 'error', message: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  // Search users as user types
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = users.filter(user => 
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.customerId?.toLowerCase().includes(term)
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleUnlockUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/admin/unlock-user/${selectedUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unlock user');
      }

      setActionResult({
        type: 'success',
        message: `✅ Account unlocked successfully for ${selectedUser.firstName} ${selectedUser.lastName}`
      });

      // Reset selection
      setSelectedUser(null);
      setConfirmUnlock(false);
      
      // Refresh user list
      fetchUsers();

    } catch (error) {
      setActionResult({
        type: 'error',
        message: `❌ Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const isUserLocked = (user) => {
    return user.accountLocked === true;
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666'
    },
    searchSection: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '16px'
    },
    resultsCount: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '16px'
    },
    lockedUsersSection: {
      background: '#fef2f2',
      border: '1px solid #ef4444',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px'
    },
    lockedTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#b91c1c',
      marginBottom: '12px'
    },
    lockedItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      background: 'white',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    userName: {
      fontWeight: '500'
    },
    userEmail: {
      fontSize: '12px',
      color: '#666',
      marginLeft: '8px'
    },
    unlockButton: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '4px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer'
    },
    userList: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    userItem: {
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid #f0f0f0',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    selectedUser: {
      background: '#e0f2fe',
      borderLeft: '4px solid #3b82f6'
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    userName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333'
    },
    userDetails: {
      fontSize: '13px',
      color: '#666',
      display: 'flex',
      gap: '16px'
    },
    lockStatus: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    },
    locked: {
      background: '#fee2e2',
      color: '#dc2626'
    },
    unlocked: {
      background: '#d1fae5',
      color: '#059669'
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
      maxWidth: '400px',
      width: '90%'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#ef4444',
      marginBottom: '12px'
    },
    modalText: {
      fontSize: '14px',
      color: '#333',
      marginBottom: '20px',
      lineHeight: 1.6
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    cancelButton: {
      padding: '8px 16px',
      background: '#e5e7eb',
      color: '#333',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    confirmButton: {
      padding: '8px 16px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    backButton: {
      marginTop: '20px',
      padding: '10px 20px',
      background: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px'
    }
  };

  // Get locked users
  const lockedUsers = users.filter(user => isUserLocked(user));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Unlock User Account</h1>
        <p style={styles.subtitle}>
          Search for a user and unlock their account if they've been locked due to failed login attempts.
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

      {/* Locked Users Section */}
      {lockedUsers.length > 0 && (
        <div style={styles.lockedUsersSection}>
          <h3 style={styles.lockedTitle}>
            🔒 Locked Users ({lockedUsers.length})
          </h3>
          <div>
            {lockedUsers.map(user => (
              <div key={user.id} style={styles.lockedItem}>
                <div>
                  <span style={styles.userName}>{user.firstName} {user.lastName}</span>
                  <span style={styles.userEmail}>{user.email}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setConfirmUnlock(true);
                  }}
                  style={styles.unlockButton}
                >
                  Unlock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div style={styles.searchSection}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="🔍 Search by name, email, or customer ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div style={styles.resultsCount}>
          Found {filteredUsers.length} users
        </div>
      </div>

      {/* User List */}
      {loading && !filteredUsers.length ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading users...
        </div>
      ) : (
        <div style={styles.userList}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  ...styles.userItem,
                  ...(selectedUser?.id === user.id ? styles.selectedUser : {})
                }}
                onClick={() => setSelectedUser(user)}
              >
                <div style={styles.userInfo}>
                  <span style={styles.userName}>
                    {user.firstName} {user.lastName}
                  </span>
                  <div style={styles.userDetails}>
                    <span>📧 {user.email}</span>
                    <span>🆔 {user.customerId || 'N/A'}</span>
                  </div>
                </div>
                
                <div style={{
                  ...styles.lockStatus,
                  ...(isUserLocked(user) ? styles.locked : styles.unlocked)
                }}>
                  {isUserLocked(user) ? '🔒 Locked' : '🔓 Active'}
                </div>

                {selectedUser?.id === user.id && isUserLocked(user) && (
                  <button
                    style={{
                      ...styles.unlockButton,
                      marginLeft: '20px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmUnlock(true);
                    }}
                  >
                    Unlock Account
                  </button>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No users found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmUnlock && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>🔓 Confirm Unlock</h3>
            <p style={styles.modalText}>
              Are you sure you want to unlock the account for <strong>
                {selectedUser.firstName} {selectedUser.lastName}
              </strong>?
              <br /><br />
              They will be able to log in immediately.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setConfirmUnlock(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmButton}
                onClick={handleUnlockUser}
                disabled={loading}
              >
                {loading ? 'Unlocking...' : 'Yes, Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        style={styles.backButton}
        onClick={() => navigate('/dashboard')}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default AdminUnlockUser;
