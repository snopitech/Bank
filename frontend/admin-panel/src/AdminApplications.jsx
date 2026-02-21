import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminApplications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [applications] = useState([
    { 
      id: 1, 
      type: 'Business', 
      businessName: 'Agbonifo Enterprises LLC', 
      applicant: 'Michael Agbonifo',
      email: 'michael@snopitech.com',
      ein: '12-3456789',
      businessType: 'LLC',
      industry: 'Technology',
      annualRevenue: '$500,000',
      submitted: '2026-02-17',
      status: 'pending',
      priority: 'high'
    },
    { 
      id: 2, 
      type: 'Credit', 
      businessName: 'Michael A.', 
      applicant: 'Michael Agbonifo',
      email: 'michael@snopitech.com',
      requestedLimit: '$5,000',
      creditScore: '720',
      annualIncome: '$125,000',
      submitted: '2026-02-16',
      status: 'pending',
      priority: 'medium'
    },
    { 
      id: 3, 
      type: 'Business', 
      businessName: 'Tech Startup LLC', 
      applicant: 'Cynthia Ekeh',
      email: 'cynthia@email.com',
      ein: '98-7654321',
      businessType: 'LLC',
      industry: 'Software',
      annualRevenue: '$250,000',
      submitted: '2026-02-15',
      status: 'approved',
      priority: 'low'
    },
    { 
      id: 4, 
      type: 'Credit', 
      businessName: 'Tracy A.', 
      applicant: 'Tracy Agbonifo',
      email: 'tracy@email.com',
      requestedLimit: '$10,000',
      creditScore: '680',
      annualIncome: '$95,000',
      submitted: '2026-02-14',
      status: 'rejected',
      priority: 'low'
    },
    { 
      id: 5, 
      type: 'Business', 
      businessName: 'Global Trading Inc', 
      applicant: 'Bose Agbonifo',
      email: 'bose@email.com',
      ein: '45-6789123',
      businessType: 'Corporation',
      industry: 'Retail',
      annualRevenue: '$1,200,000',
      submitted: '2026-02-13',
      status: 'pending',
      priority: 'high'
    }
  ]);

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.status === 'pending';
    if (filter === 'approved') return app.status === 'approved';
    if (filter === 'rejected') return app.status === 'rejected';
    return app.type.toLowerCase() === filter;
  });

  const handleApprove = (app) => {
    if (window.confirm(`Approve ${app.type} application for ${app.businessName}?`)) {
      alert(`✅ Application approved! Email sent to ${app.email}`);
    }
  };

  const handleReject = (app) => {
    setSelectedApp(app);
    setShowRejectModal(true);
  };

  const submitRejection = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    alert(`❌ Application rejected. Reason: ${rejectReason}\nEmail sent to ${selectedApp.email}`);
    setShowRejectModal(false);
    setSelectedApp(null);
    setRejectReason('');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#eab308';
      case 'approved': return '#22c55e';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

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
      gridTemplateColumns: '0.5fr 1fr 1.5fr 1fr 1fr 1fr 1.5fr',
      padding: '15px',
      background: '#f8fafc',
      borderRadius: '8px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px'
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '0.5fr 1fr 1.5fr 1fr 1fr 1fr 1.5fr',
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
    priorityBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      width: '60px',
      textAlign: 'center'
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
      width: '120px',
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
    }
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const businessCount = applications.filter(a => a.type === 'Business').length;
  const creditCount = applications.filter(a => a.type === 'Credit').length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Applications Management</h1>
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
          <div style={styles.statLabel}>Business Apps</div>
          <div style={styles.statValue}>{businessCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Credit Apps</div>
          <div style={styles.statValue}>{creditCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <button 
          style={{...styles.filterButton, ...(filter === 'all' ? styles.activeFilter : {})}}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'pending' ? styles.activeFilter : {})}}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'approved' ? styles.activeFilter : {})}}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'rejected' ? styles.activeFilter : {})}}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'business' ? styles.activeFilter : {})}}
          onClick={() => setFilter('business')}
        >
          Business
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'credit' ? styles.activeFilter : {})}}
          onClick={() => setFilter('credit')}
        >
          Credit
        </button>
      </div>

      {/* Applications Table */}
      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div>ID</div>
          <div>Type</div>
          <div>Business/Applicant</div>
          <div>Submitted</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        
        {filteredApps.map((app) => (
          <div key={app.id} style={styles.tableRow}>
            <div>#{app.id}</div>
            <div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                background: app.type === 'Business' ? '#3b82f620' : '#8b5cf620',
                color: app.type === 'Business' ? '#3b82f6' : '#8b5cf6'
              }}>
                {app.type}
              </span>
            </div>
            <div>
              <div style={{fontWeight: '500'}}>{app.businessName}</div>
              <div style={{color: '#666', fontSize: '12px'}}>{app.applicant}</div>
            </div>
            <div>{app.submitted}</div>
            <div>
              <span style={{...styles.priorityBadge, background: `${getPriorityColor(app.priority)}20`, color: getPriorityColor(app.priority)}}>
                {app.priority}
              </span>
            </div>
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
              {app.status === 'pending' && (
                <>
                  <button 
                    style={styles.approveButton}
                    onClick={() => handleApprove(app)}
                  >
                    ✓
                  </button>
                  <button 
                    style={styles.rejectButton}
                    onClick={() => handleReject(app)}
                  >
                    ✗
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
            No applications found matching your criteria
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedApp && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Application Details</h2>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Application ID:</div>
              <div style={styles.detailValue}>#{selectedApp.id}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Type:</div>
              <div style={styles.detailValue}>{selectedApp.type}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Business Name:</div>
              <div style={styles.detailValue}>{selectedApp.businessName}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Applicant:</div>
              <div style={styles.detailValue}>{selectedApp.applicant}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Email:</div>
              <div style={styles.detailValue}>{selectedApp.email}</div>
            </div>
            
            {selectedApp.type === 'Business' && (
              <>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>EIN:</div>
                  <div style={styles.detailValue}>{selectedApp.ein}</div>
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
                  <div style={styles.detailLabel}>Annual Revenue:</div>
                  <div style={styles.detailValue}>{selectedApp.annualRevenue}</div>
                </div>
              </>
            )}

            {selectedApp.type === 'Credit' && (
              <>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Requested Limit:</div>
                  <div style={styles.detailValue}>{selectedApp.requestedLimit}</div>
                </div>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Credit Score:</div>
                  <div style={styles.detailValue}>{selectedApp.creditScore}</div>
                </div>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Annual Income:</div>
                  <div style={styles.detailValue}>{selectedApp.annualIncome}</div>
                </div>
              </>
            )}

            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Submitted:</div>
              <div style={styles.detailValue}>{selectedApp.submitted}</div>
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
              {selectedApp.status === 'pending' && (
                <>
                  <button 
                    style={styles.approveButton}
                    onClick={() => {
                      handleApprove(selectedApp);
                      setShowDetails(false);
                    }}
                  >
                    Approve
                  </button>
                  <button 
                    style={styles.rejectButton}
                    onClick={() => {
                      setShowDetails(false);
                      handleReject(selectedApp);
                    }}
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
            <h2 style={styles.modalTitle}>Reject Application</h2>
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
              >
                Cancel
              </button>
              <button 
                style={styles.rejectButton}
                onClick={submitRejection}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;