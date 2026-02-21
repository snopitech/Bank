import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminTotalBalance = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock balance data
  const [balanceData] = useState({
    total: 4245678.90,
    byType: {
      checking: 1845678.45,
      savings: 1567890.23,
      business: 567890.12,
      other: 264220.10
    },
    dailyChange: 34567.89,
    weeklyChange: 156789.45,
    monthlyChange: 456789.23,
    yearlyChange: 1234567.89,
    averageBalance: 15234.56,
    accountsWithBalance: 2345,
    zeroBalanceAccounts: 222,
    negativeBalanceAccounts: 12,
    topAccounts: [
      { id: 1, name: 'Michael Agbonifo', account: '****2213', type: 'CHECKING', balance: 25140.00 },
      { id: 9, name: 'Agbonifo Enterprises', account: '****4618', type: 'BUSINESS', balance: 10000.00 },
      { id: 3, name: 'Cynthia Ekeh', account: '****8924', type: 'CHECKING', balance: 2950.00 },
      { id: 2, name: 'Michael Agbonifo', account: '****6808', type: 'SAVINGS', balance: 4500.00 },
      { id: 4, name: 'Cynthia Ekeh', account: '****6051', type: 'SAVINGS', balance: 2050.00 }
    ],
    history: [
      { date: '2026-02-11', balance: 4123456.78 },
      { date: '2026-02-12', balance: 4156789.12 },
      { date: '2026-02-13', balance: 4189012.45 },
      { date: '2026-02-14', balance: 4212345.67 },
      { date: '2026-02-15', balance: 4223456.78 },
      { date: '2026-02-16', balance: 4234567.89 },
      { date: '2026-02-17', balance: 4245678.90 }
    ]
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getChangeColor = (value) => {
    return value >= 0 ? '#22c55e' : '#ef4444';
  };

  const getChangeIcon = (value) => {
    return value >= 0 ? '▲' : '▼';
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
      cursor: 'pointer'
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
    }
  };

  // Calculate max balance for chart scaling
  const maxBalance = Math.max(...balanceData.history.map(h => h.balance));

  return (
    <div style={styles.container}>
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
            Daily: {getChangeIcon(balanceData.dailyChange)} {formatCurrency(Math.abs(balanceData.dailyChange))}
          </span>
          <span style={{color: '#fff'}}>
            Weekly: {getChangeIcon(balanceData.weeklyChange)} {formatCurrency(Math.abs(balanceData.weeklyChange))}
          </span>
          <span style={{color: '#fff'}}>
            Monthly: {getChangeIcon(balanceData.monthlyChange)} {formatCurrency(Math.abs(balanceData.monthlyChange))}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statIcon}>💰</span>
            <span style={{...styles.statChange, color: getChangeColor(balanceData.dailyChange)}}>
              {getChangeIcon(balanceData.dailyChange)} {Math.abs(balanceData.dailyChange).toFixed(0)}%
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
          <div style={styles.statValue}>{balanceData.accountsWithBalance}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statIcon}>⚪</span>
          </div>
          <div style={styles.statTitle}>Zero Balance</div>
          <div style={styles.statValue}>{balanceData.zeroBalanceAccounts}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statIcon}>🔴</span>
          </div>
          <div style={styles.statTitle}>Negative Balance</div>
          <div style={{...styles.statValue, color: '#ef4444'}}>{balanceData.negativeBalanceAccounts}</div>
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
                <div style={styles.barValue}>{formatCurrency(item.balance).replace('$', '')}</div>
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
            <div style={{...styles.accountRow, borderBottom: '1px solid #f0f0f0'}}>
              <span style={{fontWeight: '500'}}>Checking</span>
              <span style={{fontWeight: 'bold', color: '#22c55e'}}>{formatCurrency(balanceData.byType.checking)}</span>
            </div>
            <div style={styles.accountRow}>
              <span style={{fontWeight: '500'}}>Savings</span>
              <span style={{fontWeight: 'bold', color: '#22c55e'}}>{formatCurrency(balanceData.byType.savings)}</span>
            </div>
            <div style={styles.accountRow}>
              <span style={{fontWeight: '500'}}>Business</span>
              <span style={{fontWeight: 'bold', color: '#22c55e'}}>{formatCurrency(balanceData.byType.business)}</span>
            </div>
            <div style={styles.accountRow}>
              <span style={{fontWeight: '500'}}>Other</span>
              <span style={{fontWeight: 'bold', color: '#22c55e'}}>{formatCurrency(balanceData.byType.other)}</span>
            </div>
          </div>
        </div>

        {/* Top Accounts */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Top 5 Accounts by Balance</div>
          {balanceData.topAccounts.map(account => (
            <div
              key={account.id}
              style={styles.accountRow}
              onClick={() => {
                setSelectedAccount(account);
                setShowDetails(true);
              }}
            >
              <div style={styles.accountInfo}>
                <div style={styles.accountName}>{account.name}</div>
                <div style={styles.accountDetails}>
                  {account.type} • {account.account}
                </div>
              </div>
              <div style={styles.accountBalance}>{formatCurrency(account.balance)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Details Modal */}
      {showDetails && selectedAccount && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Account Details</h2>
            <p><strong>Name:</strong> {selectedAccount.name}</p>
            <p><strong>Account:</strong> {selectedAccount.account}</p>
            <p><strong>Type:</strong> {selectedAccount.type}</p>
            <p><strong>Balance:</strong> <span style={{color: '#22c55e', fontWeight: 'bold'}}>{formatCurrency(selectedAccount.balance)}</span></p>
            <button style={styles.backButton} onClick={() => setShowDetails(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTotalBalance;