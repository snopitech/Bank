import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8080";

export default function AdminUSVerifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('PENDING_REVIEW');
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userStats, setUserStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [showFullSSN, setShowFullSSN] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      fetchUserVerifications(selectedUser.id);
    } else {
      fetchVerifications();
    }
    fetchStats();
  }, [filter, selectedUser]);

  // Search users by name
  const searchUsers = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/search?name=${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchUsers(term);
  };

  // Select a user from search results
  const selectUser = (user) => {
    setSelectedUser(user);
    setSearchTerm(`${user.firstName} ${user.lastName}`);
    setShowSearchDropdown(false);
    fetchUserVerifications(user.id);
  };

  // Fetch verifications for specific user
  const fetchUserVerifications = async (userId) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/admin/us-verifications/user/${userId}`;
      if (filter !== 'ALL') {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch user verifications');
      const data = await response.json();
      setVerifications(Array.isArray(data) ? data : []);
      
      // Calculate user stats
      const stats = {
        total: data.length,
        pending: data.filter(v => v.status === 'PENDING_REVIEW').length,
        approved: data.filter(v => v.status === 'APPROVED').length,
        rejected: data.filter(v => v.status === 'REJECTED').length
      };
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user verifications:', error);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Clear user filter
  const clearUserFilter = () => {
    setSelectedUser(null);
    setSearchTerm('');
    setSearchResults([]);
    setUserStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    fetchVerifications();
  };

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      let url;
      if (filter === 'PENDING_REVIEW') {
        url = `${API_BASE}/api/admin/us-verifications/pending`;
      } else if (filter === 'APPROVED') {
        url = `${API_BASE}/api/admin/us-verifications/approved`;
      } else if (filter === 'REJECTED') {
        url = `${API_BASE}/api/admin/us-verifications/rejected`;
      } else {
        url = `${API_BASE}/api/admin/us-verifications/pending`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch verifications');
      const data = await response.json();
      setVerifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/us-verifications/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchVerificationDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/us-verifications/${id}`);
      if (!response.ok) throw new Error('Failed to fetch details');
      const data = await response.json();
      setSelectedVerification(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching details:', error);
      alert('Failed to load verification details');
    }
  };

  const viewDetails = (verification) => {
    fetchVerificationDetails(verification.id);
  };

  const handleApprove = async () => {
    if (!selectedVerification) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/us-verifications/${selectedVerification.id}/approve?adminUsername=admin`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve verification');
      }

      alert(`✅ ${data.message}`);
      
      if (selectedUser) {
        await fetchUserVerifications(selectedUser.id);
      } else {
        await fetchVerifications();
      }
      await fetchStats();
      setShowDetailsModal(false);
      setSelectedVerification(null);
      
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectReason.trim()) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/us-verifications/${selectedVerification.id}/reject?adminUsername=admin&reason=${encodeURIComponent(rejectReason)}`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject verification');
      }

      alert(`❌ ${data.message}`);
      
      if (selectedUser) {
        await fetchUserVerifications(selectedUser.id);
      } else {
        await fetchVerifications();
      }
      await fetchStats();
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setSelectedVerification(null);
      setRejectReason('');
      
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING_REVIEW':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Review' };
      case 'APPROVED':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' };
      case 'REJECTED':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    }
  };

  const styles = {
    container: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 },
    backButton: { background: '#667eea', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
    
    // Search styles
    searchSection: {
      marginBottom: '20px',
      position: 'relative'
    },
    searchContainer: {
      position: 'relative',
      marginBottom: '15px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      paddingRight: '40px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    searchIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#999'
    },
    searchDropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      maxHeight: '300px',
      overflowY: 'auto',
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginTop: '4px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 1000
    },
    searchResultItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      borderBottom: '1px solid #f0f0f0',
      transition: 'background 0.2s'
    },
    searchResultName: {
      fontWeight: '500',
      color: '#333'
    },
    searchResultEmail: {
      fontSize: '12px',
      color: '#666',
      marginTop: '2px'
    },
    userInfoCard: {
      background: '#f8f9fa',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      border: '1px solid #e0e0e0'
    },
    userInfoHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    userName: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    clearButton: {
      background: 'none',
      border: '1px solid #e0e0e0',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      color: '#666'
    },
    userInfoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px'
    },
    userInfoItem: {
      fontSize: '14px'
    },
    userInfoLabel: {
      color: '#666',
      marginBottom: '4px'
    },
    userInfoValue: {
      fontWeight: '500',
      color: '#333'
    },
    
    filterContainer: { display: 'flex', gap: '8px', marginBottom: '20px' },
    filterButton: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #e0e0e0', background: 'white', cursor: 'pointer', fontSize: '13px' },
    activeFilter: { background: '#667eea', color: 'white', borderColor: '#667eea' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    statLabel: { fontSize: '13px', color: '#666', marginBottom: '4px' },
    statValue: { fontSize: '24px', fontWeight: 'bold', color: '#333' },
    tableCard: { background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f0f0f0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' },
    td: { padding: '12px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' },
    statusBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', display: 'inline-block' },
    viewButton: { background: 'none', border: '1px solid #e0e0e0', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#667eea' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '8px', padding: '24px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' },
    modalTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' },
    detailRow: { display: 'grid', gridTemplateColumns: '1fr 2fr', marginBottom: '8px', fontSize: '14px' },
    detailLabel: { color: '#666' },
    detailValue: { fontWeight: '500' },
    section: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' },
    sectionTitle: { fontSize: '14px', fontWeight: '600', marginBottom: '8px' },
    buttonGroup: { display: 'flex', gap: '8px', marginTop: '20px' },
    approveButton: { background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
    rejectButton: { background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
    closeButton: { background: '#e0e0e0', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
    rejectModal: { background: 'white', borderRadius: '8px', padding: '24px', maxWidth: '400px', width: '90%' },
    textarea: { width: '100%', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', marginTop: '8px', minHeight: '80px' }
  };

  if (loading && verifications.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading verifications...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>US Citizen Verifications</h2>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Search Section */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search users by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
            style={styles.searchInput}
          />
          <span style={styles.searchIcon}>
            {searchLoading ? '⋯' : '🔍'}
          </span>
          
          {/* Search Results Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div style={styles.searchDropdown}>
              {searchResults.map(user => (
                <div
                  key={user.id}
                  style={styles.searchResultItem}
                  onClick={() => selectUser(user)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={styles.searchResultName}>
                    {user.firstName} {user.lastName}
                  </div>
                  <div style={styles.searchResultEmail}>{user.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected User Info Card */}
        {selectedUser && (
          <div style={styles.userInfoCard}>
            <div style={styles.userInfoHeader}>
              <h3 style={styles.userName}>{selectedUser.firstName} {selectedUser.lastName}</h3>
              <button
                style={styles.clearButton}
                onClick={clearUserFilter}
              >
                Clear Filter
              </button>
            </div>
            <div style={styles.userInfoGrid}>
              <div style={styles.userInfoItem}>
                <div style={styles.userInfoLabel}>Email</div>
                <div style={styles.userInfoValue}>{selectedUser.email}</div>
              </div>
              <div style={styles.userInfoItem}>
                <div style={styles.userInfoLabel}>Phone</div>
                <div style={styles.userInfoValue}>{selectedUser.phone || 'N/A'}</div>
              </div>
              <div style={styles.userInfoItem}>
                <div style={styles.userInfoLabel}>Member Since</div>
                <div style={styles.userInfoValue}>{formatDate(selectedUser.memberSince)}</div>
              </div>
              <div style={styles.userInfoItem}>
                <div style={styles.userInfoLabel}>Total Verifications</div>
                <div style={styles.userInfoValue}>{userStats.total}</div>
              </div>
              <div style={styles.userInfoItem}>
                <div style={styles.userInfoLabel}>Pending</div>
                <div style={{...styles.userInfoValue, color: '#eab308'}}>{userStats.pending}</div>
              </div>
              <div style={styles.userInfoItem}>
                <div style={styles.userInfoLabel}>Approved</div>
                <div style={{...styles.userInfoValue, color: '#22c55e'}}>{userStats.approved}</div>
              </div>
              <div style={styles.userInfoItem}>
                <div style={styles.userInfoLabel}>Rejected</div>
                <div style={{...styles.userInfoValue, color: '#ef4444'}}>{userStats.rejected}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.filterContainer}>
        {['PENDING_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            style={{...styles.filterButton, ...(filter === status ? styles.activeFilter : {})}}
            onClick={() => setFilter(status)}
          >
            {status === 'PENDING_REVIEW' ? 'Pending' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pending</div>
          <div style={styles.statValue}>{stats.pending}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Approved</div>
          <div style={styles.statValue}>{stats.approved}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Rejected</div>
          <div style={styles.statValue}>{stats.rejected}</div>
        </div>
      </div>

      <div style={styles.tableCard}>
        {verifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No {filter === 'PENDING_REVIEW' ? 'pending' : filter.toLowerCase()} verifications found
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>SSN</th>
                <th style={styles.th}>DOB</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {verifications.map(verification => {
                const status = getStatusBadge(verification.status);
                return (
                  <tr key={verification.id}>
                    <td style={styles.td}>{verification.id}</td>
                    <td style={styles.td}>{verification.firstName} {verification.lastName}</td>
                    <td style={styles.td}>{verification.email}</td>
                    <td style={styles.td}>{verification.ssnMasked}</td>
                    <td style={styles.td}>{formatDate(verification.dateOfBirth)}</td>
                    <td style={styles.td}>
                      <span style={{...styles.statusBadge, background: status.bg, color: status.text}}>
                        {status.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.viewButton} onClick={() => viewDetails(verification)}>
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedVerification && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>US Citizen Verification #{selectedVerification.id}</h3>
            
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Personal Information</h4>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Name:</span>
                <span style={styles.detailValue}>{selectedVerification.firstName} {selectedVerification.lastName}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Email:</span>
                <span style={styles.detailValue}>{selectedVerification.email}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Phone:</span>
                <span style={styles.detailValue}>{selectedVerification.phone || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>DOB:</span>
                <span style={styles.detailValue}>{formatDate(selectedVerification.dateOfBirth)}</span>
              </div>
             <div style={styles.detailRow}>
            <span style={styles.detailLabel}>SSN:</span>
            <span style={styles.detailValue}>
    {showFullSSN ? selectedVerification.ssnFull : selectedVerification.ssnMasked}
    <button 
      onClick={() => setShowFullSSN(!showFullSSN)}
      style={{
        background: 'none',
        border: 'none',
        marginLeft: '8px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      {showFullSSN ? '🔒' : '👁️'}
    </button>
  </span>
</div>
            </div>

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Birth Information</h4>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>City:</span>
                <span style={styles.detailValue}>{selectedVerification.birthCity || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>State:</span>
                <span style={styles.detailValue}>{selectedVerification.birthState || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Country:</span>
                <span style={styles.detailValue}>{selectedVerification.birthCountry || 'N/A'}</span>
              </div>
            </div>

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Address</h4>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Address:</span>
                <span style={styles.detailValue}>{selectedVerification.addressLine1}</span>
              </div>
              {selectedVerification.addressLine2 && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Apt/Suite:</span>
                  <span style={styles.detailValue}>{selectedVerification.addressLine2}</span>
                </div>
              )}
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>City/State/Zip:</span>
                <span style={styles.detailValue}>
                  {selectedVerification.city}, {selectedVerification.state} {selectedVerification.zipCode}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Country:</span>
                <span style={styles.detailValue}>{selectedVerification.country}</span>
              </div>
            </div>

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Financial Information</h4>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Employment:</span>
                <span style={styles.detailValue}>{selectedVerification.employmentStatus || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Annual Income:</span>
                <span style={styles.detailValue}>{formatCurrency(selectedVerification.annualIncome)}</span>
              </div>
            </div>

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Submission Info</h4>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Submitted:</span>
                <span style={styles.detailValue}>{formatDate(selectedVerification.submittedAt)}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status:</span>
                <span style={styles.detailValue}>
                  <span style={{...styles.statusBadge, background: getStatusBadge(selectedVerification.status).bg, color: getStatusBadge(selectedVerification.status).text}}>
                    {getStatusBadge(selectedVerification.status).label}
                  </span>
                </span>
              </div>
              {selectedVerification.reviewedBy && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Reviewed By:</span>
                  <span style={styles.detailValue}>{selectedVerification.reviewedBy}</span>
                </div>
              )}
              {selectedVerification.reviewedAt && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Reviewed At:</span>
                  <span style={styles.detailValue}>{formatDate(selectedVerification.reviewedAt)}</span>
                </div>
              )}
              {selectedVerification.adminNotes && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Admin Notes:</span>
                  <span style={styles.detailValue}>{selectedVerification.adminNotes}</span>
                </div>
              )}
            </div>

            <div style={styles.buttonGroup}>
              {selectedVerification.status === 'PENDING_REVIEW' && (
                <>
                  <button 
                    style={styles.approveButton} 
                    onClick={handleApprove} 
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                  <button 
                    style={styles.rejectButton} 
                    onClick={() => { setShowRejectModal(true); setShowDetailsModal(false); }} 
                    disabled={actionLoading}
                  >
                    Reject
                  </button>
                </>
              )}
              <button style={styles.closeButton} onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div style={styles.rejectModal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Reject Verification</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Please provide a reason for rejection:
            </p>
            <textarea
              style={styles.textarea}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />
            <div style={styles.buttonGroup}>
              <button style={styles.rejectButton} onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}>
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
              <button style={styles.closeButton} onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}