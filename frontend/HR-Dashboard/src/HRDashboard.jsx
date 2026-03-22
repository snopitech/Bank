import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function HRDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingApprovals: 0,
    activeEmployees: 0,
    departments: 0,
    recentActivity: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all employees
        const employeesRes = await fetch(`${API_BASE}/api/employees/admin/all`);
        const employees = await employeesRes.json();

        // Calculate stats
        const totalEmployees = employees.length;
        const pendingApprovals = employees.filter(emp => emp.status === "PENDING").length;
        const activeEmployees = employees.filter(emp => emp.status === "APPROVED" && emp.isActive).length;
        
        // Get unique departments
        const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))].length;

        // Recent activity (last 5 employees created)
        const recentActivity = employees
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(emp => ({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            status: emp.status,
            createdAt: emp.createdAt
          }));

        setStats({
          totalEmployees,
          pendingApprovals,
          activeEmployees,
          departments,
          recentActivity
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'transform 0.2s, boxShadow 0.2s'
    },
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    },
    statLabel: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '8px'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '20px',
      marginBottom: '20px'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px'
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    activityIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      background: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px',
      fontSize: '18px'
    },
    activityContent: {
      flex: 1
    },
    activityTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '4px'
    },
    activityMeta: {
      display: 'flex',
      gap: '12px',
      fontSize: '12px',
      color: '#666'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginTop: '16px'
    },
    quickActionButton: {
      background: '#f5f5f5',
      border: 'none',
      padding: '16px',
      borderRadius: '8px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background 0.2s'
    },
    quickActionIcon: {
      fontSize: '24px',
      marginBottom: '8px'
    },
    quickActionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '4px'
    },
    quickActionDesc: {
      fontSize: '12px',
      color: '#666'
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div 
          style={styles.statCard}
          onClick={() => navigate('/employees')}
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
            <div style={{...styles.statIcon, background: '#3b82f620', color: '#3b82f6'}}>
              👥
            </div>
          </div>
          <div style={styles.statLabel}>Total Employees</div>
          <div style={styles.statValue}>{stats.totalEmployees}</div>
        </div>

        <div 
          style={styles.statCard}
          onClick={() => navigate('/employees?status=pending')}
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
            <div style={{...styles.statIcon, background: '#eab30820', color: '#eab308'}}>
              ⏳
            </div>
          </div>
          <div style={styles.statLabel}>Pending Approvals</div>
          <div style={styles.statValue}>{stats.pendingApprovals}</div>
        </div>

        <div 
          style={styles.statCard}
          onClick={() => navigate('/employees?status=active')}
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
            <div style={{...styles.statIcon, background: '#22c55e20', color: '#22c55e'}}>
              ✅
            </div>
          </div>
          <div style={styles.statLabel}>Active Employees</div>
          <div style={styles.statValue}>{stats.activeEmployees}</div>
        </div>

        <div 
          style={styles.statCard}
          onClick={() => navigate('/employees')}
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
            <div style={{...styles.statIcon, background: '#8b5cf620', color: '#8b5cf6'}}>
              🏢
            </div>
          </div>
          <div style={styles.statLabel}>Departments</div>
          <div style={styles.statValue}>{stats.departments}</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.row}>
        {/* Recent Activity */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Recent Activity</h3>
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div 
                key={activity.id} 
                style={styles.activityItem}
                onClick={() => navigate(`/employees/${activity.id}`)}
              >
                <div style={styles.activityIcon}>
                  {activity.name.charAt(0)}
                </div>
                <div style={styles.activityContent}>
                  <div style={styles.activityTitle}>{activity.name}</div>
                  <div style={styles.activityMeta}>
                    <span>{activity.email}</span>
                    <span>•</span>
                    <span>{formatDate(activity.createdAt)}</span>
                  </div>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background: `${getStatusColor(activity.status)}20`,
                  color: getStatusColor(activity.status)
                }}>
                  {activity.status}
                </span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No recent activity
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Quick Actions</h3>
          <div style={styles.quickActions}>
            <button 
              style={styles.quickActionButton}
              onClick={() => navigate('/employees/create')}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
            >
              <div style={styles.quickActionIcon}>➕</div>
              <div style={styles.quickActionTitle}>New Employee</div>
              <div style={styles.quickActionDesc}>Create employee profile</div>
            </button>

            <button 
              style={styles.quickActionButton}
              onClick={() => navigate('/employees?status=pending')}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
            >
              <div style={styles.quickActionIcon}>⏳</div>
              <div style={styles.quickActionTitle}>Pending Approvals</div>
              <div style={styles.quickActionDesc}>{stats.pendingApprovals} awaiting review</div>
            </button>

            <button 
              style={styles.quickActionButton}
              onClick={() => navigate('/reports')}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
            >
              <div style={styles.quickActionIcon}>📊</div>
              <div style={styles.quickActionTitle}>Reports</div>
              <div style={styles.quickActionDesc}>View HR analytics</div>
            </button>

            <button 
              style={styles.quickActionButton}
              onClick={() => navigate('/settings')}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
            >
              <div style={styles.quickActionIcon}>⚙️</div>
              <div style={styles.quickActionTitle}>Settings</div>
              <div style={styles.quickActionDesc}>Configure HR portal</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}