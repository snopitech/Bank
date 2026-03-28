import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "";

export default function HRCreateEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const [form, setForm] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "", // Personal email - where login credentials will be sent
    phone: "",
    dateOfBirth: "",
    ssn: "",
    
    // Employment Details
    employeeId: "",
    department: "",
    hireDate: "",
    employmentType: "full-time",
    reportsTo: "",
    
    // Role & Permissions
    role: "",
    permissions: {
      viewUsers: false,
      editUsers: false,
      viewAccounts: false,
      editAccounts: false,
      viewTransactions: false,
      approveTransactions: false,
      viewReports: false,
      manageEmployees: false // 👈 HR permission
    },
    
    // Contact Information
    workPhone: "",
    workEmail: "", // Work email (@snopitech.com)
    officeLocation: "",
    
    // Emergency Contact
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    
    // Address
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA"
  });

  const departments = [
    "Information Technology",
    "Customer Service",
    "Branch Operations",
    "Loan Department",
    "Compliance",
    "Risk Management",
    "Human Resources",
    "Marketing",
    "Finance",
    "Executive"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const handlePermissionChange = (permission) => {
    setForm({
      ...form,
      permissions: {
        ...form.permissions,
        [permission]: !form.permissions[permission]
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required fields
      if (!form.firstName || !form.lastName || !form.email || !form.employeeId) {
        throw new Error("Please fill in all required fields");
      }

      // Send to backend API
      const response = await fetch(`${API_BASE}/api/employees/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create employee profile");
      }

      setSubmittedEmail(form.email);
      setSuccess(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    errorBox: {
      background: '#fef2f2',
      border: '1px solid #fee2e2',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      color: '#991b1b',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#333',
      margin: '30px 0 20px 0',
      paddingBottom: '10px',
      borderBottom: '2px solid #f0f0f0'
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '20px'
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      marginBottom: '20px'
    },
    formGroup: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: '#666',
      fontSize: '13px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'white'
    },
    checkboxGroup: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
      padding: '15px',
      background: '#f9f9f9',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    checkboxLabel: {
      fontSize: '13px',
      color: '#333'
    },
    hrHighlight: {
      background: '#fef9c3',
      border: '1px solid #eab308',
      borderRadius: '4px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: '#854d0e',
      marginLeft: '8px'
    },
    noteBox: {
      background: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '8px',
      padding: '15px',
      margin: '20px 0',
      color: '#0369a1',
      fontSize: '14px'
    },
    button: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '15px 30px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%',
      marginTop: '20px'
    },
    successCard: {
      textAlign: 'center',
      padding: '40px',
      background: '#f0fdf4',
      borderRadius: '12px',
      border: '2px solid #22c55e'
    },
    successIcon: {
      fontSize: '48px',
      marginBottom: '20px'
    },
    employeeCard: {
      background: '#f9f9f9',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
      border: '1px solid #e0e0e0',
      textAlign: 'left'
    },
    employeeDetail: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px dashed #e0e0e0'
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      marginTop: '20px'
    },
    primaryButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    secondaryButton: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create Employee Profile</h2>
          <button style={styles.backButton} onClick={() => navigate('/employees')}>
            ← Back to Employees
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={{color: '#22c55e', marginBottom: '20px', fontSize: '28px'}}>
              Employee Profile Created Successfully!
            </h2>
            
            <div style={{marginBottom: '30px'}}>
              <p style={{marginBottom: '15px', color: '#333', fontSize: '16px'}}>
                Employee <strong>{form.firstName} {form.lastName}</strong> has been created and is pending approval.
              </p>
              
              <div style={styles.employeeCard}>
                <h3 style={{marginBottom: '15px', color: '#0369a1'}}>📋 Employee Details</h3>
                
                <div style={styles.employeeDetail}>
                  <span style={{fontWeight: 'bold'}}>Personal Email:</span>
                  <span>{form.email}</span>
                </div>
                
                <div style={styles.employeeDetail}>
                  <span style={{fontWeight: 'bold'}}>Employee ID:</span>
                  <span>{form.employeeId}</span>
                </div>
                
                <div style={styles.employeeDetail}>
                  <span style={{fontWeight: 'bold'}}>Role:</span>
                  <span>{form.role || 'Not specified'}</span>
                </div>
                
                <div style={styles.employeeDetail}>
                  <span style={{fontWeight: 'bold'}}>Department:</span>
                  <span>{form.department || 'Not specified'}</span>
                </div>

                {form.permissions.manageEmployees && (
                  <div style={{...styles.employeeDetail, color: '#854d0e', fontWeight: 'bold'}}>
                    <span>👑 HR Access:</span>
                    <span>Granted</span>
                  </div>
                )}
              </div>
              
              <div style={{
                background: '#f0f9ff',
                borderRadius: '8px',
                padding: '20px',
                margin: '20px 0',
                border: '1px solid #bae6fd'
              }}>
                <p style={{marginBottom: '10px', color: '#0369a1', fontWeight: 'bold'}}>
                  📧 Email Notification Sent
                </p>
                <p style={{color: '#666', fontSize: '14px', lineHeight: '1.6'}}>
                  An approval request has been sent to <strong>snopitech@gmail.com</strong>.<br/>
                  Once approved, the employee will receive their login credentials at <strong>{form.email}</strong>.
                </p>
              </div>
            </div>

            <div style={styles.actionButtons}>
              <button
                onClick={() => navigate('/employees/create')}
                style={styles.primaryButton}
              >
                ➕ Create Another
              </button>
              <button
                onClick={() => navigate('/employees')}
                style={styles.secondaryButton}
              >
                👥 View All Employees
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Create New Employee</h2>
        <button style={styles.backButton} onClick={() => navigate('/employees')}>
          ← Back to Employees
        </button>
      </div>

      {/* Form */}
      <div style={styles.card}>
        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <h2 style={styles.sectionTitle}>Personal Information</h2>
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Personal Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@gmail.com"
                style={styles.input}
                required
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                Login credentials will be sent here after approval
              </p>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>SSN (Last 4 digits)</label>
              <input
                type="text"
                name="ssn"
                value={form.ssn}
                onChange={handleChange}
                placeholder="***-**-1234"
                maxLength="11"
                style={styles.input}
              />
            </div>
          </div>

          {/* Work Contact Information */}
          <h2 style={styles.sectionTitle}>Work Contact Information</h2>
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Work Email (@snopitech.com)</label>
              <input
                type="email"
                name="workEmail"
                value={form.workEmail}
                onChange={handleChange}
                placeholder="john.doe@snopitech.com"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Work Phone</label>
              <input
                type="tel"
                name="workPhone"
                value={form.workPhone}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Office Location</label>
              <input
                type="text"
                name="officeLocation"
                value={form.officeLocation}
                onChange={handleChange}
                placeholder="Branch/Floor/Desk"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Reports To</label>
              <input
                type="text"
                name="reportsTo"
                value={form.reportsTo}
                onChange={handleChange}
                placeholder="Manager's Name"
                style={styles.input}
              />
            </div>
          </div>

          {/* Employment Details */}
          <h2 style={styles.sectionTitle}>Employment Details</h2>
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Employee ID *</label>
              <input
                type="text"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                placeholder="EMP-2025-001"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Department</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role / Job Title *</label>
              <input
                type="text"
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g., Senior Teller, Branch Manager"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Employment Type</label>
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Hire Date</label>
              <input
                type="date"
                name="hireDate"
                value={form.hireDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Permissions */}
          <h2 style={styles.sectionTitle}>System Permissions</h2>
          <div style={styles.checkboxGroup}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.permissions.viewUsers}
                onChange={() => handlePermissionChange('viewUsers')}
              />
              <span style={styles.checkboxLabel}>View Users</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.permissions.editUsers}
                onChange={() => handlePermissionChange('editUsers')}
              />
              <span style={styles.checkboxLabel}>Edit Users</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.permissions.viewAccounts}
                onChange={() => handlePermissionChange('viewAccounts')}
              />
              <span style={styles.checkboxLabel}>View Accounts</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.permissions.editAccounts}
                onChange={() => handlePermissionChange('editAccounts')}
              />
              <span style={styles.checkboxLabel}>Edit Accounts</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.permissions.viewTransactions}
                onChange={() => handlePermissionChange('viewTransactions')}
              />
              <span style={styles.checkboxLabel}>View Transactions</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.permissions.approveTransactions}
                onChange={() => handlePermissionChange('approveTransactions')}
              />
              <span style={styles.checkboxLabel}>Approve Transactions</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.permissions.viewReports}
                onChange={() => handlePermissionChange('viewReports')}
              />
              <span style={styles.checkboxLabel}>View Reports</span>
            </label>
            <label style={{
              ...styles.checkbox,
              background: form.permissions.manageEmployees ? '#fef9c3' : 'transparent',
              padding: form.permissions.manageEmployees ? '4px 8px' : '0',
              borderRadius: '4px'
            }}>
              <input
                type="checkbox"
                checked={form.permissions.manageEmployees}
                onChange={() => handlePermissionChange('manageEmployees')}
              />
              <span style={{
                ...styles.checkboxLabel,
                fontWeight: form.permissions.manageEmployees ? 'bold' : 'normal'
              }}>
                👑 HR Portal Access
              </span>
              {form.permissions.manageEmployees && (
                <span style={styles.hrHighlight}>HR</span>
              )}
            </label>
          </div>

          {/* Address */}
          <h2 style={styles.sectionTitle}>Address</h2>
          <div style={styles.formGroup}>
            <input
              type="text"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              placeholder="Street Address"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <input
              type="text"
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
              placeholder="Apt/Suite/Unit (Optional)"
              style={styles.input}
            />
          </div>
          <div style={styles.grid3}>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              style={styles.input}
            />
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="State"
              style={styles.input}
            />
            <input
              type="text"
              name="zipCode"
              value={form.zipCode}
              onChange={handleChange}
              placeholder="ZIP Code"
              style={styles.input}
            />
          </div>

          {/* Emergency Contact */}
          <h2 style={styles.sectionTitle}>Emergency Contact</h2>
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                name="emergencyName"
                value={form.emergencyName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Relationship</label>
              <input
                type="text"
                name="emergencyRelationship"
                value={form.emergencyRelationship}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone</label>
            <input
              type="tel"
              name="emergencyPhone"
              value={form.emergencyPhone}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Note */}
          <div style={styles.noteBox}>
            <strong>📋 HR Note:</strong><br/><br/>
            1. Employee will be created in <strong>PENDING</strong> status<br/>
            2. Approval email will be sent to <strong>snopitech@gmail.com</strong><br/>
            3. After approval, employee receives login credentials at their personal email<br/>
            4. {form.permissions.manageEmployees ? 
              "👑 This employee will have HR Portal access" : 
              "This employee will have standard employee access"}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              background: loading ? '#999' : '#667eea',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Profile...' : 'Create Employee Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
