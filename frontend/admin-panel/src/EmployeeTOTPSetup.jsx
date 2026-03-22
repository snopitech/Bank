import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8080";

const EmployeeTOTPSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: show QR, 2: verify code
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [secret, setSecret] = useState('');
  const [uri, setUri] = useState('');
  const [code, setCode] = useState('');
  const [employee, setEmployee] = useState(null);
  const [enforcementMessage, setEnforcementMessage] = useState('');

  useEffect(() => {
    // Check if coming from enforcement
    const pendingSetup = localStorage.getItem("pendingTOTPSetup");
    if (pendingSetup) {
      const employeeData = JSON.parse(pendingSetup);
      setEmployee(employeeData);
      localStorage.removeItem("pendingTOTPSetup");
      
      // Show enforcement message
      setEnforcementMessage("Two-factor authentication is now required for your account. Please set it up to continue.");
    } else {
      // Get employee from localStorage
      const employeeData = JSON.parse(localStorage.getItem('employeeUser') || '{}');
      if (!employeeData || !employeeData.id) {
        navigate('/admin');
        return;
      }
      setEmployee(employeeData);
    }
    
    // Check if TOTP is already enabled
    if (employee?.id) {
      checkTOTPStatus(employee.id);
    }
  }, [navigate]);

  const checkTOTPStatus = async (employeeId) => {
    try {
      const res = await fetch(`${API_BASE}/api/employees/totp/status?employeeId=${employeeId}`);
      const data = await res.json();
      
      if (data.totpEnabled) {
        setSuccess('TOTP is already enabled for your account');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      console.error('Error checking TOTP status:', err);
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/api/employees/totp/setup?employeeId=${employee.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSecret(data.secret);
        setUri(data.uri);
        setStep(2);
      } else {
        setError(data.error || 'Failed to setup TOTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/api/employees/totp/verify-and-enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          code: code
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('TOTP enabled successfully! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      maxWidth: '500px',
      width: '100%',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      padding: '40px',
      textAlign: 'center'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#333',
      marginBottom: '10px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '30px',
      lineHeight: '1.5'
    },
    instructionBox: {
      background: '#f0f4ff',
      border: '1px solid #d0e0ff',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '25px',
      textAlign: 'left'
    },
    instructionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#4a5568',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    instructionList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    instructionItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 0',
      color: '#4a5568',
      fontSize: '14px'
    },
    instructionNumber: {
      width: '24px',
      height: '24px',
      background: '#667eea',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '600'
    },
    button: {
      width: '100%',
      padding: '14px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '12px'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    },
    successBox: {
      background: '#f0fff4',
      border: '1px solid #9ae6b4',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '25px'
    },
    successText: {
      color: '#276749',
      fontWeight: '500',
      marginBottom: '5px'
    },
    successSubtext: {
      color: '#48bb78',
      fontSize: '13px'
    },
    qrContainer: {
      background: '#f7fafc',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '25px',
      display: 'flex',
      justifyContent: 'center',
      border: '2px dashed #cbd5e0'
    },
    secretBox: {
      background: '#f7fafc',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '25px'
    },
    secretLabel: {
      fontSize: '12px',
      color: '#718096',
      marginBottom: '8px'
    },
    secretCode: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'white',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    code: {
      flex: 1,
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#2d3748'
    },
    copyButton: {
      background: '#edf2f7',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '12px',
      cursor: 'pointer',
      color: '#4a5568'
    },
    input: {
      width: '100%',
      padding: '14px',
      fontSize: '24px',
      letterSpacing: '8px',
      textAlign: 'center',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      marginBottom: '20px',
      fontFamily: 'monospace',
      outline: 'none'
    },
    inputFocused: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    verifyButton: {
      background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)'
    },
    backLink: {
      color: '#718096',
      textDecoration: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'inline-block',
      marginTop: '10px'
    },
    errorAlert: {
      background: '#fff5f5',
      border: '1px solid #fc8181',
      borderRadius: '10px',
      padding: '12px',
      marginBottom: '20px',
      color: '#c53030',
      fontSize: '14px'
    },
    successAlert: {
      background: '#f0fff4',
      border: '1px solid #9ae6b4',
      borderRadius: '10px',
      padding: '12px',
      marginBottom: '20px',
      color: '#276749',
      fontSize: '14px'
    },
    enforcementAlert: {
      background: '#fefcbf',
      border: '1px solid #faf089',
      borderRadius: '10px',
      padding: '12px',
      marginBottom: '20px',
      color: '#975a16',
      fontSize: '14px',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Two-Factor Authentication</h1>
        <p style={styles.subtitle}>Enhance your account security with Microsoft Authenticator</p>

        {enforcementMessage && (
          <div style={styles.enforcementAlert}>
            ⚠️ {enforcementMessage}
          </div>
        )}
        
        {error && (
          <div style={styles.errorAlert}>
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div style={styles.successAlert}>
            ✅ {success}
          </div>
        )}

        {step === 1 && (
          <>
            <div style={styles.instructionBox}>
              <div style={styles.instructionTitle}>
                <span>📱</span> Setup Instructions
              </div>
              <ul style={styles.instructionList}>
                <li style={styles.instructionItem}>
                  <span style={styles.instructionNumber}>1</span>
                  Open Microsoft Authenticator app on your phone
                </li>
                <li style={styles.instructionItem}>
                  <span style={styles.instructionNumber}>2</span>
                  Tap the + icon and select "Work or school account"
                </li>
                <li style={styles.instructionItem}>
                  <span style={styles.instructionNumber}>3</span>
                  Choose "Scan a QR code"
                </li>
                <li style={styles.instructionItem}>
                  <span style={styles.instructionNumber}>4</span>
                  Click the button below to generate your QR code
                </li>
              </ul>
            </div>

            <button
              onClick={handleSetup}
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={styles.successBox}>
              <div style={styles.successText}>✅ QR Code Generated</div>
              <div style={styles.successSubtext}>Scan this QR code with Microsoft Authenticator</div>
            </div>

            <div style={styles.qrContainer}>
              <QRCodeSVG value={uri} size={200} />
            </div>

            <div style={styles.secretBox}>
              <div style={styles.secretLabel}>Can't scan? Enter this secret manually:</div>
              <div style={styles.secretCode}>
                <code style={styles.code}>{secret}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(secret)}
                  style={styles.copyButton}
                >
                  Copy
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="000000"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={styles.input}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              style={{
                ...styles.button,
                ...styles.verifyButton,
                opacity: loading || code.length !== 6 ? 0.7 : 1,
                cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => !loading && code.length === 6 && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </button>
          </>
        )}

        <div style={{ marginTop: '20px' }}>
          <a
            onClick={() => navigate('/dashboard')}
            style={styles.backLink}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTOTPSetup;