import { useState } from 'react';

const API_BASE = "";

const ChangePasswordModal = ({ isOpen, onClose, userEmail, onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validatePassword = (password) => {
    return password.length >= 8 &&
           password.length <= 12 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*()]/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate new password
    if (!validatePassword(formData.newPassword)) {
      setError('Password must be 8-12 characters with uppercase, lowercase, number, and special character');
      return;
    }

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/employees/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
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
      borderRadius: '12px',
      padding: '30px',
      width: '90%',
      maxWidth: '400px',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#999'
    },
    errorBox: {
      background: '#fef2f2',
      border: '1px solid #fee2e2',
      borderRadius: '6px',
      padding: '12px',
      marginBottom: '20px',
      color: '#991b1b',
      fontSize: '13px'
    },
    successBox: {
      background: '#f0fdf4',
      border: '1px solid #22c55e',
      borderRadius: '6px',
      padding: '20px',
      textAlign: 'center',
      color: '#166534'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      color: '#666',
      marginBottom: '6px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    passwordHint: {
      fontSize: '11px',
      color: '#999',
      marginTop: '4px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    cancelButton: {
      flex: 1,
      background: '#e5e7eb',
      color: '#333',
      border: 'none',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    submitButton: {
      flex: 1,
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    disabledButton: {
      background: '#999',
      cursor: 'not-allowed'
    }
  };

  if (success) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.successBox}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>✅</span>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Password Changed!</h3>
            <p>Your password has been updated successfully.</p>
            <p style={{ fontSize: '12px', marginTop: '10px' }}>Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Change Password</h3>
          <button style={styles.closeButton} onClick={handleClose}>×</button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={{ marginRight: '8px' }}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
            <div style={styles.passwordHint}>
              Must be 8-12 characters with uppercase, lowercase, number, and special character
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(loading ? styles.disabledButton : {})
              }}
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
