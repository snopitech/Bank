/* eslint-disable no-unused-vars */
import { useState } from 'react';

const API_URL = 'http://localhost:8081/api';

function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInviteMessage, setShowInviteMessage] = useState(false);
  
  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 10) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setPassword(pass);
    checkPasswordStrength(pass);
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return '#e0e0e0';
    if (passwordStrength === 1) return '#ef4444';
    if (passwordStrength === 2) return '#f59e0b';
    if (passwordStrength === 3) return '#eab308';
    return '#22c55e';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return 'No password';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        await fetch(`${API_URL}/users/${data.userId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ONLINE' })
        });
        
        localStorage.setItem('teams_user', JSON.stringify(data));
        localStorage.setItem('teams_user_id', data.userId);
        localStorage.setItem('teams_user_name', `${data.firstName} ${data.lastName}`);
        onLogin(data);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Welcome ${firstName}! Your account has been created. A confirmation email has been sent to ${email}. You can now sign in.`);
        setShowInviteMessage(true);
        // Clear form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPasswordStrength(0);
        // Switch back to login after 5 seconds
        setTimeout(() => {
          setIsSignUp(false);
          setShowInviteMessage(false);
          setSuccess('');
        }, 5000);
      } else {
        setError(data.message || data.error || 'Registration failed. Email may already exist.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Invitation email resent to ${email}`);
      } else {
        setError(data.error || 'Failed to resend invitation');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <span style={styles.logo}>💬</span>
          <h1 style={styles.title}>Snopitech Teams</h1>
          <p style={styles.subtitle}>Collaborate. Communicate. Create.</p>
        </div>
        
        <div style={styles.tabContainer}>
          <button 
            onClick={() => {
              setIsSignUp(false);
              setError('');
              setSuccess('');
              setPassword('');
              setConfirmPassword('');
            }}
            style={{
              ...styles.tab,
              borderBottom: !isSignUp ? '2px solid #667eea' : '2px solid transparent',
              color: !isSignUp ? '#667eea' : '#999'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => {
              setIsSignUp(true);
              setError('');
              setSuccess('');
              setPassword('');
              setConfirmPassword('');
            }}
            style={{
              ...styles.tab,
              borderBottom: isSignUp ? '2px solid #667eea' : '2px solid transparent',
              color: isSignUp ? '#667eea' : '#999'
            }}
          >
            Create Account
          </button>
        </div>

        {showInviteMessage && (
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>📧</span>
            <div>
              <p style={styles.infoText}>An invitation has been sent to your email address.</p>
              <p style={styles.infoSubtext}>Check your inbox and follow the instructions to activate your account.</p>
            </div>
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {!isSignUp ? (
          // Login Form
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.passwordInput}
                  required
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={styles.eyeButton}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? (
                <span style={styles.loadingSpinner}>⏳</span>
              ) : (
                'Sign in'
              )}
            </button>
            
            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine}></span>
            </div>
            
            <button 
              type="button" 
              onClick={handleResendInvite}
              style={styles.linkButton}
            >
              📧 Resend Invitation Email
            </button>
          </form>
        ) : (
          // Sign Up Form
          <form onSubmit={handleSignUp} style={styles.form}>
            <div style={styles.nameRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{...styles.input, width: '100%'}}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{...styles.input, width: '100%'}}
                  required
                />
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Work Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChange={handlePasswordChange}
                  style={styles.passwordInput}
                  required
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={styles.eyeButton}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {password && (
                <div style={styles.strengthContainer}>
                  <div style={styles.strengthBar}>
                    <div style={{
                      ...styles.strengthFill,
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getStrengthColor()
                    }} />
                  </div>
                  <span style={styles.strengthText}>
                    Password strength: {getStrengthText()}
                  </span>
                </div>
              )}
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.passwordInput}
                  required
                />
                <button 
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? (
                <span style={styles.loadingSpinner}>⏳</span>
              ) : (
                'Create account'
              )}
            </button>
            
            <p style={styles.termsText}>
              By signing up, you agree to the <a href="#" style={styles.link}>Terms of Service</a> and 
              <a href="#" style={styles.link}> Privacy Policy</a>.
            </p>
          </form>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {!isSignUp ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
                setPassword('');
                setConfirmPassword('');
              }}
              style={styles.switchButton}
            >
              {!isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '24px',
    width: '460px',
    maxWidth: '92%',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    transition: 'transform 0.2s',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logo: {
    fontSize: '56px',
    display: 'block',
    marginBottom: '8px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '4px',
    color: '#1a1a2e',
    fontSize: '26px',
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: '13px',
    marginTop: '4px',
  },
  tabContainer: {
    display: 'flex',
    marginBottom: '28px',
    borderBottom: '1px solid #e0e0e0',
    gap: '8px',
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: 'none',
    border: 'none',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#999',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    letterSpacing: '0.3px',
  },
  nameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  input: {
    padding: '12px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    padding: '12px 48px 12px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  strengthContainer: {
    marginTop: '8px',
  },
  strengthBar: {
    height: '4px',
    backgroundColor: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  strengthFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  strengthText: {
    fontSize: '11px',
    color: '#666',
  },
  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '8px',
    fontFamily: 'inherit',
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '13px',
    textAlign: 'center',
    border: '1px solid #fecaca',
  },
  success: {
    background: '#d1fae5',
    color: '#065f46',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '13px',
    textAlign: 'center',
    border: '1px solid #a7f3d0',
  },
  infoBox: {
    background: '#e0f2fe',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #bae6fd',
  },
  infoIcon: {
    fontSize: '28px',
  },
  infoText: {
    color: '#0369a1',
    fontSize: '13px',
    margin: 0,
    fontWeight: '600',
  },
  infoSubtext: {
    color: '#0369a1',
    fontSize: '11px',
    margin: '4px 0 0',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '4px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    padding: '0 12px',
    color: '#94a3b8',
    fontSize: '12px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '13px',
    padding: '10px',
    width: '100%',
    fontWeight: '500',
    transition: 'background 0.2s',
    borderRadius: '8px',
  },
  termsText: {
    fontSize: '11px',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: '8px',
    lineHeight: '1.5',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
  },
  footer: {
    marginTop: '28px',
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  footerText: {
    fontSize: '13px',
    color: '#64748b',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    marginLeft: '4px',
  },
  loadingSpinner: {
    display: 'inline-block',
    animation: 'spin 0.6s linear infinite',
  },
};

// Add keyframe animation to document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Login;