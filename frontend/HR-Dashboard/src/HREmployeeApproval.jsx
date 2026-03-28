/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE = "";

const HREmployeeApproval = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [action, setAction] = useState('');

  useEffect(() => {
    if (!token) {
      setError('No approval token provided');
      setLoading(false);
      return;
    }
    // We don't need to fetch employee data first - we'll use the token when approving
    setLoading(false);
  }, [token]);

  const handleApprove = async () => {
    setAction('approve');
    setActionLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/employees/approve?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: 'HR Administrator',
          sendWelcomeEmail: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve employee');
      }

      setEmployee(data.employee);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/employees');
      }, 5000);

    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setAction('reject');
    setActionLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/employees/reject?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: rejectReason,
          sendNotificationEmail: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject employee');
      }

      setEmployee(data.employee);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/employees');
      }, 5000);

    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h2 style={{ color: '#b91c1c', marginBottom: '16px' }}>Error</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>{error}</p>
            <button
              onClick={() => navigate('/')}
              style={styles.button}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success && employee) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ color: '#22c55e', marginBottom: '16px' }}>
              Employee {action === 'reject' ? 'Rejected' : 'Approved'} Successfully!
            </h2>
            <p style={{ color: '#666', marginBottom: '8px' }}>
              {action === 'reject' ? (
                <>The employee has been rejected and notified.</>
              ) : (
                <>
                  Login credentials have been sent to <strong>{employee.email}</strong>
                </>
              )}
            </p>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Redirecting to employee list in 5 seconds...
            </p>
            <button
              onClick={() => navigate('/employees')}
              style={styles.button}
            >
              Go to Employees Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Employee Approval</h1>
          <button 
            style={styles.backButton}
            onClick={() => navigate('/')}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div style={styles.approvalBox}>
          <div style={styles.warningIcon}>👤</div>
          <h2 style={styles.warningTitle}>Employee Approval Request</h2>
          <p style={styles.warningText}>
            You are about to approve or reject an employee application using the token from your email.
          </p>
          
          <div style={styles.tokenBox}>
            <strong>Token:</strong> <code>{token}</code>
          </div>

          <div style={styles.actionButtons}>
            <button
              style={styles.rejectButton}
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
            >
              Reject Application
            </button>
            <button
              style={styles.approveButton}
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Approve Application'}
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Reject Employee Application</h3>
            <p style={styles.modalText}>
              Please provide a reason for rejection:
            </p>
            
            <textarea
              style={styles.textarea}
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />

            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                Cancel
              </button>
              <button
                style={styles.confirmRejectButton}
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  title: {
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
    cursor: 'pointer',
    fontSize: '14px'
  },
  approvalBox: {
    textAlign: 'center'
  },
  warningIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  warningTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px'
  },
  warningText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: 1.6
  },
  tokenBox: {
    background: '#f5f5f5',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '30px',
    fontFamily: 'monospace',
    wordBreak: 'break-all'
  },
  actionButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center'
  },
  approveButton: {
    background: '#22c55e',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '150px'
  },
  rejectButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '150px'
  },
  button: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
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
    marginBottom: '16px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
    resize: 'vertical'
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
  confirmRejectButton: {
    padding: '8px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

export default HREmployeeApproval;
