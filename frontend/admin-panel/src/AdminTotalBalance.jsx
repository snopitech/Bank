import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "";

const AdminTotalBalance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Live balance data
  const [balanceData, setBalanceData] = useState({
    total: 0,
    byType: {
      CHECKING: 0,
      SAVINGS: 0,
      BUSINESS_CHECKING: 0,
      OTHER: 0
    },
    dailyChange: 0,
    weeklyChange: 0,
    monthlyChange: 0,
    yearlyChange: 0,
    averageBalance: 0,
    accountsWithBalance: 0,
    zeroBalanceAccounts: 0,
    negativeBalanceAccounts: 0,
    topAccounts: [],
    history: []
  });

  // Styles object - moved to the top before any conditional returns
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
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
    totalCard: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      color: 'white'
    },
    totalLabel: {
      fontSize: '16px',
      opacity: 0.9,
      marginBottom: '10px'
    },
    totalValue: {
      fontSize: '48px',
      fontWeight: 'bold',
      marginBottom: '15px'
    },
    totalChange: {
      display: 'flex',
      gap: '20px',
      fontSize: '14px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    statIcon: {
      fontSize: '24px'
    },
    statTitle: {
      fontSize: '14px',
      color: '#666'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '5px'
    },
    statChange: {
      fontSize: '13px'
    },
    timeRangeSelector: {
      background: 'white',
      borderRadius: '12px',
      padding: '15px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '10px'
    },
    timeButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: '1px solid #e0e0e0',
      background: 'white',
      cursor: 'pointer',
      fontSize: '13px'
    },
    activeTime: {
      background: '#667eea',
      color: 'white',
      borderColor: '#667eea'
    },
    chartContainer: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    chartTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px'
    },
    chartBars: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: '200px',
      gap: '10px'
    },
    barContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    },
    bar: {
      width: '100%',
      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '4px 4px 0 0',
      transition: 'height 0.3s'
    },
    barLabel: {
      fontSize: '11px',
      color: '#666',
      transform: 'rotate(-45deg)',
      whiteSpace: 'nowrap'
    },
    barValue: {
      fontSize: '10px',
      color: '#999'
    },
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '30px'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '15px',
      paddingBottom: '10px',
      borderBottom: '1px solid #f0f0f0'
    },
    accountRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #f0f0f0',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    accountInfo: {
      flex: 1
    },
    accountName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    accountDetails: {
      fontSize: '12px',
      color: '#666'
    },
    accountBalance: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#22c55e'
    },
    percentageBadge: {
      fontSize: '11px',
      padding: '2px 6px',
      borderRadius: '4px',
      background: '#f0f0f0',
      marginLeft: '8px'
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
      maxWidth: '400px',
      width: '90%'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333'
    },
    modalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0'
    }
  };

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const usersResponse = await fetch(`${API_BASE}/api/users`);
      const users = await usersResponse.json();
      
      let totalBalance = 0;
      let checkingTotal = 0;
      let savingsTotal = 0;
      let businessTotal = 0;
      let otherTotal = 0;
      let accountsWithBalance = 0;
      let zeroBalanceAccounts = 0;
      let negativeBalanceAccounts = 0;
      let allAccounts = [];
      
      // Process each user's accounts
      users.forEach(user => {
        if (user.accounts && user.accounts.length > 0) {
          user.accounts.forEach(account => {
            const balance = account.balance || 0;
            
            // Add to total
            totalBalance += balance;
            
            // Count by type
            if (account.accountType === 'CHECKING') {
              checkingTotal += balance;
            } else if (account.accountType === 'SAVINGS') {
              savingsTotal += balance;
            } else if (account.accountType === 'BUSINESS_CHECKING') {
              businessTotal += balance;
            } else {
              otherTotal += balance;
            }
            
            // Count statistics
            if (balance > 0) {
              accountsWithBalance++;
            } else if (balance === 0) {
              zeroBalanceAccounts++;
            } else if (balance < 0) {
              negativeBalanceAccounts++;
            }
            
            // Collect for top accounts
            allAccounts.push({
              id: account.id,
              name: user.fullName || `${user.firstName} ${user.lastName}`,
              account: account.maskedAccountNumber || `****${account.accountNumber?.slice(-4)}`,
              type: account.accountType === 'BUSINESS_CHECKING' ? 'BUSINESS' : account.accountType,
              balance: balance,
              accountType: account.accountType
            });
          });
        }
      });
      
      // Sort accounts by balance (descending) and take top 5
      const topAccounts = allAccounts
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);
      
      // Calculate average balance (excluding zero balance accounts for meaningful average)
      const avgBalance = accountsWithBalance > 0 
        ? totalBalance / accountsWithBalance 
        : 0;
      
      // Generate mock history data (you'd need a transactions history endpoint for real data)
      const history = generateHistoryData(totalBalance);
      
      // Calculate changes (mock for now - would need historical data)
      const dailyChange = totalBalance * 0.012; // 1.2% mock
      const weeklyChange = totalBalance * 0.056; // 5.6% mock
      const monthlyChange = totalBalance * 0.089; // 8.9% mock
      const yearlyChange = totalBalance * 0.152; // 15.2% mock

      setBalanceData({
        total: totalBalance,
        byType: {
          CHECKING: checkingTotal,
          SAVINGS: savingsTotal,
          BUSINESS: businessTotal,
          OTHER: otherTotal
        },
        dailyChange,
        weeklyChange,
        monthlyChange,
        yearlyChange,
        averageBalance: avgBalance,
        accountsWithBalance,
        zeroBalanceAccounts,
        negativeBalanceAccounts,
        topAccounts,
        history
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate history data based on current total
  const generateHistoryData = (total) => {
    const history = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create some variation in the data
      const variation = 0.95 + (Math.random() * 0.1);
      const balance = total * variation;
      
      history.push({
        date: date.toISOString().split('T')[0],
        balance: balance
      });
    }
    
    return history;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatCompactCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
  };

  const getChangeColor = (value) => {
    return value >= 0 ? '#22c55e' : '#ef4444';
  };

  const getChangeIcon = (value) => {
    return value >= 0 ? '▲' : '▼';
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading balance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button style={styles.retryButton} onClick={fetchBalanceData}>
          Retry
        </button>
      </div>
    );
  }

  // Calculate max balance for chart scaling
  const maxBalance = Math.max(...balanceData.history.map(h => h.balance));

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Total Balance Overview</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Total Balance Card */}
      <div style={styles.totalCard}>
        <div style={styles.totalLabel}>Total Bank Balance</div>
        <div style={styles.totalValue}>{formatCurrency(balanceData.total)}</div>
        <div style={styles.totalChange}>
          <span style={{color: '#fff'}}>
            Daily: {getChangeIcon(balanceData.dailyChange)} {formatCompactCurrency(Math.abs(balanceData.dailyChange))}
          </span>
          <span style={{color: '#fff'}}>
            Weekly: {getChangeIcon(balanceData.weeklyChange)} {formatCompactCurrency(Math.abs(balanceData.weeklyChange))}
          </span>
          <span style={{color: '#fff'}}>
            Monthly: {getChangeIcon(balanceData.monthlyChange)} {formatCompactCurrency(Math.abs(balanceData.monthlyChange))}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statIcon}>💰</span>
            <span style={{...styles.statChange, color: getChangeColor(balanceData.dailyChange)}}>
              {getChangeIcon(balanceData.dailyChange)} {Math.abs((balanceData.dailyChange / balanceData.total) * 100).toFixed(1)}%
            </span>
          </div>
          <div style={styles.statTitle}>Average Balance</div>
          <div style={styles.statValue}>{formatCurrency(balanceData.averageBalance)}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statIcon}>📊</span>
          </div>
          <div style={styles.statTitle}>Accounts with Balance</div>
          <div style={styles.statValue}>{balanceData.accountsWithBalance.toLocaleString()}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statIcon}>⚪</span>
          </div>
          <div style={styles.statTitle}>Zero Balance</div>
          <div style={styles.statValue}>{balanceData.zeroBalanceAccounts.toLocaleString()}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statIcon}>🔴</span>
          </div>
          <div style={styles.statTitle}>Negative Balance</div>
          <div style={{...styles.statValue, color: '#ef4444'}}>{balanceData.negativeBalanceAccounts.toLocaleString()}</div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div style={styles.timeRangeSelector}>
        <button 
          style={{...styles.timeButton, ...(timeRange === 'week' ? styles.activeTime : {})}}
          onClick={() => setTimeRange('week')}
        >
          Week
        </button>
        <button 
          style={{...styles.timeButton, ...(timeRange === 'month' ? styles.activeTime : {})}}
          onClick={() => setTimeRange('month')}
        >
          Month
        </button>
        <button 
          style={{...styles.timeButton, ...(timeRange === 'quarter' ? styles.activeTime : {})}}
          onClick={() => setTimeRange('quarter')}
        >
          Quarter
        </button>
        <button 
          style={{...styles.timeButton, ...(timeRange === 'year' ? styles.activeTime : {})}}
          onClick={() => setTimeRange('year')}
        >
          Year
        </button>
      </div>

      {/* Balance Chart */}
      <div style={styles.chartContainer}>
        <div style={styles.chartTitle}>Balance History (Last 7 Days)</div>
        <div style={styles.chartBars}>
          {balanceData.history.map((item, index) => {
            const height = (item.balance / maxBalance) * 180;
            return (
              <div key={index} style={styles.barContainer}>
                <div style={{...styles.bar, height: `${height}px`}}></div>
                <div style={styles.barLabel}>{item.date.slice(-5)}</div>
                <div style={styles.barValue}>{formatCompactCurrency(item.balance)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoColumnGrid}>
        {/* Balance by Type */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Balance by Account Type</div>
          <div>
            <div style={{...styles.accountRow, borderBottom: '1px solid #f0f0f0', cursor: 'default'}}>
              <span style={{fontWeight: '500'}}>Checking</span>
              <div>
                <span style={{fontWeight: 'bold', color: '#22c55e', marginRight: '8px'}}>
                  {formatCurrency(balanceData.byType.CHECKING)}
                </span>
                <span style={styles.percentageBadge}>
                  {formatPercentage(balanceData.byType.CHECKING, balanceData.total)}
                </span>
              </div>
            </div>
            <div style={{...styles.accountRow, cursor: 'default'}}>
              <span style={{fontWeight: '500'}}>Savings</span>
              <div>
                <span style={{fontWeight: 'bold', color: '#22c55e', marginRight: '8px'}}>
                  {formatCurrency(balanceData.byType.SAVINGS)}
                </span>
                <span style={styles.percentageBadge}>
                  {formatPercentage(balanceData.byType.SAVINGS, balanceData.total)}
                </span>
              </div>
            </div>
            <div style={{...styles.accountRow, cursor: 'default'}}>
              <span style={{fontWeight: '500'}}>Business</span>
              <div>
                <span style={{fontWeight: 'bold', color: '#22c55e', marginRight: '8px'}}>
                  {formatCurrency(balanceData.byType.BUSINESS)}
                </span>
                <span style={styles.percentageBadge}>
                  {formatPercentage(balanceData.byType.BUSINESS, balanceData.total)}
                </span>
              </div>
            </div>
            <div style={{...styles.accountRow, cursor: 'default'}}>
              <span style={{fontWeight: '500'}}>Other</span>
              <div>
                <span style={{fontWeight: 'bold', color: '#22c55e', marginRight: '8px'}}>
                  {formatCurrency(balanceData.byType.OTHER)}
                </span>
                <span style={styles.percentageBadge}>
                  {formatPercentage(balanceData.byType.OTHER, balanceData.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Accounts */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Top 5 Accounts by Balance</div>
          {balanceData.topAccounts.length > 0 ? (
            balanceData.topAccounts.map(account => (
              <div
                key={account.id}
                style={styles.accountRow}
                onClick={() => {
                  setSelectedAccount(account);
                  setShowDetails(true);
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={styles.accountInfo}>
                  <div style={styles.accountName}>{account.name}</div>
                  <div style={styles.accountDetails}>
                    {account.type} • {account.account}
                  </div>
                </div>
                <div style={styles.accountBalance}>{formatCurrency(account.balance)}</div>
              </div>
            ))
          ) : (
            <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>
              No accounts found
            </div>
          )}
        </div>
      </div>

      {/* Account Details Modal */}
      {showDetails && selectedAccount && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Account Details</h2>
            
            <div style={styles.modalRow}>
              <span style={{color: '#666'}}>Account Holder:</span>
              <span style={{fontWeight: '500'}}>{selectedAccount.name}</span>
            </div>
            <div style={styles.modalRow}>
              <span style={{color: '#666'}}>Account Number:</span>
              <span style={{fontWeight: '500'}}>{selectedAccount.account}</span>
            </div>
            <div style={styles.modalRow}>
              <span style={{color: '#666'}}>Account Type:</span>
              <span style={{fontWeight: '500'}}>{selectedAccount.type}</span>
            </div>
            <div style={styles.modalRow}>
              <span style={{color: '#666'}}>Current Balance:</span>
              <span style={{fontWeight: 'bold', color: '#22c55e'}}>{formatCurrency(selectedAccount.balance)}</span>
            </div>
            
            <button 
              style={{...styles.backButton, marginTop: '20px', width: '100%'}} 
              onClick={() => setShowDetails(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTotalBalance;
