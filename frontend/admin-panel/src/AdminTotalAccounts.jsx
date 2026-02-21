import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminTotalAccounts = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('balance-desc');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock accounts data
  const [accounts] = useState([
    {
      id: 1,
      accountNumber: '****2213',
      accountType: 'CHECKING',
      ownerName: 'Michael Agbonifo',
      email: 'michael@snopitech.com',
      balance: 25140.00,
      status: 'active',
      openedDate: '2026-02-12',
      lastTransaction: '2026-02-17',
      routingNumber: '842917356',
      nickname: 'My Main Checking',
      cardCount: 2,
      transactionCount: 156,
      averageBalance: 24500.00,
      interestRate: '0.01%'
    },
    {
      id: 2,
      accountNumber: '****6808',
      accountType: 'SAVINGS',
      ownerName: 'Michael Agbonifo',
      email: 'michael@snopitech.com',
      balance: 4500.00,
      status: 'active',
      openedDate: '2026-02-12',
      lastTransaction: '2026-02-15',
      routingNumber: '842917356',
      nickname: null,
      cardCount: 0,
      transactionCount: 23,
      averageBalance: 4200.00,
      interestRate: '2.25%'
    },
    {
      id: 3,
      accountNumber: '****8924',
      accountType: 'CHECKING',
      ownerName: 'Cynthia Ekeh',
      email: 'cynthiaekeh360@gmail.com',
      balance: 2950.00,
      status: 'active',
      openedDate: '2026-02-14',
      lastTransaction: '2026-02-16',
      routingNumber: '842917356',
      nickname: null,
      cardCount: 2,
      transactionCount: 89,
      averageBalance: 2800.00,
      interestRate: '0.01%'
    },
    {
      id: 4,
      accountNumber: '****6051',
      accountType: 'SAVINGS',
      ownerName: 'Cynthia Ekeh',
      email: 'cynthiaekeh360@gmail.com',
      balance: 2050.00,
      status: 'active',
      openedDate: '2026-02-14',
      lastTransaction: '2026-02-14',
      routingNumber: '842917356',
      nickname: null,
      cardCount: 0,
      transactionCount: 12,
      averageBalance: 2000.00,
      interestRate: '2.25%'
    },
    {
      id: 5,
      accountNumber: '****2326',
      accountType: 'CHECKING',
      ownerName: 'Tracy Agbonifo',
      email: 'tracy@email.com',
      balance: 25.00,
      status: 'active',
      openedDate: '2026-02-16',
      lastTransaction: '2026-02-16',
      routingNumber: '842917356',
      nickname: null,
      cardCount: 2,
      transactionCount: 5,
      averageBalance: 12.50,
      interestRate: '0.01%'
    },
    {
      id: 6,
      accountNumber: '****5070',
      accountType: 'SAVINGS',
      ownerName: 'Tracy Agbonifo',
      email: 'tracy@email.com',
      balance: 0.00,
      status: 'active',
      openedDate: '2026-02-16',
      lastTransaction: null,
      routingNumber: '842917356',
      nickname: null,
      cardCount: 0,
      transactionCount: 0,
      averageBalance: 0.00,
      interestRate: '2.25%'
    },
    {
      id: 7,
      accountNumber: '****0339',
      accountType: 'CHECKING',
      ownerName: 'Test User',
      email: 'test@email.com',
      balance: 0.00,
      status: 'active',
      openedDate: '2026-02-16',
      lastTransaction: '2026-02-16',
      routingNumber: '842917356',
      nickname: null,
      cardCount: 2,
      transactionCount: 2,
      averageBalance: 0.00,
      interestRate: '0.01%'
    },
    {
      id: 8,
      accountNumber: '****1180',
      accountType: 'SAVINGS',
      ownerName: 'Test User',
      email: 'test@email.com',
      balance: 0.00,
      status: 'active',
      openedDate: '2026-02-16',
      lastTransaction: null,
      routingNumber: '842917356',
      nickname: null,
      cardCount: 0,
      transactionCount: 0,
      averageBalance: 0.00,
      interestRate: '2.25%'
    },
    {
      id: 9,
      accountNumber: '****4618',
      accountType: 'BUSINESS_CHECKING',
      ownerName: 'Agbonifo Enterprises LLC',
      email: 'business@agbonifo.com',
      balance: 10000.00,
      status: 'active',
      openedDate: '2026-02-17',
      lastTransaction: '2026-02-17',
      routingNumber: '842917356',
      nickname: 'Business Account',
      cardCount: 1,
      transactionCount: 1,
      averageBalance: 10000.00,
      interestRate: '0.05%'
    }
  ]);

  const accountTypes = [
    { id: 'all', name: 'All Types', count: accounts.length },
    { id: 'CHECKING', name: 'Checking', count: accounts.filter(a => a.accountType === 'CHECKING').length },
    { id: 'SAVINGS', name: 'Savings', count: accounts.filter(a => a.accountType === 'SAVINGS').length },
    { id: 'BUSINESS_CHECKING', name: 'Business', count: accounts.filter(a => a.accountType === 'BUSINESS_CHECKING').length }
  ];

  const statusTypes = [
    { id: 'all', name: 'All Status', count: accounts.length },
    { id: 'active', name: 'Active', count: accounts.filter(a => a.status === 'active').length },
    { id: 'frozen', name: 'Frozen', count: accounts.filter(a => a.status === 'frozen').length },
    { id: 'closed', name: 'Closed', count: accounts.filter(a => a.status === 'closed').length }
  ];

  const getAccountIcon = (type) => {
    switch(type) {
      case 'CHECKING': return '🏦';
      case 'SAVINGS': return '💰';
      case 'BUSINESS_CHECKING': return '💼';
      default: return '🏦';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#22c55e';
      case 'frozen': return '#ef4444';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.includes(searchTerm) ||
      (account.email && account.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || account.accountType === filterType;
    const matchesStatus = filterStatus === 'all' || account.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    switch(sortBy) {
      case 'balance-desc': return b.balance - a.balance;
      case 'balance-asc': return a.balance - b.balance;
      case 'name-asc': return a.ownerName.localeCompare(b.ownerName);
      case 'name-desc': return b.ownerName.localeCompare(a.ownerName);
      case 'date-desc': return new Date(b.openedDate) - new Date(a.openedDate);
      case 'date-asc': return new Date(a.openedDate) - new Date(b.openedDate);
      default: return 0;
    }
  });

  const stats = {
    total: accounts.length,
    totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
    averageBalance: accounts.reduce((sum, a) => sum + a.balance, 0) / accounts.length,
    checkingCount: accounts.filter(a => a.accountType === 'CHECKING').length,
    savingsCount: accounts.filter(a => a.accountType === 'SAVINGS').length,
    businessCount: accounts.filter(a => a.accountType === 'BUSINESS_CHECKING').length,
    activeCount: accounts.filter(a => a.status === 'active').length,
    zeroBalanceCount: accounts.filter(a => a.balance === 0).length,
    highBalanceCount: accounts.filter(a => a.balance > 10000).length
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
      flex: 2,
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '250px'
    },
    filterSelect: {
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'white',
      minWidth: '150px'
    },
    viewToggle: {
      display: 'flex',
      gap: '5px',
      marginLeft: 'auto'
    },
    viewButton: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #e0e0e0',
      background: 'white',
      cursor: 'pointer',
      fontSize: '13px'
    },
    activeView: {
      background: '#667eea',
      color: 'white',
      borderColor: '#667eea'
    },
    summary: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    summaryText: {
      color: '#666',
      fontSize: '14px'
    },
    summaryHighlight: {
      fontWeight: 'bold',
      color: '#333',
      marginLeft: '5px'
    },
    accountsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    accountCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    accountHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    accountIcon: {
      fontSize: '32px'
    },
    accountType: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    },
    accountNumber: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333'
    },
    accountOwner: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '10px'
    },
    accountBalance: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#22c55e',
      marginBottom: '10px'
    },
    accountDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginTop: '15px',
      padding: '15px',
      background: '#f9f9f9',
      borderRadius: '8px'
    },
    detailItem: {
      fontSize: '12px',
      color: '#666'
    },
    detailValue: {
      fontWeight: '600',
      color: '#333',
      marginLeft: '5px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      display: 'inline-block'
    },
    listTable: {
      width: '100%',
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    listHeader: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr 1fr 1fr',
      padding: '15px',
      background: '#f8fafc',
      fontWeight: '600',
      color: '#333',
      borderBottom: '1px solid #f0f0f0'
    },
    listRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr 1fr 1fr',
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      cursor: 'pointer',
      alignItems: 'center'
    },
    listCell: {
      fontSize: '13px'
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
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
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
      width: '140px',
      color: '#666',
      fontSize: '14px'
    },
    detailValue: {
      flex: 1,
      fontWeight: '500',
      color: '#333'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Total Accounts Overview</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Accounts</div>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statSub}>↑ 5 this month</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Balance</div>
          <div style={styles.statValue}>${stats.totalBalance.toLocaleString()}</div>
          <div style={styles.statSub}>Avg: ${Math.round(stats.averageBalance).toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>By Type</div>
          <div style={styles.statValue}>
            <span style={{color: '#3b82f6'}}>C:{stats.checkingCount}</span> | 
            <span style={{color: '#22c55e'}}> S:{stats.savingsCount}</span> | 
            <span style={{color: '#8b5cf6'}}> B:{stats.businessCount}</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Zero Balance</div>
          <div style={styles.statValue}>{stats.zeroBalanceCount}</div>
          <div style={styles.statSub}>Inactive accounts</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by name, account number, email..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          style={styles.filterSelect}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          {accountTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} ({type.count})
            </option>
          ))}
        </select>
        <select
          style={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {statusTypes.map(status => (
            <option key={status.id} value={status.id}>
              {status.name} ({status.count})
            </option>
          ))}
        </select>
        <select
          style={styles.filterSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="balance-desc">Balance (High to Low)</option>
          <option value="balance-asc">Balance (Low to High)</option>
          <option value="name-asc">Name (A to Z)</option>
          <option value="name-desc">Name (Z to A)</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
        </select>
        <div style={styles.viewToggle}>
          <button 
            style={{...styles.viewButton, ...(viewMode === 'grid' ? styles.activeView : {})}}
            onClick={() => setViewMode('grid')}
          >
            📱 Grid
          </button>
          <button 
            style={{...styles.viewButton, ...(viewMode === 'list' ? styles.activeView : {})}}
            onClick={() => setViewMode('list')}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        <span style={styles.summaryText}>
          Showing <span style={styles.summaryHighlight}>{filteredAccounts.length}</span> of <span style={styles.summaryHighlight}>{accounts.length}</span> accounts
        </span>
        <span style={styles.summaryText}>
          Total Balance: <span style={styles.summaryHighlight}>${filteredAccounts.reduce((sum, a) => sum + a.balance, 0).toLocaleString()}</span>
        </span>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={styles.accountsGrid}>
          {sortedAccounts.map(account => (
            <div
              key={account.id}
              style={styles.accountCard}
              onClick={() => {
                setSelectedAccount(account);
                setShowDetails(true);
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.accountHeader}>
                <span style={styles.accountIcon}>{getAccountIcon(account.accountType)}</span>
                <span style={{
                  ...styles.statusBadge,
                  background: `${getStatusColor(account.status)}20`,
                  color: getStatusColor(account.status)
                }}>
                  {account.status}
                </span>
              </div>
              <div style={styles.accountNumber}>{account.accountNumber}</div>
              <div style={styles.accountOwner}>{account.ownerName}</div>
              <div style={styles.accountBalance}>${account.balance.toLocaleString()}</div>
              <div style={styles.accountType}>{account.accountType}</div>
              
              <div style={styles.accountDetails}>
                <div style={styles.detailItem}>
                  Opened: <span style={styles.detailValue}>{account.openedDate}</span>
                </div>
                <div style={styles.detailItem}>
                  Cards: <span style={styles.detailValue}>{account.cardCount}</span>
                </div>
                <div style={styles.detailItem}>
                  Transactions: <span style={styles.detailValue}>{account.transactionCount}</span>
                </div>
                <div style={styles.detailItem}>
                  Interest: <span style={styles.detailValue}>{account.interestRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div style={styles.listTable}>
          <div style={styles.listHeader}>
            <div>Account</div>
            <div>Owner</div>
            <div>Type</div>
            <div>Balance</div>
            <div>Status</div>
            <div>Opened</div>
            <div>Cards</div>
          </div>
          {sortedAccounts.map(account => (
            <div
              key={account.id}
              style={styles.listRow}
              onClick={() => {
                setSelectedAccount(account);
                setShowDetails(true);
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <div style={styles.listCell}>
                <span style={{fontWeight: '500'}}>{account.accountNumber}</span>
              </div>
              <div style={styles.listCell}>{account.ownerName}</div>
              <div style={styles.listCell}>
                <span role="img" aria-label="type">{getAccountIcon(account.accountType)}</span> {account.accountType}
              </div>
              <div style={{...styles.listCell, fontWeight: 'bold', color: '#22c55e'}}>
                ${account.balance.toLocaleString()}
              </div>
              <div style={styles.listCell}>
                <span style={{
                  ...styles.statusBadge,
                  background: `${getStatusColor(account.status)}20`,
                  color: getStatusColor(account.status)
                }}>
                  {account.status}
                </span>
              </div>
              <div style={styles.listCell}>{account.openedDate}</div>
              <div style={styles.listCell}>{account.cardCount}</div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedAccount && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Account Details</h2>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Account Number:</div>
              <div style={styles.detailValue}>{selectedAccount.accountNumber}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Account Type:</div>
              <div style={styles.detailValue}>{selectedAccount.accountType}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Owner:</div>
              <div style={styles.detailValue}>{selectedAccount.ownerName}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Email:</div>
              <div style={styles.detailValue}>{selectedAccount.email}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Balance:</div>
              <div style={{...styles.detailValue, color: '#22c55e', fontWeight: 'bold'}}>
                ${selectedAccount.balance.toLocaleString()}
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Routing Number:</div>
              <div style={styles.detailValue}>{selectedAccount.routingNumber}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Status:</div>
              <div>
                <span style={{
                  ...styles.statusBadge,
                  background: `${getStatusColor(selectedAccount.status)}20`,
                  color: getStatusColor(selectedAccount.status)
                }}>
                  {selectedAccount.status}
                </span>
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Opened Date:</div>
              <div style={styles.detailValue}>{selectedAccount.openedDate}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Last Transaction:</div>
              <div style={styles.detailValue}>{selectedAccount.lastTransaction || 'N/A'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Nickname:</div>
              <div style={styles.detailValue}>{selectedAccount.nickname || 'Not set'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Cards Issued:</div>
              <div style={styles.detailValue}>{selectedAccount.cardCount}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Total Transactions:</div>
              <div style={styles.detailValue}>{selectedAccount.transactionCount}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Average Balance:</div>
              <div style={styles.detailValue}>${selectedAccount.averageBalance.toLocaleString()}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Interest Rate:</div>
              <div style={styles.detailValue}>{selectedAccount.interestRate}</div>
            </div>

            <div style={styles.modalButtons}>
              <button 
                style={styles.backButton}
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTotalAccounts;