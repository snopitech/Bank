import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HRSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'permissions', 'approvals', 'notifications', 'security'
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // General HR Settings
  const [generalSettings, setGeneralSettings] = useState({
    hrDepartmentName: 'Human Resources',
    hrEmail: 'hr@snopitech.com',
    hrPhone: '+1 (713) 870-1132',
    hrManager: 'Michael Agbonifo',
    officeLocation: '1023 Christmas Lane, Gambrills, MD 21054',
    businessHours: 'Mon-Fri: 9am - 5pm EST',
    employeeIdPrefix: 'EMP',
    defaultEmploymentType: 'full-time',
    probationPeriodDays: 90,
    requireOnboarding: true
  });

  // Permission Defaults
  const [permissionDefaults, setPermissionDefaults] = useState({
    defaultPermissions: {
      viewUsers: true,
      editUsers: false,
      viewAccounts: true,
      editAccounts: false,
      viewTransactions: true,
      approveTransactions: false,
      viewReports: true,
      manageEmployees: false
    },
    hrPermissions: {
      viewUsers: true,
      editUsers: true,
      viewAccounts: true,
      editAccounts: false,
      viewTransactions: true,
      approveTransactions: false,
      viewReports: true,
      manageEmployees: true
    },
    managerPermissions: {
      viewUsers: true,
      editUsers: true,
      viewAccounts: true,
      editAccounts: false,
      viewTransactions: true,
      approveTransactions: true,
      viewReports: true,
      manageEmployees: false
    },
    allowCustomPermissions: true
  });

  // Approval Settings
  const [approvalSettings, setApprovalSettings] = useState({
    requireApproval: {
      newEmployees: true,
      roleChanges: true,
      permissionChanges: true,
      salaryChanges: true,
      terminationRequests: true
    },
    approverRoles: ['HR Manager', 'Department Head'],
    autoApproveAfterDays: 7,
    notifyOnApproval: true,
    notifyOnRejection: true,
    requireRejectionReason: true
  });

  // HR Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      newApplications: true,
      approvalsPending: true,
      approvalsCompleted: true,
      employeeUpdates: true,
      terminations: true
    },
    adminNotifications: {
      systemAlerts: true,
      complianceAlerts: true,
      reportReady: true
    }
  });

  // HR Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: true,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumber: true,
    passwordRequireUpper: true,
    passwordExpiryDays: 90,
    lockoutDuration: 30,
    sessionTimeout: 15,
    maxLoginAttempts: 5,
    requireAuditLog: true,
    auditRetentionDays: 365
  });

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setSaveMessage('HR settings saved successfully!');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all HR settings to default values?')) {
      alert('Settings reset to defaults');
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
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    tab: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      background: 'white',
      color: '#333',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    activeTab: {
      background: '#667eea',
      color: 'white'
    },
    content: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '2px solid #f0f0f0'
    },
    subsectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#666',
      margin: '20px 0 15px 0'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
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
      padding: '10px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '14px'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '14px',
      minHeight: '80px'
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
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    checkboxLabel: {
      fontSize: '14px',
      color: '#333'
    },
    card: {
      background: '#f9f9f9',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '15px'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    cardTitle: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#333'
    },
    permissionTable: {
      marginTop: '10px',
      width: '100%',
      borderCollapse: 'collapse'
    },
    permissionRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px',
      borderBottom: '1px solid #e0e0e0'
    },
    actionButtons: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'flex-end',
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #f0f0f0'
    },
    saveButton: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '12px 30px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    resetButton: {
      background: 'white',
      color: '#666',
      border: '1px solid #e0e0e0',
      padding: '12px 30px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    successMessage: {
      background: '#f0fdf4',
      border: '1px solid #86efac',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      color: '#166534'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>HR Configuration</h1>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button 
          style={{...styles.tab, ...(activeTab === 'general' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('general')}
        >
          🏢 General
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'permissions' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('permissions')}
        >
          🔑 Permissions
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'approvals' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('approvals')}
        >
          ✅ Approvals
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'notifications' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('notifications')}
        >
          📨 Notifications
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'security' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {saveSuccess && (
          <div style={styles.successMessage}>
            ✅ {saveMessage}
          </div>
        )}

        {/* General HR Settings */}
        {activeTab === 'general' && (
          <>
            <h2 style={styles.sectionTitle}>General HR Settings</h2>
            
            <div style={styles.grid}>
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>HR Department Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={generalSettings.hrDepartmentName}
                    onChange={(e) => setGeneralSettings({...generalSettings, hrDepartmentName: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>HR Email</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={generalSettings.hrEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, hrEmail: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>HR Phone</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={generalSettings.hrPhone}
                    onChange={(e) => setGeneralSettings({...generalSettings, hrPhone: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>HR Manager</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={generalSettings.hrManager}
                    onChange={(e) => setGeneralSettings({...generalSettings, hrManager: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Office Location</label>
                  <textarea
                    style={styles.textarea}
                    value={generalSettings.officeLocation}
                    onChange={(e) => setGeneralSettings({...generalSettings, officeLocation: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Business Hours</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={generalSettings.businessHours}
                    onChange={(e) => setGeneralSettings({...generalSettings, businessHours: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Employee ID Prefix</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={generalSettings.employeeIdPrefix}
                    onChange={(e) => setGeneralSettings({...generalSettings, employeeIdPrefix: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Default Employment Type</label>
                  <select
                    style={styles.select}
                    value={generalSettings.defaultEmploymentType}
                    onChange={(e) => setGeneralSettings({...generalSettings, defaultEmploymentType: e.target.value})}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Probation Period (days)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={generalSettings.probationPeriodDays}
                    onChange={(e) => setGeneralSettings({...generalSettings, probationPeriodDays: parseInt(e.target.value)})}
                  />
                </div>

                <div style={styles.checkboxGroup}>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={generalSettings.requireOnboarding}
                      onChange={(e) => setGeneralSettings({...generalSettings, requireOnboarding: e.target.checked})}
                    />
                    <span style={styles.checkboxLabel}>Require Onboarding Process</span>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Permission Defaults */}
        {activeTab === 'permissions' && (
          <>
            <h2 style={styles.sectionTitle}>Permission Defaults</h2>
            
            <div style={styles.grid}>
              <div>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Default Employee Permissions</h3>
                  <div style={styles.checkboxGroup}>
                    {Object.entries(permissionDefaults.defaultPermissions).map(([key, value]) => (
                      <label key={key} style={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setPermissionDefaults({
                            ...permissionDefaults,
                            defaultPermissions: {
                              ...permissionDefaults.defaultPermissions,
                              [key]: e.target.checked
                            }
                          })}
                        />
                        <span style={styles.checkboxLabel}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>HR Team Permissions</h3>
                  <div style={styles.checkboxGroup}>
                    {Object.entries(permissionDefaults.hrPermissions).map(([key, value]) => (
                      <label key={key} style={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setPermissionDefaults({
                            ...permissionDefaults,
                            hrPermissions: {
                              ...permissionDefaults.hrPermissions,
                              [key]: e.target.checked
                            }
                          })}
                        />
                        <span style={styles.checkboxLabel}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Manager Permissions</h3>
                  <div style={styles.checkboxGroup}>
                    {Object.entries(permissionDefaults.managerPermissions).map(([key, value]) => (
                      <label key={key} style={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setPermissionDefaults({
                            ...permissionDefaults,
                            managerPermissions: {
                              ...permissionDefaults.managerPermissions,
                              [key]: e.target.checked
                            }
                          })}
                        />
                        <span style={styles.checkboxLabel}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.checkboxGroup}>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={permissionDefaults.allowCustomPermissions}
                      onChange={(e) => setPermissionDefaults({...permissionDefaults, allowCustomPermissions: e.target.checked})}
                    />
                    <span style={styles.checkboxLabel}>Allow Custom Permissions per Employee</span>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Approval Settings */}
        {activeTab === 'approvals' && (
          <>
            <h2 style={styles.sectionTitle}>Approval Settings</h2>
            
            <div style={styles.grid}>
              <div>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Require Approval For</h3>
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={approvalSettings.requireApproval.newEmployees}
                        onChange={(e) => setApprovalSettings({
                          ...approvalSettings,
                          requireApproval: {...approvalSettings.requireApproval, newEmployees: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>New Employee Registration</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={approvalSettings.requireApproval.roleChanges}
                        onChange={(e) => setApprovalSettings({
                          ...approvalSettings,
                          requireApproval: {...approvalSettings.requireApproval, roleChanges: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Role Changes</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={approvalSettings.requireApproval.permissionChanges}
                        onChange={(e) => setApprovalSettings({
                          ...approvalSettings,
                          requireApproval: {...approvalSettings.requireApproval, permissionChanges: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Permission Changes</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={approvalSettings.requireApproval.salaryChanges}
                        onChange={(e) => setApprovalSettings({
                          ...approvalSettings,
                          requireApproval: {...approvalSettings.requireApproval, salaryChanges: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Salary Changes</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={approvalSettings.requireApproval.terminationRequests}
                        onChange={(e) => setApprovalSettings({
                          ...approvalSettings,
                          requireApproval: {...approvalSettings.requireApproval, terminationRequests: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Termination Requests</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Approver Roles (comma-separated)</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={approvalSettings.approverRoles.join(', ')}
                    onChange={(e) => setApprovalSettings({
                      ...approvalSettings,
                      approverRoles: e.target.value.split(',').map(s => s.trim())
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Auto-Approve After (days)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={approvalSettings.autoApproveAfterDays}
                    onChange={(e) => setApprovalSettings({...approvalSettings, autoApproveAfterDays: parseInt(e.target.value)})}
                  />
                </div>

                <div style={styles.checkboxGroup}>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={approvalSettings.notifyOnApproval}
                      onChange={(e) => setApprovalSettings({...approvalSettings, notifyOnApproval: e.target.checked})}
                    />
                    <span style={styles.checkboxLabel}>Notify on Approval</span>
                  </label>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={approvalSettings.notifyOnRejection}
                      onChange={(e) => setApprovalSettings({...approvalSettings, notifyOnRejection: e.target.checked})}
                    />
                    <span style={styles.checkboxLabel}>Notify on Rejection</span>
                  </label>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={approvalSettings.requireRejectionReason}
                      onChange={(e) => setApprovalSettings({...approvalSettings, requireRejectionReason: e.target.checked})}
                    />
                    <span style={styles.checkboxLabel}>Require Reason for Rejection</span>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <>
            <h2 style={styles.sectionTitle}>HR Notification Preferences</h2>
            
            <div style={styles.grid}>
              <div>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Email Notifications</h3>
                  
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.newApplications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, newApplications: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>New Employee Applications</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.approvalsPending}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, approvalsPending: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Approvals Pending</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.approvalsCompleted}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, approvalsCompleted: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Approvals Completed</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.employeeUpdates}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, employeeUpdates: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Employee Profile Updates</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.terminations}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, terminations: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Terminations</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Admin Notifications</h3>
                  
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.adminNotifications.systemAlerts}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          adminNotifications: {...notificationSettings.adminNotifications, systemAlerts: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>System Alerts</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.adminNotifications.complianceAlerts}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          adminNotifications: {...notificationSettings.adminNotifications, complianceAlerts: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Compliance Alerts</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.adminNotifications.reportReady}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          adminNotifications: {...notificationSettings.adminNotifications, reportReady: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Report Ready</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* HR Security Settings */}
        {activeTab === 'security' && (
          <>
            <h2 style={styles.sectionTitle}>HR Security Configuration</h2>
            
            <div style={styles.grid}>
              <div>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Authentication</h3>
                  
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorRequired}
                        onChange={(e) => setSecuritySettings({...securitySettings, twoFactorRequired: e.target.checked})}
                      />
                      <span style={styles.checkboxLabel}>Require Two-Factor Authentication</span>
                    </label>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password Minimum Length</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                    />
                  </div>

                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={securitySettings.passwordRequireSpecial}
                        onChange={(e) => setSecuritySettings({...securitySettings, passwordRequireSpecial: e.target.checked})}
                      />
                      <span style={styles.checkboxLabel}>Require Special Characters</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={securitySettings.passwordRequireNumber}
                        onChange={(e) => setSecuritySettings({...securitySettings, passwordRequireNumber: e.target.checked})}
                      />
                      <span style={styles.checkboxLabel}>Require Numbers</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={securitySettings.passwordRequireUpper}
                        onChange={(e) => setSecuritySettings({...securitySettings, passwordRequireUpper: e.target.checked})}
                      />
                      <span style={styles.checkboxLabel}>Require Uppercase Letters</span>
                    </label>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password Expiry (days)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={securitySettings.passwordExpiryDays}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiryDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Session & Audit</h3>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Max Login Attempts</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                    />
                  </div>

                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={securitySettings.requireAuditLog}
                        onChange={(e) => setSecuritySettings({...securitySettings, requireAuditLog: e.target.checked})}
                      />
                      <span style={styles.checkboxLabel}>Require Audit Log</span>
                    </label>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Audit Retention (days)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={securitySettings.auditRetentionDays}
                      onChange={(e) => setSecuritySettings({...securitySettings, auditRetentionDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button style={styles.resetButton} onClick={handleResetDefaults}>
            Reset to Defaults
          </button>
          <button style={styles.saveButton} onClick={handleSaveSettings}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRSettings;