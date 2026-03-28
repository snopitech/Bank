import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Live stats data - preserve the structure
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', change: '+12%', icon: '👥', color: '#3b82f6', path: '/users' },
    { label: 'Total Accounts', value: '0', change: '+8%', icon: '🏦', color: '#8b5cf6', path: '/total-accounts' },
    { label: 'Applications', value: '0', change: 'pending', icon: '📋', color: '#eab308', path: '/applications' },
    { label: 'Total Balance', value: '$0', change: '+5%', icon: '💰', color: '#22c55e', path: '/total-balance' },
    { label: 'Active Cards', value: '0', change: '+124', icon: '💳', color: '#ec4899', path: '/active-cards' },
    { label: 'Alerts', value: '0', change: 'critical', icon: '⚠️', color: '#ef4444', path: '/alerts' } 
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { time: '10:30 AM', action: 'New user registered', user: 'john@email.com', type: 'user' },
    { time: '10:15 AM', action: '$50K transfer flagged', user: 'Account #1234', type: 'alert' },
    { time: '09:45 AM', action: 'Business account approved', user: 'Tech Startup LLC', type: 'success' },
    { time: '09:20 AM', action: 'Account frozen', user: '#1245', type: 'warning' },
    { time: '08:50 AM', action: 'Support ticket created', user: '#8921', type: 'ticket' }
  ]);

  const [pendingItems, setPendingItems] = useState([
    { type: 'Business App', name: 'Agbonifo Enterprises', priority: 'high', time: '2h ago' },
    { type: 'Credit App', name: 'Michael A.', priority: 'medium', time: '3h ago' },
    { type: 'Claim', name: '#CL-2026-12', priority: 'high', time: '5h ago' },
    { type: 'Support', name: 'Technical issue', priority: 'low', time: '6h ago' }
  ]);

  // Get user data on component mount
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    const employeeUser = localStorage.getItem('employeeUser');
    
    if (adminUser) {
      setUser(JSON.parse(adminUser));
    } else if (employeeUser) {
      setUser(JSON.parse(employeeUser));
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Fetch live data
  useEffect(() => {
    if (user) {
      fetchLiveData();
    }
  }, [user]);

  const fetchLiveData = async () => {
    try {
      // Fetch users data
      const usersResponse = await fetch(`${API_BASE}/api/users`);
      const usersData = await usersResponse.json();
      
      // Calculate totals from users
      let totalAccounts = 0;
      let totalBalance = 0;
      let activeCardsCount = 0;
      
      // Loop through all users to get their accounts and cards
      for (const user of usersData) {
        if (user.accounts && user.accounts.length > 0) {
          totalAccounts += user.accounts.length;
          user.accounts.forEach(account => {
            totalBalance += account.balance || 0;
          });
        }
        
        // Fetch cards for this user
        try {
          const cardsResponse = await fetch(`${API_BASE}/api/cards/user/${user.id}`);
          if (cardsResponse.ok) {
            const userCards = await cardsResponse.json();
            // Count only ACTIVE cards
            const activeUserCards = userCards.filter(card => card.status === 'ACTIVE').length;
            activeCardsCount += activeUserCards;
          }
        } catch (err) {
          console.error(`Error fetching cards for user ${user.id}:`, err);
        }
      }

      // Fetch pending applications count
      let pendingApplicationsCount = 0;
      try {
        const applicationsResponse = await fetch(`${API_BASE}/api/admin/business/applications?status=PENDING`);
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          pendingApplicationsCount = applicationsData.length;
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      }

      // Fetch unread alerts count for the current user
      let alertsCount = 0;
      if (user?.id) {
        try {
          const alertsResponse = await fetch(`${API_BASE}/api/alerts/user/${user.id}/unread/count`);
          if (alertsResponse.ok) {
            alertsCount = await alertsResponse.json();
          }
        } catch (err) {
          console.error('Error fetching alerts count:', err);
        }
      }

      // Format balance
      const formattedBalance = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(totalBalance);

      // Format numbers with commas
      const formattedActiveCards = new Intl.NumberFormat('en-US').format(activeCardsCount);
      const formattedTotalAccounts = new Intl.NumberFormat('en-US').format(totalAccounts);
      const formattedTotalUsers = new Intl.NumberFormat('en-US').format(usersData.length);

      // Update stats with live data
      setStats([
        { label: 'Total Users', value: formattedTotalUsers, change: '+12%', icon: '👥', color: '#3b82f6', path: '/users' },
        { label: 'Total Accounts', value: formattedTotalAccounts, change: '+8%', icon: '🏦', color: '#8b5cf6', path: '/total-accounts' },
        { label: 'Applications', value: pendingApplicationsCount.toString(), change: 'pending', icon: '📋', color: '#eab308', path: '/applications' },
        { label: 'Total Balance', value: formattedBalance, change: '+5%', icon: '💰', color: '#22c55e', path: '/total-balance' },
        { label: 'Active Cards', value: formattedActiveCards, change: '+124', icon: '💳', color: '#ec4899', path: '/active-cards' },
        { label: 'Alerts', value: alertsCount.toString(), change: 'critical', icon: '⚠️', color: '#ef4444', path: '/alerts' } 
      ]);

      // Update pending items with real data if available
      if (pendingApplicationsCount > 0) {
        setPendingItems([
          { 
            type: 'Business App', 
            name: `${pendingApplicationsCount} Pending`, 
            priority: 'high', 
            time: 'Now' 
          },
          ...pendingItems.slice(1)
        ]);
      }

      // Fetch recent alerts for activity
      if (user?.id) {
        try {
          const recentAlertsResponse = await fetch(`${API_BASE}/api/alerts/user/${user.id}?limit=3`);
          if (recentAlertsResponse.ok) {
            const recentAlerts = await recentAlertsResponse.json();
            
            // Convert alerts to activity format
            const alertActivities = recentAlerts.slice(0, 2).map(alert => ({
              time: formatTimeAgo(alert.timestamp),
              action: alert.title,
              user: alert.type,
              type: alert.priority === 'HIGH' ? 'alert' : 'warning'
            }));
            
            // Merge with existing activity (keeping first few items)
            setRecentActivity(prev => [
              ...alertActivities,
              ...prev.slice(alertActivities.length)
            ]);
          }
        } catch (err) {
          console.error('Error fetching recent alerts:', err);
        }
      }

    } catch (error) {
      console.error('Error fetching live data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins === 0 ? 'Just now' : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'user': return '#3b82f6';
      case 'alert': return '#ef4444';
      case 'success': return '#22c55e';
      case 'warning': return '#eab308';
      default: return '#8b5cf6';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('employeeUser');
    navigate('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

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
      alignItems: 'center',
      position: 'relative'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    adminMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      cursor: 'pointer'
    },
    adminAvatar: {
      width: '40px',
      height: '40px',
      background: '#667eea',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold'
    },
    adminName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    dropdown: {
      position: 'absolute',
      right: '30px',
      top: '80px',
      width: '220px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      zIndex: 50
    },
    dropdownItem: {
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#333',
      transition: 'background 0.2s'
    },
    dropdownDivider: {
      height: '1px',
      background: '#e5e7eb',
      margin: '8px 0'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, boxShadow 0.2s',
      cursor: 'pointer'
    },
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    statIcon: {
      fontSize: '24px',
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statLabel: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '5px'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '5px'
    },
    statChange: {
      fontSize: '13px',
      fontWeight: '500'
    },
    quickActions: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px'
    },
    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px'
    },
    button: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '20px',
      marginBottom: '30px'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    pendingItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      borderBottom: '1px solid #f0f0f0'
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px',
      borderBottom: '1px solid #f0f0f0'
    },
    timeStamp: {
      color: '#999',
      fontSize: '12px',
      minWidth: '70px'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    footer: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header with Dropdown */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Dashboard</h1>
        <div style={styles.adminMenu} onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div style={styles.adminAvatar}>
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
          <span style={styles.adminName}>
            {user.firstName} {user.lastName}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div style={styles.dropdown}>
            <div style={{...styles.dropdownItem}} onClick={() => { setDropdownOpen(false); navigate('/profile'); }}>
              <span>👤</span> Profile
            </div>
            <div style={{...styles.dropdownItem}} onClick={() => { setDropdownOpen(false); navigate('/settings'); }}>
              <span>⚙️</span> Settings
            </div>
            <div style={{...styles.dropdownItem}} onClick={() => { setDropdownOpen(false); navigate('/alerts'); }}>
              <span>🔔</span> Alerts
              <span style={{marginLeft: 'auto', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '10px'}}>{stats[5].value}</span>
            </div>
            <div style={{...styles.dropdownItem}} onClick={() => { setDropdownOpen(false); navigate('/messages'); }}>
              <span>✉️</span> Messages
              <span style={{marginLeft: 'auto', background: '#eab308', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '10px'}}>5</span>
            </div>
            <div style={styles.dropdownDivider}></div>
            <div style={{...styles.dropdownItem}} onClick={handleLogout}>
              <span>🚪</span> Logout
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid - Now with live alerts count */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div 
            key={index} 
            style={{...styles.statCard, cursor: stat.path ? 'pointer' : 'default'}}
            onClick={() => stat.path && navigate(stat.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={styles.statHeader}>
              <div style={{...styles.statIcon, background: `${stat.color}20`, color: stat.color}}>
                {stat.icon}
              </div>
              <span style={{...styles.statChange, color: stat.change.includes('+') ? '#22c55e' : stat.change === 'pending' ? '#eab308' : '#ef4444'}}>
                {stat.change}
              </span>
            </div>
            <div style={styles.statLabel}>{stat.label}</div>
            <div style={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <div style={styles.buttonGrid}>
                
          <button 
            style={styles.button}
            onClick={() => navigate('/open-account')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
          >
            🏦 Open New Account
          </button>
         
          <button 
            style={styles.button}
            onClick={() => navigate('/update-limits')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
          >
            💰 Update Limits
          </button>

          <button 
            style={styles.button}
            onClick={() => navigate('/generate-report')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
          >
            📊 Generate Report
          </button>

          <button 
           style={styles.button}
           onClick={() => navigate('/transactions')}
           onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
           onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
           >
          💰 Monitor Transactions
          </button>
           <button 
           style={styles.button}
           onClick={() => navigate('/support')}
           onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
           onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
           >
           📨 Support Tickets
           </button>
            <button 
          style={styles.button}
          onClick={() => navigate('/claims')}
          onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
          >
         ⚖️ Claims & Disputes
          </button>
          <button 
           style={styles.button}
           onClick={() => navigate('/currency')}
           onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
           onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
           >
           💱 Currency Management
           </button>
           <button 
            style={styles.button}
            onClick={() => navigate('/teller')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
            >
            🏦 Teller Operations
            </button>
            <button 
            style={styles.button}
            onClick={() => navigate('/audit')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
            >
            📋 Audit Logs
            </button>

             <button 
             style={styles.button}
             onClick={() => navigate('/reports')}
             onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
             onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
             >
             📊 Reports & Analytics
             </button>
             <button 
             style={styles.button}
             onClick={() => navigate('/settings')}
             onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
             onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
             >
            ⚙️ System Settings
             </button>
             <button 
             style={styles.button}
             onClick={() => navigate('/admin/verify-checks')}
             onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
             onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
              >
            ✅ Verify Checks
            </button>
            <button 
            style={styles.button}
            onClick={() => navigate('/business-applications')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
          >
             🏢 Business Account Application
          </button>
           <button 
            style={styles.button}
            onClick={() => navigate('/credit-applications')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
            >
            💳 Credit Account Applications
            </button>

             <button 
             style={styles.button}
             onClick={() => navigate('/admin/loan-applications')}
             onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
             onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
             >
             💰 Loan Applications
           </button>

           <button 
            style={styles.button}
            onClick={() => navigate('/admin/users')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
            >
            👥 Manage Users
          </button>
           
          <button 
          style={styles.button}
          onClick={() => navigate('/admin/loan-applications')}
          onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
          >
          💰 Loan Applications
          </button>

          <button 
            style={styles.button}
            onClick={() => navigate('/active-cards')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
          >
            💳 Manage Cards
          </button>

          <button 
          style={styles.button}
          onClick={() => navigate('/admin/unlock-user')}
          onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
          >
          🔓 Unlock User Account      

          </button>

  <button 
  style={styles.button}
  onClick={() => navigate('/admin/us-verifications')}
  onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
  onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
>
  US Citizen's Verifications
</button>


<button 
  style={styles.button}
  onClick={() => navigate('/admin/non-us-verifications')}
  onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
  onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
>
  🌍 Non-US Citizen Verification
</button>

          {/* Add TOTP Setup Button - Only visible for employees */}
          {user && (  // Show for any logged-in user
            <button 
              style={styles.button}
              onClick={() => navigate('/admin/totp-setup')}
              onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
            >
              🔐 Setup Two-Factor Auth
            </button>
          )}

        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoColumnGrid}>
        {/* Pending Items */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Pending Reviews</h3>
          {pendingItems.map((item, index) => (
            <div key={index} style={styles.pendingItem}>
              <div>
                <span style={{fontWeight: '500', marginRight: '8px'}}>{item.name}</span>
                <span style={{color: '#666', fontSize: '12px'}}>{item.type}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <span style={{color: '#999', fontSize: '12px'}}>{item.time}</span>
                <span style={{...styles.badge, background: `${getPriorityColor(item.priority)}20`, color: getPriorityColor(item.priority)}}>
                  {item.priority}
                </span>
                <button 
                  style={{color: '#667eea', background: 'none', border: 'none', cursor: 'pointer'}}
                  onClick={() => navigate('/applications')}
                >
                  Review →
                </button>
              </div>
            </div>
          ))}
          <div style={{textAlign: 'center', marginTop: '15px'}}>
            <button 
              style={{color: '#667eea', background: 'none', border: 'none', cursor: 'pointer'}}
              onClick={() => navigate('/applications')}
            >
              View All Applications →
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Recent Activity</h3>
          {recentActivity.map((item, index) => (
            <div key={index} style={styles.activityItem}>
              <span style={styles.timeStamp}>{item.time}</span>
              <div style={{flex: 1}}>
                <div style={{fontWeight: '500', fontSize: '14px'}}>{item.action}</div>
                <div style={{color: '#666', fontSize: '12px'}}>{item.user}</div>
              </div>
              <span style={{...styles.badge, background: `${getActivityColor(item.type)}20`, color: getActivityColor(item.type)}}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div style={styles.footer}>
        <div style={{display: 'flex', gap: '20px'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span style={{width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%'}}></span>
            Database: Connected
          </span>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span style={{width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%'}}></span>
            API: 124ms
          </span>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span style={{width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%'}}></span>
            Cache: Operational
          </span>
        </div>
        <span style={{color: '#666', fontSize: '13px'}}>Last backup: 2 hours ago</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
