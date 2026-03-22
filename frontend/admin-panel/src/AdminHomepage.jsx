import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function AdminHomepage() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHRWarning, setShowHRWarning] = useState(false);
  const [showCustomerWarning, setShowCustomerWarning] = useState(false);

 const [form, setForm] = useState({
  email: "",
  password: ""
});
const [totpStep, setTotpStep] = useState(false); // New: TOTP verification step
const [totpCode, setTotpCode] = useState("");
const [tempToken, setTempToken] = useState(""); // New: Temporary token from login
const [employeeId, setEmployeeId] = useState(null); // New: Employee ID for TOTP
  
  // Live stats data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAccounts: 0,
    totalBalance: 0,
    loading: true
  });

  const loginRef = useRef(null);
  const buttonRef = useRef(null);

  // Fetch live stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users to get count
      const usersResponse = await fetch(`${API_BASE}/api/users`);
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const usersData = await usersResponse.json();
      
      // Calculate total users
      const totalUsers = usersData.length;
      
      // Calculate total accounts and balance
      let totalAccounts = 0;
      let totalBalance = 0;
      
      usersData.forEach(user => {
        if (user.accounts && user.accounts.length > 0) {
          totalAccounts += user.accounts.length;
          user.accounts.forEach(account => {
            totalBalance += account.balance || 0;
          });
        }
      });
      
      setStats({
        totalUsers,
        totalAccounts,
        totalBalance,
        loading: false
      });
      
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

// Handle login submission
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Check if it's admin login
    if (form.email === "admin@snopitech.com" && form.password === "admin123") {
      const adminData = {
        id: 1,
        firstName: "Admin",
        lastName: "User",
        email: form.email,
        role: "super_admin"
      };
      
      localStorage.setItem("adminUser", JSON.stringify(adminData));
      setShowLogin(false);
      navigate("/dashboard");
      return;
    }
    
    // If not admin, try employee login via API
    const response = await fetch(`${API_BASE}/api/employees/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password
      })
    });

    const data = await response.json();

    // ADD THIS CONSOLE LOG RIGHT HERE
    console.log("Login response data:", data);
    console.log("Employee TOTP enabled:", data.employee?.totpEnabled); // ADD THIS LINE

    if (!response.ok) {
      throw new Error(data.error || "Invalid email or password");
    }

   // Check if TOTP is required
if (data.requiresTotp) {
  // Store temp token and show TOTP verification
  setTempToken(data.tempToken);
  setEmployeeId(data.employee?.id);
  setTotpStep(true);
} 
// Check if TOTP setup is required (enforcement after 2 logins)
else if (data.requiresTotpSetup) {
  // Show message and redirect to TOTP setup
  alert(data.message || "Two-factor authentication is now required. You will be redirected to setup.");
  
  // Store employee data temporarily
  localStorage.setItem("pendingTOTPSetup", JSON.stringify(data.employee));
  
  // Redirect to TOTP setup page
  setTimeout(() => {
    navigate("/admin/totp-setup");
  }, 1500);
}
else {
  // No TOTP required, login successful
  localStorage.setItem("employeeUser", JSON.stringify(data.employee));
  localStorage.removeItem("pendingTOTPSetup");
  // Show remaining logins message if applicable
  if (data.loginsRemaining) {
    alert(`You have ${data.loginsRemaining} logins remaining before two-factor authentication is required.`);
  }
  
  setShowLogin(false);
  navigate("/dashboard");
}

  } catch (err) {
    console.error("Login error:", err);
    alert(err.message || "Invalid email or password");
  }
};
// Handle TOTP verification
const handleTOTPVerify = async () => {
  if (!totpCode || totpCode.length !== 6) {
    alert("Please enter a valid 6-digit code");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/employees/totp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId: employeeId,
        code: totpCode
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Invalid verification code");
    }

    // TOTP verification successful
    localStorage.setItem("employeeUser", JSON.stringify(data.employee));
    setShowLogin(false);
    setTotpStep(false);
    navigate("/dashboard");

  } catch (err) {
    console.error("TOTP verification error:", err);
    alert(err.message || "Invalid verification code");
  }
};

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLogin && loginRef.current && buttonRef.current) {
        const clickedInsideDropdown = loginRef.current.contains(event.target);
        const clickedOnButton = buttonRef.current.contains(event.target);
        
        const isFormElement = event.target.closest('form') !== null;
        const isInsideLoginForm = loginRef.current.contains(event.target) || 
                                 (isFormElement && loginRef.current.querySelector('form')?.contains(event.target));
        
        if (!isInsideLoginForm && !clickedOnButton) {
          setShowLogin(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLogin]);

  // Handle HR Panel click
  const handleHRPanelClick = () => {
    setShowHRWarning(true);
  };

  // Handle Customer Portal click
  const handleCustomerPortalClick = () => {
    setShowCustomerWarning(true);
  };

  // Handle proceed to HR login
  const handleProceedToHR = () => {
    setShowHRWarning(false);
    window.location.href = "http://localhost:5174/login";
  };

  // Handle proceed to Customer Portal
  const handleProceedToCustomer = () => {
    setShowCustomerWarning(false);
    window.location.href = "http://localhost:5175/";
  };

  const logoUrl = "https://snopitechstore.online/public-images/Mylogo.png";

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    logoImage: {
      width: '48px',
      height: '48px',
      background: 'white',
      borderRadius: '50%',
      overflow: 'hidden'
    },
    logoText: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0
    },
    logoSubtext: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.8)',
      margin: 0
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    hrButton: {
      background: '#10b981',
      color: 'white',
      padding: '10px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    customerButton: {
      background: '#ef4444',
      color: 'white',
      padding: '10px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    loginButton: {
      background: 'white',
      color: '#667eea',
      padding: '10px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    loginDropdown: {
      position: 'absolute',
      right: '30px',
      top: '80px',
      width: '320px',
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
      zIndex: 50,
      border: '1px solid #e5e7eb'
    },
    heroSection: {
      padding: '60px 30px'
    },
    heroContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '48px',
      alignItems: 'center'
    },
    heroTitle: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '24px',
      lineHeight: 1.2
    },
    heroHighlight: {
      color: '#fde047'
    },
    heroText: {
      fontSize: '18px',
      color: 'rgba(255,255,255,0.9)',
      marginBottom: '32px',
      lineHeight: 1.6
    },
    buttonPrimary: {
      background: 'white',
      color: '#667eea',
      padding: '16px 32px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '16px',
      border: 'none',
      cursor: 'pointer',
      marginRight: '16px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
    },
    buttonSecondary: {
      background: 'transparent',
      color: 'white',
      padding: '16px 32px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '16px',
      border: '2px solid white',
      cursor: 'pointer',
      marginRight: '16px'
    },
    statsCard: {
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px'
    },
    statItem: {
      background: 'rgba(255,255,255,0.15)',
      padding: '24px',
      borderRadius: '12px',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.9)'
    },
    featuresSection: {
      background: 'white',
      padding: '60px 30px'
    },
    sectionTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginBottom: '16px'
    },
    sectionSubtitle: {
      fontSize: '18px',
      color: '#666',
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto 48px'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '32px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    featureCard: {
      background: '#f9f9f9',
      padding: '32px',
      borderRadius: '12px',
      textAlign: 'center',
      transition: 'transform 0.2s',
      cursor: 'pointer'
    },
    featureIcon: {
      fontSize: '48px',
      marginBottom: '24px'
    },
    featureTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '12px'
    },
    featureDesc: {
      fontSize: '14px',
      color: '#666',
      lineHeight: 1.6
    },
    // Modal Styles
    modalOverlay: {
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
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      textAlign: 'center'
    },
    warningIcon: {
      fontSize: '64px',
      marginBottom: '20px',
      color: '#ef4444'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#b91c1c',
      marginBottom: '16px'
    },
    modalText: {
      fontSize: '16px',
      color: '#333',
      marginBottom: '20px',
      lineHeight: 1.6
    },
    warningBox: {
      background: '#fef2f2',
      border: '1px solid #fee2e2',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      textAlign: 'left'
    },
    warningText: {
      color: '#991b1b',
      fontSize: '14px',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center'
    },
    cancelButton: {
      background: '#e5e7eb',
      color: '#333',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px'
    },
    proceedButton: {
      background: '#ef4444',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px'
    },
    footer: {
      background: '#1f2937',
      padding: '48px 30px 24px'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '48px',
      maxWidth: '1200px',
      margin: '0 auto 48px'
    },
    footerTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '24px'
    },
    footerLink: {
      display: 'block',
      color: '#9ca3af',
      textDecoration: 'none',
      fontSize: '14px',
      marginBottom: '12px'
    },
    footerBottom: {
      borderTop: '1px solid #374151',
      paddingTop: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      fontSize: '14px',
      color: '#9ca3af'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logoImage}>
            <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={styles.logoText}>SNOPITECH BANK</h1>
            <p style={styles.logoSubtext}>Admin Portal</p>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={styles.buttonGroup}>
            {/* Customer Portal Button */}
            <button 
              onClick={handleCustomerPortalClick}
              style={styles.customerButton}
            >
              <span>🏦</span>
              Customer Portal
            </button>

            {/* HR Panel Button */}
            <button 
              onClick={handleHRPanelClick}
              style={styles.hrButton}
            >
              <span>👑</span>
              HR Panel
            </button>

            {/* Admin Login Button */}
            <button 
              ref={buttonRef}
              onClick={() => setShowLogin(!showLogin)}
              style={styles.loginButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Admin Login</span>
            </button>
          </div>

         {/* Login Dropdown */}
          {showLogin && (
            <div ref={loginRef} style={styles.loginDropdown}>
              {!totpStep ? (
                // Login Form
                <>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', color: '#333' }}>
                    Admin Sign In
                  </h3>
                  
                  <form onSubmit={handleSubmit}>
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      style={styles.input}
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    
                    <div style={{ position: 'relative' }}>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        style={styles.input}
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    
                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        background: '#667eea',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '8px'
                      }}
                    >
                      Login to Dashboard
                    </button>
                  </form>
                </>
              ) : (
                // TOTP Verification Form
<>
  <h3 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', color: '#333' }}>
    Two-Factor Authentication
  </h3>
  
  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔐</div>
    <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
      Enter the 6-digit code from your Microsoft Authenticator app
    </p>
  </div>
  
  <div>
    <input
      type="text"
      placeholder="000000"
      maxLength="6"
      value={totpCode}
      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
      style={{
        ...styles.input,
        textAlign: 'center',
        fontSize: '24px',
        letterSpacing: '8px',
        fontWeight: 'bold'
      }}
    />
  </div>
  
  <button
    onClick={handleTOTPVerify}
    style={{
      width: '100%',
      background: '#10b981',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '16px'
    }}
  >
    Verify & Login
  </button>
  
  {/* ADD THIS LOST ACCESS BUTTON */}
  <div style={{ marginTop: '8px', textAlign: 'center' }}>
    <button
      onClick={() => {
        alert('Please contact HR to reset your two-factor authentication');
      }}
      style={{
        background: 'none',
        border: 'none',
        color: '#ef4444',
        fontSize: '12px',
        cursor: 'pointer',
        textDecoration: 'underline'
      }}
    >
      Lost access to authenticator?
    </button>
  </div>
  
  <button
    onClick={() => {
      setTotpStep(false);
      setTotpCode('');
    }}
    style={{
      width: '100%',
      background: 'transparent',
      color: '#666',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '400',
      cursor: 'pointer',
      marginTop: '8px',
      fontSize: '14px'
    }}
  >
    ← Back to Login
  </button>
</>
              )}
            </div>
          )}
        </div>
      </header>

      {/* HR Warning Modal */}
      {showHRWarning && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.warningIcon}>⚠️</div>
            <h2 style={styles.modalTitle}>HR Portal Access</h2>
            <p style={styles.modalText}>
              You are attempting to access the Human Resources portal.
            </p>
            
            <div style={styles.warningBox}>
              <div style={styles.warningText}>
                <span>🔒</span>
                <span>This area is restricted to HR personnel only</span>
              </div>
              <div style={styles.warningText}>
                <span>⚖️</span>
                <span>Unauthorized access is subject to disciplinary action</span>
              </div>
              <div style={styles.warningText}>
                <span>📋</span>
                <span>All access is logged and monitored</span>
              </div>
              <div style={styles.warningText}>
                <span>👑</span>
                <span>HR privileges require manageEmployees permission</span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              Do you have the required HR permissions to continue?
            </p>

            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowHRWarning(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToHR}
                style={styles.proceedButton}
              >
                Continue to HR Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Portal Warning Modal */}
      {showCustomerWarning && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.warningIcon}>🏦</div>
            <h2 style={styles.modalTitle}>Customer Portal Access</h2>
            <p style={styles.modalText}>
              You are attempting to access the Customer Banking Portal.
            </p>
            
            <div style={styles.warningBox}>
              <div style={styles.warningText}>
                <span>🔒</span>
                <span>This is a separate domain for customer banking activities</span>
              </div>
              <div style={styles.warningText}>
                <span>⚖️</span>
                <span>Company policy prohibits unauthorized access to customer interfaces</span>
              </div>
              <div style={styles.warningText}>
                <span>📋</span>
                <span>All access attempts are logged for security compliance</span>
              </div>
              <div style={styles.warningText}>
                <span>⚠️</span>
                <span>This is NOT your admin dashboard - proceed with caution</span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              Do you understand that you are leaving the admin portal and entering the customer-facing banking interface?
            </p>

            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowCustomerWarning(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToCustomer}
                style={styles.proceedButton}
              >
                Continue to Customer Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div>
            <h2 style={styles.heroTitle}>
              Bank Management <span style={styles.heroHighlight}>Made Simple</span>
            </h2>
            <p style={styles.heroText}>
              Complete control over users, accounts, transactions, and banking operations. 
              Secure, fast, and intuitive admin dashboard.
            </p>
            <div>
              <button
                onClick={() => setShowLogin(true)}
                style={styles.buttonPrimary}
              >
                Access Admin Panel
              </button>
              <button style={styles.buttonSecondary}>
                Learn More
              </button>
            </div>
          </div>
          
          <div style={styles.statsCard}>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>
                  {stats.loading ? '...' : formatNumber(stats.totalUsers)}
                </div>
                <div style={styles.statLabel}>Total Users</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>
                  {stats.loading ? '...' : formatNumber(stats.totalAccounts)}
                </div>
                <div style={styles.statLabel}>Active Accounts</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>
                  {stats.loading ? '...' : formatCurrency(stats.totalBalance)}
                </div>
                <div style={styles.statLabel}>Total Balance</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>24/7</div>
                <div style={styles.statLabel}>System Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Complete Banking Control</h2>
        <p style={styles.sectionSubtitle}>
          Everything you need to manage your bank efficiently and securely
        </p>
        
        <div style={styles.featuresGrid}>
          {[
            { icon: '👥', title: 'User Management', desc: 'View, search, and manage all bank users. Approve applications, freeze accounts, and more.' },
            { icon: '💰', title: 'Transaction Monitoring', desc: 'Monitor all transactions in real-time. Flag suspicious activity and ensure compliance.' },
            { icon: '💳', title: 'Card Management', desc: 'Issue, freeze, replace, and manage all bank cards. Set limits and track usage.' },
            { icon: '📊', title: 'Reports & Analytics', desc: 'Generate detailed reports on transactions, users, accounts, and financial performance.' },
            { icon: '⚖️', title: 'Claims & Disputes', desc: 'Manage customer claims and disputes. Investigate and resolve issues efficiently.' },
            { icon: '🔒', title: 'Security & Compliance', desc: 'Audit logs, fraud detection, and compliance tools to keep your bank secure.' }
          ].map((feature, index) => (
            <div key={index} style={styles.featureCard}>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div>
            <h3 style={styles.footerTitle}>SNOPITECH BANK</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              Complete banking management system for authorized personnel only.
            </p>
          </div>
          <div>
            <h3 style={styles.footerTitle}>Management</h3>
            <a href="#" style={styles.footerLink}>Dashboard</a>
            <a href="#" style={styles.footerLink}>Users</a>
            <a href="#" style={styles.footerLink}>Accounts</a>
            <a href="#" style={styles.footerLink}>Transactions</a>
          </div>
          <div>
            <h3 style={styles.footerTitle}>Security</h3>
            <a href="#" style={styles.footerLink}>Audit Logs</a>
            <a href="#" style={styles.footerLink}>Access Control</a>
            <a href="#" style={styles.footerLink}>Compliance</a>
          </div>
          <div>
            <h3 style={styles.footerTitle}>Support</h3>
            <a href="#" style={styles.footerLink}>Help Center</a>
            <a href="#" style={styles.footerLink}>Documentation</a>
            <a href="#" style={styles.footerLink}>Contact IT</a>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <div>© 2026 Snopitech Bank. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Security</a>
            <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}