import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminTransactions = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);

  const [transactions] = useState([
    { 
      id: 'TXN-1001', 
      date: '2026-02-17 10:30 AM', 
      from: 'Michael Agbonifo', 
      fromAccount: '****2213',
      to: 'Amazon.com',
      toAccount: 'MER-AMZN',
      amount: 299.99,
      type: 'PURCHASE',
      status: 'completed',
      risk: 'low',
      category: 'Shopping'
    },
    { 
      id: 'TXN-1002', 
      date: '2026-02-17 10:15 AM', 
      from: 'Cynthia Ekeh', 
      fromAccount: '****8924',
      to: 'Walmart',
      toAccount: 'MER-WMT',
      amount: 156.32,
      type: 'PURCHASE',
      status: 'completed',
      risk: 'low',
      category: 'Groceries'
    },
    { 
      id: 'TXN-1003', 
      date: '2026-02-17 09:45 AM', 
      from: 'Tracy Agbonifo', 
      fromAccount: '****2326',
      to: 'External Transfer',
      toAccount: '****7890',
      amount: 50000.00,
      type: 'TRANSFER',
      status: 'pending',
      risk: 'high',
      category: 'Transfer'
    },
    { 
      id: 'TXN-1004', 
      date: '2026-02-17 09:20 AM', 
      from: 'Bose Agbonifo', 
      fromAccount: '****5678',
      to: 'Shell Gas',
      toAccount: 'MER-SHL',
      amount: 45.67,
      type: 'PURCHASE',
      status: 'completed',
      risk: 'low',
      category: 'Fuel'
    },
    { 
      id: 'TXN-1005', 
      date: '2026-02-17 08:50 AM', 
      from: 'Michael Agbonifo', 
      fromAccount: '****2213',
      to: 'International Transfer',
      toAccount: 'GBP****1234',
      amount: 12500.00,
      type: 'WIRE',
      status: 'flagged',
      risk: 'high',
      category: 'International'
    },
    { 
      id: 'TXN-1006', 
      date: '2026-02-16 11:30 PM', 
      from: 'Test User', 
      fromAccount: '****0339',
      to: 'ATM Withdrawal',
      toAccount: 'ATM-1234',
      amount: 500.00,
      type: 'WITHDRAWAL',
      status: 'completed',
      risk: 'medium',
      category: 'ATM'
    },
    { 
      id: 'TXN-1007', 
      date: '2026-02-16 10:00 PM', 
      from: 'Cynthia Ekeh', 
      fromAccount: '****8924',
      to: 'Netflix',
      toAccount: 'MER-NFLX',
      amount: 15.99,
      type: 'PURCHASE',
      status: 'completed',
      risk: 'low',
      category: 'Subscription'
    },
    { 
      id: 'TXN-1008', 
      date: '2026-02-16 3:15 PM', 
      from: 'Michael Agbonifo', 
      fromAccount: '****2213',
      to: 'Unknown Merchant',
      toAccount: 'MER-UNKN',
      amount: 3200.00,
      type: 'PURCHASE',
      status: 'flagged',
      risk: 'high',
      category: 'Uncategorized'
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#22c55e';
      case 'pending': return '#eab308';
      case 'flagged': return '#ef4444';
      case 'failed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return '#22c55e';
      case 'medium': return '#eab308';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'PURCHASE': return '🛒';
      case 'TRANSFER': return '↔️';
      case 'WIRE': return '🌐';
      case 'WITHDRAWAL': return '💵';
      case 'DEPOSIT': return '📥';
      default: return '💳';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.toString().includes(searchTerm);
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'high-risk') return matchesSearch && tx.risk === 'high';
    if (filter === 'flagged') return matchesSearch && tx.status === 'flagged';
    if (filter === 'pending') return matchesSearch && tx.status === 'pending';
    if (filter === 'completed') return matchesSearch && tx.status === 'completed';
    return matchesSearch;
  });

  const handleFlagTransaction = (tx) => {
    setSelectedTransaction(tx);
    setShowFlagModal(true);
  };

  const submitFlag = () => {
    if (!flagReason.trim()) {
      alert('Please provide a reason for flagging');
      return;
    }
    alert(`Transaction ${selectedTransaction.id} flagged. Reason: ${flagReason}`);
    setShowFlagModal(false);
    setSelectedTransaction(null);
    setFlagReason('');
  };

  const stats = {
    total: transactions.length,
    highRisk: transactions.filter(t => t.risk === 'high').length,
    flagged: transactions.filter(t => t.status === 'flagged').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    volume: transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    statLabel: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '5px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333'
    },
    statSub: {
      fontSize: '12px',
      color: '#22c55e',
      marginTop: '5px'
    },
    filters: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '15px',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    searchInput: {
      flex: 1,
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '250px'
    },
    filterButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      background: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s'
    },
    activeFilter: {
      background: '#667eea',
      color: 'white',
      borderColor: '#667eea'
    },
    table: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'auto'
    },
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 1fr 1fr 1.5fr',
      padding: '15px',
      background: '#f8fafc',
      borderRadius: '8px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px'
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 1fr 1fr 1.5fr',
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      alignItems: 'center'
    },
    riskBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      width: '60px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      width: '80px'
    },
    actionButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      marginRight: '8px'
    },
    flagButton: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '500px',
      width: '90%'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333'
    },
    detailRow: {
      display: 'flex',
      marginBottom: '12px',
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    detailLabel: {
      width: '120px',
      color: '#666',
      fontSize: '14px'
    },
    detailValue: {
      flex: 1,
      fontWeight: '500',
      color: '#333'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '20px',
      minHeight: '100px'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Transaction Monitoring</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Transactions</div>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statSub}>Last 24 hours</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Volume</div>
          <div style={styles.statValue}>${stats.volume}</div>
          <div style={styles.statSub}>Total amount</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>High Risk</div>
          <div style={{...styles.statValue, color: '#ef4444'}}>{stats.highRisk}</div>
          <div style={styles.statSub}>Needs review</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Flagged</div>
          <div style={{...styles.statValue, color: '#ef4444'}}>{stats.flagged}</div>
          <div style={styles.statSub}>Suspicious</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by ID, name, amount..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          style={{...styles.filterButton, ...(filter === 'all' ? styles.activeFilter : {})}}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'high-risk' ? styles.activeFilter : {})}}
          onClick={() => setFilter('high-risk')}
        >
          🔴 High Risk
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'flagged' ? styles.activeFilter : {})}}
          onClick={() => setFilter('flagged')}
        >
          🚩 Flagged
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'pending' ? styles.activeFilter : {})}}
          onClick={() => setFilter('pending')}
        >
          ⏳ Pending
        </button>
      </div>

      {/* Transactions Table */}
      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div>ID</div>
          <div>Date/Time</div>
          <div>From → To</div>
          <div>Amount</div>
          <div>Risk</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        
        {filteredTransactions.map((tx) => (
          <div key={tx.id} style={styles.tableRow}>
            <div style={{fontSize: '12px', fontWeight: '500'}}>{tx.id}</div>
            <div style={{fontSize: '12px'}}>{tx.date}</div>
            <div>
              <div style={{fontWeight: '500', fontSize: '13px'}}>
                {getTypeIcon(tx.type)} {tx.from}
              </div>
              <div style={{color: '#666', fontSize: '11px'}}>→ {tx.to}</div>
              <div style={{color: '#999', fontSize: '10px'}}>{tx.fromAccount} → {tx.toAccount}</div>
            </div>
            <div>
              <div style={{fontWeight: 'bold', color: tx.amount > 10000 ? '#ef4444' : '#333'}}>
                ${tx.amount.toLocaleString()}
              </div>
              <div style={{fontSize: '10px', color: '#666'}}>{tx.category}</div>
            </div>
            <div>
              <span style={{...styles.riskBadge, background: `${getRiskColor(tx.risk)}20`, color: getRiskColor(tx.risk)}}>
                {tx.risk}
              </span>
            </div>
            <div>
              <span style={{...styles.statusBadge, background: `${getStatusColor(tx.status)}20`, color: getStatusColor(tx.status)}}>
                {tx.status}
              </span>
            </div>
            <div>
              <button 
                style={styles.actionButton}
                onClick={() => {
                  setSelectedTransaction(tx);
                  setShowDetails(true);
                }}
              >
                View
              </button>
              {tx.risk !== 'high' && tx.status !== 'flagged' && (
                <button 
                  style={styles.flagButton}
                  onClick={() => handleFlagTransaction(tx)}
                >
                  🚩 Flag
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
            No transactions found matching your criteria
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedTransaction && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Transaction Details</h2>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Transaction ID:</div>
              <div style={styles.detailValue}>{selectedTransaction.id}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Date & Time:</div>
              <div style={styles.detailValue}>{selectedTransaction.date}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>From:</div>
              <div style={styles.detailValue}>{selectedTransaction.from} ({selectedTransaction.fromAccount})</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>To:</div>
              <div style={styles.detailValue}>{selectedTransaction.to} ({selectedTransaction.toAccount})</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Amount:</div>
              <div style={{...styles.detailValue, fontWeight: 'bold', color: selectedTransaction.amount > 10000 ? '#ef4444' : '#333'}}>
                ${selectedTransaction.amount.toLocaleString()}
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Type:</div>
              <div style={styles.detailValue}>{selectedTransaction.type}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Category:</div>
              <div style={styles.detailValue}>{selectedTransaction.category}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Risk Level:</div>
              <div>
                <span style={{...styles.riskBadge, background: `${getRiskColor(selectedTransaction.risk)}20`, color: getRiskColor(selectedTransaction.risk)}}>
                  {selectedTransaction.risk}
                </span>
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Status:</div>
              <div>
                <span style={{...styles.statusBadge, background: `${getStatusColor(selectedTransaction.status)}20`, color: getStatusColor(selectedTransaction.status)}}>
                  {selectedTransaction.status}
                </span>
              </div>
            </div>

            <div style={styles.modalButtons}>
              <button 
                style={styles.backButton}
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              {selectedTransaction.risk !== 'high' && selectedTransaction.status !== 'flagged' && (
                <button 
                  style={styles.flagButton}
                  onClick={() => {
                    setShowDetails(false);
                    handleFlagTransaction(selectedTransaction);
                  }}
                >
                  Flag Transaction
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && selectedTransaction && (
        <div style={styles.modal} onClick={() => setShowFlagModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Flag Transaction</h2>
            <p style={{marginBottom: '20px', color: '#666'}}>
              Flagging transaction <strong>{selectedTransaction.id}</strong> for ${selectedTransaction.amount.toLocaleString()}
            </p>
            
            <textarea
              style={styles.textarea}
              placeholder="Reason for flagging (e.g., suspicious pattern, unusual amount, etc.)"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
            />

            <div style={styles.modalButtons}>
              <button 
                style={{...styles.backButton, background: '#666'}}
                onClick={() => {
                  setShowFlagModal(false);
                  setFlagReason('');
                }}
              >
                Cancel
              </button>
              <button 
                style={styles.flagButton}
                onClick={submitFlag}
              >
                Confirm Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
