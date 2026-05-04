import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8080/api";

const AdminOpenAccount = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [accountType, setAccountType] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [success, setSuccess] = useState(false);
  const [newAccount, setNewAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState("");
  
  // Get employee ID from localStorage
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    const employeeUser = localStorage.getItem('employeeUser');
    
    if (adminUser) {
      const user = JSON.parse(adminUser);
      setEmployeeId(user.id);
    } else if (employeeUser) {
      const user = JSON.parse(employeeUser);
      setEmployeeId(user.id);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const accountTypes = [
    { id: 'CHECKING', name: 'Personal Checking', features: ['Debit Card Included', 'Online Banking', 'Mobile Check Deposit'], interest: '0.01%', fee: '$0' },
    { id: 'SAVINGS', name: 'Personal Savings', features: ['High-Yield Interest', 'No Monthly Fee', 'Automatic Savings'], interest: '2.25%', fee: '$0' },
    { id: 'BUSINESS', name: 'Business Account', features: ['Business Debit Card', 'Employee Cards', 'Merchant Services'], interest: '0.05%', fee: '$15', requiresApproval: true }
  ];

  // Security questions array
  const securityQuestions = [
    "What was the name of your first pet?",
    "What was your childhood nickname?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What was the name of your elementary school?",
    "What is your favorite book?",
    "What is your favorite movie?",
    "What was the make of your first car?",
    "What is your father's middle name?",
    "What hospital were you born in?"
  ];

  // Employment Status options
  const employmentStatuses = [
    "Employed Full-Time",
    "Employed Part-Time",
    "Self-Employed",
    "Retired",
    "Student",
    "Homemaker",
    "Unemployed",
    "Disabled"
  ];

  // Income ranges
  const incomeRanges = [
    "Under $25,000",
    "$25,000 - $49,999",
    "$50,000 - $74,999",
    "$75,000 - $99,999",
    "$100,000 - $149,999",
    "$150,000 - $199,999",
    "$200,000 - $299,999",
    "$300,000+"
  ];

  // Source of Funds options
  const sourceOfFundsOptions = [
    "Employment Salary",
    "Self-Employment/Business Income",
    "Investments",
    "Retirement/Pension",
    "Inheritance",
    "Family Support",
    "Savings",
    "Other"
  ];

  // Investment Objectives
  const investmentObjectives = [
    "Capital Preservation",
    "Income Generation",
    "Growth",
    "Aggressive Growth",
    "Retirement Planning",
    "Education Savings",
    "Wealth Transfer",
    "Tax Minimization"
  ];

  // Tax Brackets
  const taxBrackets = [
    "10% - $0 to $11,000",
    "12% - $11,001 to $44,725",
    "22% - $44,726 to $95,375",
    "24% - $95,376 to $182,100",
    "32% - $182,101 to $231,250",
    "35% - $231,251 to $578,125",
    "37% - $578,126+",
    "Not Sure"
  ];

  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ssn: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    birthCity: '',
    birthState: '',
    birthCountry: 'USA',
    employmentStatus: '',
    annualIncome: '',
    sourceOfFunds: '',
    investmentObjective: '',
    taxBracket: '',
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: '',
    securityQuestion3: '',
    securityAnswer3: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  // Format SSN as XXX-XX-XXXX
  const handleSSNChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3 && value.length <= 5) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 5) {
      value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 9);
    }
    setNewCustomer({ ...newCustomer, ssn: value });
  };

  // Search customer by email
  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setSearchError('Please enter an email address');
      return;
    }

    setLoading(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const response = await fetch(`${API_BASE}/banker/customers/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employeeId,
          searchEmail: searchEmail.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResult(data);
      setSearchError(null);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error.message);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer({
      id: customer.customerId,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      ssnLast4: customer.maskedSsn ? customer.maskedSsn.slice(-4) : '****',
      existingAccounts: customer.existingAccounts.length,
      availableAccountTypes: customer.availableAccountTypes
    });
    setStep(2);
  };

  const handleCreateNewCustomer = () => {
    setStep(3);
  };

  const handleNewCustomerChange = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
    setError("");
  };

  const handleNewCustomerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Validate password
    if (!newCustomer.password || newCustomer.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    
    // Validate required fields
    if (!newCustomer.securityQuestion1 || !newCustomer.securityAnswer1 ||
        !newCustomer.securityQuestion2 || !newCustomer.securityAnswer2 ||
        !newCustomer.securityQuestion3 || !newCustomer.securityAnswer3) {
      setError("Please complete all three security questions");
      setLoading(false);
      return;
    }
    
    try {
      // Use the new banker endpoint to create customer WITHOUT auto-creating accounts
      const response = await fetch(`${API_BASE}/banker/customers/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employeeId,
          firstName: newCustomer.firstName,
          lastName: newCustomer.lastName,
          email: newCustomer.email,
          phone: newCustomer.phone,
          dateOfBirth: newCustomer.dateOfBirth,
          ssn: newCustomer.ssn,
          addressLine1: newCustomer.addressLine1,
          addressLine2: newCustomer.addressLine2 || "",
          city: newCustomer.city,
          state: newCustomer.state,
          zipCode: newCustomer.zipCode,
          country: newCustomer.country,
          birthCity: newCustomer.birthCity,
          birthState: newCustomer.birthState,
          birthCountry: newCustomer.birthCountry,
          employmentStatus: newCustomer.employmentStatus,
          annualIncome: newCustomer.annualIncome,
          sourceOfFunds: newCustomer.sourceOfFunds,
          riskTolerance: newCustomer.investmentObjective,
          taxBracket: newCustomer.taxBracket,
          password: newCustomer.password,
          securityQuestion1: newCustomer.securityQuestion1,
          securityAnswer1: newCustomer.securityAnswer1,
          securityQuestion2: newCustomer.securityQuestion2,
          securityAnswer2: newCustomer.securityAnswer2,
          securityQuestion3: newCustomer.securityQuestion3,
          securityAnswer3: newCustomer.securityAnswer3
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create customer");
      }
      
      // Now search for the customer to get their available account types
      const searchResponse = await fetch(`${API_BASE}/banker/customers/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employeeId,
          searchEmail: newCustomer.email
        })
      });
      
      const searchData = await searchResponse.json();
      
      setSelectedCustomer({
        id: searchData.customerId,
        name: `${newCustomer.firstName} ${newCustomer.lastName}`,
        email: newCustomer.email,
        phone: newCustomer.phone,
        ssnLast4: newCustomer.ssn.slice(-4),
        existingAccounts: searchData.existingAccounts.length,
        availableAccountTypes: searchData.availableAccountTypes
      });
      
      setStep(2);
      setError("");
      
    } catch (err) {
      console.error("Create customer error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
  };

  const handleOpenAccount = async () => {
    if (!accountType) {
      alert('Please select an account type');
      return;
    }

    setLoading(true);

    try {
      if (accountType === 'BUSINESS') {
        const response = await fetch(`${API_BASE}/banker/business-applications/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employeeId: employeeId,
            customerId: selectedCustomer.id,
            businessName: `${selectedCustomer.name}'s Business`,
            businessType: 'SOLE_PROPRIETORSHIP',
            businessAddress: 'Business Address',
            ein: '00-0000000',
            businessDocuments: null
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit business application');
        }

        setNewAccount({
          accountNumber: 'Pending Approval',
          cardNumber: null,
          type: 'Business Account',
          initialDeposit: 0,
          openedDate: new Date().toLocaleDateString(),
          routingNumber: 'Pending',
          requiresApproval: true
        });
      } else {
        const response = await fetch(`${API_BASE}/banker/accounts/open-instant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employeeId: employeeId,
            customerId: selectedCustomer.id,
            accountType: accountType,
            initialDeposit: parseFloat(initialDeposit) || 0
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to open account');
        }

        setNewAccount({
          accountNumber: data.accountNumber,
          cardNumber: accountType === 'CHECKING' ? 'Card will be mailed' : null,
          type: data.accountType === 'CHECKING' ? 'Personal Checking' : 'Personal Savings',
          initialDeposit: data.balance,
          openedDate: new Date(data.openedAt).toLocaleDateString(),
          routingNumber: data.routingNumber,
          requiresApproval: false
        });
      }

      setSuccess(true);
    } catch (error) {
      console.error('Open account error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setAccountType('');
    setInitialDeposit('');
    setSuccess(false);
    setNewAccount(null);
    setSearchEmail('');
    setSearchResult(null);
    setSearchError(null);
    setError("");
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      ssn: '',
      dateOfBirth: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      birthCity: '',
      birthState: '',
      birthCountry: 'USA',
      employmentStatus: '',
      annualIncome: '',
      sourceOfFunds: '',
      investmentObjective: '',
      taxBracket: '',
      securityQuestion1: '',
      securityAnswer1: '',
      securityQuestion2: '',
      securityAnswer2: '',
      securityQuestion3: '',
      securityAnswer3: '',
      password: ''
    });
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
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '30px',
      gap: '40px'
    },
    stepItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    },
    stepCircle: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '18px'
    },
    stepActive: {
      background: '#667eea',
      color: 'white'
    },
    stepInactive: {
      background: '#e0e0e0',
      color: '#999'
    },
    content: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto'
    },
    searchBox: {
      marginBottom: '20px'
    },
    searchInput: {
      width: '100%',
      padding: '15px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '10px'
    },
    searchButton: {
      width: '100%',
      padding: '12px',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    errorMessage: {
      background: '#fee2e2',
      color: '#ef4444',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '15px',
      fontSize: '14px'
    },
    customerList: {
      maxHeight: '400px',
      overflowY: 'auto',
      marginTop: '20px'
    },
    customerCard: {
      padding: '15px',
      border: '1px solid #f0f0f0',
      borderRadius: '8px',
      marginBottom: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    customerInfo: {
      flex: 1
    },
    customerName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333'
    },
    customerDetails: {
      fontSize: '14px',
      color: '#666',
      marginTop: '4px'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      background: '#e0e0e0',
      color: '#666'
    },
    newCustomerButton: {
      width: '100%',
      padding: '15px',
      background: 'none',
      border: '2px dashed #667eea',
      borderRadius: '8px',
      color: '#667eea',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '10px'
    },
    form: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px'
    },
    formFull: {
      gridColumn: 'span 2'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: '#666',
      fontSize: '14px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'white'
    },
    accountTypes: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    },
    accountTypeCard: {
      padding: '20px',
      border: '2px solid #f0f0f0',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    accountTypeSelected: {
      borderColor: '#667eea',
      background: '#f5f3ff'
    },
    accountTypeName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px'
    },
    accountTypeFeatures: {
      listStyle: 'none',
      padding: 0,
      margin: '10px 0',
      fontSize: '13px',
      color: '#666'
    },
    accountTypeRate: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '10px',
      fontSize: '14px',
      fontWeight: '500'
    },
    depositSection: {
      marginTop: '20px',
      padding: '20px',
      background: '#f9f9f9',
      borderRadius: '8px'
    },
    successCard: {
      textAlign: 'center',
      padding: '40px',
      background: '#f0fdf4',
      borderRadius: '12px',
      border: '2px solid #22c55e'
    },
    successIcon: {
      fontSize: '48px',
      marginBottom: '20px'
    },
    accountDetails: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      margin: '20px 0',
      textAlign: 'left'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    button: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '15px 30px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      width: '100%',
      marginTop: '20px'
    },
    secondaryButton: {
      background: 'white',
      color: '#667eea',
      border: '2px solid #667eea',
      padding: '15px 30px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      width: '100%',
      marginTop: '10px'
    },
    sectionDivider: {
      borderTop: '1px solid #e0e0e0',
      margin: '20px 0',
      paddingTop: '20px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '15px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Open New Account</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.stepIndicator}>
        <div style={styles.stepItem}>
          <div style={{...styles.stepCircle, ...(step >= 1 ? styles.stepActive : styles.stepInactive)}}>1</div>
          <span style={{color: step >= 1 ? '#333' : '#999'}}>Select Customer</span>
        </div>
        <div style={styles.stepItem}>
          <div style={{...styles.stepCircle, ...(step >= 2 ? styles.stepActive : styles.stepInactive)}}>2</div>
          <span style={{color: step >= 2 ? '#333' : '#999'}}>Choose Account</span>
        </div>
        <div style={styles.stepItem}>
          <div style={{...styles.stepCircle, ...(step >= 3 ? styles.stepActive : styles.stepInactive)}}>3</div>
          <span style={{color: step >= 3 ? '#333' : '#999'}}>Confirm & Open</span>
        </div>
      </div>

      {/* Step 1: Search Customer */}
      {step === 1 && (
        <div style={styles.content}>
          <h2 style={{marginBottom: '20px'}}>Find Customer</h2>
          
          <div style={styles.searchBox}>
            <input
              type="email"
              placeholder="Enter customer email address..."
              style={styles.searchInput}
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              style={styles.searchButton} 
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Customer'}
            </button>
          </div>

          {searchError && (
            <div style={styles.errorMessage}>
              ⚠️ {searchError}
            </div>
          )}

          {searchResult && !searchError && (
            <div style={styles.customerList}>
              <div
                style={styles.customerCard}
                onClick={() => handleCustomerSelect(searchResult)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <div style={styles.customerInfo}>
                  <div style={styles.customerName}>
                    {searchResult.firstName} {searchResult.lastName}
                  </div>
                  <div style={styles.customerDetails}>
                    {searchResult.email} • {searchResult.phone || 'No phone'} • SSN {searchResult.maskedSsn}
                  </div>
                  <div style={styles.customerDetails}>
                    Existing: {searchResult.existingAccounts.join(', ') || 'None'} | 
                    Available: {searchResult.availableAccountTypes.join(', ')}
                  </div>
                </div>
                <span style={styles.badge}>
                  {searchResult.existingAccounts.length} accounts
                </span>
              </div>
            </div>
          )}

          <button
            style={styles.newCustomerButton}
            onClick={handleCreateNewCustomer}
          >
            + New Customer (Walk-in)
          </button>
        </div>
      )}

      {/* Step 3: New Customer Form */}
      {step === 3 && (
        <div style={styles.content}>
          <h2 style={{marginBottom: '20px'}}>New Customer Information</h2>
          
          {error && (
            <div style={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleNewCustomerSubmit}>
            {/* Personal Information */}
            <div style={styles.sectionDivider}>
              <h3 style={styles.sectionTitle}>Personal Information</h3>
              <div style={styles.form}>
                <div>
                  <label style={styles.label}>First Name *</label>
                  <input type="text" name="firstName" style={styles.input} value={newCustomer.firstName} onChange={handleNewCustomerChange} required />
                </div>
                <div>
                  <label style={styles.label}>Last Name *</label>
                  <input type="text" name="lastName" style={styles.input} value={newCustomer.lastName} onChange={handleNewCustomerChange} required />
                </div>
                <div style={styles.formFull}>
                  <label style={styles.label}>Email *</label>
                  <input type="email" name="email" style={styles.input} value={newCustomer.email} onChange={handleNewCustomerChange} required />
                </div>
                <div>
                  <label style={styles.label}>Phone *</label>
                  <input type="tel" name="phone" style={styles.input} value={newCustomer.phone} onChange={handleNewCustomerChange} required />
                </div>
                <div>
                  <label style={styles.label}>SSN *</label>
                  <input type="text" name="ssn" style={styles.input} placeholder="XXX-XX-XXXX" value={newCustomer.ssn} onChange={handleSSNChange} required />
                </div>
                <div>
                  <label style={styles.label}>Date of Birth *</label>
                  <input type="date" name="dateOfBirth" style={styles.input} value={newCustomer.dateOfBirth} onChange={handleNewCustomerChange} required />
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={styles.sectionDivider}>
              <h3 style={styles.sectionTitle}>Address</h3>
              <div style={styles.form}>
                <div style={styles.formFull}>
                  <label style={styles.label}>Street Address *</label>
                  <input type="text" name="addressLine1" style={styles.input} value={newCustomer.addressLine1} onChange={handleNewCustomerChange} required />
                </div>
                <div style={styles.formFull}>
                  <label style={styles.label}>Apt/Suite/Unit</label>
                  <input type="text" name="addressLine2" style={styles.input} value={newCustomer.addressLine2} onChange={handleNewCustomerChange} />
                </div>
                <div>
                  <label style={styles.label}>City *</label>
                  <input type="text" name="city" style={styles.input} value={newCustomer.city} onChange={handleNewCustomerChange} required />
                </div>
                <div>
                  <label style={styles.label}>State *</label>
                  <input type="text" name="state" style={styles.input} value={newCustomer.state} onChange={handleNewCustomerChange} required />
                </div>
                <div>
                  <label style={styles.label}>ZIP Code *</label>
                  <input type="text" name="zipCode" style={styles.input} value={newCustomer.zipCode} onChange={handleNewCustomerChange} required />
                </div>
                <div>
                  <label style={styles.label}>Country *</label>
                  <select name="country" style={styles.select} value={newCustomer.country} onChange={handleNewCustomerChange}>
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Identity Verification */}
            <div style={styles.sectionDivider}>
              <h3 style={styles.sectionTitle}>Identity Verification</h3>
              <div style={styles.form}>
                <div>
                  <label style={styles.label}>Birth City *</label>
                  <input type="text" name="birthCity" style={styles.input} value={newCustomer.birthCity} onChange={handleNewCustomerChange} required />
                </div>
                <div>
                  <label style={styles.label}>Birth State/Province *</label>
                  <input type="text" name="birthState" style={styles.input} value={newCustomer.birthState} onChange={handleNewCustomerChange} required />
                </div>
                <div style={styles.formFull}>
                  <label style={styles.label}>Birth Country *</label>
                  <input type="text" name="birthCountry" style={styles.input} value={newCustomer.birthCountry} onChange={handleNewCustomerChange} required />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div style={styles.sectionDivider}>
              <h3 style={styles.sectionTitle}>Financial Information</h3>
              <div style={styles.form}>
                <div>
                  <label style={styles.label}>Employment Status *</label>
                  <select name="employmentStatus" style={styles.select} value={newCustomer.employmentStatus} onChange={handleNewCustomerChange} required>
                    <option value="">Select...</option>
                    {employmentStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Annual Income *</label>
                  <select name="annualIncome" style={styles.select} value={newCustomer.annualIncome} onChange={handleNewCustomerChange} required>
                    <option value="">Select...</option>
                    {incomeRanges.map((r, i) => <option key={i} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Source of Funds *</label>
                  <select name="sourceOfFunds" style={styles.select} value={newCustomer.sourceOfFunds} onChange={handleNewCustomerChange} required>
                    <option value="">Select...</option>
                    {sourceOfFundsOptions.map((s, i) => <option key={i} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Investment Objective *</label>
                  <select name="investmentObjective" style={styles.select} value={newCustomer.investmentObjective} onChange={handleNewCustomerChange} required>
                    <option value="">Select...</option>
                    {investmentObjectives.map((o, i) => <option key={i} value={o}>{o}</option>)}
                  </select>
                </div>
                <div style={styles.formFull}>
                  <label style={styles.label}>Tax Bracket</label>
                  <select name="taxBracket" style={styles.select} value={newCustomer.taxBracket} onChange={handleNewCustomerChange}>
                    <option value="">Select...</option>
                    {taxBrackets.map((t, i) => <option key={i} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Security Questions */}
            <div style={styles.sectionDivider}>
              <h3 style={styles.sectionTitle}>Security Questions</h3>
              <div style={styles.form}>
                <div style={styles.formFull}>
                  <label style={styles.label}>Question 1 *</label>
                  <select name="securityQuestion1" style={styles.select} value={newCustomer.securityQuestion1} onChange={handleNewCustomerChange} required>
                    <option value="">Select a question</option>
                    {securityQuestions.map((q, i) => <option key={i} value={q}>{q}</option>)}
                  </select>
                </div>
                <div style={styles.formFull}>
                  <label style={styles.label}>Answer 1 *</label>
                  <input type="text" name="securityAnswer1" style={styles.input} value={newCustomer.securityAnswer1} onChange={handleNewCustomerChange} required />
                </div>
                <div style={styles.formFull}>
                  <label style={styles.label}>Question 2 *</label>
                  <select name="securityQuestion2" style={styles.select} value={newCustomer.securityQuestion2} onChange={handleNewCustomerChange} required>
                    <option value="">Select a question</option>
                    {securityQuestions.map((q, i) => <option key={i} value={q}>{q}</option>)}
                  </select>
                </div>
                <div style={styles.formFull}>
                  <label style={styles.label}>Answer 2 *</label>
                  <input type="text" name="securityAnswer2" style={styles.input} value={newCustomer.securityAnswer2} onChange={handleNewCustomerChange} required />
                </div>
                <div style={styles.formFull}>
                  <label style={styles.label}>Question 3 *</label>
                  <select name="securityQuestion3" style={styles.select} value={newCustomer.securityQuestion3} onChange={handleNewCustomerChange} required>
                    <option value="">Select a question</option>
                    {securityQuestions.map((q, i) => <option key={i} value={q}>{q}</option>)}
                  </select>
                </div>
                <div style={styles.formFull}>
                  <label style={styles.label}>Answer 3 *</label>
                  <input type="text" name="securityAnswer3" style={styles.input} value={newCustomer.securityAnswer3} onChange={handleNewCustomerChange} required />
                </div>
              </div>
            </div>

            {/* Password */}
            <div style={styles.sectionDivider}>
              <h3 style={styles.sectionTitle}>Password</h3>
              <div style={styles.form}>
                <div style={styles.formFull}>
                  <label style={styles.label}>Password *</label>
                  <div style={{position: 'relative'}}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      style={styles.input} 
                      value={newCustomer.password} 
                      onChange={handleNewCustomerChange} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      style={{position: 'absolute', right: '10px', top: '12px', background: 'none', border: 'none', cursor: 'pointer'}}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>Minimum 8 characters</p>
                </div>
              </div>
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Creating Customer...' : 'Create Customer & Continue'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Choose Account Type */}
      {step === 2 && selectedCustomer && (
        <div style={styles.content}>
          <h2 style={{marginBottom: '20px'}}>Choose Account Type for {selectedCustomer.name}</h2>
          
          <div style={styles.accountTypes}>
            {accountTypes.map(type => {
              const isAvailable = selectedCustomer.availableAccountTypes?.includes(type.id);
              
              return (
                <div
                  key={type.id}
                  style={{
                    ...styles.accountTypeCard,
                    ...(accountType === type.id ? styles.accountTypeSelected : {}),
                    ...(!isAvailable ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                  }}
                  onClick={() => isAvailable && handleAccountTypeSelect(type.id)}
                >
                  <div style={styles.accountTypeName}>{type.name}</div>
                  {!isAvailable && (
                    <div style={{color: '#ef4444', fontSize: '12px', marginBottom: '8px'}}>
                      ⚠️ Already exists
                    </div>
                  )}
                  <ul style={styles.accountTypeFeatures}>
                    {type.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                  </ul>
                  <div style={styles.accountTypeRate}>
                    <span>APY: {type.interest}</span>
                    <span>Fee: {type.fee}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {accountType === 'BUSINESS' && (
            <div style={styles.depositSection}>
              <p style={{color: '#eab308', marginBottom: '10px'}}>
                ⚠️ Business accounts require approval. Our team will review and activate within 1-2 business days.
              </p>
            </div>
          )}

          {(accountType === 'CHECKING' || accountType === 'SAVINGS') && (
            <div style={styles.depositSection}>
              <label style={styles.label}>Initial Deposit Amount ($)</label>
              <input
                type="number"
                style={styles.input}
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                placeholder="$0 minimum"
                min="0"
                step="100"
              />
            </div>
          )}

          <button
            style={styles.button}
            onClick={handleOpenAccount}
            disabled={loading || !accountType}
          >
            {loading ? 'Processing...' : 'Open Account'}
          </button>
        </div>
      )}

      {/* Step 3: Success */}
      {success && newAccount && (
        <div style={styles.content}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>🎉</div>
            <h2 style={{color: '#22c55e', marginBottom: '20px'}}>
              {newAccount.requiresApproval ? 'Application Submitted!' : 'Account Successfully Opened!'}
            </h2>
            
            <div style={styles.accountDetails}>
              <div style={styles.detailRow}>
                <span>Customer:</span>
                <span style={{fontWeight: 'bold'}}>{selectedCustomer.name}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Account Type:</span>
                <span style={{fontWeight: 'bold'}}>{newAccount.type}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Account Number:</span>
                <span style={{fontWeight: 'bold'}}>{newAccount.accountNumber}</span>
              </div>
              {newAccount.routingNumber !== 'Pending' && (
                <div style={styles.detailRow}>
                  <span>Routing Number:</span>
                  <span style={{fontWeight: 'bold'}}>{newAccount.routingNumber}</span>
                </div>
              )}
              {newAccount.cardNumber && (
                <div style={styles.detailRow}>
                  <span>Debit Card:</span>
                  <span style={{fontWeight: 'bold'}}>{newAccount.cardNumber}</span>
                </div>
              )}
              {newAccount.initialDeposit > 0 && (
                <div style={styles.detailRow}>
                  <span>Initial Deposit:</span>
                  <span style={{fontWeight: 'bold', color: '#22c55e'}}>${newAccount.initialDeposit}</span>
                </div>
              )}
              <div style={styles.detailRow}>
                <span>Opened Date:</span>
                <span style={{fontWeight: 'bold'}}>{newAccount.openedDate}</span>
              </div>
              {newAccount.requiresApproval && (
                <div style={styles.detailRow}>
                  <span>Status:</span>
                  <span style={{fontWeight: 'bold', color: '#eab308'}}>Pending Approval</span>
                </div>
              )}
            </div>

            <button
              style={styles.button}
              onClick={resetForm}
            >
              Open Another Account
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOpenAccount;