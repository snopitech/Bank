import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAlerts = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock alerts data
  const [alerts] = useState([
    {
      id: 1,
      type: 'SECURITY',
      severity: 'HIGH',
      status: 'ACTIVE',
      title: 'Multiple Failed Login Attempts',
      message: 'User Michael Agbonifo has 5 failed login attempts in the last 15 minutes',
      customer: 'Michael Agbonifo',
      customerId: 1,
      timestamp: '2026-02-17 10:30:45',
      ipAddress: '192.168.1.105',
      location: 'Houston, TX',
      device: 'Chrome / Windows',
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolved: false,
      resolvedBy: null,
      resolvedAt: null,
      notes: ''
    },
    {
      id: 2,
      type: 'TRANSACTION',
      severity: 'HIGH',
      status: 'ACTIVE',
      title: 'Large Transfer Detected',
      message: '$50,000 transfer initiated from account ****2326 to external account',
      customer: 'Tracy Agbonifo',
      customerId: 3,
      timestamp: '2026-02-17 09:15:22',
      amount: 50000,
      accountFrom: '****2326',
      accountTo: 'EXT-7890',
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolved: false,
      resolvedBy: null,
      resolvedAt: null,
      notes: ''
    },
    {
      id: 3,
      type: 'FRAUD',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      title: 'Potential Card Skimming',
      message: 'Multiple ATM withdrawals at different locations within 1 hour',
      customer: 'Cynthia Ekeh',
      customerId: 2,
      timestamp: '2026-02-17 08:45:12',
      transactions: [
        { time: '07:30', location: 'ATM #1234, Houston', amount: 500 },
        { time: '08:15', location: 'ATM #5678, Pearland', amount: 400 }
      ],
      acknowledged: true,
      acknowledgedBy: 'Sarah Johnson',
      acknowledgedAt: '2026-02-17 09:00:00',
      resolved: false,
      resolvedBy: null,
      resolvedAt: null,
      notes: 'Under investigation'
    },
    {
      id: 4,
      type: 'SYSTEM',
      severity: 'MEDIUM',
      status: 'ACTIVE',
      title: 'Database Performance Degradation',
      message: 'Query response time increased by 150% in the last hour',
      customer: null,
      customerId: null,
      timestamp: '2026-02-17 07:30:00',
      metrics: {
        responseTime: '250ms',
        normal: '100ms',
        queries: '10,234/min'
      },
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolved: false,
      resolvedBy: null,
      resolvedAt: null,
      notes: ''
    },
    {
      id: 5,
      type: 'ACCOUNT',
      severity: 'LOW',
      status: 'ACTIVE',
      title: 'Low Balance Alert',
      message: 'Account ****2326 has balance below $100 threshold',
      customer: 'Tracy Agbonifo',
      customerId: 3,
      timestamp: '2026-02-17 06:20:33',
      account: '****2326',
      balance: 25.00,
      threshold: 100.00,
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolved: false,
      resolvedBy: null,
      resolvedAt: null,
      notes: ''
    },
    {
      id: 6,
      type: 'COMPLIANCE',
      severity: 'HIGH',
      status: 'RESOLVED',
      title: 'KYC Verification Required',
      message: 'Customer Bose Agbonifo needs document verification',
      customer: 'Bose Agbonifo',
      customerId: 4,
      timestamp: '2026-02-16 14:30:00',
      documents: ['ID Card', 'Proof of Address'],
      acknowledged: true,
      acknowledgedBy: 'John Smith',
      acknowledgedAt: '2026-02-16 15:00:00',
      resolved: true,
      resolvedBy: 'John Smith',
      resolvedAt: '2026-02-16 16:30:00',
      notes: 'Documents verified and approved'
    },
    {
      id: 7,
      type: 'CARD',
      severity: 'HIGH',
      status: 'RESOLVED',
      title: 'Lost Card Report',
      message: 'Customer reported card ****6581 as lost/stolen',
      customer: 'Michael Agbonifo',
      customerId: 1,
      timestamp: '2026-02-16 11:20:15',
      cardNumber: '****6581',
      reason: 'Lost',
      acknowledged: true,
      acknowledgedBy: 'Lisa Brown',
      acknowledgedAt: '2026-02-16 11:30:00',
      resolved: true,
      resolvedBy: 'Lisa Brown',
      resolvedAt: '2026-02-16 11:45:00',
      notes: 'Card blocked, replacement ordered'
    },
    {
      id: 8,
      type: 'TRANSACTION',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      title: 'Duplicate Transaction Reported',
      message: 'Customer reported duplicate charge of $45.67 at Uber',
      customer: 'Test User',
      customerId: 5,
      timestamp: '2026-02-16 09:10:22',
      amount: 45.67,
      merchant: 'Uber',
      transactionId: 'TXN-1008',
      acknowledged: true,
      acknowledgedBy: 'Mike Wilson',
      acknowledgedAt: '2026-02-16 09:30:00',
      resolved: true,
      resolvedBy: 'Mike Wilson',
      resolvedAt: '2026-02-16 10:15:00',
      notes: 'Duplicate charge refunded'
    },
    {
      id: 9,
      type: 'SYSTEM',
      severity: 'LOW',
      status: 'RESOLVED',
      title: 'Scheduled Maintenance',
      message: 'System maintenance completed successfully',
      customer: null,
      customerId: null,
      timestamp: '2026-02-16 04:00:00',
      duration: '2 hours',
      components: ['Database', 'API Gateway'],
      acknowledged: true,
      acknowledgedBy: 'System',
      acknowledgedAt: '2026-02-16 04:00:00',
      resolved: true,
      resolvedBy: 'System',
      resolvedAt: '2026-02-16 06:00:00',
      notes: 'All systems operational'
    },
    {
      id: 10,
      type: 'SECURITY',
      severity: 'MEDIUM',
      status: 'ACTIVE',
      title: 'New Device Login',
      message: 'User Cynthia Ekeh logged in from new device',
      customer: 'Cynthia Ekeh',
      customerId: 2,
      timestamp: '2026-02-17 11:45:33',
      device: 'Firefox / MacOS',
      location: 'Austin, TX',
      ipAddress: '192.168.1.205',
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolved: false,
      resolvedBy: null,
      resolvedAt: null,
      notes: ''
    }
  ]);

  const alertTypes = [
    { id: 'all', name: 'All Types', count: alerts.length },
    { id: 'SECURITY', name: 'Security', count: alerts.filter(a => a.type === 'SECURITY').length, icon: '🔒' },
    { id: 'TRANSACTION', name: 'Transaction', count: alerts.filter(a => a.type === 'TRANSACTION').length, icon: '💰' },
    { id: 'FRAUD', name: 'Fraud', count: alerts.filter(a => a.type === 'FRAUD').length, icon: '🚩' },
    { id: 'ACCOUNT', name: 'Account', count: alerts.filter(a => a.type === 'ACCOUNT').length, icon: '🏦' },
    { id: 'CARD', name: 'Card', count: alerts.filter(a => a.type === 'CARD').length, icon: '💳' },
    { id: 'SYSTEM', name: 'System', count: alerts.filter(a => a.type === 'SYSTEM').length, icon: '⚙️' },
    { id: 'COMPLIANCE', name: 'Compliance', count: alerts.filter(a => a.type === 'COMPLIANCE').length, icon: '📋' }
  ];

  const severityLevels = [
    { id: 'all', name: 'All Severities', count: alerts.length },
    { id: 'CRITICAL', name: 'Critical', count: alerts.filter(a => a.severity === 'CRITICAL').length, color: '#7f1d1d' },
    { id: 'HIGH', name: 'High', count: alerts.filter(a => a.severity === 'HIGH').length, color: '#991b1b' },
    { id: 'MEDIUM', name: 'Medium', count: alerts.filter(a => a.severity === 'MEDIUM').length, color: '#b45309' },
    { id: 'LOW', name: 'Low', count: alerts.filter(a => a.severity === 'LOW').length, color: '#047857' }
  ];

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return '#7f1d1d';
      case 'HIGH': return '#991b1b';
      case 'MEDIUM': return '#b45309';
      case 'LOW': return '#047857';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'SECURITY': '🔒',
      'TRANSACTION': '💰',
      'FRAUD': '🚩',
      'ACCOUNT': '🏦',
      'CARD': '💳',
      'SYSTEM': '⚙️',
      'COMPLIANCE': '📋'
    };
    return icons[type] || '📢';
  };

  const getStatusColor = (status) => {
    return status === 'ACTIVE' ? '#ef4444' : '#22c55e';
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      (alert.title && alert.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.message && alert.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.customer && alert.customer.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    
    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const handleAcknowledge = (alertId) => {
    alert(`Alert ${alertId} acknowledged`);
  };

  const handleResolve = (alertId) => {
    alert(`Alert ${alertId} resolved`);
  };

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'ACTIVE').length,
    critical: alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length,
    high: alerts.filter(a => a.severity === 'HIGH' && a.status === 'ACTIVE').length,
    security: alerts.filter(a => a.type === 'SECURITY' && a.status === 'ACTIVE').length,
    fraud: alerts.filter(a => a.type === 'FRAUD' && a.status === 'ACTIVE').length
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    statLabel: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '5px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333'
    },
    statSub: {
      fontSize: '12px',
      marginTop: '5px'
    },
    filters: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '15px',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    searchInput: {
      flex: 2,
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '250px'
    },
    filterSelect: {
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'white',
      minWidth: '150px'
    },
    summary: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    summaryText: {
      color: '#666',
      fontSize: '14px'
    },
    summaryHighlight: {
      fontWeight: 'bold',
      color: '#333',
      marginLeft: '5px'
    },
    alertsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    alertItem: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s',
      borderLeft: '4px solid transparent'
    },
    alertHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    alertType: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    typeIcon: {
      fontSize: '20px'
    },
    typeName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    alertTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '5px'
    },
    alertMessage: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '10px'
    },
    alertMeta: {
      display: 'flex',
      gap: '20px',
      fontSize: '12px',
      color: '#999',
      marginBottom: '10px'
    },
    severityBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      color: 'white'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600'
    },
    alertFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '10px',
      paddingTop: '10px',
      borderTop: '1px solid #f0f0f0'
    },
    actionButton: {
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '12px',
      cursor: 'pointer',
      marginRight: '8px'
    },
    acknowledgeButton: {
      background: '#eab308',
      color: 'white'
    },
    resolveButton: {
      background: '#22c55e',
      color: 'white'
    },
    modal: {
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
      padding: '30px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333'
    },
    detailRow: {
      display: 'flex',
      marginBottom: '12px',
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    detailLabel: {
      width: '120px',
      color: '#666',
      fontSize: '14px'
    },
    detailValue: {
      flex: 1,
      fontWeight: '500',
      color: '#333'
    },
    notesTextarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '100px',
      marginTop: '10px'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Alerts & Notifications</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Alerts</div>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={{...styles.statSub, color: '#ef4444'}}>{stats.active} active</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Critical</div>
          <div style={{...styles.statValue, color: '#7f1d1d'}}>{stats.critical}</div>
          <div style={styles.statSub}>Need immediate attention</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>High Priority</div>
          <div style={{...styles.statValue, color: '#991b1b'}}>{stats.high}</div>
          <div style={styles.statSub}>Require review</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Security/Fraud</div>
          <div style={styles.statValue}>{stats.security + stats.fraud}</div>
          <div style={styles.statSub}>Security: {stats.security} | Fraud: {stats.fraud}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by title, message, customer..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          style={styles.filterSelect}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          {alertTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.icon} {type.name} ({type.count})
            </option>
          ))}
        </select>
        <select
          style={styles.filterSelect}
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
        >
          {severityLevels.map(level => (
            <option key={level.id} value={level.id}>
              {level.name} ({level.count})
            </option>
          ))}
        </select>
        <select
          style={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active ({alerts.filter(a => a.status === 'ACTIVE').length})</option>
          <option value="RESOLVED">Resolved ({alerts.filter(a => a.status === 'RESOLVED').length})</option>
        </select>
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        <span style={styles.summaryText}>
          Showing <span style={styles.summaryHighlight}>{filteredAlerts.length}</span> of <span style={styles.summaryHighlight}>{alerts.length}</span> alerts
        </span>
        <span style={styles.summaryText}>
          Active: <span style={{...styles.summaryHighlight, color: '#ef4444'}}>{filteredAlerts.filter(a => a.status === 'ACTIVE').length}</span>
        </span>
      </div>

      {/* Alerts List */}
      <div style={styles.alertsList}>
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            style={{
              ...styles.alertItem,
              borderLeftColor: getSeverityColor(alert.severity)
            }}
            onClick={() => {
              setSelectedAlert(alert);
              setShowDetails(true);
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
          >
            <div style={styles.alertHeader}>
              <div style={styles.alertType}>
                <span style={styles.typeIcon}>{getTypeIcon(alert.type)}</span>
                <span style={styles.typeName}>{alert.type}</span>
              </div>
              <span style={{
                ...styles.statusBadge,
                background: `${getStatusColor(alert.status)}20`,
                color: getStatusColor(alert.status)
              }}>
                {alert.status}
              </span>
            </div>

            <div style={styles.alertTitle}>{alert.title}</div>
            <div style={styles.alertMessage}>{alert.message}</div>

            <div style={styles.alertMeta}>
              <span>🕒 {alert.timestamp}</span>
              {alert.customer && <span>👤 {alert.customer}</span>}
              {alert.amount && <span>💰 ${alert.amount.toLocaleString()}</span>}
            </div>

            <div style={styles.alertFooter}>
              <span style={{
                ...styles.severityBadge,
                background: getSeverityColor(alert.severity)
              }}>
                {alert.severity}
              </span>
              <div>
                {!alert.acknowledged && alert.status === 'ACTIVE' && (
                  <button
                    style={{...styles.actionButton, ...styles.acknowledgeButton}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcknowledge(alert.id);
                    }}
                  >
                    Acknowledge
                  </button>
                )}
                {alert.acknowledged && !alert.resolved && alert.status === 'ACTIVE' && (
                  <button
                    style={{...styles.actionButton, ...styles.resolveButton}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolve(alert.id);
                    }}
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {showDetails && selectedAlert && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Alert Details</h2>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Alert ID:</div>
              <div style={styles.detailValue}>#{selectedAlert.id}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Type:</div>
              <div style={styles.detailValue}>
                <span style={styles.typeIcon}>{getTypeIcon(selectedAlert.type)}</span> {selectedAlert.type}
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Severity:</div>
              <div>
                <span style={{
                  ...styles.severityBadge,
                  background: getSeverityColor(selectedAlert.severity)
                }}>
                  {selectedAlert.severity}
                </span>
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Status:</div>
              <div>
                <span style={{
                  ...styles.statusBadge,
                  background: `${getStatusColor(selectedAlert.status)}20`,
                  color: getStatusColor(selectedAlert.status)
                }}>
                  {selectedAlert.status}
                </span>
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Title:</div>
              <div style={styles.detailValue}>{selectedAlert.title}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Message:</div>
              <div style={styles.detailValue}>{selectedAlert.message}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Timestamp:</div>
              <div style={styles.detailValue}>{selectedAlert.timestamp}</div>
            </div>
            {selectedAlert.customer && (
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Customer:</div>
                <div style={styles.detailValue}>{selectedAlert.customer} (ID: {selectedAlert.customerId})</div>
              </div>
            )}
            {selectedAlert.ipAddress && (
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>IP Address:</div>
                <div style={styles.detailValue}>{selectedAlert.ipAddress}</div>
              </div>
            )}
            {selectedAlert.location && (
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Location:</div>
                <div style={styles.detailValue}>{selectedAlert.location}</div>
              </div>
            )}
            {selectedAlert.amount && (
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Amount:</div>
                <div style={styles.detailValue}>${selectedAlert.amount.toLocaleString()}</div>
              </div>
            )}

            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Acknowledged:</div>
              <div style={styles.detailValue}>
                {selectedAlert.acknowledged ? `Yes by ${selectedAlert.acknowledgedBy} at ${selectedAlert.acknowledgedAt}` : 'No'}
              </div>
            </div>

            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Resolved:</div>
              <div style={styles.detailValue}>
                {selectedAlert.resolved ? `Yes by ${selectedAlert.resolvedBy} at ${selectedAlert.resolvedAt}` : 'No'}
              </div>
            </div>

            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Notes:</div>
              <div style={styles.detailValue}>{selectedAlert.notes || 'No notes'}</div>
            </div>

            <textarea
              style={styles.notesTextarea}
              placeholder="Add notes..."
              value={selectedAlert.notes}
              onChange={(e) => {
                const updated = {...selectedAlert, notes: e.target.value};
                setSelectedAlert(updated);
              }}
            />

            <div style={styles.modalButtons}>
              {!selectedAlert.acknowledged && selectedAlert.status === 'ACTIVE' && (
                <button
                  style={{...styles.actionButton, ...styles.acknowledgeButton}}
                  onClick={() => {
                    handleAcknowledge(selectedAlert.id);
                    setShowDetails(false);
                  }}
                >
                  Acknowledge
                </button>
              )}
              {selectedAlert.acknowledged && !selectedAlert.resolved && selectedAlert.status === 'ACTIVE' && (
                <button
                  style={{...styles.actionButton, ...styles.resolveButton}}
                  onClick={() => {
                    handleResolve(selectedAlert.id);
                    setShowDetails(false);
                  }}
                >
                  Resolve
                </button>
              )}
              <button
                style={styles.backButton}
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlerts;