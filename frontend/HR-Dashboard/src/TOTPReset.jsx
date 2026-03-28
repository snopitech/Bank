import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "";

const TOTPReset = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

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

  // Get employees who are enforced but haven't set up TOTP
  const getEnforcedEmployees = () => {
    return employees.filter(emp => 
      emp.totpEnforcementDate && !emp.totpEnabled
    );
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

  const handleResetTOTP = async () => {
    if (!selectedEmployee) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/employees/admin/${selectedEmployee.id}/reset-totp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset TOTP');
      }

      setActionResult({
        type: 'success',
        message: `✅ TOTP reset successfully for ${selectedEmployee.firstName} ${selectedEmployee.lastName}. They can now log in without 2FA.`
      });

      // Reset selection
      setSelectedEmployee(null);
      setConfirmReset(false);
      
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

  const getTOTPStatus = (employee) => {
    if (employee.totpEnabled) {
      return <span style={{ color: '#22c55e' }}>✅ Enabled</span>;
    } else if (employee.totpSetupCompleted) {
      return <span style={{ color: '#eab308' }}>⚠️ Setup Completed</span>;
    } else {
      return <span style={{ color: '#9ca3af' }}>⭕ Not Setup</span>;
    }
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
    enforcedSection: {
      background: '#fef9c3',
      border: '1px solid #eab308',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px'
    },
    enforcedTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#854d0e',
      marginBottom: '12px'
    },
    enforcedItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      background: 'white',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    enforcedName: {
      fontWeight: '500'
    },
    enforcedEmail: {
      fontSize: '12px',
      color: '#666',
      marginLeft: '8px'
    },
    enforcedButton: {
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
    totpStatus: {
      padding: '0 24px',
      fontSize: '14px',
      fontWeight: '500'
    },
    actionButton: {
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    resetButton: {
      background: '#ef4444',
      color: 'white'
    },
    disabledButton: {
      background: '#e5e7eb',
      color: '#9ca3af',
      cursor: 'not-allowed'
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
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Reset Two-Factor Authentication (TOTP)</h1>
        <p style={styles.subtitle}>
          Search for an employee and reset their TOTP if they've lost access to their authenticator app.
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
{getEnforcedEmployees().length > 0 && (
  <div style={styles.enforcedSection}>
    <h3 style={styles.enforcedTitle}>
      ⚠️ Employees Requiring TOTP Reset ({getEnforcedEmployees().length})
    </h3>
    <div>
      {getEnforcedEmployees().map(emp => (
        <div key={emp.id} style={styles.enforcedItem}>
          <div>
            <span style={styles.enforcedName}>{emp.firstName} {emp.lastName}</span>
            <span style={styles.enforcedEmail}>{emp.email}</span>
          </div>
          <button
            onClick={() => {
              setSelectedEmployee(emp);
              setConfirmReset(true);
            }}
            style={styles.enforcedButton}
          >
            Reset TOTP
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
      
      <div style={styles.totpStatus}>
        {getTOTPStatus(emp)}
      </div>

      {/* Show reset button for ALL employees, not just those with TOTP enabled */}
     {selectedEmployee?.id === emp.id && (
  <button
    style={{
      ...styles.actionButton,
      ...styles.resetButton
    }}
    onClick={(e) => {
      e.stopPropagation();
      setConfirmReset(true);
    }}
  >
    Reset TOTP
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
      {confirmReset && selectedEmployee && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>⚠️ Confirm TOTP Reset</h3>
            <p style={styles.modalText}>
              You are about to reset two-factor authentication for <strong>
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </strong>.
              <br /><br />
              They will be able to log in without a 2FA code and will need to set up TOTP again.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmButton}
                onClick={handleResetTOTP}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Yes, Reset TOTP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TOTPReset;
