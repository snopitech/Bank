import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminClaims = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [resolution, setResolution] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [claimStatus, setClaimStatus] = useState('');

  const [claims] = useState([
    {
      id: 'CLM-1001',
      claimNumber: 'CLM-20260217001',
      customer: 'Michael Agbonifo',
      email: 'michael@snopitech.com',
      accountId: 1,
      accountNumber: '****2213',
      type: 'UNAUTHORIZED_TRANSACTION',
      subject: 'Unauthorized Amazon Charge',
      description: 'I noticed a charge on my account for $299.99 that I did not authorize.',
      amount: 299.99,
      transactionDate: '2026-02-14',
      merchantName: 'Amazon.com',
      priority: 'HIGH',
      status: 'SUBMITTED',
      filedDate: '2026-02-15T10:30:00',
      documents: 2
    },
    {
      id: 'CLM-1002',
      claimNumber: 'CLM-20260216002',
      customer: 'Cynthia Ekeh',
      email: 'cynthiaekeh360@gmail.com',
      accountId: 3,
      accountNumber: '****8924',
      type: 'DUPLICATE_CHARGE',
      subject: 'Double Charge for Netflix',
      description: 'I was charged twice for my Netflix subscription this month.',
      amount: 29.98,
      transactionDate: '2026-02-10',
      merchantName: 'Netflix',
      priority: 'MEDIUM',
      status: 'UNDER_REVIEW',
      filedDate: '2026-02-16T14:20:00',
      documents: 1
    },
    {
      id: 'CLM-1003',
      claimNumber: 'CLM-20260216003',
      customer: 'Tracy Agbonifo',
      email: 'tracy@email.com',
      accountId: 10,
      accountNumber: '****2326',
      type: 'FRAUD',
      subject: 'ATM Card Skimming',
      description: 'I believe my card was skimmed at an ATM. Multiple unauthorized withdrawals.',
      amount: 1200.00,
      transactionDate: '2026-02-15',
      merchantName: 'ATM Withdrawal',
      priority: 'URGENT',
      status: 'APPROVED',
      filedDate: '2026-02-16T09:15:00',
      documents: 3,
      resolution: 'Claim approved. Amount credited to account. New card being issued.'
    },
    {
      id: 'CLM-1004',
      claimNumber: 'CLM-20260215004',
      customer: 'Bose Agbonifo',
      email: 'bose@email.com',
      accountId: 11,
      accountNumber: '****1180',
      type: 'SERVICE_ISSUE',
      subject: 'Wire Transfer Not Received',
      description: 'I sent a wire transfer 5 days ago but recipient still hasn\'t received it.',
      amount: 5000.00,
      transactionDate: '2026-02-10',
      merchantName: 'Wire Transfer',
      priority: 'HIGH',
      status: 'REJECTED',
      filedDate: '2026-02-15T11:45:00',
      documents: 2,
      resolution: 'Wire transfer was sent to incorrect account number. Customer provided wrong details.'
    },
    {
      id: 'CLM-1005',
      claimNumber: 'CLM-20260217005',
      customer: 'Test User',
      email: 'test@email.com',
      accountId: 8,
      accountNumber: '****0339',
      type: 'UNAUTHORIZED_TRANSACTION',
      subject: 'Unknown Charge from Uber',
      description: 'I have not used Uber recently but see a charge for $45.67',
      amount: 45.67,
      transactionDate: '2026-02-16',
      merchantName: 'Uber',
      priority: 'MEDIUM',
      status: 'SUBMITTED',
      filedDate: '2026-02-17T08:30:00',
      documents: 0
    },
    {
      id: 'CLM-1006',
      claimNumber: 'CLM-20260214006',
      customer: 'Michael Agbonifo',
      email: 'michael@snopitech.com',
      accountId: 1,
      accountNumber: '****2213',
      type: 'OTHER',
      subject: 'Wrong Fee Applied',
      description: 'I was charged a $35 overdraft fee but I had sufficient funds.',
      amount: 35.00,
      transactionDate: '2026-02-12',
      merchantName: 'Bank Fee',
      priority: 'LOW',
      status: 'RESOLVED',
      filedDate: '2026-02-14T13:20:00',
      documents: 1,
      resolution: 'Fee waived as courtesy. Amount credited to account.'
    }
  ]);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'SUBMITTED': return '#3b82f6';
      case 'UNDER_REVIEW': return '#eab308';
      case 'APPROVED': return '#22c55e';
      case 'REJECTED': return '#ef4444';
      case 'RESOLVED': return '#8b5cf6';
      case 'CLOSED': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'UNAUTHORIZED_TRANSACTION': return 'Unauthorized';
      case 'DUPLICATE_CHARGE': return 'Duplicate';
      case 'FRAUD': return 'Fraud';
      case 'SERVICE_ISSUE': return 'Service Issue';
      case 'OTHER': return 'Other';
      default: return type;
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'submitted') return matchesSearch && claim.status === 'SUBMITTED';
    if (filter === 'under-review') return matchesSearch && claim.status === 'UNDER_REVIEW';
    if (filter === 'approved') return matchesSearch && claim.status === 'APPROVED';
    if (filter === 'urgent') return matchesSearch && claim.priority === 'URGENT';
    if (filter === 'high') return matchesSearch && claim.priority === 'HIGH';
    return matchesSearch;
  });

  const handleStatusChange = (claimId, newStatus) => {
    if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
      setSelectedClaim(claims.find(c => c.id === claimId));
      setClaimStatus(newStatus);
      setShowResolveModal(true);
    } else {
      alert(`Claim ${claimId} status updated to ${newStatus}`);
    }
  };

  const handleResolve = () => {
    if (!resolution.trim()) {
      alert('Please provide a resolution note');
      return;
    }
    alert(`Claim ${selectedClaim.id} ${claimStatus}. Resolution: ${resolution}`);
    setShowResolveModal(false);
    setResolution('');
    setSelectedClaim(null);
  };

  const stats = {
    total: claims.length,
    submitted: claims.filter(c => c.status === 'SUBMITTED').length,
    underReview: claims.filter(c => c.status === 'UNDER_REVIEW').length,
    urgent: claims.filter(c => c.priority === 'URGENT').length,
    totalAmount: claims.reduce((sum, c) => sum + c.amount, 0).toLocaleString()
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
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    searchInput: {
      flex: 1,
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '250px'
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
      gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 1fr 1fr 1.5fr 2fr',
      padding: '15px',
      background: '#f8fafc',
      borderRadius: '8px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px'
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 1fr 1fr 1.5fr 2fr',
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      alignItems: 'center'
    },
    priorityBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      width: '70px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      width: '90px'
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
      maxWidth: '600px',
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
    descriptionBox: {
      background: '#f9f9f9',
      padding: '15px',
      borderRadius: '8px',
      margin: '15px 0',
      fontSize: '14px',
      color: '#333'
    },
    resolutionBox: {
      background: '#f0fdf4',
      padding: '15px',
      borderRadius: '8px',
      margin: '15px 0',
      fontSize: '14px',
      color: '#166534',
      border: '1px solid #86efac'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '20px',
      background: 'white'
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
    documentTag: {
      display: 'inline-block',
      background: '#f0f0f0',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      marginRight: '5px',
      marginBottom: '5px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Claims & Disputes</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Claims</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Submitted</div>
          <div style={{...styles.statValue, color: '#3b82f6'}}>{stats.submitted}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Under Review</div>
          <div style={{...styles.statValue, color: '#eab308'}}>{stats.underReview}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Amount</div>
          <div style={{...styles.statValue, color: '#ef4444'}}>${stats.totalAmount}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by claim number, customer, subject..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          style={{...styles.filterButton, ...(filter === 'all' ? styles.activeFilter : {})}}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'submitted' ? styles.activeFilter : {})}}
          onClick={() => setFilter('submitted')}
        >
          📝 Submitted
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'under-review' ? styles.activeFilter : {})}}
          onClick={() => setFilter('under-review')}
        >
          🔍 Under Review
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'urgent' ? styles.activeFilter : {})}}
          onClick={() => setFilter('urgent')}
        >
          ⚠️ Urgent
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'high' ? styles.activeFilter : {})}}
          onClick={() => setFilter('high')}
        >
          🔴 High Priority
        </button>
      </div>

      {/* Claims Table */}
      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div>Claim #</div>
          <div>Customer</div>
          <div>Subject</div>
          <div>Type</div>
          <div>Amount</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        
        {filteredClaims.map((claim) => (
          <div key={claim.id} style={styles.tableRow}>
            <div style={{fontSize: '12px', fontWeight: '500'}}>{claim.claimNumber}</div>
            <div>
              <div style={{fontWeight: '500', fontSize: '13px'}}>{claim.customer}</div>
              <div style={{color: '#666', fontSize: '11px'}}>{claim.accountNumber}</div>
            </div>
            <div>
              <div style={{fontWeight: '500', fontSize: '13px'}}>{claim.subject}</div>
              <div style={{color: '#666', fontSize: '11px'}}>{claim.merchantName}</div>
            </div>
            <div style={{fontSize: '12px'}}>{getTypeLabel(claim.type)}</div>
            <div style={{fontWeight: 'bold', color: claim.amount > 1000 ? '#ef4444' : '#333'}}>
              ${claim.amount.toFixed(2)}
            </div>
            <div>
              <span style={{...styles.priorityBadge, background: `${getPriorityColor(claim.priority)}20`, color: getPriorityColor(claim.priority)}}>
                {claim.priority}
              </span>
            </div>
            <div>
              <span style={{...styles.statusBadge, background: `${getStatusColor(claim.status)}20`, color: getStatusColor(claim.status)}}>
                {claim.status}
              </span>
            </div>
            <div>
              <button 
                style={styles.actionButton}
                onClick={() => {
                  setSelectedClaim(claim);
                  setShowDetails(true);
                }}
              >
                View
              </button>
              {claim.status === 'SUBMITTED' && (
                <>
                  <button 
                    style={styles.approveButton}
                    onClick={() => handleStatusChange(claim.id, 'UNDER_REVIEW')}
                  >
                    Review
                  </button>
                </>
              )}
              {claim.status === 'UNDER_REVIEW' && (
                <>
                  <button 
                    style={styles.approveButton}
                    onClick={() => handleStatusChange(claim.id, 'APPROVED')}
                  >
                    Approve
                  </button>
                  <button 
                    style={styles.rejectButton}
                    onClick={() => handleStatusChange(claim.id, 'REJECTED')}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredClaims.length === 0 && (
          <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
            No claims found matching your criteria
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedClaim && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Claim Details - {selectedClaim.claimNumber}</h2>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Customer:</div>
              <div style={styles.detailValue}>{selectedClaim.customer} ({selectedClaim.email})</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Account:</div>
              <div style={styles.detailValue}>{selectedClaim.accountNumber}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Type:</div>
              <div style={styles.detailValue}>{selectedClaim.type}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Subject:</div>
              <div style={styles.detailValue}>{selectedClaim.subject}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Amount:</div>
              <div style={{...styles.detailValue, fontWeight: 'bold', color: '#ef4444'}}>
                ${selectedClaim.amount.toFixed(2)}
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Merchant:</div>
              <div style={styles.detailValue}>{selectedClaim.merchantName}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Transaction Date:</div>
              <div style={styles.detailValue}>{selectedClaim.transactionDate}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Filed Date:</div>
              <div style={styles.detailValue}>{new Date(selectedClaim.filedDate).toLocaleString()}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Priority:</div>
              <div>
                <span style={{...styles.priorityBadge, background: `${getPriorityColor(selectedClaim.priority)}20`, color: getPriorityColor(selectedClaim.priority)}}>
                  {selectedClaim.priority}
                </span>
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Status:</div>
              <div>
                <span style={{...styles.statusBadge, background: `${getStatusColor(selectedClaim.status)}20`, color: getStatusColor(selectedClaim.status)}}>
                  {selectedClaim.status}
                </span>
              </div>
            </div>

            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Description:</div>
            </div>
            <div style={styles.descriptionBox}>
              {selectedClaim.description}
            </div>

            {selectedClaim.resolution && (
              <>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Resolution:</div>
                </div>
                <div style={styles.resolutionBox}>
                  {selectedClaim.resolution}
                </div>
              </>
            )}

            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Documents:</div>
              <div>
                {selectedClaim.documents > 0 ? (
                  <span style={styles.documentTag}>
                    📎 {selectedClaim.documents} document(s) uploaded
                  </span>
                ) : (
                  <span style={{color: '#999'}}>No documents</span>
                )}
              </div>
            </div>

            <div style={styles.modalButtons}>
              {selectedClaim.status === 'SUBMITTED' && (
                <button 
                  style={styles.actionButton}
                  onClick={() => {
                    handleStatusChange(selectedClaim.id, 'UNDER_REVIEW');
                    setShowDetails(false);
                  }}
                >
                  Move to Review
                </button>
              )}
              {selectedClaim.status === 'UNDER_REVIEW' && (
                <>
                  <button 
                    style={styles.approveButton}
                    onClick={() => {
                      setShowDetails(false);
                      handleStatusChange(selectedClaim.id, 'APPROVED');
                    }}
                  >
                    Approve
                  </button>
                  <button 
                    style={styles.rejectButton}
                    onClick={() => {
                      setShowDetails(false);
                      handleStatusChange(selectedClaim.id, 'REJECTED');
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
              <button 
                style={{...styles.backButton, background: '#666'}}
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedClaim && (
        <div style={styles.modal} onClick={() => setShowResolveModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {claimStatus === 'APPROVED' ? 'Approve' : 'Reject'} Claim
            </h2>
            <p style={{marginBottom: '20px', color: '#666'}}>
              {claimStatus === 'APPROVED' 
                ? `Approving claim #${selectedClaim.claimNumber} for $${selectedClaim.amount}`
                : `Rejecting claim #${selectedClaim.claimNumber}`}
            </p>
            
            <textarea
              style={styles.textarea}
              placeholder={claimStatus === 'APPROVED' 
                ? "Resolution notes (e.g., Amount credited, New card issued, etc.)" 
                : "Reason for rejection (will be sent to customer)"}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />

            <div style={styles.modalButtons}>
              <button 
                style={{...styles.backButton, background: '#666'}}
                onClick={() => {
                  setShowResolveModal(false);
                  setResolution('');
                }}
              >
                Cancel
              </button>
              <button 
                style={claimStatus === 'APPROVED' ? styles.approveButton : styles.rejectButton}
                onClick={handleResolve}
              >
                Confirm {claimStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaims;