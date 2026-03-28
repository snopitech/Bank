import { useState } from "react";

const API_BASE = "";

export default function ChangePasswordModal({ isOpen, onClose, userEmail, onSuccess }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (!validatePassword(form.newPassword)) {
      setMessage({ 
        type: "error", 
        text: "Password must be at least 8 characters with uppercase, lowercase, number, and special character." 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE}/api/employees/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      // Success
      setMessage({ 
        type: "success", 
        text: "Password changed successfully! You will be redirected to login..." 
      });
      
      // Clear form
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // Call onSuccess callback to handle logout and redirect
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setMessage({ type: "", text: "" });
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
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
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#999'
    },
    message: {
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px'
    },
    successMessage: {
      background: '#f0fdf4',
      border: '1px solid #22c55e',
      color: '#166534'
    },
    errorMessage: {
      background: '#fef2f2',
      border: '1px solid #ef4444',
      color: '#991b1b'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '8px'
    },
    inputContainer: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '12px',
      paddingRight: '40px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    toggleButton: {
      position: 'absolute',
      right: '12px',
      top: '12px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#666'
    },
    requirements: {
      background: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px'
    },
    requirementsTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#0369a1',
      marginBottom: '8px'
    },
    requirementsList: {
      margin: 0,
      padding: 0,
      listStyle: 'none'
    },
    requirementItem: {
      fontSize: '13px',
      color: '#0369a1',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    submitButton: {
      flex: 1,
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    cancelButton: {
      flex: 1,
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Change Password</h2>
          <button style={styles.closeButton} onClick={handleClose}>✕</button>
        </div>

        {/* Message */}
        {message.text && (
          <div style={{
            ...styles.message,
            ...(message.type === 'success' ? styles.successMessage : styles.errorMessage)
          }}>
            {message.text}
          </div>
        )}

        {/* Password Requirements */}
        <div style={styles.requirements}>
          <div style={styles.requirementsTitle}>Password Requirements:</div>
          <ul style={styles.requirementsList}>
            <li style={styles.requirementItem}>
              <span>✓</span> At least 8 characters long
            </li>
            <li style={styles.requirementItem}>
              <span>✓</span> One uppercase letter
            </li>
            <li style={styles.requirementItem}>
              <span>✓</span> One lowercase letter
            </li>
            <li style={styles.requirementItem}>
              <span>✓</span> One number
            </li>
            <li style={styles.requirementItem}>
              <span>✓</span> One special character (!@#$%^&*)
            </li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Current Password</label>
            <div style={styles.inputContainer}>
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter current password"
                disabled={loading}
              />
              <button
                type="button"
                style={styles.toggleButton}
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputContainer}>
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter new password"
                disabled={loading}
              />
              <button
                type="button"
                style={styles.toggleButton}
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={styles.inputContainer}>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="Confirm new password"
                disabled={loading}
              />
              <button
                type="button"
                style={styles.toggleButton}
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.disabled : {})
              }}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
