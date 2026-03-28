import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function HRLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hrUser, setHrUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check authentication and HR permissions
  useEffect(() => {
    const user = localStorage.getItem("hrUser");
    if (!user) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(user);
    
    // Double-check HR permission
    if (!parsedUser.permissions?.manageEmployees) {
      localStorage.removeItem("hrUser");
      navigate("/login");
      return;
    }

    setHrUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("hrUser");
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    sidebar: {
      width: sidebarCollapsed ? '80px' : '280px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      transition: 'width 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      overflowY: 'auto'
    },
    sidebarHeader: {
      padding: '24px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: 'white',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      color: '#667eea',
      fontWeight: 'bold'
    },
    logoText: {
      fontSize: sidebarCollapsed ? '0' : '18px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      opacity: sidebarCollapsed ? 0 : 1,
      transition: 'opacity 0.2s'
    },
    toggleButton: {
      background: 'rgba(255,255,255,0.1)',
      border: 'none',
      color: 'white',
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    navMenu: {
      flex: 1,
      padding: '24px 0'
    },
    navItem: {
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      margin: '4px 12px',
      borderRadius: '8px'
    },
    activeNavItem: {
      background: 'rgba(255,255,255,0.2)'
    },
    navIcon: {
      fontSize: '20px',
      minWidth: '32px',
      textAlign: 'center'
    },
    navText: {
      fontSize: '14px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      opacity: sidebarCollapsed ? 0 : 1,
      transition: 'opacity 0.2s'
    },
    mainContent: {
      flex: 1,
      marginLeft: sidebarCollapsed ? '80px' : '280px',
      transition: 'margin-left 0.3s ease'
    },
    header: {
      background: 'white',
      padding: '16px 30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    pageTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#333'
    },
    userMenu: {
      position: 'relative',
      cursor: 'pointer'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      borderRadius: '8px',
      background: '#f5f5f5'
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      background: '#667eea',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold'
    },
    userDetails: {
      lineHeight: '1.4'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    },
    userRole: {
      fontSize: '12px',
      color: '#666'
    },
    dropdown: {
      position: 'absolute',
      right: 0,
      top: '60px',
      width: '200px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      zIndex: 50
    },
    dropdownItem: {
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#333'
    },
    dropdownDivider: {
      height: '1px',
      background: '#e5e7eb',
      margin: '8px 0'
    },
    content: {
      padding: '30px'
    }
  };

  // UPDATED: Added Manage Users and improved labels
  const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/users', icon: '👥', label: 'Manage Users' },      
    { path: '/employees', icon: '👔', label: 'Manage Employees' }, 
    { path: '/employees/create', icon: '➕', label: 'Create Employee' },
    { path: '/totp-reset', icon: '🔐', label: 'Reset TOTP' },        
    { path: '/unlock-mfa', icon: '🔓', label: 'Unlock MFA' },        
    { path: '/reports', icon: '📈', label: 'Reports' },
    { path: '/cleanup', icon: '🧹', label: 'Verification History Cleanup' }, // NEW
    { path: '/settings', icon: '⚙️', label: 'Settings' },
    { path: '/danger-zone', icon: '⚠️', label: 'Danger Zone' }
  ];

  if (!hrUser) return null;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>HR</div>
            <span style={styles.logoText}>HR Portal</span>
          </div>
          <button 
            style={styles.toggleButton}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <div style={styles.navMenu}>
          {navItems.map((item) => (
            <div
              key={item.path}
              style={{
                ...styles.navItem,
                ...(isActive(item.path) ? styles.activeNavItem : {})
              }}
              onClick={() => navigate(item.path)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navText}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.pageTitle}>
            {navItems.find(item => item.path === location.pathname)?.label || 'HR Portal'}
          </h2>

          <div style={styles.userMenu} onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {hrUser.firstName?.charAt(0)}{hrUser.lastName?.charAt(0)}
              </div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>
                  {hrUser.firstName} {hrUser.lastName}
                </div>
                <div style={styles.userRole}>HR Administrator</div>
              </div>
            </div>

            {/* Dropdown */}
            {dropdownOpen && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownItem} onClick={() => navigate('/profile')}>
                  <span>👤</span> My Profile
                </div>
                <div style={styles.dropdownItem} onClick={() => navigate('/settings')}>
                  <span>⚙️</span> Settings
                </div>
                <div style={styles.dropdownDivider}></div>
                <div style={styles.dropdownItem} onClick={handleLogout}>
                  <span>🚪</span> Logout
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
