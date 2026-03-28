import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "";

const AdminApplications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch applications on component mount and when filter changes
  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/api/admin/business/applications`;
      if (filter !== 'ALL') {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app) => {
    if (!window.confirm(`Approve business application for ${app.businessName}?`)) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/business/applications/${app.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Admin' })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve application');
      }

      alert(`✅ Business account approved! Email sent to ${app.businessEmail}`);
      fetchApplications(); // Refresh the list
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (app) => {
    setSelectedApp(app);
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/business/applications/${selectedApp.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: rejectReason,
          rejectedBy: 'Admin'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject application');
      }

      alert(`❌ Application rejected. Reason: ${rejectReason}\nEmail sent to ${selectedApp.businessEmail}`);
      setShowRejectModal(false);
      setSelectedApp(null);
      setRejectReason('');
      fetchApplications(); // Refresh the list
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return '#eab308';
      case 'APPROVED': return '#22c55e';
      case 'REJECTED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  // Calculate stats
  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
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
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '15px',
      flexWrap: 'wrap'
    },
    filterButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      background: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s'
    },
    activeFilter: {
      background: '#667eea',
      color: 'white',
      borderColor: '#667eea'
    },
    table: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'auto'
    },
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: '0.5fr 1.5fr 1fr 1fr 1fr 1fr 1.5fr',
      padding: '15px',
      background: '#f8fafc',
      borderRadius: '8px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px'
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '0.5fr 1.5fr 1fr 1fr 1fr 1fr 1.5fr',
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      alignItems: 'center'
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      textAlign: 'center',
      display: 'inline-block',
      width: '80px'
    },
    actionButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      marginRight: '8px'
    },
    approveButton: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      marginRight: '8px'
    },
    rejectButton: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer'
    },
    modal: {
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
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333'
    },
    detailRow: {
      display: 'flex',
      marginBottom: '12px',
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    detailLabel: {
      width: '140px',
      color: '#666',
      fontSize: '14px'
    },
    detailValue: {
      flex: 1,
      fontWeight: '500',
      color: '#333'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '20px',
      minHeight: '100px'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div>Loading applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error Loading Applications</h2>
        <p>{error}</p>
        <button style={styles.retryButton} onClick={fetchApplications}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Business Applications Management</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Applications</div>
          <div style={styles.statValue}>{applications.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pending Review</div>
          <div style={styles.statValue}>{pendingCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Approved</div>
          <div style={styles.statValue}>{approvedCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Rejected</div>
          <div style={styles.statValue}>{rejectedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <button 
          style={{...styles.filterButton, ...(filter === 'PENDING' ? styles.activeFilter : {})}}
          onClick={() => setFilter('PENDING')}
        >
          Pending
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'APPROVED' ? styles.activeFilter : {})}}
          onClick={() => setFilter('APPROVED')}
        >
          Approved
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'REJECTED' ? styles.activeFilter : {})}}
          onClick={() => setFilter('REJECTED')}
        >
          Rejected
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'ALL' ? styles.activeFilter : {})}}
          onClick={() => setFilter('ALL')}
        >
          All
        </button>
      </div>

      {/* Applications Table */}
      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div>ID</div>
          <div>Business Name</div>
          <div>Owner</div>
          <div>Type</div>
          <div>Submitted</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        
        {applications.length > 0 ? (
          applications.map((app) => (
            <div key={app.id} style={styles.tableRow}>
              <div>#{app.id}</div>
              <div style={{fontWeight: '500'}}>{app.businessName}</div>
              <div>
                <div>{app.ownerName || 'N/A'}</div>
                <div style={{color: '#666', fontSize: '12px'}}>{app.businessEmail}</div>
              </div>
              <div>{app.businessType}</div>
              <div>{formatDate(app.createdDate)}</div>
              <div>
                <span style={{...styles.statusBadge, background: `${getStatusColor(app.status)}20`, color: getStatusColor(app.status)}}>
                  {app.status}
                </span>
              </div>
              <div>
                <button 
                  style={styles.actionButton}
                  onClick={() => {
                    setSelectedApp(app);
                    setShowDetails(true);
                  }}
                >
                  View
                </button>
                {app.status === 'PENDING' && (
                  <>
                    <button 
                      style={styles.approveButton}
                      onClick={() => handleApprove(app)}
                      disabled={actionLoading}
                    >
                      ✓
                    </button>
                    <button 
                      style={styles.rejectButton}
                      onClick={() => handleReject(app)}
                      disabled={actionLoading}
                    >
                      ✗
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
            No applications found matching your criteria
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedApp && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Business Application Details</h2>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Application ID:</div>
              <div style={styles.detailValue}>#{selectedApp.id}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Business Name:</div>
              <div style={styles.detailValue}>{selectedApp.businessName}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Owner:</div>
              <div style={styles.detailValue}>{selectedApp.ownerName || selectedApp.applicant || 'N/A'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Email:</div>
              <div style={styles.detailValue}>{selectedApp.businessEmail || selectedApp.email}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Phone:</div>
              <div style={styles.detailValue}>{selectedApp.businessPhone || 'N/A'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>EIN:</div>
              <div style={styles.detailValue}>{selectedApp.maskedEin || selectedApp.ein || 'N/A'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Business Type:</div>
              <div style={styles.detailValue}>{selectedApp.businessType}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Industry:</div>
              <div style={styles.detailValue}>{selectedApp.industry}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Years in Operation:</div>
              <div style={styles.detailValue}>{selectedApp.yearsInOperation || 'N/A'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Annual Revenue:</div>
              <div style={styles.detailValue}>{selectedApp.annualRevenue ? formatCurrency(selectedApp.annualRevenue) : 'N/A'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Employees:</div>
              <div style={styles.detailValue}>{selectedApp.numberOfEmployees || 'N/A'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Address:</div>
              <div style={styles.detailValue}>{selectedApp.fullBusinessAddress || selectedApp.businessAddress || 'N/A'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Submitted:</div>
              <div style={styles.detailValue}>{formatDate(selectedApp.createdDate || selectedApp.submitted)}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Status:</div>
              <div style={styles.detailValue}>
                <span style={{...styles.statusBadge, background: `${getStatusColor(selectedApp.status)}20`, color: getStatusColor(selectedApp.status)}}>
                  {selectedApp.status}
                </span>
              </div>
            </div>

            <div style={styles.modalButtons}>
              <button 
                style={styles.backButton}
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              {selectedApp.status === 'PENDING' && (
                <>
                  <button 
                    style={styles.approveButton}
                    onClick={() => {
                      handleApprove(selectedApp);
                      setShowDetails(false);
                    }}
                    disabled={actionLoading}
                  >
                    Approve
                  </button>
                  <button 
                    style={styles.rejectButton}
                    onClick={() => {
                      setShowDetails(false);
                      handleReject(selectedApp);
                    }}
                    disabled={actionLoading}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div style={styles.modal} onClick={() => setShowRejectModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Reject Business Application</h2>
            <p style={{marginBottom: '20px', color: '#666'}}>
              Rejecting application for <strong>{selectedApp.businessName}</strong>
            </p>
            
            <textarea
              style={styles.textarea}
              placeholder="Please provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div style={styles.modalButtons}>
              <button 
                style={{...styles.backButton, background: '#666'}}
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                style={styles.rejectButton}
                onClick={submitRejection}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
