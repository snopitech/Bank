import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminFreezeAccount = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeDuration, setFreezeDuration] = useState('temporary'); // 'temporary', 'indefinite'
  const [confirmAction, setConfirmAction] = useState('');
  const [success, setSuccess] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  // Mock customers database with accounts
  const [customers] = useState([
    { 
      id: 1, 
      name: 'Michael Agbonifo', 
      email: 'michael@snopitech.com', 
      phone: '(713) 870-1132',
      status: 'active',
      accounts: [
        { id: 1, type: 'CHECKING', number: '****2213', balance: 25140.00, status: 'active', frozen: false },
        { id: 2, type: 'SAVINGS', number: '****6808', balance: 4500.00, status: 'active', frozen: false }
      ]
    },
    { 
      id: 2, 
      name: 'Cynthia Ekeh', 
      email: 'cynthiaekeh360@gmail.com', 
      phone: '(081) 315-2879',
      status: 'active',
      accounts: [
        { id: 3, type: 'CHECKING', number: '****8924', balance: 2950.00, status: 'active', frozen: false },
        { id: 4, type: 'SAVINGS', number: '****6051', balance: 2050.00, status: 'active', frozen: false }
      ]
    },
    { 
      id: 3, 
      name: 'Tracy Agbonifo', 
      email: 'snopitech+40@gmail.com', 
      phone: '(713) 870-1100',
      status: 'active',
      accounts: [
        { id: 10, type: 'CHECKING', number: '****2326', balance: 25.00, status: 'active', frozen: true },
        { id: 11, type: 'SAVINGS', number: '****5070', balance: 0.00, status: 'active', frozen: false }
      ]
    },
    { 
      id: 4, 
      name: 'Bose Agbonifo', 
      email: 'snopitech+1@gmail.com', 
      phone: '(713) 870-1131',
      status: 'pending',
      accounts: []
    },
    { 
      id: 5, 
      name: 'Test User', 
      email: 'test.cards@email.com', 
      phone: '123-456-7890',
      status: 'suspended',
      accounts: [
        { id: 8, type: 'CHECKING', number: '****0339', balance: 0.00, status: 'active', frozen: false },
        { id: 9, type: 'SAVINGS', number: '****1180', balance: 0.00, status: 'active', frozen: false }
      ]
    }
  ]);

  const freezeReasons = [
    'Suspicious Activity',
    'Multiple Failed Login Attempts',
    'Customer Request',
    'Lost/Stolen Card',
    'Legal Hold',
    'Fraud Investigation',
    'NSF/Overdrawn Account',
    'Court Order',
    'Account Inactivity',
    'Security Breach',
    'Compliance Review',
    'Other'
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

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setStep(3);
  };

  const handleFreezeAccount = () => {
    if (!freezeReason) {
      alert('Please select a reason for freezing');
      return;
    }

    if (confirmAction !== selectedAccount.number.slice(-4)) {
      alert('Please type the last 4 digits to confirm');
      return;
    }

    // Mock freeze action
    setActionResult({
      customer: selectedCustomer.name,
      account: `${selectedAccount.type} ${selectedAccount.number}`,
      reason: freezeReason,
      duration: freezeDuration,
      date: new Date().toLocaleString(),
      status: 'FROZEN'
    });

    setSuccess(true);
  };

  const handleUnfreezeAccount = () => {
    if (!freezeReason) {
      alert('Please select a reason for unfreezing');
      return;
    }

    if (confirmAction !== selectedAccount.number.slice(-4)) {
      alert('Please type the last 4 digits to confirm');
      return;
    }

    // Mock unfreeze action
    setActionResult({
      customer: selectedCustomer.name,
      account: `${selectedAccount.type} ${selectedAccount.number}`,
      reason: freezeReason,
      date: new Date().toLocaleString(),
      status: 'ACTIVE'
    });

    setSuccess(true);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setSelectedAccount(null);
    setFreezeReason('');
    setFreezeDuration('temporary');
    setConfirmAction('');
    setSuccess(false);
    setActionResult(null);
    setSearchTerm('');
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
      maxWidth: '600px',
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
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px'
    },
    accountList: {
      marginTop: '20px'
    },
    accountCard: {
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
    accountInfo: {
      flex: 1
    },
    accountType: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333'
    },
    accountNumber: {
      fontSize: '14px',
      color: '#666',
      marginTop: '4px'
    },
    accountBalance: {
      fontSize: '18px',
      fontWeight: 'bold'
    },
    frozenBadge: {
      background: '#ef4444',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      marginLeft: '10px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: '#666',
      fontSize: '14px',
      fontWeight: '500'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'white'
    },
    radioGroup: {
      display: 'flex',
      gap: '20px',
      marginBottom: '15px'
    },
    radio: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px'
    },
    warningBox: {
      background: '#fef2f2',
      border: '1px solid #fee2e2',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      color: '#991b1b'
    },
    infoBox: {
      background: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      color: '#0369a1'
    },
    button: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      width: '100%',
      marginTop: '20px'
    },
    unfreezeButton: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '15px',
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
      padding: '15px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      width: '100%',
      marginTop: '10px'
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
    resultDetails: {
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
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Freeze / Unfreeze Account</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Step Indicator */}
      {!success && step > 1 && (
        <div style={styles.stepIndicator}>
          <div style={styles.stepItem}>
            <div style={{...styles.stepCircle, ...(step >= 1 ? styles.stepActive : styles.stepInactive)}}>1</div>
            <span style={{color: step >= 1 ? '#333' : '#999'}}>Select Customer</span>
          </div>
          <div style={styles.stepItem}>
            <div style={{...styles.stepCircle, ...(step >= 2 ? styles.stepActive : styles.stepInactive)}}>2</div>
            <span style={{color: step >= 2 ? '#333' : '#999'}}>Select Account</span>
          </div>
          <div style={styles.stepItem}>
            <div style={{...styles.stepCircle, ...(step >= 3 ? styles.stepActive : styles.stepInactive)}}>3</div>
            <span style={{color: step >= 3 ? '#333' : '#999'}}>Confirm Action</span>
          </div>
        </div>
      )}

      {/* Success Screen */}
      {success && actionResult ? (
        <div style={styles.content}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>
              {actionResult.status === 'FROZEN' ? '❄️' : '✅'}
            </div>
            <h2 style={{color: actionResult.status === 'FROZEN' ? '#ef4444' : '#22c55e', marginBottom: '20px'}}>
              Account {actionResult.status === 'FROZEN' ? 'Frozen' : 'Unfrozen'} Successfully!
            </h2>
            
            <div style={styles.resultDetails}>
              <div style={styles.detailRow}>
                <span>Customer:</span>
                <span style={{fontWeight: 'bold'}}>{actionResult.customer}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Account:</span>
                <span style={{fontWeight: 'bold'}}>{actionResult.account}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Status:</span>
                <span style={{fontWeight: 'bold', color: actionResult.status === 'FROZEN' ? '#ef4444' : '#22c55e'}}>
                  {actionResult.status}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span>Reason:</span>
                <span style={{fontWeight: 'bold'}}>{actionResult.reason}</span>
              </div>
              {actionResult.duration && (
                <div style={styles.detailRow}>
                  <span>Duration:</span>
                  <span style={{fontWeight: 'bold'}}>{actionResult.duration}</span>
                </div>
              )}
              <div style={styles.detailRow}>
                <span>Date/Time:</span>
                <span style={{fontWeight: 'bold'}}>{actionResult.date}</span>
              </div>
            </div>

            <button
              style={styles.button}
              onClick={resetForm}
            >
              Freeze / Unfreeze Another Account
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
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
                        {customer.email} • {customer.phone}
                      </div>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      background: customer.status === 'active' ? '#22c55e20' : '#eab30820',
                      color: customer.status === 'active' ? '#22c55e' : '#eab308'
                    }}>
                      {customer.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                style={styles.secondaryButton}
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Step 2: Select Account */}
          {step === 2 && selectedCustomer && (
            <div style={styles.content}>
              <h2 style={{marginBottom: '20px'}}>
                Select Account for {selectedCustomer.name}
              </h2>
              
              <div style={styles.accountList}>
                {selectedCustomer.accounts.length > 0 ? (
                  selectedCustomer.accounts.map(account => (
                    <div
                      key={account.id}
                      style={styles.accountCard}
                      onClick={() => handleAccountSelect(account)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={styles.accountInfo}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                          <span style={styles.accountType}>{account.type}</span>
                          {account.frozen && (
                            <span style={styles.frozenBadge}>FROZEN</span>
                          )}
                        </div>
                        <div style={styles.accountNumber}>{account.number}</div>
                      </div>
                      <div style={{...styles.accountBalance, color: account.frozen ? '#ef4444' : '#22c55e'}}>
                        ${account.balance.toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{color: '#999', textAlign: 'center', padding: '20px'}}>
                    This customer has no active accounts
                  </p>
                )}
              </div>

              <button
                style={styles.secondaryButton}
                onClick={() => setStep(1)}
              >
                ← Back to Customer Selection
              </button>
            </div>
          )}

          {/* Step 3: Confirm Action */}
          {step === 3 && selectedAccount && (
            <div style={styles.content}>
              <h2 style={{marginBottom: '20px'}}>
                {selectedAccount.frozen ? 'Unfreeze Account' : 'Freeze Account'}
              </h2>

              <div style={styles.infoBox}>
                <strong>Account Details:</strong><br />
                Customer: {selectedCustomer.name}<br />
                Account: {selectedAccount.type} {selectedAccount.number}<br />
                Balance: ${selectedAccount.balance.toFixed(2)}<br />
                Current Status: <span style={{color: selectedAccount.frozen ? '#ef4444' : '#22c55e'}}>
                  {selectedAccount.frozen ? 'FROZEN' : 'ACTIVE'}
                </span>
              </div>

              {!selectedAccount.frozen && selectedAccount.balance > 0 && (
                <div style={styles.warningBox}>
                  ⚠️ This account has a positive balance of ${selectedAccount.balance.toFixed(2)}. 
                  Freezing will prevent all transactions including withdrawals.
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Reason</label>
                <select
                  style={styles.select}
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                >
                  <option value="">Select reason</option>
                  {freezeReasons.map((reason, index) => (
                    <option key={index} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              {!selectedAccount.frozen && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration</label>
                  <div style={styles.radioGroup}>
                    <label style={styles.radio}>
                      <input
                        type="radio"
                        name="duration"
                        value="temporary"
                        checked={freezeDuration === 'temporary'}
                        onChange={(e) => setFreezeDuration(e.target.value)}
                      />
                      Temporary (Review within 24h)
                    </label>
                    <label style={styles.radio}>
                      <input
                        type="radio"
                        name="duration"
                        value="indefinite"
                        checked={freezeDuration === 'indefinite'}
                        onChange={(e) => setFreezeDuration(e.target.value)}
                      />
                      Indefinite
                    </label>
                  </div>
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Type the last 4 digits of the account number to confirm
                </label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder={selectedAccount.number.slice(-4)}
                  value={confirmAction}
                  onChange={(e) => setConfirmAction(e.target.value)}
                  maxLength="4"
                />
              </div>

              {selectedAccount.frozen ? (
                <button
                  style={styles.unfreezeButton}
                  onClick={handleUnfreezeAccount}
                >
                  Unfreeze Account
                </button>
              ) : (
                <button
                  style={styles.button}
                  onClick={handleFreezeAccount}
                >
                  Freeze Account
                </button>
              )}

              <button
                style={styles.secondaryButton}
                onClick={() => setStep(2)}
              >
                ← Back to Account Selection
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminFreezeAccount;