import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminUpdateLimits = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts', 'cards'
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [limitType, setLimitType] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [reason, setReason] = useState('');
  const [confirmAction, setConfirmAction] = useState('');
  const [success, setSuccess] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  // Mock customers database with accounts and cards
  const [customers] = useState([
    { 
      id: 1, 
      name: 'Michael Agbonifo', 
      email: 'michael@snopitech.com', 
      phone: '(713) 870-1132',
      status: 'active',
      accounts: [
        { 
          id: 1, 
          type: 'CHECKING', 
          number: '****2213', 
          balance: 25140.00, 
          dailyLimit: 3000,
          monthlyLimit: 50000,
          transferLimit: 10000,
          status: 'active' 
        },
        { 
          id: 2, 
          type: 'SAVINGS', 
          number: '****6808', 
          balance: 4500.00, 
          dailyLimit: 2000,
          monthlyLimit: 25000,
          transferLimit: 5000,
          status: 'active' 
        }
      ],
      cards: [
        { id: 6, type: 'PHYSICAL', number: '****-****-****-6581', dailyLimit: 5000, transactionLimit: 1000, monthlyLimit: 50000, status: 'ACTIVE' },
        { id: 7, type: 'VIRTUAL', number: '****-****-****-8145', dailyLimit: 2000, transactionLimit: 500, monthlyLimit: 10000, status: 'ACTIVE' }
      ]
    },
    { 
      id: 2, 
      name: 'Cynthia Ekeh', 
      email: 'cynthiaekeh360@gmail.com', 
      phone: '(081) 315-2879',
      status: 'active',
      accounts: [
        { 
          id: 3, 
          type: 'CHECKING', 
          number: '****8924', 
          balance: 2950.00, 
          dailyLimit: 2000,
          monthlyLimit: 30000,
          transferLimit: 5000,
          status: 'active' 
        },
        { 
          id: 4, 
          type: 'SAVINGS', 
          number: '****6051', 
          balance: 2050.00, 
          dailyLimit: 1500,
          monthlyLimit: 20000,
          transferLimit: 3000,
          status: 'active' 
        }
      ],
      cards: [
        { id: 2, type: 'PHYSICAL', number: '****-****-****-8159', dailyLimit: 3000, transactionLimit: 800, monthlyLimit: 30000, status: 'ACTIVE' },
        { id: 3, type: 'VIRTUAL', number: '****-****-****-4432', dailyLimit: 1500, transactionLimit: 400, monthlyLimit: 8000, status: 'ACTIVE' }
      ]
    },
    { 
      id: 3, 
      name: 'Tracy Agbonifo', 
      email: 'snopitech+40@gmail.com', 
      phone: '(713) 870-1100',
      status: 'active',
      accounts: [
        { 
          id: 10, 
          type: 'CHECKING', 
          number: '****2326', 
          balance: 25.00, 
          dailyLimit: 1000,
          monthlyLimit: 15000,
          transferLimit: 2000,
          status: 'active' 
        },
        { 
          id: 11, 
          type: 'SAVINGS', 
          number: '****5070', 
          balance: 0.00, 
          dailyLimit: 1000,
          monthlyLimit: 10000,
          transferLimit: 1000,
          status: 'active' 
        }
      ],
      cards: [
        { id: 4, type: 'PHYSICAL', number: '****-****-****-7541', dailyLimit: 2000, transactionLimit: 600, monthlyLimit: 20000, status: 'INACTIVE' },
        { id: 5, type: 'VIRTUAL', number: '****-****-****-4432', dailyLimit: 1000, transactionLimit: 300, monthlyLimit: 5000, status: 'INACTIVE' }
      ]
    }
  ]);

  const limitTypes = {
    accounts: [
      { id: 'daily', name: 'Daily Transaction Limit', description: 'Maximum amount per day', unit: '$' },
      { id: 'monthly', name: 'Monthly Transaction Limit', description: 'Maximum amount per month', unit: '$' },
      { id: 'transfer', name: 'Transfer Limit', description: 'Maximum amount per transfer', unit: '$' },
      { id: 'withdrawal', name: 'ATM Withdrawal Limit', description: 'Maximum ATM withdrawal per day', unit: '$' }
    ],
    cards: [
      { id: 'daily', name: 'Daily Spending Limit', description: 'Maximum amount per day', unit: '$' },
      { id: 'transaction', name: 'Per Transaction Limit', description: 'Maximum amount per transaction', unit: '$' },
      { id: 'monthly', name: 'Monthly Spending Limit', description: 'Maximum amount per month', unit: '$' },
      { id: 'atm', name: 'ATM Withdrawal Limit', description: 'Maximum ATM withdrawal per day', unit: '$' }
    ]
  };

  const reasonOptions = [
    'Customer Request',
    'Good Payment History',
    'Increased Income',
    'Business Need',
    'Risk Assessment',
    'Account Review',
    'Temporary Increase',
    'Permanent Increase',
    'Compliance Update',
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

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setStep(3);
  };

  const handleUpdateLimit = () => {
    if (!limitType) {
      alert('Please select a limit type');
      return;
    }

    if (!newLimit || parseFloat(newLimit) <= 0) {
      alert('Please enter a valid limit amount');
      return;
    }

    if (!reason) {
      alert('Please select a reason');
      return;
    }

    if (confirmAction !== (selectedAccount?.number.slice(-4) || selectedCard?.number.slice(-4))) {
      alert('Please type the last 4 digits to confirm');
      return;
    }

    // Get current limit value
    let currentValue = 0;
    if (activeTab === 'accounts' && selectedAccount) {
      if (limitType === 'daily') currentValue = selectedAccount.dailyLimit;
      if (limitType === 'monthly') currentValue = selectedAccount.monthlyLimit;
      if (limitType === 'transfer') currentValue = selectedAccount.transferLimit;
    } else if (activeTab === 'cards' && selectedCard) {
      if (limitType === 'daily') currentValue = selectedCard.dailyLimit;
      if (limitType === 'transaction') currentValue = selectedCard.transactionLimit;
      if (limitType === 'monthly') currentValue = selectedCard.monthlyLimit;
    }

    // Mock update action
    setActionResult({
      customer: selectedCustomer.name,
      item: activeTab === 'accounts' 
        ? `${selectedAccount.type} Account ${selectedAccount.number}`
        : `${selectedCard.type} Card ${selectedCard.number}`,
      limitType: limitTypes[activeTab].find(l => l.id === limitType)?.name,
      oldValue: currentValue,
      newValue: parseFloat(newLimit),
      reason: reason,
      date: new Date().toLocaleString(),
      status: 'UPDATED'
    });

    setSuccess(true);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setSelectedAccount(null);
    setSelectedCard(null);
    setLimitType('');
    setNewLimit('');
    setReason('');
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
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      maxWidth: '600px',
      margin: '0 auto 20px auto'
    },
    tab: {
      flex: 1,
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      background: 'white',
      color: '#333',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px'
    },
    itemList: {
      marginTop: '20px'
    },
    itemCard: {
      padding: '15px',
      border: '1px solid #f0f0f0',
      borderRadius: '8px',
      marginBottom: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    itemHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    itemTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333'
    },
    itemSubtitle: {
      fontSize: '14px',
      color: '#666'
    },
    limitsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
      marginTop: '10px'
    },
    limitBox: {
      background: '#f9f9f9',
      padding: '8px',
      borderRadius: '4px',
      textAlign: 'center'
    },
    limitLabel: {
      fontSize: '11px',
      color: '#666',
      marginBottom: '2px'
    },
    limitValue: {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#333'
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
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px'
    },
    currentLimit: {
      background: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      color: '#0369a1',
      fontSize: '14px'
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
    },
    highlight: {
      fontWeight: 'bold',
      color: '#22c55e'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Update Account Limits</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      {!success && step === 1 && (
        <div style={styles.tabs}>
          <button 
            style={{...styles.tab, ...(activeTab === 'accounts' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('accounts')}
          >
            🏦 Account Limits
          </button>
          <button 
            style={{...styles.tab, ...(activeTab === 'cards' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('cards')}
          >
            💳 Card Limits
          </button>
        </div>
      )}

      {/* Step Indicator */}
      {!success && step > 1 && (
        <div style={styles.stepIndicator}>
          <div style={styles.stepItem}>
            <div style={{...styles.stepCircle, ...(step >= 1 ? styles.stepActive : styles.stepInactive)}}>1</div>
            <span style={{color: step >= 1 ? '#333' : '#999'}}>Select Customer</span>
          </div>
          <div style={styles.stepItem}>
            <div style={{...styles.stepCircle, ...(step >= 2 ? styles.stepActive : styles.stepInactive)}}>2</div>
            <span style={{color: step >= 2 ? '#333' : '#999'}}>Select {activeTab === 'accounts' ? 'Account' : 'Card'}</span>
          </div>
          <div style={styles.stepItem}>
            <div style={{...styles.stepCircle, ...(step >= 3 ? styles.stepActive : styles.stepInactive)}}>3</div>
            <span style={{color: step >= 3 ? '#333' : '#999'}}>Update Limit</span>
          </div>
        </div>
      )}

      {/* Success Screen */}
      {success && actionResult ? (
        <div style={styles.content}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={{color: '#22c55e', marginBottom: '20px'}}>Limit Updated Successfully!</h2>
            
            <div style={styles.resultDetails}>
              <div style={styles.detailRow}>
                <span>Customer:</span>
                <span style={{fontWeight: 'bold'}}>{actionResult.customer}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Item:</span>
                <span style={{fontWeight: 'bold'}}>{actionResult.item}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Limit Type:</span>
                <span style={{fontWeight: 'bold'}}>{actionResult.limitType}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Old Limit:</span>
                <span style={{fontWeight: 'bold'}}>${actionResult.oldValue.toLocaleString()}</span>
              </div>
              <div style={styles.detailRow}>
                <span>New Limit:</span>
                <span style={{...styles.highlight}}>${actionResult.newValue.toLocaleString()}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Reason:</span>
                <span style={{fontWeight: 'bold'}}>{actionResult.reason}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Date/Time:</span>
                <span style={{fontWeight: 'bold'}}>{actionResult.date}</span>
              </div>
            </div>

            <button
              style={styles.button}
              onClick={resetForm}
            >
              Update Another Limit
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

          {/* Step 2: Select Account/Card */}
          {step === 2 && selectedCustomer && (
            <div style={styles.content}>
              <h2 style={{marginBottom: '20px'}}>
                Select {activeTab === 'accounts' ? 'Account' : 'Card'} for {selectedCustomer.name}
              </h2>
              
              <div style={styles.itemList}>
                {activeTab === 'accounts' ? (
                  // Show Accounts
                  selectedCustomer.accounts.map(account => (
                    <div
                      key={account.id}
                      style={styles.itemCard}
                      onClick={() => handleAccountSelect(account)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={styles.itemHeader}>
                        <span style={styles.itemTitle}>{account.type} Account</span>
                        <span style={{color: '#22c55e', fontWeight: 'bold'}}>${account.balance.toLocaleString()}</span>
                      </div>
                      <div style={styles.itemSubtitle}>{account.number}</div>
                      
                      <div style={styles.limitsGrid}>
                        <div style={styles.limitBox}>
                          <div style={styles.limitLabel}>Daily</div>
                          <div style={styles.limitValue}>${account.dailyLimit.toLocaleString()}</div>
                        </div>
                        <div style={styles.limitBox}>
                          <div style={styles.limitLabel}>Monthly</div>
                          <div style={styles.limitValue}>${account.monthlyLimit.toLocaleString()}</div>
                        </div>
                        <div style={styles.limitBox}>
                          <div style={styles.limitLabel}>Transfer</div>
                          <div style={styles.limitValue}>${account.transferLimit.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Show Cards
                  selectedCustomer.cards.map(card => (
                    <div
                      key={card.id}
                      style={styles.itemCard}
                      onClick={() => handleCardSelect(card)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={styles.itemHeader}>
                        <span style={styles.itemTitle}>{card.type} Card</span>
                        <span style={{
                          ...styles.statusBadge,
                          background: card.status === 'ACTIVE' ? '#22c55e20' : '#eab30820',
                          color: card.status === 'ACTIVE' ? '#22c55e' : '#eab308'
                        }}>
                          {card.status}
                        </span>
                      </div>
                      <div style={styles.itemSubtitle}>{card.number}</div>
                      
                      <div style={styles.limitsGrid}>
                        <div style={styles.limitBox}>
                          <div style={styles.limitLabel}>Daily</div>
                          <div style={styles.limitValue}>${card.dailyLimit.toLocaleString()}</div>
                        </div>
                        <div style={styles.limitBox}>
                          <div style={styles.limitLabel}>Per TXN</div>
                          <div style={styles.limitValue}>${card.transactionLimit.toLocaleString()}</div>
                        </div>
                        <div style={styles.limitBox}>
                          <div style={styles.limitLabel}>Monthly</div>
                          <div style={styles.limitValue}>${card.monthlyLimit.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))
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

          {/* Step 3: Update Limit */}
          {step === 3 && (selectedAccount || selectedCard) && (
            <div style={styles.content}>
              <h2 style={{marginBottom: '20px'}}>Update Limit</h2>

              <div style={styles.infoBox}>
                <strong>Customer:</strong> {selectedCustomer.name}<br />
                <strong>{activeTab === 'accounts' ? 'Account:' : 'Card:'}</strong> {activeTab === 'accounts' 
                  ? `${selectedAccount.type} ${selectedAccount.number}`
                  : `${selectedCard.type} ${selectedCard.number}`}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Limit Type</label>
                <select
                  style={styles.select}
                  value={limitType}
                  onChange={(e) => setLimitType(e.target.value)}
                >
                  <option value="">Select limit type</option>
                  {limitTypes[activeTab].map(limit => (
                    <option key={limit.id} value={limit.id}>
                      {limit.name}
                    </option>
                  ))}
                </select>
              </div>

              {limitType && (
                <div style={styles.currentLimit}>
                  <strong>Current Limit:</strong> ${activeTab === 'accounts' 
                    ? (limitType === 'daily' ? selectedAccount.dailyLimit :
                       limitType === 'monthly' ? selectedAccount.monthlyLimit :
                       selectedAccount.transferLimit)
                    : (limitType === 'daily' ? selectedCard.dailyLimit :
                       limitType === 'transaction' ? selectedCard.transactionLimit :
                       selectedCard.monthlyLimit)
                  .toLocaleString()}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>New Limit Amount ($)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="Enter new limit"
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Reason for Change</label>
                <select
                  style={styles.select}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">Select reason</option>
                  {reasonOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div style={styles.warningBox}>
                ⚠️ Increasing limits may increase risk exposure. Please ensure proper verification.
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Type the last 4 digits to confirm
                </label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder={activeTab === 'accounts' 
                    ? selectedAccount.number.slice(-4) 
                    : selectedCard.number.slice(-4)}
                  value={confirmAction}
                  onChange={(e) => setConfirmAction(e.target.value)}
                  maxLength="4"
                />
              </div>

              <button
                style={styles.button}
                onClick={handleUpdateLimit}
              >
                Update Limit
              </button>

              <button
                style={styles.secondaryButton}
                onClick={() => setStep(2)}
              >
                ← Back to Selection
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUpdateLimits;