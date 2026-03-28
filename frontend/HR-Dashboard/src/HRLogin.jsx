/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HRCreateEmployee from "./HRCreateEmployee"; // Import your exact component

const API_BASE = "";

export default function HRLogin() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(true);
  const [showCreateHR, setShowCreateHR] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // MFA States
  const [step, setStep] = useState(1); // 1: email/password, 2: verify code
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const loginRef = useRef(null);

  // Handle login form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendDisabled(true);
    setResendTimer(60);
    
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle login submission (Step 1)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/hr/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      // Store temp token and move to MFA step
      setTempToken(data.tempToken);
      setStep(2);
      startResendTimer();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle code verification (Step 2)
  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/hr/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken: tempToken,
          code: code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      // Check if user has HR permissions (manageEmployees: true)
      const employee = data.employee;
      const hasHRAccess = employee.permissions?.manageEmployees === true;

      if (!hasHRAccess) {
        throw new Error("Access denied. HR privileges required.");
      }

      // Store HR user data
      localStorage.setItem("hrUser", JSON.stringify(employee));
      localStorage.setItem("hrToken", data.token);
      
      // Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend code
  const handleResend = async () => {
    if (resendDisabled) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/hr/auth/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken: tempToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      // Reset timer
      startResendTimer();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreationSuccess = () => {
    setShowCreateHR(false);
    // Optionally show a success message
  };

  // Handle back to admin home
  const handleBackToAdmin = () => {
    window.location.href = "/";
  };

  const logoUrl = "https://snopitechstore.online/public-images/Mylogo.png";

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
    headerButtons: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    homeButton: {
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
    createHRButton: {
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
    loginContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '40px 20px 60px',
      minHeight: '600px'
    },
    loginCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '40px',
      maxWidth: showCreateHR ? '1000px' : '400px',
      width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
    },
    loginHeader: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    loginTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    },
    loginSubtitle: {
      fontSize: '14px',
      color: '#666'
    },
    errorBox: {
      background: '#fef2f2',
      border: '1px solid #fee2e2',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
      color: '#991b1b',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoBox: {
      background: '#ebf8ff',
      border: '1px solid #90cdf4',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      fontSize: '14px',
      color: '#2c5282'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#333',
      fontSize: '14px',
      fontWeight: '500'
    },
    inputContainer: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    codeInput: {
      textAlign: 'center',
      fontSize: '24px',
      letterSpacing: '8px',
      fontFamily: 'monospace'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '12px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#666'
    },
    loginButton: {
      width: '100%',
      background: '#667eea',
      color: 'white',
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '10px'
    },
    verifyButton: {
      width: '100%',
      background: '#10b981',
      color: 'white',
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '10px'
    },
    secondaryButton: {
      width: '100%',
      background: '#e5e7eb',
      color: '#333',
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '500',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '10px'
    },
    disabledButton: {
      background: '#999',
      cursor: 'not-allowed'
    },
    resendSection: {
      marginTop: '20px',
      textAlign: 'center'
    },
    resendButton: {
      background: 'none',
      border: 'none',
      color: '#667eea',
      cursor: 'pointer',
      fontSize: '14px',
      textDecoration: 'underline'
    },
    resendDisabled: {
      color: '#a0aec0',
      cursor: 'not-allowed',
      textDecoration: 'none'
    },
    backToLogin: {
      textAlign: 'center',
      marginTop: '20px',
      color: '#667eea',
      cursor: 'pointer',
      fontSize: '14px',
      textDecoration: 'underline'
    },
    footer: {
      background: '#1f2937',
      padding: '48px 30px 24px',
      marginTop: '40px'
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
            <p style={styles.logoSubtext}>HR Portal</p>
          </div>
        </div>

        <div style={styles.headerButtons}>
          {/* Back to Admin Home Button */}
          <button 
            onClick={handleBackToAdmin}
            style={styles.homeButton}
          >
            <span>🏠</span>
            Back to Admin Home
          </button>

          {/* Create HR Account Button */}
          <button 
            onClick={() => {
              setShowCreateHR(!showCreateHR);
              setStep(1);
              setCode("");
              setError("");
            }}
            style={styles.createHRButton}
          >
            <span>👑</span>
            {showCreateHR ? 'Back to Login' : 'Create HR Account'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {showCreateHR ? (
            /* Use your exact HRCreateEmployee component */
            <HRCreateEmployee onSuccess={handleCreationSuccess} />
          ) : (
            /* Login or MFA Verification */
            step === 1 ? (
              /* Step 1: Email and Password */
              <div>
                <div style={styles.loginHeader}>
                  <h2 style={styles.loginTitle}>HR Portal Login</h2>
                  <p style={styles.loginSubtitle}>Sign in with your employee credentials</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="hr@snopitech.com"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password</label>
                    <div style={styles.inputContainer}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        style={styles.input}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        style={styles.passwordToggle}
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...styles.loginButton,
                      ...(loading ? styles.disabledButton : {})
                    }}
                  >
                    {loading ? 'Verifying...' : 'Sign In'}
                  </button>
                </form>
              </div>
            ) : (
              /* Step 2: MFA Verification */
              <div>
                <div style={styles.loginHeader}>
                  <h2 style={styles.loginTitle}>Verification Required</h2>
                  <p style={styles.loginSubtitle}>Enter the 6-digit code sent to your email</p>
                </div>

                <div style={styles.infoBox}>
                  <strong>📧 Code sent to:</strong>
                  <p style={{ marginTop: '5px', fontSize: '13px' }}>
                    {form.email} (expires in 5 minutes)
                  </p>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Verification Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    style={{
                      ...styles.input,
                      ...styles.codeInput
                    }}
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={loading || code.length !== 6}
                  style={{
                    ...styles.verifyButton,
                    ...(loading || code.length !== 6 ? styles.disabledButton : {})
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <div style={styles.resendSection}>
                  <button
                    onClick={handleResend}
                    disabled={resendDisabled || loading}
                    style={{
                      ...styles.resendButton,
                      ...(resendDisabled ? styles.resendDisabled : {})
                    }}
                  >
                    {resendDisabled 
                      ? `Resend code in ${resendTimer}s` 
                      : 'Resend verification code'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setStep(1);
                    setCode("");
                  }}
                  style={styles.secondaryButton}
                >
                  ← Back to Login
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div>
            <h3 style={styles.footerTitle}>SNOPITECH BANK HR</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              Human Resources management portal for authorized personnel only.
            </p>
          </div>
          <div>
            <h3 style={styles.footerTitle}>HR Functions</h3>
            <a href="#" style={styles.footerLink}>User Management</a>
            <a href="#" style={styles.footerLink}>Employee Management</a>
            <a href="#" style={styles.footerLink}>Danger Zone</a>
          </div>
          <div>
            <h3 style={styles.footerTitle}>Security</h3>
            <a href="#" style={styles.footerLink}>Access Control</a>
            <a href="#" style={styles.footerLink}>Audit Logs</a>
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
