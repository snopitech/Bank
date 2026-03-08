import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8080";

export default function LoanApplicationForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eligibility, setEligibility] = useState(null);
  const [loanPurposes, setLoanPurposes] = useState([]);
  const [loanTerms, setLoanTerms] = useState([]);
  
  const [form, setForm] = useState({
    requestedAmount: '',
    loanPurpose: '',
    reason: '',
    requestedTermMonths: 36,
    employmentStatus: '',
    annualIncome: '',
    employerName: '',
    yearsAtEmployer: ''
  });

  // Employment Status options
  const employmentStatuses = [
    "Employed Full-Time",
    "Employed Part-Time",
    "Self-Employed",
    "Retired",
    "Student",
    "Unemployed"
  ];

  // Get sessionId from localStorage
  const getSessionId = () => {
    try {
      const userStr = localStorage.getItem('loggedInUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.sessionId;
      }
      return null;
    } catch (err) {
      console.error('Error getting sessionId:', err);
      return null;
    }
  };

  // Check eligibility and load purposes/terms on mount
  useEffect(() => {
    checkEligibility();
    loadLoanPurposes();
    loadLoanTerms();
  }, []);

  const checkEligibility = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/loan/eligibility`, {
        headers: { 'sessionId': sessionId }
      });
      const data = await response.json();
      setEligibility(data);
      
      if (!data.canApply) {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error checking eligibility:', err);
    }
  };

  const loadLoanPurposes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/loan/purposes`);
      const data = await response.json();
      setLoanPurposes(data);
    } catch (err) {
      console.error('Error loading loan purposes:', err);
    }
  };

  const loadLoanTerms = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/loan/terms`);
      const data = await response.json();
      setLoanTerms(data);
    } catch (err) {
      console.error('Error loading loan terms:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setForm({ ...form, requestedAmount: rawValue });
  };

  const validateForm = () => {
    const amount = parseFloat(form.requestedAmount);
    
    if (amount < 100 || amount > 1000000000) {
      setError('Loan amount must be between $100 and $1,000,000,000');
      return false;
    }
    
    if (!form.loanPurpose) {
      setError('Please select a loan purpose');
      return false;
    }
    
    if (!form.reason.trim()) {
      setError('Please provide a reason for the loan');
      return false;
    }
    
    if (!form.employmentStatus) {
      setError('Please select employment status');
      return false;
    }
    
    if (!form.annualIncome) {
      setError('Please enter annual income');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    if (!eligibility?.canApply) {
      setError(eligibility?.message || 'You are not eligible to apply for a loan');
      return;
    }

    setLoading(true);

    try {
      const sessionId = getSessionId();
      
      const requestData = {
        requestedAmount: parseFloat(form.requestedAmount),
        loanPurpose: form.loanPurpose,
        reason: form.reason,
        requestedTermMonths: parseInt(form.requestedTermMonths),
        employmentStatus: form.employmentStatus,
        annualIncome: parseFloat(form.annualIncome.replace(/[^0-9]/g, '')),
        employerName: form.employerName || null,
        yearsAtEmployer: form.yearsAtEmployer ? parseInt(form.yearsAtEmployer) : null
      };

      const response = await fetch(`${API_BASE}/api/loan/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sessionId': sessionId
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Application failed');
      }

      setSuccess(`✅ ${data.message}`);
      
      // Reset form
      setForm({
        requestedAmount: '',
        loanPurpose: '',
        reason: '',
        requestedTermMonths: 36,
        employmentStatus: '',
        annualIncome: '',
        employerName: '',
        yearsAtEmployer: ''
      });
      
      // Recheck eligibility
      await checkEligibility();
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/accounts');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px'
    },
    header: {
      marginBottom: '30px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#666'
    },
    eligibilityCard: {
      background: eligibility?.canApply ? '#f0f9ff' : '#fef2f2',
      border: `1px solid ${eligibility?.canApply ? '#3b82f6' : '#ef4444'}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    },
    eligibilityTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: eligibility?.canApply ? '#3b82f6' : '#ef4444',
      marginBottom: '8px'
    },
    eligibilityText: {
      fontSize: '14px',
      color: '#666'
    },
    form: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e0e0e0'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    field: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'border-color 0.2s'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '14px',
      background: 'white'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '14px',
      minHeight: '100px',
      fontFamily: 'inherit'
    },
    button: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%',
      transition: 'background 0.2s'
    },
    buttonDisabled: {
      background: '#9ca3af',
      cursor: 'not-allowed'
    },
    error: {
      background: '#fef2f2',
      color: '#ef4444',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #fee2e2'
    },
    success: {
      background: '#f0fdf4',
      color: '#22c55e',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #bbf7d0'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Loan Application</h1>
        <p style={styles.subtitle}>Apply for a personal loan with Snopitech Bank</p>
      </div>

      {/* Eligibility Card */}
      {eligibility && (
        <div style={styles.eligibilityCard}>
          <div style={styles.eligibilityTitle}>
            {eligibility.canApply ? '✓ You are eligible' : '✗ Not eligible'}
          </div>
          <div style={styles.eligibilityText}>
            {eligibility.canApply ? (
              <>
                You have {eligibility.remainingSlots} loan slot(s) remaining. 
                You currently have {eligibility.existingLoans} active loan(s) out of {eligibility.maxLoans}.
              </>
            ) : (
              eligibility.message
            )}
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Application Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Loan Details Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Loan Details</h2>
          
          <div style={styles.field}>
            <label style={styles.label}>Loan Amount * (Min $100 - Max $1B)</label>
            <input
              type="text"
              name="requestedAmount"
              value={form.requestedAmount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              style={styles.input}
              disabled={!eligibility?.canApply}
            />
            {form.requestedAmount && (
              <small style={{color: '#666'}}>
                ≈ {formatCurrency(form.requestedAmount)}
              </small>
            )}
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Loan Purpose *</label>
              <select
                name="loanPurpose"
                value={form.loanPurpose}
                onChange={handleChange}
                style={styles.select}
                disabled={!eligibility?.canApply}
              >
                <option value="">Select purpose</option>
                {loanPurposes.map(purpose => (
                  <option key={purpose.code} value={purpose.code}>
                    {purpose.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Loan Term (months) *</label>
              <select
                name="requestedTermMonths"
                value={form.requestedTermMonths}
                onChange={handleChange}
                style={styles.select}
                disabled={!eligibility?.canApply}
              >
                {loanTerms.map(term => (
                  <option key={term} value={term}>{term} months</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Reason for Loan *</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Please explain why you need this loan..."
              style={styles.textarea}
              disabled={!eligibility?.canApply}
            />
          </div>
        </div>

        {/* Employment & Income Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Employment & Income</h2>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Employment Status *</label>
              <select
                name="employmentStatus"
                value={form.employmentStatus}
                onChange={handleChange}
                style={styles.select}
                disabled={!eligibility?.canApply}
              >
                <option value="">Select status</option>
                {employmentStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Annual Income *</label>
              <input
                type="text"
                name="annualIncome"
                value={form.annualIncome}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setForm({ ...form, annualIncome: value });
                }}
                placeholder="Enter annual income"
                style={styles.input}
                disabled={!eligibility?.canApply}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Employer Name (Optional)</label>
              <input
                type="text"
                name="employerName"
                value={form.employerName}
                onChange={handleChange}
                placeholder="Enter employer name"
                style={styles.input}
                disabled={!eligibility?.canApply}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Years at Employer (Optional)</label>
              <input
                type="number"
                name="yearsAtEmployer"
                value={form.yearsAtEmployer}
                onChange={handleChange}
                placeholder="Years"
                min="0"
                style={styles.input}
                disabled={!eligibility?.canApply}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !eligibility?.canApply}
          style={{
            ...styles.button,
            ...((loading || !eligibility?.canApply) ? styles.buttonDisabled : {})
          }}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}