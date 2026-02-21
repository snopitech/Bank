import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminOpenAccount = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountType, setAccountType] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [success, setSuccess] = useState(false);
  const [newAccount, setNewAccount] = useState(null);

  // Mock customers database
  const [customers] = useState([
    { id: 1, name: 'Michael Agbonifo', email: 'michael@snopitech.com', phone: '(713) 870-1132', ssnLast4: '7789', existingAccounts: 2 },
    { id: 2, name: 'Cynthia Ekeh', email: 'cynthiaekeh360@gmail.com', phone: '(081) 315-2879', ssnLast4: '3381', existingAccounts: 2 },
    { id: 3, name: 'Tracy Agbonifo', email: 'snopitech+40@gmail.com', phone: '(713) 870-1100', ssnLast4: '2656', existingAccounts: 2 },
    { id: 4, name: 'Bose Agbonifo', email: 'snopitech+1@gmail.com', phone: '(713) 870-1131', ssnLast4: '7788', existingAccounts: 0 },
    { id: 5, name: 'Test User', email: 'test.cards@email.com', phone: '123-456-7890', ssnLast4: '6789', existingAccounts: 2 },
  ]);

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
    country: 'USA'
  });

  const accountTypes = [
    { id: 'checking', name: 'Personal Checking', features: ['Debit Card Included', 'Online Banking', 'Mobile Check Deposit'], interest: '0.01%', fee: '$0' },
    { id: 'savings', name: 'Personal Savings', features: ['High-Yield Interest', 'No Monthly Fee', 'Automatic Savings'], interest: '2.25%', fee: '$0' },
    { id: 'business-checking', name: 'Business Checking', features: ['Business Debit Card', 'Employee Cards', 'Merchant Services'], interest: '0.05%', fee: '$15' },
    { id: 'business-savings', name: 'Business Savings', features: ['Higher Limits', 'Business Tools', 'FDIC Insured'], interest: '1.85%', fee: '$10' },
    { id: 'money-market', name: 'Money Market', features: ['Tiered Interest', 'Check Writing', 'Higher Rates'], interest: '3.50%', fee: '$12' },
    { id: 'cd', name: 'Certificate of Deposit', features: ['Fixed Rate', 'Guaranteed Returns', 'Terms 3-60 months'], interest: '4.25%', fee: '$0' }
  ];

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setStep(2);
  };

  const handleCreateNewCustomer = () => {
    setStep(3);
  };

  const handleNewCustomerChange = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  const handleNewCustomerSubmit = (e) => {
    e.preventDefault();
    // In real app, API call to create customer
    const newId = customers.length + 1;
    const createdCustomer = {
      id: newId,
      name: `${newCustomer.firstName} ${newCustomer.lastName}`,
      email: newCustomer.email,
      phone: newCustomer.phone,
      ssnLast4: newCustomer.ssn.slice(-4),
      existingAccounts: 0
    };
    setSelectedCustomer(createdCustomer);
    setStep(2);
  };

  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
  };

  const handleOpenAccount = () => {
    if (!accountType || !initialDeposit) {
      alert('Please select account type and enter initial deposit');
      return;
    }

    // Mock account creation
    const accountNumber = '****' + Math.floor(1000 + Math.random() * 9000);
    const cardNumber = accountType.includes('checking') ? '****-****-****-' + Math.floor(1000 + Math.random() * 9000) : null;

    setNewAccount({
      accountNumber,
      cardNumber,
      type: accountTypes.find(t => t.id === accountType).name,
      initialDeposit: parseFloat(initialDeposit),
      openedDate: new Date().toLocaleDateString(),
      routingNumber: '842917356'
    });

    setSuccess(true);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setAccountType('');
    setInitialDeposit('');
    setSuccess(false);
    setNewAccount(null);
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
      marginBottom: '20px'
    },
    customerList: {
      maxHeight: '400px',
      overflowY: 'auto'
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
      fontSize: '14px'
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
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Open New Account</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Step Indicator */}
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

      {/* Step 1: Select Customer */}
      {step === 1 && (
        <div style={styles.content}>
          <h2 style={{marginBottom: '20px'}}>Select Customer</h2>
          
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={styles.customerList}>
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                style={styles.customerCard}
                onClick={() => handleCustomerSelect(customer)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <div style={styles.customerInfo}>
                  <div style={styles.customerName}>{customer.name}</div>
                  <div style={styles.customerDetails}>
                    {customer.email} • {customer.phone} • SSN ***-**-{customer.ssnLast4}
                  </div>
                </div>
                <span style={styles.badge}>{customer.existingAccounts} accounts</span>
              </div>
            ))}
          </div>

          <button
            style={styles.newCustomerButton}
            onClick={handleCreateNewCustomer}
          >
            + New Customer (Walk-in)
          </button>
        </div>
      )}

      {/* Step 1b: New Customer Form */}
      {step === 3 && (
        <div style={styles.content}>
          <h2 style={{marginBottom: '20px'}}>New Customer Information</h2>
          
          <form onSubmit={handleNewCustomerSubmit}>
            <div style={styles.form}>
              <div>
                <label style={styles.label}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  style={styles.input}
                  value={newCustomer.firstName}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  style={styles.input}
                  value={newCustomer.lastName}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div style={styles.formFull}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  style={styles.input}
                  value={newCustomer.email}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  style={styles.input}
                  value={newCustomer.phone}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>SSN *</label>
                <input
                  type="text"
                  name="ssn"
                  style={styles.input}
                  placeholder="XXX-XX-XXXX"
                  value={newCustomer.ssn}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  style={styles.input}
                  value={newCustomer.dateOfBirth}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div style={styles.formFull}>
                <label style={styles.label}>Address Line 1 *</label>
                <input
                  type="text"
                  name="addressLine1"
                  style={styles.input}
                  value={newCustomer.addressLine1}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div style={styles.formFull}>
                <label style={styles.label}>Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  style={styles.input}
                  value={newCustomer.addressLine2}
                  onChange={handleNewCustomerChange}
                />
              </div>
              <div>
                <label style={styles.label}>City *</label>
                <input
                  type="text"
                  name="city"
                  style={styles.input}
                  value={newCustomer.city}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>State *</label>
                <input
                  type="text"
                  name="state"
                  style={styles.input}
                  value={newCustomer.state}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>ZIP Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  style={styles.input}
                  value={newCustomer.zipCode}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Country *</label>
                <select
                  name="country"
                  style={styles.select}
                  value={newCustomer.country}
                  onChange={handleNewCustomerChange}
                >
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>

            <button type="submit" style={styles.button}>
              Create Customer & Continue
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Choose Account Type */}
      {step === 2 && selectedCustomer && (
        <div style={styles.content}>
          <h2 style={{marginBottom: '20px'}}>Choose Account Type for {selectedCustomer.name}</h2>
          
          <div style={styles.accountTypes}>
            {accountTypes.map(type => (
              <div
                key={type.id}
                style={{
                  ...styles.accountTypeCard,
                  ...(accountType === type.id ? styles.accountTypeSelected : {})
                }}
                onClick={() => handleAccountTypeSelect(type.id)}
              >
                <div style={styles.accountTypeName}>{type.name}</div>
                <ul style={styles.accountTypeFeatures}>
                  {type.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                </ul>
                <div style={styles.accountTypeRate}>
                  <span>APY: {type.interest}</span>
                  <span>Fee: {type.fee}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.depositSection}>
            <label style={styles.label}>Initial Deposit Amount ($)</label>
            <input
              type="number"
              style={styles.input}
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value)}
              placeholder="Minimum $25"
              min="25"
            />
          </div>

          <button
            style={styles.button}
            onClick={handleOpenAccount}
          >
            Open Account
          </button>
        </div>
      )}

      {/* Step 3: Success */}
      {success && newAccount && (
        <div style={styles.content}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>🎉</div>
            <h2 style={{color: '#22c55e', marginBottom: '20px'}}>Account Successfully Opened!</h2>
            
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
              <div style={styles.detailRow}>
                <span>Routing Number:</span>
                <span style={{fontWeight: 'bold'}}>{newAccount.routingNumber}</span>
              </div>
              {newAccount.cardNumber && (
                <div style={styles.detailRow}>
                  <span>Debit Card:</span>
                  <span style={{fontWeight: 'bold'}}>{newAccount.cardNumber}</span>
                </div>
              )}
              <div style={styles.detailRow}>
                <span>Initial Deposit:</span>
                <span style={{fontWeight: 'bold', color: '#22c55e'}}>${newAccount.initialDeposit}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Opened Date:</span>
                <span style={{fontWeight: 'bold'}}>{newAccount.openedDate}</span>
              </div>
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