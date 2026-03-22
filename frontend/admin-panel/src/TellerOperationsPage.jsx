import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const API_BASE = "http://localhost:8080";

export default function TellerOperationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAccounts, setUserAccounts] = useState({ 
    regularAccounts: [], 
    creditAccounts: [], 
    loanAccounts: [] 
  });
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [operation, setOperation] = useState(null); // 'deposit', 'withdraw', 'transfer'
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [toAccount, setToAccount] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/teller/search/users?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) searchUsers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const selectUser = async (user) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedAccount(null);
    setOperation(null);
    setAmount('');
    setNote('');
    setToAccount(null);
    setError('');
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/api/teller/user/${user.id}/accounts`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch accounts');
      }
      
      const data = await response.json();
      setUserAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to fetch user accounts');
    }
  };

  const handleOperation = (op, account) => {
    setSelectedAccount(account);
    setOperation(op);
    setAmount('');
    setNote('');
    setToAccount(null);
    setError('');
    setSuccess(null);
  };

  const handleTransfer = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!toAccount) {
      setError('Please select destination account');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleDepositWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setShowConfirmModal(true);
  };

  const executeOperation = async () => {
    setProcessing(true);
    setError('');

    try {
      let url, body;

      if (operation === 'deposit') {
        url = `${API_BASE}/api/teller/deposit`;
        body = {
          userId: selectedUser.id,
          accountId: selectedAccount.id,
          amount: parseFloat(amount),
          note: note || null
        };
      } else if (operation === 'withdraw') {
        url = `${API_BASE}/api/teller/withdraw`;
        body = {
          userId: selectedUser.id,
          accountId: selectedAccount.id,
          amount: parseFloat(amount),
          note: note || null
        };
      } else if (operation === 'transfer') {
        url = `${API_BASE}/api/teller/transfer`;
        body = {
          userId: selectedUser.id,
          fromAccountId: selectedAccount.id,
          toAccountId: toAccount.id,
          amount: parseFloat(amount),
          note: note || null
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transaction failed');
      }

      setSuccess(data);
      setShowConfirmModal(false);
      
      // Refresh accounts
      const accountsResponse = await fetch(`${API_BASE}/api/teller/user/${selectedUser.id}/accounts`);
      const accountsData = await accountsResponse.json();
      setUserAccounts(accountsData);

    } catch (error) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const resetSuccess = () => {
    setSuccess(null);
    setSelectedAccount(null);
    setOperation(null);
    setAmount('');
    setNote('');
    setToAccount(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getButtonLabel = () => {
    if (!selectedAccount || !operation) return '';
    
    if (selectedAccount.isLoan) {
      if (operation === 'deposit') return 'Make Payment';
      if (operation === 'withdraw') return 'Borrow More';
      if (operation === 'transfer') return 'Transfer';
    } else if (selectedAccount.isCredit) {
      if (operation === 'deposit') return 'Make Payment';
      if (operation === 'withdraw') return 'Cash Advance';
      if (operation === 'transfer') return 'Transfer';
    } else {
      if (operation === 'deposit') return 'Make Deposit';
      if (operation === 'withdraw') return 'Make Withdrawal';
      if (operation === 'transfer') return 'Transfer';
    }
    return '';
  };

  const styles = {
    container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 },
    backButton: { background: '#667eea', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
    searchContainer: { marginBottom: '20px', position: 'relative' },
    searchInput: { width: '100%', padding: '12px 16px', paddingRight: '40px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
    searchIcon: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' },
    searchResults: { position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '300px', overflowY: 'auto', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000 },
    searchResultItem: { padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' },
    userCard: { background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid #e0e0e0' },
    userHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    userName: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 },
    accountsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' },
    accountCard: { background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.2s' },
    accountCardSelected: { border: '2px solid #667eea', boxShadow: '0 4px 12px rgba(102,126,234,0.2)' },
    accountHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    accountType: { fontSize: '14px', fontWeight: '600', color: '#667eea' },
    accountNumber: { fontSize: '12px', color: '#999' },
    accountBalance: { fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
    accountLimit: { fontSize: '12px', color: '#666' },
    actionButtons: { display: 'flex', gap: '8px', marginTop: '12px' },
    actionButton: { flex: 1, padding: '8px', borderRadius: '4px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' },
    depositButton: { background: '#22c55e', color: 'white' },
    withdrawButton: { background: '#ef4444', color: 'white' },
    transferButton: { background: '#667eea', color: 'white' },
    operationPanel: { background: 'white', borderRadius: '8px', padding: '20px', marginTop: '20px', border: '1px solid #e0e0e0' },
    input: { width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', marginBottom: '12px' },
    select: { width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', marginBottom: '12px' },
    textarea: { width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', minHeight: '80px', marginBottom: '12px' },
    executeButton: { width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '8px', padding: '24px', maxWidth: '400px', width: '90%' },
    modalTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' },
    modalText: { fontSize: '14px', color: '#666', marginBottom: '8px' },
    modalButtons: { display: 'flex', gap: '8px', marginTop: '20px' },
    confirmButton: { flex: 1, padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    cancelButton: { flex: 1, padding: '10px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    errorAlert: { background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#dc2626' },
    successAlert: { background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '20px', textAlign: 'center' },
    successIcon: { width: '48px', height: '48px', color: '#22c55e', margin: '0 auto 12px' }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Teller Operations</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Search Section */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <MagnifyingGlassIcon style={styles.searchIcon} width={20} height={20} />
        
        {searchResults.length > 0 && (
          <div style={styles.searchResults}>
            {searchResults.map(user => (
              <div
                key={user.id}
                style={styles.searchResultItem}
                onClick={() => selectUser(user)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <div><strong>{user.fullName}</strong></div>
                <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected User */}
      {selectedUser && (
        <div style={styles.userCard}>
          <div style={styles.userHeader}>
            <h3 style={styles.userName}>{selectedUser.fullName}</h3>
            <div style={{ fontSize: '14px', color: '#666' }}>{selectedUser.email}</div>
          </div>
        </div>
      )}

      {/* Accounts Display */}
      {selectedUser && (
        <>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>User Accounts</h2>
          <div style={styles.accountsGrid}>
            {/* Regular Accounts */}
            {userAccounts.regularAccounts?.map(account => (
              <div
                key={account.id}
                style={{
                  ...styles.accountCard,
                  ...(selectedAccount?.id === account.id ? styles.accountCardSelected : {})
                }}
                onClick={() => setSelectedAccount(account)}
              >
                <div style={styles.accountHeader}>
                  <span style={styles.accountType}>{account.type}</span>
                  <span style={styles.accountNumber}>{account.accountNumber}</span>
                </div>
                <div style={styles.accountBalance}>{formatCurrency(account.balance)}</div>
                
                {selectedAccount?.id === account.id && (
                  <div style={styles.actionButtons}>
                    <button
                      style={{...styles.actionButton, ...styles.depositButton}}
                      onClick={(e) => { e.stopPropagation(); handleOperation('deposit', account); }}
                    >
                      ⬇️ Deposit
                    </button>
                    <button
                      style={{...styles.actionButton, ...styles.withdrawButton}}
                      onClick={(e) => { e.stopPropagation(); handleOperation('withdraw', account); }}
                    >
                      ⬆️ Withdraw
                    </button>
                    <button
                      style={{...styles.actionButton, ...styles.transferButton}}
                      onClick={(e) => { e.stopPropagation(); handleOperation('transfer', account); }}
                    >
                      🔄 Transfer
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Credit Accounts */}
            {userAccounts.creditAccounts?.map(account => (
              <div
                key={account.id}
                style={{
                  ...styles.accountCard,
                  ...(selectedAccount?.id === account.id ? styles.accountCardSelected : {})
                }}
                onClick={() => setSelectedAccount(account)}
              >
                <div style={styles.accountHeader}>
                  <span style={styles.accountType}>CREDIT CARD</span>
                  <span style={styles.accountNumber}>{account.accountNumber}</span>
                </div>
                <div style={styles.accountBalance}>{formatCurrency(account.balance)}</div>
                <div style={styles.accountLimit}>
                  Limit: {formatCurrency(account.creditLimit)} • Available: {formatCurrency(account.availableCredit)}
                </div>
                
                {selectedAccount?.id === account.id && (
                  <div style={styles.actionButtons}>
                    <button
                      style={{...styles.actionButton, ...styles.depositButton}}
                      onClick={(e) => { e.stopPropagation(); handleOperation('deposit', account); }}
                    >
                      ⬇️ Payment
                    </button>
                    <button
                      style={{...styles.actionButton, ...styles.withdrawButton}}
                      onClick={(e) => { e.stopPropagation(); handleOperation('withdraw', account); }}
                    >
                      ⬆️ Cash Advance
                    </button>
                    <button
                      style={{...styles.actionButton, ...styles.transferButton}}
                      onClick={(e) => { e.stopPropagation(); handleOperation('transfer', account); }}
                    >
                      🔄 Transfer
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Loan Accounts */}
            {userAccounts.loanAccounts?.map(account => (
              <div
                key={account.id}
                style={{
                  ...styles.accountCard,
                  ...(selectedAccount?.id === account.id ? styles.accountCardSelected : {})
                }}
                onClick={() => setSelectedAccount(account)}
              >
                <div style={styles.accountHeader}>
                  <span style={styles.accountType}>LOAN</span>
                  <span style={styles.accountNumber}>{account.accountNumber}</span>
                </div>
                <div style={styles.accountBalance}>{formatCurrency(account.balance)}</div>
                <div style={styles.accountLimit}>
                  Original: {formatCurrency(account.originalAmount)} • {account.interestRate}% APR
                </div>
                
                {selectedAccount?.id === account.id && (
                  <div style={styles.actionButtons}>
                    <button
                      style={{...styles.actionButton, ...styles.depositButton}}
                      onClick={(e) => { e.stopPropagation(); handleOperation('deposit', account); }}
                    >
                      ⬇️ Payment
                    </button>
                    <button
                      style={{...styles.actionButton, ...styles.withdrawButton}}
                      onClick={(e) => { e.stopPropagation(); handleOperation('withdraw', account); }}
                    >
                      ⬆️ Borrow
                    </button>
                    <button
                      style={{...styles.actionButton, ...styles.transferButton}}
                      onClick={(e) => { e.stopPropagation(); handleOperation('transfer', account); }}
                    >
                      🔄 Transfer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Operation Panel */}
      {selectedAccount && operation && !success && (
        <div style={styles.operationPanel}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            {getButtonLabel()}
          </h3>

          {error && <div style={styles.errorAlert}>{error}</div>}

          <div style={{ marginBottom: '12px' }}>
            <strong>Account:</strong> {selectedAccount.type} {selectedAccount.accountNumber}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Current Balance:</strong> {formatCurrency(selectedAccount.balance)}
            {selectedAccount.isCredit && (
              <span style={{ marginLeft: '12px', color: '#666' }}>
                (Available: {formatCurrency(selectedAccount.availableCredit)})
              </span>
            )}
          </div>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />

          {operation === 'transfer' && (
            <select
              value={toAccount?.id || ''}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const allAccounts = [
                  ...(userAccounts.regularAccounts || []),
                  ...(userAccounts.creditAccounts || []),
                  ...(userAccounts.loanAccounts || [])
                ];
                setToAccount(allAccounts.find(a => a.id === id));
              }}
              style={styles.select}
            >
              <option value="">Select destination account</option>
              {[...(userAccounts.regularAccounts || []), ...(userAccounts.creditAccounts || []), ...(userAccounts.loanAccounts || [])]
                .filter(a => a.id !== selectedAccount.id)
                .map(account => (
                  <option key={account.id} value={account.id}>
                    {account.type} {account.accountNumber} ({formatCurrency(account.balance)})
                  </option>
                ))}
            </select>
          )}

          <textarea
            placeholder="Add note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={styles.textarea}
          />

          <button
            style={styles.executeButton}
            onClick={operation === 'transfer' ? handleTransfer : handleDepositWithdraw}
          >
            Review Transaction
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div style={styles.successAlert}>
          <CheckCircleIcon style={styles.successIcon} />
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Transaction Successful!</h3>
          <p style={{ marginBottom: '4px' }}>{success.message}</p>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
            New Balance: {formatCurrency(success.newBalance)}
          </p>
          <button
            style={{ ...styles.executeButton, background: '#22c55e' }}
            onClick={resetSuccess}
          >
            New Transaction
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Confirm Transaction</h3>
            
            <div style={styles.modalText}>
              <strong>Operation:</strong> {getButtonLabel()}
            </div>
            <div style={styles.modalText}>
              <strong>From:</strong> {selectedAccount.type} {selectedAccount.accountNumber}
            </div>
            {operation === 'transfer' && toAccount && (
              <div style={styles.modalText}>
                <strong>To:</strong> {toAccount.type} {toAccount.accountNumber}
              </div>
            )}
            <div style={styles.modalText}>
              <strong>Amount:</strong> {formatCurrency(parseFloat(amount))}
            </div>
            {note && (
              <div style={styles.modalText}>
                <strong>Note:</strong> {note}
              </div>
            )}

            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmButton}
                onClick={executeOperation}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}