import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HREmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/employees/admin/all');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search and status
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && emp.isActive) ||
      (filterStatus === 'DISABLED' && !emp.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.isActive).length;
  const disabledEmployees = employees.filter(emp => !emp.isActive).length;

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleDisableEmployee = async (employee) => {
    if (!window.confirm(`Disable employee ${employee.firstName} ${employee.lastName}?`)) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/employees/admin/${employee.id}/disable`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable employee');
      }

      await fetchEmployees(); // Refresh the list
      alert(`Employee ${employee.firstName} ${employee.lastName} has been disabled.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnableEmployee = async (employee) => {
    if (!window.confirm(`Enable employee ${employee.firstName} ${employee.lastName}?`)) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/employees/admin/${employee.id}/enable`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enable employee');
      }

      await fetchEmployees(); // Refresh the list
      alert(`Employee ${employee.firstName} ${employee.lastName} has been enabled.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (employee) => {
    if (!window.confirm(`Reset password for ${employee.firstName} ${employee.lastName}?`)) return;
    
    setActionLoading(true);
    setResetResult(null);
    
    try {
      const response = await fetch(`http://localhost:8080/api/employees/admin/${employee.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setResetResult({
        success: true,
        message: `Password reset successful. Temporary password: ${data.temporaryPassword}`
      });

      setTimeout(() => setResetResult(null), 5000);
    } catch (err) {
      setResetResult({
        success: false,
        message: err.message
      });
    } finally {
      setActionLoading(false);
      setShowResetModal(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/employees/admin/${selectedEmployee.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete employee');
      }

      await fetchEmployees(); // Refresh the list
      setShowDeleteModal(false);
      setShowEmployeeModal(false);
      alert(`Employee ${selectedEmployee.firstName} ${selectedEmployee.lastName} has been permanently deleted.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? { bg: '#10b98120', color: '#10b981', label: 'Active' }
      : { bg: '#ef444420', color: '#ef4444', label: 'Disabled' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '16px' }}>Error: {error}</div>
        <button 
          onClick={fetchEmployees}
          style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    content: {
      padding: '24px'
    },
    header: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px 30px',
      marginBottom: '24px',
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
      padding: '8px 16px',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    statLabel: {
      color: '#6b7280',
      fontSize: '12px',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827'
    },
    filters: {
      background: 'white',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      gap: '12px'
    },
    searchInput: {
      flex: 1,
      padding: '10px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      fontSize: '14px'
    },
    filterSelect: {
      padding: '10px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      fontSize: '14px',
      minWidth: '150px'
    },
    table: {
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflowX: 'auto'
    },
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 2fr 1.5fr 1.5fr 2fr',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '6px',
      fontWeight: '600',
      color: '#374151'
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 2fr 1.5fr 1.5fr 2fr',
      padding: '12px',
      borderBottom: '1px solid #e5e7eb',
      alignItems: 'center'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textAlign: 'center',
      display: 'inline-block'
    },
    actionButton: {
      padding: '6px 12px',
      margin: '0 4px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500'
    },
    viewButton: {
      background: '#3b82f6',
      color: 'white'
    },
    disableButton: {
      background: '#f59e0b',
      color: 'white'
    },
    enableButton: {
      background: '#10b981',
      color: 'white'
    },
    resetButton: {
      background: '#8b5cf6',
      color: 'white'
    },
    deleteButton: {
      background: '#ef4444',
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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '8px',
      padding: '24px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: '1px solid #e5e7eb'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#6b7280'
    },
    detailGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginBottom: '20px'
    },
    detailItem: {
      padding: '8px',
      background: '#f9fafb',
      borderRadius: '4px'
    },
    detailLabel: {
      color: '#6b7280',
      fontSize: '11px',
      marginBottom: '2px'
    },
    detailValue: {
      fontWeight: '500',
      color: '#111827',
      fontSize: '14px'
    },
    permissionsSection: {
      marginTop: '16px',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '4px'
    },
    permissionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px',
      marginTop: '8px'
    },
    permissionItem: {
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    modalFooter: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    cancelButton: {
      padding: '8px 16px',
      background: '#e5e7eb',
      color: '#111827',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    confirmDeleteButton: {
      padding: '8px 16px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    confirmResetButton: {
      padding: '8px 16px',
      background: '#8b5cf6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    resetResult: {
      marginTop: '12px',
      padding: '12px',
      borderRadius: '4px',
      fontSize: '13px'
    },
    successResult: {
      background: '#d1fae5',
      color: '#065f46',
      border: '1px solid #10b981'
    },
    errorResult: {
      background: '#fee2e2',
      color: '#b91c1c',
      border: '1px solid #ef4444'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Employee Management</h1>
          <button 
            style={styles.backButton}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Employees</div>
            <div style={styles.statValue}>{totalEmployees}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active</div>
            <div style={styles.statValue}>{activeEmployees}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Disabled</div>
            <div style={styles.statValue}>{disabledEmployees}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Search by name, email, or employee ID..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            style={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Employees</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled Only</option>
          </select>
        </div>

        {/* Employees Table */}
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div>ID</div>
            <div>Name</div>
            <div>Email</div>
            <div>Employee ID</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {filteredEmployees.map((emp) => {
            const status = getStatusBadge(emp.isActive);
            
            return (
              <div key={emp.id} style={styles.tableRow}>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>#{emp.id}</div>
                <div style={{ fontWeight: '500' }}>{emp.firstName} {emp.lastName}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{emp.email}</div>
                <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>{emp.employeeId}</div>
                <div>
                  <span style={{ ...styles.statusBadge, background: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                </div>
                <div>
                  <button
                    style={{ ...styles.actionButton, ...styles.viewButton, marginRight: '4px' }}
                    onClick={() => handleViewEmployee(emp)}
                  >
                    View
                  </button>
                  {emp.isActive ? (
                    <button
                      style={{ ...styles.actionButton, ...styles.disableButton, marginRight: '4px' }}
                      onClick={() => handleDisableEmployee(emp)}
                      disabled={actionLoading}
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      style={{ ...styles.actionButton, ...styles.enableButton, marginRight: '4px' }}
                      onClick={() => handleEnableEmployee(emp)}
                      disabled={actionLoading}
                    >
                      Enable
                    </button>
                  )}
                  <button
                    style={{ ...styles.actionButton, ...styles.resetButton, marginRight: '4px' }}
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setShowResetModal(true);
                    }}
                    disabled={actionLoading}
                  >
                    Reset
                  </button>
                </div>
              </div>
            );
          })}

          {filteredEmployees.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              No employees found matching your criteria
            </div>
          )}
        </div>
      </div>

      {/* Employee Details Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Employee Details</h3>
              <button style={styles.closeButton} onClick={() => setShowEmployeeModal(false)}>×</button>
            </div>

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Name</div>
                <div style={styles.detailValue}>{selectedEmployee.firstName} {selectedEmployee.lastName}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Email</div>
                <div style={styles.detailValue}>{selectedEmployee.email}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Employee ID</div>
                <div style={styles.detailValue}>{selectedEmployee.employeeId}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Department</div>
                <div style={styles.detailValue}>{selectedEmployee.department || 'N/A'}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Role</div>
                <div style={styles.detailValue}>{selectedEmployee.role || 'N/A'}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Phone</div>
                <div style={styles.detailValue}>{selectedEmployee.phone || 'N/A'}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Hire Date</div>
                <div style={styles.detailValue}>{formatDate(selectedEmployee.hireDate)}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Status</div>
                <div style={styles.detailValue}>
                  <span style={{ 
                    ...styles.statusBadge, 
                    background: selectedEmployee.isActive ? '#10b98120' : '#ef444420', 
                    color: selectedEmployee.isActive ? '#10b981' : '#ef4444' 
                  }}>
                    {selectedEmployee.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {selectedEmployee.permissions && (
              <div style={styles.permissionsSection}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Permissions</div>
                <div style={styles.permissionGrid}>
                  {Object.entries(selectedEmployee.permissions).map(([key, value]) => (
                    <div key={key} style={styles.permissionItem}>
                      <span>{value ? '✅' : '❌'}</span>
                      <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div style={{ marginTop: '16px' }}>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Last Login</div>
                <div style={styles.detailValue}>{selectedEmployee.lastLoginAt ? new Date(selectedEmployee.lastLoginAt).toLocaleString() : 'Never'}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Password Change Required</div>
                <div style={styles.detailValue}>{selectedEmployee.passwordChangeRequired ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowEmployeeModal(false)}
              >
                Close
              </button>
              <button
                style={styles.deleteButton}
                onClick={() => setShowDeleteModal(true)}
              >
                🗑️ Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
              🗑️ Delete Employee
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Are you sure you want to permanently delete <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong>?
            </p>
            <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmDeleteButton}
                onClick={handleDeleteEmployee}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedEmployee && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
              🔑 Reset Password
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Reset password for <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong>?
            </p>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
              A temporary password will be generated and emailed to {selectedEmployee.email}.
            </p>

            {resetResult && (
              <div style={{
                ...styles.resetResult,
                ...(resetResult.success ? styles.successResult : styles.errorResult)
              }}>
                {resetResult.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowResetModal(false);
                  setResetResult(null);
                }}
              >
                Cancel
              </button>
              <button
                style={styles.confirmResetButton}
                onClick={() => handleResetPassword(selectedEmployee)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Resetting...' : 'Reset Password'}
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

export default HREmployees;