import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8080";

export default function AdminBusinessApplications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/admin/business/applications`;
      if (filter !== 'ALL') {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (app) => {
    setSelectedApp(app);
    setShowDetailsModal(true);
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/business/applications/${selectedApp.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve application');
      }

      // Refresh list and close modal
      await fetchApplications();
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
      const response = await fetch(`${API_BASE}/api/admin/business/applications/${selectedApp.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject application');
      }

      // Refresh list and close modals
      await fetchApplications();
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    container: {
      padding: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
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
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    filterContainer: {
      display: 'flex',
      gap: '8px'
    },
    filterButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: '1px solid #e0e0e0',
      background: 'white',
      cursor: 'pointer',
      fontSize: '13px'
    },
    activeFilter: {
      background: '#667eea',
      color: 'white',
      borderColor: '#667eea'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      background: 'white',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    statLabel: {
      fontSize: '13px',
      color: '#666',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333'
    },
    tableCard: {
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '12px',
      borderBottom: '2px solid #f0f0f0',
      fontSize: '12px',
      fontWeight: '600',
      color: '#666',
      textTransform: 'uppercase'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '14px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      display: 'inline-block'
    },
    viewButton: {
      background: 'none',
      border: '1px solid #e0e0e0',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      color: '#667eea'
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
    modal: {
      background: 'white',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '16px'
    },
    detailRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      marginBottom: '8px',
      fontSize: '14px'
    },
    detailLabel: {
      color: '#666'
    },
    detailValue: {
      fontWeight: '500'
    },
    section: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #f0f0f0'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      marginTop: '20px'
    },
    approveButton: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    rejectButton: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    closeButton: {
      background: '#e0e0e0',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    rejectModal: {
      background: 'white',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%'
    },
    textarea: {
      width: '100%',
      padding: '8px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      marginTop: '8px',
      minHeight: '80px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading applications...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with Back Button */}
      <div style={styles.header}>
        <h2 style={styles.title}>Business Account Applications</h2>
        <button 
          style={styles.backButton}
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={styles.filterContainer}>
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
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Applications</div>
          <div style={styles.statValue}>{applications.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pending</div>
          <div style={styles.statValue}>{applications.filter(a => a.status === 'PENDING').length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Approved</div>
          <div style={styles.statValue}>{applications.filter(a => a.status === 'APPROVED').length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Rejected</div>
          <div style={styles.statValue}>{applications.filter(a => a.status === 'REJECTED').length}</div>
        </div>
      </div>

      {/* Applications Table */}
      <div style={styles.tableCard}>
        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No applications found
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Business Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Industry</th>
                <th style={styles.th}>Annual Revenue</th>
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
                      <div style={{ fontWeight: '500' }}>{app.businessName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>EIN: {app.maskedEin}</div>
                    </td>
                    <td style={styles.td}>{app.businessType}</td>
                    <td style={styles.td}>{app.industry}</td>
                    <td style={styles.td}>{formatCurrency(app.annualRevenue)}</td>
                    <td style={styles.td}>{formatDate(app.createdDate)}</td>
                    <td style={styles.td}>
                      <span style={{...styles.statusBadge, background: status.bg, color: status.text}}>
                        {status.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewButton}
                        onClick={() => viewDetails(app)}
                      >
                        View Details
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
            <h3 style={styles.modalTitle}>Application Details</h3>
            
            {/* Business Info */}
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Business Name:</span>
              <span style={styles.detailValue}>{selectedApp.businessName}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>EIN:</span>
              <span style={styles.detailValue}>{selectedApp.maskedEin}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Business Type:</span>
              <span style={styles.detailValue}>{selectedApp.businessType}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Industry:</span>
              <span style={styles.detailValue}>{selectedApp.industry}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Years in Operation:</span>
              <span style={styles.detailValue}>{selectedApp.yearsInOperation || 'N/A'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Annual Revenue:</span>
              <span style={styles.detailValue}>{formatCurrency(selectedApp.annualRevenue)}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Employees:</span>
              <span style={styles.detailValue}>{selectedApp.numberOfEmployees || 'N/A'}</span>
            </div>

            {/* Address */}
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Business Address</h4>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Address:</span>
                <span style={styles.detailValue}>{selectedApp.businessAddress}</span>
              </div>
              {selectedApp.businessAddress2 && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Address Line 2:</span>
                  <span style={styles.detailValue}>{selectedApp.businessAddress2}</span>
                </div>
              )}
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>City/State/Zip:</span>
                <span style={styles.detailValue}>
                  {selectedApp.businessCity}, {selectedApp.businessState} {selectedApp.businessZipCode}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Country:</span>
                <span style={styles.detailValue}>{selectedApp.businessCountry}</span>
              </div>
            </div>

            {/* Contact */}
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Contact Information</h4>
              {selectedApp.businessPhone && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Phone:</span>
                  <span style={styles.detailValue}>{selectedApp.businessPhone}</span>
                </div>
              )}
              {selectedApp.businessEmail && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Email:</span>
                  <span style={styles.detailValue}>{selectedApp.businessEmail}</span>
                </div>
              )}
              {selectedApp.website && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Website:</span>
                  <span style={styles.detailValue}>{selectedApp.website}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedApp.status === 'PENDING' && (
              <div style={styles.buttonGroup}>
                <button
                  style={styles.approveButton}
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Approve Application'}
                </button>
                <button
                  style={styles.rejectButton}
                  onClick={() => {
                    setShowRejectModal(true);
                    setShowDetailsModal(false);
                  }}
                  disabled={actionLoading}
                >
                  Reject Application
                </button>
                <button
                  style={styles.closeButton}
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            )}

            {selectedApp.status !== 'PENDING' && (
              <div style={styles.buttonGroup}>
                <button
                  style={styles.closeButton}
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            )}
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
              <button
                style={styles.rejectButton}
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
              <button
                style={styles.closeButton}
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}