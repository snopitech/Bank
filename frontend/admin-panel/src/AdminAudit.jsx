import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAudit = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today'); // 'today', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [auditLogs] = useState([
    {
      id: 'AUD-1001',
      timestamp: '2026-02-17 10:30:45',
      admin: 'John Doe',
      adminId: 1,
      action: 'USER_CREATED',
      category: 'user',
      description: 'Created new user account for Bose Agbonifo',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/98.0',
      details: {
        userId: 4,
        userName: 'Bose Agbonifo',
        email: 'snopitech+1@gmail.com',
        accountsCreated: 2
      }
    },
    {
      id: 'AUD-1002',
      timestamp: '2026-02-17 10:15:22',
      admin: 'Sarah Johnson',
      adminId: 2,
      action: 'ACCOUNT_OPENED',
      category: 'account',
      description: 'Opened Business Checking account for Agbonifo Enterprises',
      ipAddress: '192.168.1.46',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64) Firefox/95.0',
      details: {
        customerId: 1,
        customerName: 'Michael Agbonifo',
        accountType: 'BUSINESS_CHECKING',
        accountNumber: '****4618',
        initialDeposit: 10000.00
      }
    },
    {
      id: 'AUD-1003',
      timestamp: '2026-02-17 09:45:10',
      admin: 'John Smith',
      adminId: 3,
      action: 'TRANSACTION_FLAGGED',
      category: 'security',
      description: 'Flagged suspicious transaction of $50,000',
      ipAddress: '192.168.1.47',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Safari/15.0',
      details: {
        transactionId: 'TXN-1003',
        customerId: 3,
        customerName: 'Tracy Agbonifo',
        amount: 50000.00,
        reason: 'Unusual large transfer',
        status: 'UNDER_REVIEW'
      }
    },
    {
      id: 'AUD-1004',
      timestamp: '2026-02-17 09:20:33',
      admin: 'Lisa Brown',
      adminId: 4,
      action: 'CARD_REPLACEMENT',
      category: 'card',
      description: 'Processed card replacement for lost/stolen card',
      ipAddress: '192.168.1.48',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64) Edge/98.0',
      details: {
        customerId: 2,
        customerName: 'Cynthia Ekeh',
        oldCardLast4: '8924',
        newCardLast4: '1122',
        reason: 'LOST',
        expedited: true
      }
    },
    {
      id: 'AUD-1005',
      timestamp: '2026-02-17 08:50:15',
      admin: 'Mike Wilson',
      adminId: 5,
      action: 'FEE_WAIVED',
      category: 'financial',
      description: 'Waived overdraft fee for customer',
      ipAddress: '192.168.1.49',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/97.0',
      details: {
        customerId: 1,
        customerName: 'Michael Agbonifo',
        feeAmount: 35.00,
        reason: 'Customer courtesy',
        transactionId: 'TXN-0987'
      }
    },
    {
      id: 'AUD-1006',
      timestamp: '2026-02-16 16:20:05',
      admin: 'John Doe',
      adminId: 1,
      action: 'LIMIT_INCREASE',
      category: 'card',
      description: 'Increased credit limit for customer',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/98.0',
      details: {
        customerId: 3,
        customerName: 'Tracy Agbonifo',
        oldLimit: 5000.00,
        newLimit: 10000.00,
        reason: 'Good payment history'
      }
    },
    {
      id: 'AUD-1007',
      timestamp: '2026-02-16 15:10:22',
      admin: 'Sarah Johnson',
      adminId: 2,
      action: 'ACCOUNT_FROZEN',
      category: 'security',
      description: 'Froze account due to suspicious activity',
      ipAddress: '192.168.1.46',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64) Firefox/95.0',
      details: {
        accountId: 8,
        accountNumber: '****0339',
        customerId: 5,
        customerName: 'Test User',
        reason: 'Multiple failed login attempts'
      }
    },
    {
      id: 'AUD-1008',
      timestamp: '2026-02-16 14:30:18',
      admin: 'John Smith',
      adminId: 3,
      action: 'CLAIM_RESOLVED',
      category: 'claim',
      description: 'Resolved customer claim for unauthorized transaction',
      ipAddress: '192.168.1.47',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Safari/15.0',
      details: {
        claimId: 'CLM-1003',
        customerId: 3,
        customerName: 'Tracy Agbonifo',
        amount: 1200.00,
        resolution: 'APPROVED',
        notes: 'Funds credited to account'
      }
    },
    {
      id: 'AUD-1009',
      timestamp: '2026-02-16 11:45:52',
      admin: 'Lisa Brown',
      adminId: 4,
      action: 'EXCHANGE_RATE_UPDATED',
      category: 'currency',
      description: 'Updated foreign exchange rates',
      ipAddress: '192.168.1.48',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64) Edge/98.0',
      details: {
        currencies: ['EUR', 'GBP', 'JPY', 'CAD'],
        oldRates: { EUR: 0.91, GBP: 0.78, JPY: 147.50, CAD: 1.34 },
        newRates: { EUR: 0.92, GBP: 0.79, JPY: 148.50, CAD: 1.35 }
      }
    },
    {
      id: 'AUD-1010',
      timestamp: '2026-02-15 09:30:00',
      admin: 'Mike Wilson',
      adminId: 5,
      action: 'BULK_STATEMENT_GENERATED',
      category: 'report',
      description: 'Generated monthly statements for all customers',
      ipAddress: '192.168.1.49',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/97.0',
      details: {
        month: 'January 2026',
        totalCustomers: 7,
        statementsGenerated: 14,
        fileSize: '2.4 MB'
      }
    }
  ]);

  const getActionIcon = (category) => {
    switch(category) {
      case 'user': return '👤';
      case 'account': return '🏦';
      case 'security': return '🔒';
      case 'card': return '💳';
      case 'financial': return '💰';
      case 'claim': return '⚖️';
      case 'currency': return '💱';
      case 'report': return '📊';
      default: return '📝';
    }
  };

  const getActionColor = (category) => {
    switch(category) {
      case 'user': return '#3b82f6';
      case 'account': return '#8b5cf6';
      case 'security': return '#ef4444';
      case 'card': return '#ec4899';
      case 'financial': return '#22c55e';
      case 'claim': return '#f97316';
      case 'currency': return '#eab308';
      case 'report': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'user') return matchesSearch && log.category === 'user';
    if (filter === 'account') return matchesSearch && log.category === 'account';
    if (filter === 'security') return matchesSearch && log.category === 'security';
    if (filter === 'card') return matchesSearch && log.category === 'card';
    if (filter === 'financial') return matchesSearch && log.category === 'financial';
    if (filter === 'claim') return matchesSearch && log.category === 'claim';
    return matchesSearch;
  });

  const stats = {
    total: auditLogs.length,
    today: auditLogs.filter(l => l.timestamp.startsWith('2026-02-17')).length,
    week: 45,
    month: 128,
    uniqueAdmins: [...new Set(auditLogs.map(l => l.admin))].length
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
      gridTemplateColumns: 'repeat(4, 1fr)',
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
      flex: 1,
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '250px'
    },
    filterButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      background: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s'
    },
    activeFilter: {
      background: '#667eea',
      color: 'white',
      borderColor: '#667eea'
    },
    dateRange: {
      display: 'flex',
      gap: '10px',
      marginLeft: 'auto'
    },
    dateButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      background: 'white',
      cursor: 'pointer',
      fontSize: '13px'
    },
    activeDate: {
      background: '#667eea',
      color: 'white',
      borderColor: '#667eea'
    },
    table: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'auto'
    },
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.5fr 2fr 2fr 1.5fr',
      padding: '15px',
      background: '#f8fafc',
      borderRadius: '8px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px'
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.5fr 2fr 2fr 1.5fr',
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    actionCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    actionIcon: {
      fontSize: '20px'
    },
    actionText: {
      fontWeight: '500'
    },
    timestamp: {
      fontSize: '13px',
      color: '#666'
    },
    adminName: {
      fontWeight: '500',
      color: '#333'
    },
    adminId: {
      fontSize: '11px',
      color: '#999'
    },
    categoryBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      width: '80px'
    },
    viewButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer'
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
    detailsBox: {
      background: '#f9f9f9',
      padding: '15px',
      borderRadius: '8px',
      margin: '15px 0',
      fontSize: '13px',
      color: '#333'
    },
    detailSubRow: {
      display: 'flex',
      padding: '5px 0'
    },
    detailSubLabel: {
      width: '100px',
      color: '#666'
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
        <h1 style={styles.headerTitle}>Audit Logs</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Logs</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Today</div>
          <div style={{...styles.statValue, color: '#3b82f6'}}>{stats.today}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>This Week</div>
          <div style={{...styles.statValue, color: '#8b5cf6'}}>{stats.week}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Active Admins</div>
          <div style={{...styles.statValue, color: '#22c55e'}}>{stats.uniqueAdmins}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by ID, admin, action..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          style={{...styles.filterButton, ...(filter === 'all' ? styles.activeFilter : {})}}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'user' ? styles.activeFilter : {})}}
          onClick={() => setFilter('user')}
        >
          👤 Users
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'account' ? styles.activeFilter : {})}}
          onClick={() => setFilter('account')}
        >
          🏦 Accounts
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'security' ? styles.activeFilter : {})}}
          onClick={() => setFilter('security')}
        >
          🔒 Security
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'card' ? styles.activeFilter : {})}}
          onClick={() => setFilter('card')}
        >
          💳 Cards
        </button>
        
        <div style={styles.dateRange}>
          <button 
            style={{...styles.dateButton, ...(dateRange === 'today' ? styles.activeDate : {})}}
            onClick={() => setDateRange('today')}
          >
            Today
          </button>
          <button 
            style={{...styles.dateButton, ...(dateRange === 'week' ? styles.activeDate : {})}}
            onClick={() => setDateRange('week')}
          >
            This Week
          </button>
          <button 
            style={{...styles.dateButton, ...(dateRange === 'month' ? styles.activeDate : {})}}
            onClick={() => setDateRange('month')}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div>Timestamp</div>
          <div>Admin</div>
          <div>Action</div>
          <div>Description</div>
          <div>Details</div>
        </div>
        
        {filteredLogs.map((log) => (
          <div 
            key={log.id} 
            style={styles.tableRow}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            onClick={() => {
              setSelectedLog(log);
              setShowDetails(true);
            }}
          >
            <div style={styles.timestamp}>{log.timestamp}</div>
            <div>
              <div style={styles.adminName}>{log.admin}</div>
              <div style={styles.adminId}>ID: {log.adminId}</div>
            </div>
            <div style={styles.actionCell}>
              <span style={styles.actionIcon}>{getActionIcon(log.category)}</span>
              <span style={styles.actionText}>{log.action}</span>
            </div>
            <div style={{fontSize: '13px', color: '#666'}}>{log.description}</div>
            <div>
              <span style={{...styles.categoryBadge, background: `${getActionColor(log.category)}20`, color: getActionColor(log.category)}}>
                {log.category}
              </span>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
            No audit logs found matching your criteria
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Audit Log Details</h2>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Log ID:</div>
              <div style={styles.detailValue}>{selectedLog.id}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Timestamp:</div>
              <div style={styles.detailValue}>{selectedLog.timestamp}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Admin:</div>
              <div style={styles.detailValue}>{selectedLog.admin} (ID: {selectedLog.adminId})</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Action:</div>
              <div style={styles.detailValue}>
                <span style={{...styles.actionCell}}>
                  <span style={styles.actionIcon}>{getActionIcon(selectedLog.category)}</span>
                  <span>{selectedLog.action}</span>
                </span>
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Category:</div>
              <div>
                <span style={{...styles.categoryBadge, background: `${getActionColor(selectedLog.category)}20`, color: getActionColor(selectedLog.category)}}>
                  {selectedLog.category}
                </span>
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Description:</div>
              <div style={styles.detailValue}>{selectedLog.description}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>IP Address:</div>
              <div style={styles.detailValue}>{selectedLog.ipAddress}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>User Agent:</div>
              <div style={styles.detailValue}>{selectedLog.userAgent}</div>
            </div>

            <h3 style={{marginTop: '20px', marginBottom: '10px', fontSize: '16px'}}>Additional Details</h3>
            <div style={styles.detailsBox}>
              {Object.entries(selectedLog.details).map(([key, value]) => (
                <div key={key} style={styles.detailSubRow}>
                  <div style={styles.detailSubLabel}>{key}:</div>
                  <div style={{color: '#333'}}>
                    {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.modalButtons}>
              <button 
                style={{...styles.backButton, background: '#666'}}
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

export default AdminAudit;