import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8080";

const AdminAlerts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterRead, setFilterRead] = useState('all'); // 'all', 'read', 'unread'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    security: 0,
    transaction: 0,
    account: 0,
    notice: 0
  });

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    const adminUser = localStorage.getItem('adminUser');
    const employeeUser = localStorage.getItem('employeeUser');
    
    if (adminUser) {
      return JSON.parse(adminUser).id;
    } else if (employeeUser) {
      return JSON.parse(employeeUser).id;
    }
    return null;
  };

  const userId = getCurrentUserId();

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    fetchAlerts();
  }, [userId]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/alerts/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      
      setAlerts(data);
      calculateStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/user/${userId}/unread/count`);
      if (response.ok) {
        const count = await response.json();
        return count;
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
    return 0;
  };

  const calculateStats = (alertsData) => {
    const unread = alertsData.filter(a => !a.read).length;
    const critical = alertsData.filter(a => a.priority === 'HIGH' && !a.read).length;
    const high = alertsData.filter(a => a.priority === 'HIGH' && !a.read).length;
    const medium = alertsData.filter(a => a.priority === 'MEDIUM' && !a.read).length;
    const low = alertsData.filter(a => a.priority === 'LOW' && !a.read).length;
    const security = alertsData.filter(a => a.type === 'SECURITY' && !a.read).length;
    const transaction = alertsData.filter(a => a.type === 'TRANSACTION' && !a.read).length;
    const account = alertsData.filter(a => a.type === 'ACCOUNT' && !a.read).length;
    const notice = alertsData.filter(a => a.type === 'NOTICE' && !a.read).length;

    setStats({
      total: alertsData.length,
      unread,
      critical,
      high,
      medium,
      low,
      security,
      transaction,
      account,
      notice
    });
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/${alertId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to mark as read');
      
      // Update local state
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );
      
      // Recalculate stats
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      );
      calculateStats(updatedAlerts);
      
    } catch (err) {
      console.error('Error marking alert as read:', err);
      alert('Failed to mark alert as read');
    }
  };

  const handleMarkAsUnread = async (alertId) => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/${alertId}/unread`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to mark as unread');
      
      // Update local state
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, read: false } : alert
        )
      );
      
      // Recalculate stats
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, read: false } : alert
      );
      calculateStats(updatedAlerts);
      
    } catch (err) {
      console.error('Error marking alert as unread:', err);
      alert('Failed to mark as unread');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/user/${userId}/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to mark all as read');
      
      // Update local state
      setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
      
      // Recalculate stats
      const updatedAlerts = alerts.map(alert => ({ ...alert, read: true }));
      calculateStats(updatedAlerts);
      
    } catch (err) {
      console.error('Error marking all as read:', err);
      alert('Failed to mark all as read');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/alerts/${alertId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete alert');
      
      // Update local state
      const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
      setAlerts(updatedAlerts);
      calculateStats(updatedAlerts);
      
      if (selectedAlert?.id === alertId) {
        setShowDetails(false);
        setSelectedAlert(null);
      }
      
    } catch (err) {
      console.error('Error deleting alert:', err);
      alert('Failed to delete alert');
    }
  };

  const handleDeleteAllAlerts = async () => {
    if (!window.confirm('Are you sure you want to delete ALL alerts? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/alerts/user/${userId}/all`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete all alerts');
      
      // Clear local state
      setAlerts([]);
      calculateStats([]);
      setShowDetails(false);
      setSelectedAlert(null);
      
    } catch (err) {
      console.error('Error deleting all alerts:', err);
      alert('Failed to delete all alerts');
    }
  };

  const alertTypes = [
    { id: 'all', name: 'All Types', icon: '📢' },
    { id: 'SECURITY', name: 'Security', icon: '🔒' },
    { id: 'TRANSACTION', name: 'Transaction', icon: '💰' },
    { id: 'ACCOUNT', name: 'Account', icon: '🏦' },
    { id: 'NOTICE', name: 'Notice', icon: '📋' }
  ];

  const priorityLevels = [
    { id: 'all', name: 'All Priorities' },
    { id: 'HIGH', name: 'High Priority' },
    { id: 'MEDIUM', name: 'Medium Priority' },
    { id: 'LOW', name: 'Low Priority' }
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
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
      'ACCOUNT': '🏦',
      'NOTICE': '📋'
    };
    return icons[type] || '📢';
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      (alert.title && alert.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.message && alert.message.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && alert.read) || 
                       (filterRead === 'unread' && !alert.read);
    
    return matchesSearch && matchesType && matchesPriority && matchesRead;
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins === 0 ? 'Just now' : `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
      borderLeft: '4px solid transparent',
      opacity: alert => alert.read ? 0.7 : 1
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
    priorityBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      color: 'white'
    },
    readBadge: {
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
    readButton: {
      background: '#3b82f6',
      color: 'white'
    },
    unreadButton: {
      background: '#eab308',
      color: 'white'
    },
    deleteButton: {
      background: '#ef4444',
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
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      color: 'white'
    },
    errorContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      color: 'white'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error Loading Alerts</h2>
        <p>{error}</p>
        <button style={styles.backButton} onClick={fetchAlerts}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Alerts & Notifications</h1>
        <div>
          {alerts.length > 0 && (
            <button
              style={{ ...styles.backButton, marginRight: '10px', background: '#22c55e' }}
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </button>
          )}
          <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Alerts</div>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={{...styles.statSub, color: '#ef4444'}}>{stats.unread} unread</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>High Priority</div>
          <div style={{...styles.statValue, color: '#991b1b'}}>{stats.high}</div>
          <div style={styles.statSub}>Need attention</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Medium Priority</div>
          <div style={{...styles.statValue, color: '#b45309'}}>{stats.medium}</div>
          <div style={styles.statSub}>Review soon</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Low Priority</div>
          <div style={{...styles.statValue, color: '#047857'}}>{stats.low}</div>
          <div style={styles.statSub}>For information</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by title or message..."
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
              {type.icon} {type.name}
            </option>
          ))}
        </select>
        <select
          style={styles.filterSelect}
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          {priorityLevels.map(level => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
        <select
          style={styles.filterSelect}
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
        </select>
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        <span style={styles.summaryText}>
          Showing <span style={styles.summaryHighlight}>{filteredAlerts.length}</span> of <span style={styles.summaryHighlight}>{alerts.length}</span> alerts
        </span>
        <span style={styles.summaryText}>
          Unread: <span style={{...styles.summaryHighlight, color: '#ef4444'}}>{filteredAlerts.filter(a => !a.read).length}</span>
        </span>
      </div>

      {/* Alerts List */}
      <div style={styles.alertsList}>
        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#666' }}>No alerts found matching your criteria</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              style={{
                ...styles.alertItem,
                borderLeftColor: getPriorityColor(alert.priority),
                opacity: alert.read ? 0.7 : 1
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
                  <span style={styles.typeIcon}>{alert.icon || getTypeIcon(alert.type)}</span>
                  <span style={styles.typeName}>{alert.type}</span>
                </div>
                <span style={{
                  ...styles.readBadge,
                  background: alert.read ? '#22c55e20' : '#eab30820',
                  color: alert.read ? '#22c55e' : '#eab308'
                }}>
                  {alert.read ? 'Read' : 'Unread'}
                </span>
              </div>

              <div style={styles.alertTitle}>{alert.title}</div>
              <div style={styles.alertMessage}>{alert.message}</div>

              <div style={styles.alertMeta}>
                <span>🕒 {formatTimestamp(alert.timestamp)}</span>
                {alert.accountNumber && <span>🏦 Account: {alert.accountNumber}</span>}
              </div>

              <div style={styles.alertFooter}>
                <span style={{
                  ...styles.priorityBadge,
                  background: getPriorityColor(alert.priority)
                }}>
                  {alert.priority}
                </span>
                <div>
                  {!alert.read && (
                    <button
                      style={{...styles.actionButton, ...styles.readButton}}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(alert.id);
                      }}
                    >
                      Mark Read
                    </button>
                  )}
                  {alert.read && (
                    <button
                      style={{...styles.actionButton, ...styles.unreadButton}}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsUnread(alert.id);
                      }}
                    >
                      Mark Unread
                    </button>
                  )}
                  <button
                    style={{...styles.actionButton, ...styles.deleteButton}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAlert(alert.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedAlert && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Alert Details</h2>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Type:</div>
              <div style={styles.detailValue}>
                <span style={styles.typeIcon}>{selectedAlert.icon || getTypeIcon(selectedAlert.type)}</span> {selectedAlert.type}
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Priority:</div>
              <div>
                <span style={{
                  ...styles.priorityBadge,
                  background: getPriorityColor(selectedAlert.priority)
                }}>
                  {selectedAlert.priority}
                </span>
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Status:</div>
              <span style={{
                ...styles.readBadge,
                background: selectedAlert.read ? '#22c55e20' : '#eab30820',
                color: selectedAlert.read ? '#22c55e' : '#eab308'
              }}>
                {selectedAlert.read ? 'Read' : 'Unread'}
              </span>
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
              <div style={styles.detailValue}>{new Date(selectedAlert.timestamp).toLocaleString()}</div>
            </div>
            {selectedAlert.accountNumber && (
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Account:</div>
                <div style={styles.detailValue}>{selectedAlert.accountNumber}</div>
              </div>
            )}

            <div style={styles.modalButtons}>
              {!selectedAlert.read && (
                <button
                  style={{...styles.actionButton, ...styles.readButton}}
                  onClick={() => {
                    handleMarkAsRead(selectedAlert.id);
                    setShowDetails(false);
                  }}
                >
                  Mark as Read
                </button>
              )}
              {selectedAlert.read && (
                <button
                  style={{...styles.actionButton, ...styles.unreadButton}}
                  onClick={() => {
                    handleMarkAsUnread(selectedAlert.id);
                    setShowDetails(false);
                  }}
                >
                  Mark as Unread
                </button>
              )}
              <button
                style={{...styles.actionButton, ...styles.deleteButton}}
                onClick={() => {
                  handleDeleteAlert(selectedAlert.id);
                }}
              >
                Delete
              </button>
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