import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "";

export default function HREmployeeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    ssnLastFour: "",
    
    // Employment Details
    employeeId: "",
    department: "",
    hireDate: "",
    employmentType: "",
    reportsTo: "",
    role: "",
    
    // Permissions
    permissions: {
      viewUsers: false,
      editUsers: false,
      viewAccounts: false,
      editAccounts: false,
      viewTransactions: false,
      approveTransactions: false,
      viewReports: false,
      manageEmployees: false
    },
    
    // Contact Information
    workPhone: "",
    workEmail: "",
    officeLocation: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    
    // Emergency Contact
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    
    // Status
    status: "",
    isActive: true
  });

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/employees/admin/${id}`);
        
        if (!response.ok) {
          throw new Error("Employee not found");
        }
        
        const data = await response.json();
        setEmployee(data);
        
        // Initialize form
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth || "",
          ssnLastFour: data.maskedSsn?.slice(-4) || data.ssnLastFour || "",
          
          employeeId: data.employeeId || "",
          department: data.department || "",
          hireDate: data.hireDate || "",
          employmentType: data.employmentType || "",
          reportsTo: data.reportsTo || "",
          role: data.role || "",
          
          permissions: data.permissions || {
            viewUsers: false,
            editUsers: false,
            viewAccounts: false,
            editAccounts: false,
            viewTransactions: false,
            approveTransactions: false,
            viewReports: false,
            manageEmployees: false
          },
          
          workPhone: data.workPhone || "",
          workEmail: data.workEmail || "",
          officeLocation: data.officeLocation || "",
          addressLine1: data.addressLine1 || "",
          addressLine2: data.addressLine2 || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          country: data.country || "",
          
          emergencyName: data.emergencyName || "",
          emergencyRelationship: data.emergencyRelationship || "",
          emergencyPhone: data.emergencyPhone || "",
          
          status: data.status || "PENDING",
          isActive: data.isActive !== false
        });
        
      } catch (error) {
        console.error("Error fetching employee:", error);
        setMessage({ type: "error", text: "Failed to load employee data" });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Prepare update data (only editable fields)
      const updateData = {
        phone: formData.phone,
        workPhone: formData.workPhone,
        officeLocation: formData.officeLocation,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        emergencyName: formData.emergencyName,
        emergencyRelationship: formData.emergencyRelationship,
        emergencyPhone: formData.emergencyPhone,
        department: formData.department,
        reportsTo: formData.reportsTo,
        role: formData.role,
        employmentType: formData.employmentType,
        permissions: formData.permissions
      };

      const response = await fetch(`${API_BASE}/api/employees/admin/${id}/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update employee");
      }

      const updatedData = await response.json();
      setEmployee(updatedData);
      
      setMessage({ type: "success", text: "Employee updated successfully!" });
      setIsEditing(false);

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);

    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm(`Reset password for ${employee.firstName} ${employee.lastName}? A temporary password will be emailed.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/employees/admin/${id}/reset-password`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      alert(`Password reset successful. Temporary password has been emailed.`);

    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleStatus = async () => {
    const action = formData.isActive ? "disable" : "enable";
    if (!window.confirm(`Are you sure you want to ${action} this employee?`)) {
      return;
    }

    try {
      const endpoint = formData.isActive
        ? `${API_BASE}/api/employees/admin/${id}/disable`
        : `${API_BASE}/api/employees/admin/${id}/enable`;

      const response = await fetch(endpoint, {
        method: 'PUT'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} employee`);
      }

      setFormData(prev => ({
        ...prev,
        isActive: !prev.isActive
      }));

    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/employees/admin/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete employee");
      }

      navigate('/employees');

    } catch (error) {
      alert(error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return '#22c55e';
      case 'PENDING': return '#eab308';
      case 'REJECTED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto'
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
      cursor: 'pointer'
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
    profileHeader: {
      background: 'linear-gradient(to right, #667eea, #764ba2)',
      borderRadius: '12px',
      padding: '30px',
      marginBottom: '30px',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    profileInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    avatar: {
      width: '60px',
      height: '60px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold'
    },
    profileName: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '4px'
    },
    profileMeta: {
      fontSize: '14px',
      opacity: 0.9
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: 'rgba(255,255,255,0.2)',
      color: 'white'
    },
    actionButtons: {
      display: 'flex',
      gap: '10px'
    },
    actionButton: {
      background: 'rgba(255,255,255,0.2)',
      border: '1px solid rgba(255,255,255,0.3)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px'
    },
    fieldGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '12px',
      color: '#666',
      marginBottom: '4px',
      fontWeight: '500'
    },
    value: {
      fontSize: '16px',
      color: '#333',
      fontWeight: '500',
      padding: '8px 0'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '14px'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '14px',
      background: 'white'
    },
    checkboxGroup: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginTop: '10px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    divider: {
      height: '1px',
      background: '#f0f0f0',
      margin: '20px 0'
    },
    editButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginRight: '10px'
    },
    saveButton: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginRight: '10px'
    },
    cancelButton: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        Loading employee details...
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        Employee not found
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Employee Details</h2>
        <button style={styles.backButton} onClick={() => navigate('/employees')}>
          ← Back to Employees
        </button>
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

      {/* Profile Header */}
      <div style={styles.profileHeader}>
        <div style={styles.profileInfo}>
          <div style={styles.avatar}>
            {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
          </div>
          <div>
            <div style={styles.profileName}>
              {formData.firstName} {formData.lastName}
            </div>
            <div style={styles.profileMeta}>
              {formData.role} • {formData.department} • ID: {formData.employeeId}
            </div>
          </div>
          <span style={{
            ...styles.statusBadge,
            background: `${getStatusColor(formData.status)}`,
            opacity: 0.9
          }}>
            {formData.status}
          </span>
          <span style={{
            ...styles.statusBadge,
            background: formData.isActive ? '#22c55e' : '#ef4444',
            opacity: 0.9
          }}>
            {formData.isActive ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>

        <div style={styles.actionButtons}>
          <button style={styles.actionButton} onClick={handleResetPassword}>
            🔑 Reset Password
          </button>
          <button style={styles.actionButton} onClick={handleToggleStatus}>
            {formData.isActive ? '🔒 Disable' : '🔓 Enable'}
          </button>
          <button style={{...styles.actionButton, background: '#ef4444'}} onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Edit/Save Buttons */}
      <div style={{ marginBottom: '20px', textAlign: 'right' }}>
        {!isEditing ? (
          <button style={styles.editButton} onClick={() => setIsEditing(true)}>
            ✏️ Edit Employee
          </button>
        ) : (
          <>
            <button 
              style={styles.saveButton} 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button 
              style={styles.cancelButton} 
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              ✕ Cancel
            </button>
          </>
        )}
      </div>

      {/* Personal Information */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>👤 Personal Information</div>
        <div style={styles.grid2}>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>First Name</div>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.firstName}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Last Name</div>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.lastName}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Email</div>
            <div style={styles.value}>{formData.email}</div>
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Phone</div>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.phone || 'Not provided'}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Date of Birth</div>
            {isEditing ? (
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formatDate(formData.dateOfBirth)}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>SSN (Last 4)</div>
            <div style={styles.value}>•••-••-{formData.ssnLastFour}</div>
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>💼 Employment Details</div>
        <div style={styles.grid2}>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Employee ID</div>
            <div style={styles.value}>{formData.employeeId}</div>
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Department</div>
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.department || 'Not specified'}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Role</div>
            {isEditing ? (
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.role || 'Not specified'}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Employment Type</div>
            {isEditing ? (
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            ) : (
              <div style={styles.value}>{formData.employmentType || 'Not specified'}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Hire Date</div>
            <div style={styles.value}>{formatDate(formData.hireDate)}</div>
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Reports To</div>
            {isEditing ? (
              <input
                type="text"
                name="reportsTo"
                value={formData.reportsTo}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.reportsTo || 'Not specified'}</div>
            )}
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>🔑 System Permissions</div>
        {isEditing ? (
          <div style={styles.checkboxGroup}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.permissions.viewUsers}
                onChange={() => handlePermissionChange('viewUsers')}
              />
              <span>View Users</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.permissions.editUsers}
                onChange={() => handlePermissionChange('editUsers')}
              />
              <span>Edit Users</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.permissions.viewAccounts}
                onChange={() => handlePermissionChange('viewAccounts')}
              />
              <span>View Accounts</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.permissions.editAccounts}
                onChange={() => handlePermissionChange('editAccounts')}
              />
              <span>Edit Accounts</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.permissions.viewTransactions}
                onChange={() => handlePermissionChange('viewTransactions')}
              />
              <span>View Transactions</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.permissions.approveTransactions}
                onChange={() => handlePermissionChange('approveTransactions')}
              />
              <span>Approve Transactions</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.permissions.viewReports}
                onChange={() => handlePermissionChange('viewReports')}
              />
              <span>View Reports</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.permissions.manageEmployees}
                onChange={() => handlePermissionChange('manageEmployees')}
              />
              <span style={{ fontWeight: formData.permissions.manageEmployees ? 'bold' : 'normal' }}>
                👑 HR Access
              </span>
            </label>
          </div>
        ) : (
          <div style={styles.checkboxGroup}>
            {Object.entries(formData.permissions).map(([key, value]) => (
              value && (
                <div key={key} style={{ color: '#667eea', fontSize: '14px' }}>
                  ✓ {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>📞 Contact Information</div>
        <div style={styles.grid2}>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Work Phone</div>
            {isEditing ? (
              <input
                type="text"
                name="workPhone"
                value={formData.workPhone}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.workPhone || 'Not provided'}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Work Email</div>
            <div style={styles.value}>{formData.workEmail || 'Not provided'}</div>
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Office Location</div>
            {isEditing ? (
              <input
                type="text"
                name="officeLocation"
                value={formData.officeLocation}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.officeLocation || 'Not provided'}</div>
            )}
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.grid2}>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Address Line 1</div>
            {isEditing ? (
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.addressLine1 || 'Not provided'}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Address Line 2</div>
            {isEditing ? (
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.addressLine2 || ''}</div>
            )}
          </div>
        </div>

        <div style={styles.grid3}>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>City</div>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.city || 'Not provided'}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>State</div>
            {isEditing ? (
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.state || 'Not provided'}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Zip Code</div>
            {isEditing ? (
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.zipCode || 'Not provided'}</div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>🚨 Emergency Contact</div>
        <div style={styles.grid2}>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Name</div>
            {isEditing ? (
              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.emergencyName || 'Not provided'}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Relationship</div>
            {isEditing ? (
              <input
                type="text"
                name="emergencyRelationship"
                value={formData.emergencyRelationship}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.emergencyRelationship || 'Not provided'}</div>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <div style={styles.label}>Phone</div>
            {isEditing ? (
              <input
                type="text"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>{formData.emergencyPhone || 'Not provided'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
