import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminTeller = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit', 'withdrawal', 'transfer'
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferToAccount, setTransferToAccount] = useState('');
  const [transferToCustomer, setTransferToCustomer] = useState(null);
  const [success, setSuccess] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);

  // Mock customers database
  const [customers] = useState([
    { 
      id: 1, 
      name: 'Michael Agbonifo', 
      email: 'michael@snopitech.com', 
      phone: '(713) 870-1132',
      accounts: [
        { id: 1, type: 'CHECKING', number: '****2213', balance: 25140.00, status: 'active' },
        { id: 2, type: 'SAVINGS', number: '****6808', balance: 4500.00, status: 'active' }
      ]
    },
    { 
      id: 2, 
      name: 'Cynthia Ekeh', 
      email: 'cynthiaekeh360@gmail.com', 
      phone: '(081) 315-2879',
      accounts: [
        { id: 3, type: 'CHECKING', number: '****8924', balance: 2950.00, status: 'active' },
        { id: 4, type: 'SAVINGS', number: '****6051', balance: 2050.00, status: 'active' }
      ]
    },
    { 
      id: 3, 
      name: 'Tracy Agbonifo', 
      email: 'snopitech+40@gmail.com', 
      phone: '(713) 870-1100',
      accounts: [
        { id: 10, type: 'CHECKING', number: '****2326', balance: 25.00, status: 'active' },
        { id: 11, type: 'SAVINGS', number: '****5070', balance: 0.00, status: 'active' }
      ]
    },
    { 
      id: 4, 
      name: 'Bose Agbonifo', 
      email: 'snopitech+1@gmail.com', 
      phone: '(713) 870-1131',
      accounts: []
    }
  ]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    if (activeTab === 'transfer') {
      setStep(2); // Select source account for transfer
    } else {
      setStep(2); // Select account for deposit/withdrawal
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setStep(3); // Enter amount
  };

  const handleTransferToSearch = (accountNumber) => {
    // Mock search for destination account
    const found = customers.find(c => 
      c.accounts.some(a => a.number === accountNumber || a.number.slice(-4) === accountNumber.slice(-4))
    );
    if (found) {
      const destAccount = found.accounts.find(a => 
        a.number === accountNumber || a.number.slice(-4) === accountNumber.slice(-4)
      );
      setTransferToCustomer(found);
      setTransferToAccount(destAccount);
    } else {
      alert('Account not found');
    }
  };

  const handleTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (activeTab === 'withdrawal' && selectedAccount.balance < parseFloat(amount)) {
      alert('Insufficient funds');
      return;
    }

    if (activeTab === 'transfer' && !transferToAccount) {
      alert('Please select destination account');
      return;
    }

    // Mock transaction processing
    const transactionId = 'TXN-' + Math.floor(Math.random() * 10000);
    const newBalance = activeTab === 'deposit' 
      ? selectedAccount.balance + parseFloat(amount)
      : selectedAccount.balance - parseFloat(amount);

    setTransactionResult({
      id: transactionId,
      type: activeTab.toUpperCase(),
      amount: parseFloat(amount),
      fromAccount: activeTab === 'transfer' ? selectedAccount : null,
      toAccount: activeTab === 'transfer' ? transferToAccount : null,
      newBalance,
      description: description || `${activeTab} transaction`
    });

    setSuccess(true);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setSelectedAccount(null);
    setAmount('');
    setDescription('');
    setTransferToAccount(null);
    setTransferToCustomer(null);
    setSuccess(false);
    setTransactionResult(null);
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
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px'
    },
    tab: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      background: 'white',
      color: '#333',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flex: 1
    },
    activeTab: {
      background: '#667eea',
      color: 'white'
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
    badge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      background: '#e0e0e0',
      color: '#666'
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
      fontWeight: 'bold',
      color: '#22c55e'
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
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '16px'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px'
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
    transactionDetails: {
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
    warningBox: {
      background: '#fef2f2',
      border: '1px solid #fee2e2',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      color: '#991b1b'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Teller Operations</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button 
          style={{...styles.tab, ...(activeTab === 'deposit' ? styles.activeTab : {})}}
          onClick={() => {
            setActiveTab('deposit');
            resetForm();
          }}
        >
          💰 Deposit
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'withdrawal' ? styles.activeTab : {})}}
          onClick={() => {
            setActiveTab('withdrawal');
            resetForm();
          }}
        >
          💵 Withdrawal
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'transfer' ? styles.activeTab : {})}}
          onClick={() => {
            setActiveTab('transfer');
            resetForm();
          }}
        >
          ↔️ Transfer
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
            <span style={{color: step >= 3 ? '#333' : '#999'}}>Enter Amount</span>
          </div>
        </div>
      )}

      {/* Success Screen */}
      {success && transactionResult ? (
        <div style={styles.content}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={{color: '#22c55e', marginBottom: '20px'}}>Transaction Successful!</h2>
            
            <div style={styles.transactionDetails}>
              <div style={styles.detailRow}>
                <span>Transaction ID:</span>
                <span style={{fontWeight: 'bold'}}>{transactionResult.id}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Type:</span>
                <span style={{fontWeight: 'bold'}}>{transactionResult.type}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Amount:</span>
                <span style={{fontWeight: 'bold', color: '#22c55e'}}>${transactionResult.amount.toFixed(2)}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Account:</span>
                <span style={{fontWeight: 'bold'}}>{selectedAccount.type} {selectedAccount.number}</span>
              </div>
              {transactionResult.toAccount && (
                <div style={styles.detailRow}>
                  <span>To Account:</span>
                  <span style={{fontWeight: 'bold'}}>{transactionResult.toAccount.type} {transactionResult.toAccount.number}</span>
                </div>
              )}
              <div style={styles.detailRow}>
                <span>New Balance:</span>
                <span style={{fontWeight: 'bold', color: '#22c55e'}}>${transactionResult.newBalance.toFixed(2)}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Description:</span>
                <span style={{fontWeight: 'bold'}}>{transactionResult.description}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Date/Time:</span>
                <span style={{fontWeight: 'bold'}}>{new Date().toLocaleString()}</span>
              </div>
            </div>

            <button
              style={styles.button}
              onClick={resetForm}
            >
              New Transaction
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
                    <span style={styles.badge}>{customer.accounts.length} accounts</span>
                  </div>
                ))}
              </div>
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
                        <div style={styles.accountType}>{account.type}</div>
                        <div style={styles.accountNumber}>{account.number}</div>
                      </div>
                      <div style={styles.accountBalance}>
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

          {/* Step 3: Enter Amount */}
          {step === 3 && selectedAccount && (
            <div style={styles.content}>
              <h2 style={{marginBottom: '20px'}}>
                {activeTab === 'deposit' && 'Make Deposit'}
                {activeTab === 'withdrawal' && 'Make Withdrawal'}
                {activeTab === 'transfer' && 'Make Transfer'}
              </h2>

              <div style={styles.accountCard}>
                <div style={styles.accountInfo}>
                  <div style={styles.accountType}>{selectedAccount.type}</div>
                  <div style={styles.accountNumber}>{selectedAccount.number}</div>
                </div>
                <div style={styles.accountBalance}>
                  Balance: ${selectedAccount.balance.toFixed(2)}
                </div>
              </div>

              {activeTab === 'transfer' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Destination Account Number</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Enter account number (e.g., ****2213)"
                    onChange={(e) => handleTransferToSearch(e.target.value)}
                  />
                  {transferToAccount && transferToCustomer && (
                    <div style={{...styles.accountCard, marginTop: '10px', background: '#f0fdf4'}}>
                      <div style={styles.accountInfo}>
                        <div style={styles.accountType}>{transferToAccount.type}</div>
                        <div style={styles.accountNumber}>{transferToAccount.number}</div>
                        <div style={{fontSize: '12px', color: '#666'}}>
                          {transferToCustomer.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'withdrawal' && selectedAccount.balance <= 0 && (
                <div style={styles.warningBox}>
                  ⚠️ This account has zero balance. Withdrawal cannot be processed.
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Amount ($)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description (Optional)</label>
                <textarea
                  style={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`Enter ${activeTab} description...`}
                />
              </div>

              <button
                style={styles.button}
                onClick={handleTransaction}
                disabled={activeTab === 'transfer' && !transferToAccount}
              >
                Process {activeTab}
              </button>

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

export default AdminTeller;