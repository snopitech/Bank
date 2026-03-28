import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "";

const AdminTotalAccounts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('balance-desc');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Styles object - moved to the top before any conditional returns
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    content: {
      padding: '24px'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    loadingSpinner: {
      border: '4px solid rgba(255,255,255,0.3)',
      borderTop: '4px solid white',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    },
    errorContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    retryButton: {
      background: 'white',
      color: '#667eea',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '20px'
    },
    header: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px 30px',
      marginBottom: '24px',
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
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    statLabel: {
      color: '#6b7280',
      fontSize: '12px',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827'
    },
    statSub: {
      fontSize: '12px',
      color: '#22c55e',
      marginTop: '4px'
    },
    filters: {
      background: 'white',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    searchInput: {
      flex: 2,
      padding: '10px 12px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      fontSize: '14px',
      minWidth: '250px'
    },
    filterSelect: {
      padding: '10px 12px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      fontSize: '14px',
      background: 'white',
      minWidth: '150px'
    },
    summary: {
      background: 'white',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
      color: '#6b7280'
    },
    summaryHighlight: {
      fontWeight: '600',
      color: '#667eea'
    },
    gallerySection: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    },
    galleryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    galleryTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: 0
    },
    scrollHint: {
      fontSize: '13px',
      color: '#6b7280'
    },
    cardsContainer: {
      display: 'flex',
      gap: '20px',
      overflowX: 'auto',
      padding: '8px 4px 16px 4px',
      scrollBehavior: 'smooth'
    },
    accountCard: {
      minWidth: '350px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'transform 0.2s, boxShadow 0.2s'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    cardIcon: {
      fontSize: '32px'
    },
    accountNumber: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '4px'
    },
    accountOwner: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px'
    },
    accountBalance: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#22c55e',
      marginBottom: '8px'
    },
    accountType: {
      fontSize: '13px',
      color: '#6b7280',
      marginBottom: '12px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    },
    cardDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginTop: '15px',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '8px'
    },
    detailItem: {
      fontSize: '12px',
      color: '#6b7280'
    },
    detailValue: {
      fontWeight: '600',
      color: '#111827',
      marginLeft: '4px'
    },
    footer: {
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      color: 'white'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      gap: '32px',
      marginBottom: '32px'
    },
    footerTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#94a3b8',
      marginBottom: '16px'
    },
    footerText: {
      fontSize: '14px',
      color: '#cbd5e1',
      lineHeight: '1.6',
      marginBottom: '16px'
    },
    footerBadge: {
      background: '#334155',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      color: '#94a3b8',
      display: 'inline-block',
      marginRight: '8px'
    },
    footerStats: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    footerStatItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
      fontSize: '14px'
    },
    footerLink: {
      display: 'block',
      color: '#cbd5e1',
      textDecoration: 'none',
      fontSize: '14px',
      marginBottom: '8px'
    },
    footerBottom: {
      borderTop: '1px solid #334155',
      paddingTop: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: '#64748b'
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

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all users
      const response = await fetch(`${API_BASE}/api/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      
      // Extract all accounts from users
      let allAccounts = [];
      users.forEach(user => {
        if (user.accounts && user.accounts.length > 0) {
          user.accounts.forEach(account => {
            allAccounts.push({
              id: account.id,
              accountNumber: account.maskedAccountNumber || `****${account.accountNumber?.slice(-4)}`,
              fullAccountNumber: account.accountNumber,
              accountType: account.accountType,
              ownerName: user.fullName || `${user.firstName} ${user.lastName}`,
              email: user.email,
              balance: account.balance || 0,
              status: account.closed ? 'closed' : account.disabled ? 'frozen' : 'active',
              openedDate: user.memberSince ? user.memberSince.split('T')[0] : 'N/A',
              lastTransaction: 'N/A',
              routingNumber: account.routingNumber || '842917356',
              nickname: account.nickname,
              cardCount: 0,
              transactionCount: 0,
              averageBalance: account.balance || 0,
              interestRate: account.accountType === 'SAVINGS' ? '2.25%' : '0.01%',
              userId: user.id
            });
          });
        }
      });
      
      setAccounts(allAccounts);
      setHasMore(allAccounts.length >= 20);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreAccounts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    // Simulate loading more (you'd implement pagination with your API)
    setTimeout(() => {
      setHasMore(false);
      setLoadingMore(false);
    }, 1000);
  };

  const accountTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'CHECKING', name: 'Checking' },
    { id: 'SAVINGS', name: 'Savings' },
    { id: 'BUSINESS_CHECKING', name: 'Business' }
  ];

  const statusTypes = [
    { id: 'all', name: 'All Status' },
    { id: 'active', name: 'Active' },
    { id: 'frozen', name: 'Frozen' },
    { id: 'closed', name: 'Closed' }
  ];

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
    averageBalance: accounts.length > 0 ? accounts.reduce((sum, a) => sum + a.balance, 0) / accounts.length : 0,
    checkingCount: accounts.filter(a => a.accountType === 'CHECKING').length,
    savingsCount: accounts.filter(a => a.accountType === 'SAVINGS').length,
    businessCount: accounts.filter(a => a.accountType === 'BUSINESS_CHECKING').length,
    activeCount: accounts.filter(a => a.status === 'active').length,
    frozenCount: accounts.filter(a => a.status === 'frozen').length,
    closedCount: accounts.filter(a => a.status === 'closed').length,
    zeroBalanceCount: accounts.filter(a => a.balance === 0).length,
    highBalanceCount: accounts.filter(a => a.balance > 10000).length
  };

  const getAccountIcon = (type) => {
    switch(type) {
      case 'CHECKING': return '🏦';
      case 'SAVINGS': return '💰';
      case 'BUSINESS_CHECKING': return '💼';
      default: return '🏦';
    }
  };

  const getAccountColor = (type) => {
    switch(type) {
      case 'CHECKING': return '#3b82f6';
      case 'SAVINGS': return '#22c55e';
      case 'BUSINESS_CHECKING': return '#8b5cf6';
      default: return '#3b82f6';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#22c55e';
      case 'frozen': return '#f59e0b';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollWidth - scrollLeft - clientWidth < 100 && hasMore && !loadingMore) {
      loadMoreAccounts();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error Loading Accounts</h2>
        <p>{error}</p>
        <button style={styles.retryButton} onClick={fetchAccounts}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          ::-webkit-scrollbar {
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>

      <div style={styles.content}>
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
            <div style={styles.statValue}>{stats.total.toLocaleString()}</div>
            <div style={styles.statSub}>↑ {stats.activeCount} active</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Balance</div>
            <div style={styles.statValue}>{formatCurrency(stats.totalBalance)}</div>
            <div style={styles.statSub}>Avg: {formatCurrency(stats.averageBalance)}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Checking</div>
            <div style={styles.statValue}>{stats.checkingCount}</div>
            <div style={styles.statSub}>{formatCurrency(accounts.filter(a => a.accountType === 'CHECKING').reduce((s, a) => s + a.balance, 0))}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Savings</div>
            <div style={styles.statValue}>{stats.savingsCount}</div>
            <div style={styles.statSub}>{formatCurrency(accounts.filter(a => a.accountType === 'SAVINGS').reduce((s, a) => s + a.balance, 0))}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Business</div>
            <div style={styles.statValue}>{stats.businessCount}</div>
            <div style={styles.statSub}>{formatCurrency(accounts.filter(a => a.accountType === 'BUSINESS_CHECKING').reduce((s, a) => s + a.balance, 0))}</div>
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
            placeholder="🔍 Search by name, account number, email..."
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
                {type.name}
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
                {status.name}
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
        </div>

        {/* Summary */}
        <div style={styles.summary}>
          <span>
            Showing <span style={styles.summaryHighlight}>{filteredAccounts.length}</span> of <span style={styles.summaryHighlight}>{accounts.length}</span> accounts
          </span>
          <span>
            Total Balance: <span style={styles.summaryHighlight}>{formatCurrency(filteredAccounts.reduce((sum, a) => sum + a.balance, 0))}</span>
          </span>
        </div>

        {/* Horizontal Scrollable Gallery */}
        <div style={styles.gallerySection}>
          <div style={styles.galleryHeader}>
            <h2 style={styles.galleryTitle}>Account Gallery</h2>
            <span style={styles.scrollHint}>Scroll right →</span>
          </div>
          
          <div 
            style={styles.cardsContainer}
            onScroll={handleScroll}
          >
            {sortedAccounts.map(account => (
              <div
                key={account.id}
                style={styles.accountCard}
                onClick={() => {
                  setSelectedAccount(account);
                  setShowDetails(true);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                }}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>{getAccountIcon(account.accountType)}</span>
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
                <div style={styles.accountBalance}>{formatCurrency(account.balance)}</div>
                <div style={styles.accountType}>{account.accountType}</div>
                
                <div style={styles.cardDetails}>
                  <div style={styles.detailItem}>
                    Opened: <span style={styles.detailValue}>{account.openedDate}</span>
                  </div>
                  <div style={styles.detailItem}>
                    Cards: <span style={styles.detailValue}>{account.cardCount}</span>
                  </div>
                  <div style={styles.detailItem}>
                    Interest: <span style={styles.detailValue}>{account.interestRate}</span>
                  </div>
                  <div style={styles.detailItem}>
                    Routing: <span style={styles.detailValue}>{account.routingNumber}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {loadingMore && (
              <div style={{ minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ border: '2px solid #f3f3f3', borderTop: '2px solid #667eea', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite' }}></div>
              </div>
            )}
            
            {!hasMore && (
              <div style={{ minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '13px' }}>
                End of list
              </div>
            )}
          </div>
        </div>

        {/* Beautiful Footer */}
        <div style={styles.footer}>
          <div style={styles.footerGrid}>
            {/* About Section */}
            <div>
              <h3 style={styles.footerTitle}>About Account Management</h3>
              <p style={styles.footerText}>
                Complete overview of all bank accounts. Monitor balances, track account types, 
                and manage account statuses from one centralized dashboard.
              </p>
              <div>
                <span style={styles.footerBadge}>🏦 Real-time balances</span>
                <span style={styles.footerBadge}>📊 Account analytics</span>
                <span style={styles.footerBadge}>🔒 Secure monitoring</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 style={styles.footerTitle}>Account Statistics</h3>
              <ul style={styles.footerStats}>
                <li style={styles.footerStatItem}>
                  <span style={{ color: '#cbd5e1' }}>Active Rate</span>
                  <span style={{ fontWeight: '600', color: 'white' }}>
                    {stats.total > 0 ? ((stats.activeCount / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </li>
                <li style={styles.footerStatItem}>
                  <span style={{ color: '#cbd5e1' }}>Checking/Savings Ratio</span>
                  <span style={{ fontWeight: '600', color: 'white' }}>
                    {stats.checkingCount}:{stats.savingsCount}
                  </span>
                </li>
                <li style={styles.footerStatItem}>
                  <span style={{ color: '#cbd5e1' }}>High Balance Accts</span>
                  <span style={{ fontWeight: '600', color: '#22c55e' }}>{stats.highBalanceCount}</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 style={styles.footerTitle}>Quick Actions</h3>
              <a href="#" style={styles.footerLink}>📋 Generate Account Report</a>
              <a href="#" style={styles.footerLink}>🔍 Search by Customer</a>
              <a href="#" style={styles.footerLink}>📊 View Account Analytics</a>
              <a href="#" style={styles.footerLink}>⚙️ Bulk Account Actions</a>
            </div>

            {/* Support */}
            <div>
              <h3 style={styles.footerTitle}>Account Support</h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '12px' }}>
                Need assistance with account management?
              </p>
              <div style={{ background: '#334155', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>📞 +1 (713) 870-1132</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>✉️ accounts@snopitech.com</div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={styles.footerBottom}>
            <div>
              © 2026 SnopitechBank Account Management System. All data is encrypted and secure.
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Security</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Compliance</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Audit</a>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedAccount && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Account Details</h2>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Account Number:</div>
              <div style={styles.detailValue}>{selectedAccount.fullAccountNumber || selectedAccount.accountNumber}</div>
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
                {formatCurrency(selectedAccount.balance)}
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
              <div style={styles.detailLabel}>Nickname:</div>
              <div style={styles.detailValue}>{selectedAccount.nickname || 'Not set'}</div>
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
