import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'fees', 'limits', 'maintenance', 'security', 'notifications'
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    bankName: 'Snopitech Bank',
    bankAddress: '1023 Christmas Lane, Gambrills, MD 21054',
    bankPhone: '+1 (713) 870-1132',
    bankEmail: 'support@snopitech.com',
    website: 'www.snopitech.com',
    routingNumber: '842917356',
    swiftCode: 'SNOPUS33',
    fdicInsurance: 'Yes',
    timeZone: 'America/New_York',
    businessHours: '24/7 Online, Branch: Mon-Fri 9am-5pm'
  });

  // Fee Settings
  const [feeSettings, setFeeSettings] = useState({
    monthlyMaintenance: { checking: 0, savings: 0, business: 15 },
    overdraftFee: 35,
    atmFee: 2.50,
    foreignTransactionFee: 1.0,
    wireTransferIncoming: 15,
    wireTransferOutgoing: 25,
    stopPayment: 35,
    cashierCheck: 10,
    cardReplacement: { standard: 0, expedited: 15 },
    statementCopy: 5,
    accountClosing: 0
  });

  // Limit Settings
  const [limitSettings, setLimitSettings] = useState({
    dailyWithdrawal: { atm: 1000, teller: 5000, online: 3000 },
    dailyTransfer: { internal: 10000, external: 5000, wire: 25000 },
    cardTransaction: { single: 5000, daily: 10000, monthly: 50000 },
    minimumBalance: { checking: 0, savings: 300, business: 1000 },
    maximumBalance: { checking: 1000000, savings: 5000000, business: 10000000 },
    depositLimits: { atm: 5000, mobile: 10000, teller: 50000 }
  });

  // Maintenance Settings
  const [maintenanceSettings, setMaintenanceSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: 'System is currently under maintenance. Please check back later.',
    scheduledMaintenance: [
      { id: 1, date: '2026-02-20', startTime: '02:00', endTime: '04:00', description: 'Database upgrade', status: 'scheduled' },
      { id: 2, date: '2026-02-22', startTime: '03:00', endTime: '05:00', description: 'Security patch', status: 'scheduled' }
    ],
    backupTime: '02:00',
    backupFrequency: 'daily',
    logRetentionDays: 90,
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: true,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumber: true,
    passwordRequireUpper: true,
    passwordExpiryDays: 90,
    lockoutDuration: 30,
    ipWhitelisting: false,
    allowedIPs: '192.168.1.0/24,10.0.0.0/8',
    fraudDetection: true,
    suspiciousThreshold: 10000,
    emailAlerts: true,
    smsAlerts: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      newUser: true,
      largeTransaction: true,
      failedLogin: true,
      accountChanges: true,
      weeklySummary: true,
      monthlyStatement: true
    },
    smsNotifications: {
      largeTransaction: true,
      failedLogin: false,
      otpVerification: true
    },
    adminNotifications: {
      newApplications: true,
      flaggedTransactions: true,
      supportTickets: true,
      systemAlerts: true,
      dailyReport: true
    }
  });

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all settings to default values?')) {
      alert('Settings reset to defaults');
    }
  };

  const handleAddMaintenance = () => {
    alert('Add scheduled maintenance window');
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
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600'
    },
    scheduledMaintenance: {
      marginTop: '15px'
    },
    maintenanceItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      border: '1px solid #f0f0f0',
      borderRadius: '6px',
      marginBottom: '10px'
    },
    addButton: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '13px',
      cursor: 'pointer'
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
        <h1 style={styles.headerTitle}>System Configuration</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
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
          style={{...styles.tab, ...(activeTab === 'fees' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('fees')}
        >
          💰 Fees
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'limits' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('limits')}
        >
          📊 Limits
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'maintenance' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('maintenance')}
        >
          🔧 Maintenance
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'security' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'notifications' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('notifications')}
        >
          📨 Notifications
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {saveSuccess && (
          <div style={styles.successMessage}>
            ✅ {saveMessage}
          </div>
        )}

        {/* General Settings */}
        {activeTab === 'general' && (
          <>
            <h2 style={styles.sectionTitle}>General Bank Settings</h2>
            
            <div style={styles.grid}>
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Bank Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={generalSettings.bankName}
                    onChange={(e) => setGeneralSettings({...generalSettings, bankName: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Bank Address</label>
                  <textarea
                    style={styles.textarea}
                    value={generalSettings.bankAddress}
                    onChange={(e) => setGeneralSettings({...generalSettings, bankAddress: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Bank Phone</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={generalSettings.bankPhone}
                    onChange={(e) => setGeneralSettings({...generalSettings, bankPhone: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Bank Email</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={generalSettings.bankEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, bankEmail: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Website</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={generalSettings.website}
                    onChange={(e) => setGeneralSettings({...generalSettings, website: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Routing Number</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={generalSettings.routingNumber}
                    onChange={(e) => setGeneralSettings({...generalSettings, routingNumber: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>SWIFT Code</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={generalSettings.swiftCode}
                    onChange={(e) => setGeneralSettings({...generalSettings, swiftCode: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Time Zone</label>
                  <select
                    style={styles.select}
                    value={generalSettings.timeZone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timeZone: e.target.value})}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
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
              </div>
            </div>
          </>
        )}

        {/* Fee Settings */}
        {activeTab === 'fees' && (
          <>
            <h2 style={styles.sectionTitle}>Fee Configuration</h2>
            
            <div style={styles.grid}>
              <div>
                <h3 style={styles.subsectionTitle}>Monthly Maintenance</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Checking Account</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={feeSettings.monthlyMaintenance.checking}
                    onChange={(e) => setFeeSettings({
                      ...feeSettings, 
                      monthlyMaintenance: {...feeSettings.monthlyMaintenance, checking: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Savings Account</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={feeSettings.monthlyMaintenance.savings}
                    onChange={(e) => setFeeSettings({
                      ...feeSettings, 
                      monthlyMaintenance: {...feeSettings.monthlyMaintenance, savings: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Business Account</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={feeSettings.monthlyMaintenance.business}
                    onChange={(e) => setFeeSettings({
                      ...feeSettings, 
                      monthlyMaintenance: {...feeSettings.monthlyMaintenance, business: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <h3 style={styles.subsectionTitle}>Transaction Fees</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Overdraft Fee</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={feeSettings.overdraftFee}
                    onChange={(e) => setFeeSettings({...feeSettings, overdraftFee: parseFloat(e.target.value)})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>ATM Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    style={styles.input}
                    value={feeSettings.atmFee}
                    onChange={(e) => setFeeSettings({...feeSettings, atmFee: parseFloat(e.target.value)})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Foreign Transaction Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    style={styles.input}
                    value={feeSettings.foreignTransactionFee}
                    onChange={(e) => setFeeSettings({...feeSettings, foreignTransactionFee: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <h3 style={styles.subsectionTitle}>Wire Transfers</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Incoming Wire</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={feeSettings.wireTransferIncoming}
                    onChange={(e) => setFeeSettings({...feeSettings, wireTransferIncoming: parseFloat(e.target.value)})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Outgoing Wire</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={feeSettings.wireTransferOutgoing}
                    onChange={(e) => setFeeSettings({...feeSettings, wireTransferOutgoing: parseFloat(e.target.value)})}
                  />
                </div>

                <h3 style={styles.subsectionTitle}>Service Fees</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stop Payment</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={feeSettings.stopPayment}
                    onChange={(e) => setFeeSettings({...feeSettings, stopPayment: parseFloat(e.target.value)})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Cashier's Check</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={feeSettings.cashierCheck}
                    onChange={(e) => setFeeSettings({...feeSettings, cashierCheck: parseFloat(e.target.value)})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Statement Copy</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={feeSettings.statementCopy}
                    onChange={(e) => setFeeSettings({...feeSettings, statementCopy: parseFloat(e.target.value)})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Closing</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={feeSettings.accountClosing}
                    onChange={(e) => setFeeSettings({...feeSettings, accountClosing: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Limit Settings */}
        {activeTab === 'limits' && (
          <>
            <h2 style={styles.sectionTitle}>Transaction Limits</h2>
            
            <div style={styles.grid}>
              <div>
                <h3 style={styles.subsectionTitle}>Daily Withdrawal Limits</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>ATM</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.dailyWithdrawal.atm}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      dailyWithdrawal: {...limitSettings.dailyWithdrawal, atm: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Teller</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.dailyWithdrawal.teller}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      dailyWithdrawal: {...limitSettings.dailyWithdrawal, teller: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Online</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.dailyWithdrawal.online}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      dailyWithdrawal: {...limitSettings.dailyWithdrawal, online: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <h3 style={styles.subsectionTitle}>Transfer Limits</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Internal Transfer</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.dailyTransfer.internal}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      dailyTransfer: {...limitSettings.dailyTransfer, internal: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>External Transfer</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.dailyTransfer.external}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      dailyTransfer: {...limitSettings.dailyTransfer, external: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Wire Transfer</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.dailyTransfer.wire}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      dailyTransfer: {...limitSettings.dailyTransfer, wire: parseFloat(e.target.value)}
                    })}
                  />
                </div>
              </div>

              <div>
                <h3 style={styles.subsectionTitle}>Card Transaction Limits</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Single Transaction</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.cardTransaction.single}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      cardTransaction: {...limitSettings.cardTransaction, single: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Daily Total</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.cardTransaction.daily}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      cardTransaction: {...limitSettings.cardTransaction, daily: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Monthly Total</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.cardTransaction.monthly}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      cardTransaction: {...limitSettings.cardTransaction, monthly: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <h3 style={styles.subsectionTitle}>Minimum Balances</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Checking</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.minimumBalance.checking}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      minimumBalance: {...limitSettings.minimumBalance, checking: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Savings</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.minimumBalance.savings}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      minimumBalance: {...limitSettings.minimumBalance, savings: parseFloat(e.target.value)}
                    })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Business</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={limitSettings.minimumBalance.business}
                    onChange={(e) => setLimitSettings({
                      ...limitSettings, 
                      minimumBalance: {...limitSettings.minimumBalance, business: parseFloat(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Maintenance Settings */}
        {activeTab === 'maintenance' && (
          <>
            <h2 style={styles.sectionTitle}>System Maintenance</h2>
            
            <div style={styles.grid}>
              <div>
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTitle}>Maintenance Mode</span>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={maintenanceSettings.maintenanceMode}
                        onChange={(e) => setMaintenanceSettings({...maintenanceSettings, maintenanceMode: e.target.checked})}
                      />
                      <span style={styles.checkboxLabel}>Enable</span>
                    </label>
                  </div>
                  {maintenanceSettings.maintenanceMode && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Maintenance Message</label>
                      <textarea
                        style={styles.textarea}
                        value={maintenanceSettings.maintenanceMessage}
                        onChange={(e) => setMaintenanceSettings({...maintenanceSettings, maintenanceMessage: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Backup Settings</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Backup Time</label>
                    <input
                      type="time"
                      style={styles.input}
                      value={maintenanceSettings.backupTime}
                      onChange={(e) => setMaintenanceSettings({...maintenanceSettings, backupTime: e.target.value})}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Backup Frequency</label>
                    <select
                      style={styles.select}
                      value={maintenanceSettings.backupFrequency}
                      onChange={(e) => setMaintenanceSettings({...maintenanceSettings, backupFrequency: e.target.value})}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Log Retention (days)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={maintenanceSettings.logRetentionDays}
                      onChange={(e) => setMaintenanceSettings({...maintenanceSettings, logRetentionDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTitle}>Scheduled Maintenance</span>
                    <button style={styles.addButton} onClick={handleAddMaintenance}>+ Add</button>
                  </div>

                  <div style={styles.scheduledMaintenance}>
                    {maintenanceSettings.scheduledMaintenance.map((item) => (
                      <div key={item.id} style={styles.maintenanceItem}>
                        <div>
                          <div><strong>{item.date}</strong> {item.startTime} - {item.endTime}</div>
                          <div style={{fontSize: '12px', color: '#666'}}>{item.description}</div>
                        </div>
                        <span style={{
                          ...styles.statusBadge,
                          background: item.status === 'scheduled' ? '#eab30820' : '#22c55e20',
                          color: item.status === 'scheduled' ? '#eab308' : '#22c55e'
                        }}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Session Settings</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={maintenanceSettings.sessionTimeout}
                      onChange={(e) => setMaintenanceSettings({...maintenanceSettings, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Max Login Attempts</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={maintenanceSettings.maxLoginAttempts}
                      onChange={(e) => setMaintenanceSettings({...maintenanceSettings, maxLoginAttempts: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <>
            <h2 style={styles.sectionTitle}>Security Configuration</h2>
            
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
                  <h3 style={styles.cardTitle}>Fraud Prevention</h3>
                  
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={securitySettings.fraudDetection}
                        onChange={(e) => setSecuritySettings({...securitySettings, fraudDetection: e.target.checked})}
                      />
                      <span style={styles.checkboxLabel}>Enable Fraud Detection</span>
                    </label>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Suspicious Transaction Threshold ($)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={securitySettings.suspiciousThreshold}
                      onChange={(e) => setSecuritySettings({...securitySettings, suspiciousThreshold: parseFloat(e.target.value)})}
                    />
                  </div>

                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={securitySettings.emailAlerts}
                        onChange={(e) => setSecuritySettings({...securitySettings, emailAlerts: e.target.checked})}
                      />
                      <span style={styles.checkboxLabel}>Email Alerts for Suspicious Activity</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={securitySettings.smsAlerts}
                        onChange={(e) => setSecuritySettings({...securitySettings, smsAlerts: e.target.checked})}
                      />
                      <span style={styles.checkboxLabel}>SMS Alerts for Suspicious Activity</span>
                    </label>
                  </div>

                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={securitySettings.ipWhitelisting}
                        onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelisting: e.target.checked})}
                      />
                      <span style={styles.checkboxLabel}>Enable IP Whitelisting</span>
                    </label>
                  </div>

                  {securitySettings.ipWhitelisting && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Allowed IPs (comma-separated CIDR)</label>
                      <textarea
                        style={styles.textarea}
                        value={securitySettings.allowedIPs}
                        onChange={(e) => setSecuritySettings({...securitySettings, allowedIPs: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <>
            <h2 style={styles.sectionTitle}>Notification Preferences</h2>
            
            <div style={styles.grid}>
              <div>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Email Notifications (Customer)</h3>
                  
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.newUser}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, newUser: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>New User Registration</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.largeTransaction}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, largeTransaction: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Large Transaction Alerts</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.failedLogin}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, failedLogin: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Failed Login Attempts</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.accountChanges}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, accountChanges: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Account Changes</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.weeklySummary}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, weeklySummary: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Weekly Summary</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.monthlyStatement}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {...notificationSettings.emailNotifications, monthlyStatement: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Monthly Statement</span>
                    </label>
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>SMS Notifications</h3>
                  
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications.largeTransaction}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          smsNotifications: {...notificationSettings.smsNotifications, largeTransaction: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Large Transaction Alerts</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications.failedLogin}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          smsNotifications: {...notificationSettings.smsNotifications, failedLogin: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Failed Login Alerts</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications.otpVerification}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          smsNotifications: {...notificationSettings.smsNotifications, otpVerification: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>OTP Verification</span>
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
                        checked={notificationSettings.adminNotifications.newApplications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          adminNotifications: {...notificationSettings.adminNotifications, newApplications: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>New Applications</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.adminNotifications.flaggedTransactions}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          adminNotifications: {...notificationSettings.adminNotifications, flaggedTransactions: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Flagged Transactions</span>
                    </label>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.adminNotifications.supportTickets}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          adminNotifications: {...notificationSettings.adminNotifications, supportTickets: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>New Support Tickets</span>
                    </label>
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
                        checked={notificationSettings.adminNotifications.dailyReport}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          adminNotifications: {...notificationSettings.adminNotifications, dailyReport: e.target.checked}
                        })}
                      />
                      <span style={styles.checkboxLabel}>Daily Report</span>
                    </label>
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

export default AdminSettings;
