import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8080";

const UnlockMFA = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmUnlock, setConfirmUnlock] = useState(false);

  // Fetch all employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/employees/admin/all`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      
      // Filter to only show approved employees
      const approvedEmployees = data.filter(emp => emp.status === 'APPROVED');
      setEmployees(approvedEmployees);
      setFilteredEmployees(approvedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setActionResult({ type: 'error', message: 'Failed to load employees' });
    } finally {
      setLoading(false);
    }
  };

  // Search employees as user types
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = employees.filter(emp => 
      emp.firstName?.toLowerCase().includes(term) ||
      emp.lastName?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.employeeId?.toLowerCase().includes(term)
    );
    setFilteredEmployees(results);
  }, [searchTerm, employees]);

  const handleUnlockMFA = async () => {
    if (!selectedEmployee) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/hr/auth/admin/unlock/${selectedEmployee.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unlock MFA');
      }

      setActionResult({
        type: 'success',
        message: `✅ MFA unlocked successfully for ${selectedEmployee.firstName} ${selectedEmployee.lastName}`
      });

      // Reset selection
      setSelectedEmployee(null);
      setConfirmUnlock(false);
      
      // Refresh employee list
      fetchEmployees();

    } catch (error) {
      setActionResult({
        type: 'error',
        message: `❌ Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if employee is locked (has hrAccountLocked flag)
  const isLocked = (employee) => {
    return employee.hrAccountLocked === true;
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666'
    },
    lockedSection: {
      background: '#fef2f2',
      border: '1px solid #ef4444',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px'
    },
    lockedTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#b91c1c',
      marginBottom: '12px'
    },
    lockedItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      background: 'white',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    employeeName: {
      fontWeight: '500'
    },
    employeeEmail: {
      fontSize: '12px',
      color: '#666',
      marginLeft: '8px'
    },
    unlockButton: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '4px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer'
    },
    searchSection: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '16px'
    },
    resultsCount: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '16px'
    },
    employeeList: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    employeeItem: {
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid #f0f0f0',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    selectedEmployee: {
      background: '#e0f2fe',
      borderLeft: '4px solid #3b82f6'
    },
    employeeInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    employeeName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333'
    },
    employeeDetails: {
      fontSize: '13px',
      color: '#666',
      display: 'flex',
      gap: '16px'
    },
    lockStatus: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    },
    locked: {
      background: '#fee2e2',
      color: '#dc2626'
    },
    unlocked: {
      background: '#d1fae5',
      color: '#059669'
    },
    resultAlert: {
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px',
      fontSize: '14px'
    },
    successAlert: {
      background: '#d1fae5',
      border: '1px solid #10b981',
      color: '#065f46'
    },
    errorAlert: {
      background: '#fee2e2',
      border: '1px solid #ef4444',
      color: '#b91c1c'
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
      maxWidth: '400px',
      width: '90%'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#ef4444',
      marginBottom: '12px'
    },
    modalText: {
      fontSize: '14px',
      color: '#333',
      marginBottom: '20px',
      lineHeight: 1.6
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    cancelButton: {
      padding: '8px 16px',
      background: '#e5e7eb',
      color: '#333',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    confirmButton: {
      padding: '8px 16px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    backButton: {
      marginTop: '20px',
      padding: '10px 20px',
      background: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px'
    }
  };

  // Get locked employees
  const lockedEmployees = employees.filter(emp => isLocked(emp));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Unlock MFA Accounts</h1>
        <p style={styles.subtitle}>
          Search for employees who are locked out due to failed MFA attempts and unlock their accounts.
        </p>
      </div>

      {/* Action Result Alert */}
      {actionResult && (
        <div style={{
          ...styles.resultAlert,
          ...(actionResult.type === 'success' ? styles.successAlert : styles.errorAlert)
        }}>
          {actionResult.message}
        </div>
      )}

      {/* Locked Employees Section */}
      {lockedEmployees.length > 0 && (
        <div style={styles.lockedSection}>
          <h3 style={styles.lockedTitle}>
            🔒 Locked MFA Accounts ({lockedEmployees.length})
          </h3>
          <div>
            {lockedEmployees.map(emp => (
              <div key={emp.id} style={styles.lockedItem}>
                <div>
                  <span style={styles.employeeName}>{emp.firstName} {emp.lastName}</span>
                  <span style={styles.employeeEmail}>{emp.email}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setConfirmUnlock(true);
                  }}
                  style={styles.unlockButton}
                >
                  Unlock MFA
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div style={styles.searchSection}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="🔍 Search by name, email, or employee ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div style={styles.resultsCount}>
          Found {filteredEmployees.length} employees
        </div>
      </div>

      {/* Employee List */}
      {loading && !filteredEmployees.length ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading employees...
        </div>
      ) : (
        <div style={styles.employeeList}>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                style={{
                  ...styles.employeeItem,
                  ...(selectedEmployee?.id === emp.id ? styles.selectedEmployee : {})
                }}
                onClick={() => setSelectedEmployee(emp)}
              >
                <div style={styles.employeeInfo}>
                  <span style={styles.employeeName}>
                    {emp.firstName} {emp.lastName}
                  </span>
                  <div style={styles.employeeDetails}>
                    <span>📧 {emp.email}</span>
                    <span>🆔 {emp.employeeId}</span>
                    <span>🏢 {emp.department || 'N/A'}</span>
                  </div>
                </div>
                
                <div style={{
                  ...styles.lockStatus,
                  ...(isLocked(emp) ? styles.locked : styles.unlocked)
                }}>
                  {isLocked(emp) ? '🔒 Locked' : '🔓 Active'}
                </div>

                {selectedEmployee?.id === emp.id && isLocked(emp) && (
                  <button
                    style={{
                      ...styles.unlockButton,
                      marginLeft: '20px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmUnlock(true);
                    }}
                  >
                    Unlock MFA
                  </button>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No employees found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmUnlock && selectedEmployee && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>🔓 Confirm MFA Unlock</h3>
            <p style={styles.modalText}>
              Are you sure you want to unlock MFA for <strong>
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </strong>?
              <br /><br />
              They will be able to log in again immediately.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setConfirmUnlock(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmButton}
                onClick={handleUnlockMFA}
                disabled={loading}
              >
                {loading ? 'Unlocking...' : 'Yes, Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        style={styles.backButton}
        onClick={() => navigate('/')}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default UnlockMFA;