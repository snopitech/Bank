import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "";

export default function AdminLoanApplications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('PENDING');
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userStats, setUserStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    if (selectedUser) {
      fetchUserApplications(selectedUser.id);
    } else {
      fetchApplications();
    }
    fetchStats();
  }, [filter, selectedUser]);

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

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchUsers(term);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setSearchTerm(`${user.firstName} ${user.lastName}`);
    setShowSearchDropdown(false);
    fetchUserApplications(user.id);
  };

  const fetchUserApplications = async (userId) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/admin/loan/applications/user/${userId}`;
      if (filter !== 'ALL') {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch user applications');
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
      
      const stats = {
        total: data.length,
        pending: data.filter(v => v.status === 'PENDING').length,
        approved: data.filter(v => v.status === 'APPROVED').length,
        rejected: data.filter(v => v.status === 'REJECTED').length
      };
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const clearUserFilter = () => {
    setSelectedUser(null);
    setSearchTerm('');
    setSearchResults([]);
    setUserStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    fetchApplications();
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let url;
      if (filter === 'PENDING') {
        url = `${API_BASE}/api/admin/loan/applications/pending`;
      } else if (filter === 'APPROVED') {
        url = `${API_BASE}/api/admin/loan/applications/approved`;
      } else if (filter === 'REJECTED') {
        url = `${API_BASE}/api/admin/loan/applications/rejected`;
      } else {
        url = `${API_BASE}/api/admin/loan/applications/pending`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/loan/applications/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchApplicationDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/loan/applications/${id}`);
      if (!response.ok) throw new Error('Failed to fetch details');
      const data = await response.json();
      setSelectedApp(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching details:', error);
      alert('Failed to load application details');
    }
  };

  const viewDetails = (app) => {
    fetchApplicationDetails(app.id);
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/loan/applications/${selectedApp.id}/approve?adminUsername=admin`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve application');
      }

      alert(`✅ ${data.message}`);
      
      if (selectedUser) {
        await fetchUserApplications(selectedUser.id);
      } else {
        await fetchApplications();
      }
      await fetchStats();
      setShowDetailsModal(false);
      setSelectedApp(null);
      
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectReason.trim()) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/loan/applications/${selectedApp.id}/reject?adminUsername=admin&reason=${encodeURIComponent(rejectReason)}`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject application');
      }

      alert(`❌ ${data.message}`);
      
      if (selectedUser) {
        await fetchUserApplications(selectedUser.id);
      } else {
        await fetchApplications();
      }
      await fetchStats();
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setSelectedApp(null);
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
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' };
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

  if (loading && applications.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading applications...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Loan Applications</h2>
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

        {selectedUser && (
          <div style={styles.userInfoCard}>
            <div style={styles.userInfoHeader}>
              <h3 style={styles.userName}>{selectedUser.firstName} {selectedUser.lastName}</h3>
              <button style={styles.clearButton} onClick={clearUserFilter}>
                Clear Filter
              </button>
            </div>
            <div style={styles.userInfoGrid}>
              <div style={styles.userInfoItem}>
                <div style={styles.userInfoLabel}>Email</div>
                <div style={styles.userInfoValue}>{selectedUser.email}</div>
              </div>
              <div style={styles.userInfoItem}>
                <div style={styles.userInfoLabel}>Total Applications</div>
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
        {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            style={{...styles.filterButton, ...(filter === status ? styles.activeFilter : {})}}
            onClick={() => setFilter(status)}
          >
            {status}
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
        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No {filter.toLowerCase()} applications found
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Applicant</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Purpose</th>
                <th style={styles.th}>Term</th>
                <th style={styles.th}>Submitted</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => {
                const status = getStatusBadge(app.status);
                return (
                  <tr key={app.id}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '500' }}>{app.userFirstName} {app.userLastName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{app.userEmail}</div>
                    </td>
                    <td style={styles.td}>{formatCurrency(app.requestedAmount)}</td>
                    <td style={styles.td}>{app.loanPurpose}</td>
                    <td style={styles.td}>{app.requestedTermMonths} months</td>
                    <td style={styles.td}>{formatDate(app.submittedAt)}</td>
                    <td style={styles.td}>
                      <span style={{...styles.statusBadge, background: status.bg, color: status.text}}>
                        {status.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.viewButton} onClick={() => viewDetails(app)}>
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
      {showDetailsModal && selectedApp && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Loan Application Details</h3>
            
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Applicant Information</h4>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Name:</span>
                <span style={styles.detailValue}>{selectedApp.userFirstName} {selectedApp.userLastName}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Email:</span>
                <span style={styles.detailValue}>{selectedApp.userEmail}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Phone:</span>
                <span style={styles.detailValue}>{selectedApp.userPhone || 'N/A'}</span>
              </div>
            </div>

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Loan Details</h4>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Amount:</span>
                <span style={styles.detailValue}>{formatCurrency(selectedApp.requestedAmount)}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Purpose:</span>
                <span style={styles.detailValue}>{selectedApp.loanPurpose}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Term:</span>
                <span style={styles.detailValue}>{selectedApp.requestedTermMonths} months</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Reason:</span>
                <span style={styles.detailValue}>{selectedApp.reason || 'N/A'}</span>
              </div>
            </div>

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Employment & Income</h4>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Employment Status:</span>
                <span style={styles.detailValue}>{selectedApp.employmentStatus || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Annual Income:</span>
                <span style={styles.detailValue}>{formatCurrency(selectedApp.annualIncome)}</span>
              </div>
              {selectedApp.employerName && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Employer:</span>
                  <span style={styles.detailValue}>{selectedApp.employerName}</span>
                </div>
              )}
              {selectedApp.yearsAtEmployer && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Years at Employer:</span>
                  <span style={styles.detailValue}>{selectedApp.yearsAtEmployer}</span>
                </div>
              )}
            </div>

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Submission Info</h4>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Submitted:</span>
                <span style={styles.detailValue}>{formatDate(selectedApp.submittedAt)}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Existing Loans:</span>
                <span style={styles.detailValue}>{selectedApp.existingLoanCount || 0}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status:</span>
                <span style={styles.detailValue}>
                  <span style={{...styles.statusBadge, background: getStatusBadge(selectedApp.status).bg, color: getStatusBadge(selectedApp.status).text}}>
                    {getStatusBadge(selectedApp.status).label}
                  </span>
                </span>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              {selectedApp.status === 'PENDING' && (
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
            <h3 style={styles.modalTitle}>Reject Application</h3>
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
