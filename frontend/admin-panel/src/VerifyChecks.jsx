import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "";

const VerifyChecks = () => {
  const navigate = useNavigate();
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Fetch checks based on active tab
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingChecks();
    } else if (activeTab === 'approved') {
      fetchApprovedChecks();
    } else if (activeTab === 'rejected') {
      fetchRejectedChecks();
    }
    fetchStats();
  }, [activeTab]);

  const fetchPendingChecks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/checks/pending`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending checks');
      }
      
      const data = await response.json();
      setChecks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedChecks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/checks/approved`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch approved checks');
      }
      
      const data = await response.json();
      setChecks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRejectedChecks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/checks/rejected`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch rejected checks');
      }
      
      const data = await response.json();
      setChecks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/checks/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Filter checks by search term
  const filteredChecks = checks.filter(check => {
    const searchLower = searchTerm.toLowerCase();
    return (
      check.userName?.toLowerCase().includes(searchLower) ||
      check.userEmail?.toLowerCase().includes(searchLower) ||
      check.checkNumber?.toLowerCase().includes(searchLower) ||
      check.amount?.toString().includes(searchLower) ||
      check.payeeName?.toLowerCase().includes(searchLower)
    );
  });

  const handleApprove = async (checkId) => {
    if (!window.confirm('Are you sure you want to approve this check? The amount will be credited to the user\'s account.')) {
      return;
    }

    setProcessingId(checkId);
    try {
      const response = await fetch(`${API_BASE}/api/admin/checks/${checkId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve check');
      }

      // Remove from list if in pending tab
      if (activeTab === 'pending') {
        setChecks(checks.filter(c => c.id !== checkId));
      }
      
      // Refresh stats
      fetchStats();
      alert('✅ Check approved successfully! Email notification sent to user.');
      
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessingId(selectedCheck.id);
    try {
      const response = await fetch(`${API_BASE}/api/admin/checks/${selectedCheck.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject check');
      }

      // Remove from list if in pending tab
      if (activeTab === 'pending') {
        setChecks(checks.filter(c => c.id !== selectedCheck.id));
      }
      
      setShowRejectModal(false);
      setSelectedCheck(null);
      setRejectionReason('');
      
      // Refresh stats
      fetchStats();
      alert('❌ Check rejected successfully! Email notification sent to user.');
      
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const viewCheckDetails = (check) => {
    setSelectedCheck(check);
  };

  const closeDetails = () => {
    setSelectedCheck(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: { bg: '#fef3c7', text: '#92400e' },
      APPROVED: { bg: '#d1fae5', text: '#065f46' },
      REJECTED: { bg: '#fee2e2', text: '#991b1b' }
    };
    const color = colors[status] || colors.PENDING;
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: color.bg,
        color: color.text
      }}>
        {status}
      </span>
    );
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '20px'
    },
    header: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px 30px',
      marginBottom: '20px',
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
      padding: '10px 20px',
      background: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      marginBottom: '20px'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '5px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#666'
    },
    tabsContainer: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '10px',
      marginBottom: '20px'
    },
    tab: {
      padding: '10px 20px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      color: '#666',
      borderRadius: '8px',
      transition: 'all 0.2s'
    },
    activeTab: {
      background: '#667eea',
      color: 'white'
    },
    searchContainer: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px'
    },
    searchInput: {
      flex: 1,
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px'
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
      padding: '12px',
      borderBottom: '2px solid #e5e7eb',
      color: '#666',
      fontSize: '14px',
      fontWeight: '600'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '14px',
      color: '#333'
    },
    actionButton: {
      padding: '6px 12px',
      margin: '0 4px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    approveButton: {
      background: '#22c55e',
      color: 'white'
    },
    rejectButton: {
      background: '#ef4444',
      color: 'white'
    },
    viewButton: {
      background: '#3b82f6',
      color: 'white'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    modalHeader: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333'
    },
    modalBody: {
      marginBottom: '20px'
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '100px',
      marginBottom: '10px'
    },
    cancelButton: {
      padding: '10px 20px',
      background: '#9ca3af',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    submitButton: {
      padding: '10px 20px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      fontSize: '18px',
      color: '#666'
    },
    errorContainer: {
      background: '#fee2e2',
      color: '#991b1b',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center'
    },
    emptyContainer: {
      textAlign: 'center',
      padding: '40px',
      color: '#666',
      fontSize: '16px'
    },
    imagePreview: {
      maxWidth: '100%',
      maxHeight: '300px',
      objectFit: 'contain',
      marginBottom: '10px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginBottom: '20px'
    }
  };

  if (loading && checks.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Verify Checks</h1>
          <button 
            style={styles.backButton}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
          >
            ← Back to Dashboard
          </button>
        </div>
        <div style={styles.loadingContainer}>Loading checks...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Verify Checks</h1>
        <button 
          style={styles.backButton}
          onClick={() => navigate('/dashboard')}
          onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsRow}>
        <div style={{...styles.statCard, borderTop: '4px solid #fbbf24'}}>
          <div style={styles.statNumber}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending Checks</div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #22c55e'}}>
          <div style={styles.statNumber}>{stats.approved}</div>
          <div style={styles.statLabel}>Approved Checks</div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #ef4444'}}>
          <div style={styles.statNumber}>{stats.rejected}</div>
          <div style={styles.statLabel}>Rejected Checks</div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabs}>
          <button 
            style={{...styles.tab, ...(activeTab === 'pending' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button 
            style={{...styles.tab, ...(activeTab === 'approved' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({stats.approved})
          </button>
          <button 
            style={{...styles.tab, ...(activeTab === 'rejected' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        <div style={styles.searchContainer}>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search by user name, email, check number, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Checks Table */}
        <div style={styles.tableContainer}>
          {filteredChecks.length === 0 ? (
            <div style={styles.emptyContainer}>
              {searchTerm ? 'No checks match your search' : `No ${activeTab} checks found`}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Check #</th>
                  <th style={styles.th}>Payee</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChecks.map((check) => (
                  <tr key={check.id}>
                    <td style={styles.td}>{formatDate(check.submittedAt)}</td>
                    <td style={styles.td}>
                      <div>{check.userName}</div>
                      <div style={{fontSize: '12px', color: '#666'}}>{check.userEmail}</div>
                    </td>
                    <td style={styles.td}>{check.checkNumber}</td>
                    <td style={styles.td}>{check.payeeName}</td>
                    <td style={styles.td}><strong>{formatCurrency(check.amount)}</strong></td>
                    <td style={styles.td}>{getStatusBadge(check.status)}</td>
                    <td style={styles.td}>
                      <button 
                        style={{...styles.actionButton, ...styles.viewButton}}
                        onClick={() => viewCheckDetails(check)}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                      >
                        View
                      </button>
                      
                      {activeTab === 'pending' && (
                        <>
                          <button 
                            style={{...styles.actionButton, ...styles.approveButton, marginLeft: '8px'}}
                            onClick={() => handleApprove(check.id)}
                            disabled={processingId === check.id}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#16a34a'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#22c55e'}
                          >
                            {processingId === check.id ? '...' : 'Approve'}
                          </button>
                          <button 
                            style={{...styles.actionButton, ...styles.rejectButton, marginLeft: '8px'}}
                            onClick={() => {
                              setSelectedCheck(check);
                              setShowRejectModal(true);
                            }}
                            disabled={processingId === check.id}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {activeTab === 'rejected' && check.rejectionReason && (
                        <span style={{fontSize: '12px', color: '#991b1b', marginLeft: '8px'}}>
                          Reason: {check.rejectionReason.substring(0, 20)}...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Check Details Modal */}
      {selectedCheck && !showRejectModal && (
        <div style={styles.modalOverlay} onClick={closeDetails}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              Check Details - #{selectedCheck.checkNumber}
            </div>
            
            <div style={styles.modalBody}>
              {/* Images */}
              <div style={styles.imageGrid}>
                {selectedCheck.frontImagePath && (
                  <div>
                    <strong>Front:</strong>
                    <img 
                      src={`${API_BASE}${selectedCheck.frontImagePath}`} 
                      alt="Check front" 
                      style={styles.imagePreview}
                    />
                  </div>
                )}
                {selectedCheck.backImagePath && (
                  <div>
                    <strong>Back:</strong>
                    <img 
                      src={`${API_BASE}${selectedCheck.backImagePath}`} 
                      alt="Check back" 
                      style={styles.imagePreview}
                    />
                  </div>
                )}
              </div>

              {/* Details */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div><strong>Amount:</strong> {formatCurrency(selectedCheck.amount)}</div>
                <div><strong>Check #:</strong> {selectedCheck.checkNumber}</div>
                <div><strong>Routing #:</strong> {selectedCheck.routingNumber}</div>
                <div><strong>Account #:</strong> {selectedCheck.accountNumber}</div>
                <div><strong>Payee:</strong> {selectedCheck.payeeName}</div>
                <div><strong>Check Date:</strong> {formatDate(selectedCheck.checkDate)}</div>
                <div><strong>Submitted:</strong> {formatDate(selectedCheck.submittedAt)}</div>
                <div><strong>Status:</strong> {getStatusBadge(selectedCheck.status)}</div>
              </div>
              
              {selectedCheck.rejectionReason && (
                <div style={{marginTop: '15px', padding: '10px', background: '#fee2e2', borderRadius: '8px'}}>
                  <strong>Rejection Reason:</strong> {selectedCheck.rejectionReason}
                </div>
              )}

              <div style={{marginTop: '15px', padding: '10px', background: '#f3f4f6', borderRadius: '8px'}}>
                <strong>User:</strong> {selectedCheck.userName} ({selectedCheck.userEmail})
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={{...styles.cancelButton, background: '#6b7280'}}
                onClick={closeDetails}
                onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCheck && (
        <div style={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              Reject Check - #{selectedCheck.checkNumber}
            </div>
            
            <div style={styles.modalBody}>
              <p style={{marginBottom: '10px', color: '#666'}}>
                Please provide a reason for rejecting this check:
              </p>
              <textarea
                style={styles.textarea}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Signature missing, Amount mismatch, etc."
              />
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.cancelButton}
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedCheck(null);
                  setRejectionReason('');
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#9ca3af'}
              >
                Cancel
              </button>
              <button 
                style={{...styles.submitButton, ...(processingId === selectedCheck.id ? {opacity: 0.5} : {})}}
                onClick={handleReject}
                disabled={processingId === selectedCheck.id}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                {processingId === selectedCheck.id ? 'Rejecting...' : 'Reject Check'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyChecks;
