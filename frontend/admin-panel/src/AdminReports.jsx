import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminReports = () => {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState('daily'); // 'daily', 'monthly', 'financial', 'user', 'transaction', 'custom'
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Sample report data
  const [dailyReport] = useState({
    date: '2026-02-17',
    summary: {
      totalTransactions: 1247,
      totalVolume: 345678.90,
      avgTransaction: 277.25,
      uniqueCustomers: 342
    },
    byType: {
      deposits: { count: 423, volume: 189456.78 },
      withdrawals: { count: 387, volume: 98765.43 },
      transfers: { count: 289, volume: 45678.90 },
      payments: { count: 148, volume: 11777.79 }
    },
    topTransactions: [
      { id: 'TXN-1003', amount: 50000.00, type: 'TRANSFER', customer: 'Tracy Agbonifo' },
      { id: 'TXN-1005', amount: 12500.00, type: 'WIRE', customer: 'Michael Agbonifo' },
      { id: 'TXN-1008', amount: 3200.00, type: 'PURCHASE', customer: 'Michael Agbonifo' }
    ],
    hourlyBreakdown: [
      { hour: '00-03', count: 23, volume: 4567.89 },
      { hour: '03-06', count: 12, volume: 2345.67 },
      { hour: '06-09', count: 89, volume: 12345.67 },
      { hour: '09-12', count: 234, volume: 67890.12 },
      { hour: '12-15', count: 345, volume: 98765.43 },
      { hour: '15-18', count: 278, volume: 76543.21 },
      { hour: '18-21', count: 167, volume: 43210.98 },
      { hour: '21-24', count: 99, volume: 21098.76 }
    ]
  });

  const [monthlyReport] = useState({
    month: 'February 2026',
    year: 2026,
    summary: {
      totalTransactions: 32450,
      totalVolume: 8923456.78,
      avgTransaction: 275.00,
      uniqueCustomers: 567,
      activeAccounts: 892
    },
    daily: [
      { day: '01', count: 987, volume: 245678.90 },
      { day: '02', count: 1023, volume: 278901.23 },
      { day: '03', count: 1102, volume: 298765.43 },
      { day: '04', count: 987, volume: 267890.12 },
      { day: '05', count: 1123, volume: 312345.67 }
    ],
    byCategory: {
      'Shopping': { count: 8765, volume: 1234567.89 },
      'Groceries': { count: 6543, volume: 987654.32 },
      'Bills': { count: 5432, volume: 2345678.90 },
      'Transfer': { count: 4321, volume: 3456789.01 },
      'Entertainment': { count: 3210, volume: 456789.12 },
      'Other': { count: 4179, volume: 345678.90 }
    }
  });

  const [financialReport] = useState({
    asOf: '2026-02-17',
    assets: {
      totalDeposits: 12567890.45,
      loans: 4567890.12,
      investments: 2345678.90,
      cash: 1234567.89,
      total: 20716027.36
    },
    liabilities: {
      customerDeposits: 15678901.23,
      pendingTransactions: 456789.01,
      fees: 123456.78,
      total: 16259147.02
    },
    equity: {
      retainedEarnings: 3456789.45,
      capital: 1000000.00,
      total: 4456789.45
    },
    dailyRevenue: [
      { date: '2026-02-11', revenue: 12345.67 },
      { date: '2026-02-12', revenue: 13456.78 },
      { date: '2026-02-13', revenue: 14567.89 },
      { date: '2026-02-14', revenue: 15678.90 },
      { date: '2026-02-15', revenue: 16789.01 },
      { date: '2026-02-16', revenue: 17890.12 },
      { date: '2026-02-17', revenue: 18901.23 }
    ]
  });

  const [userReport] = useState({
    totalUsers: 1234,
    activeUsers: 1156,
    newUsers: 45,
    byAccountType: {
      checking: 892,
      savings: 678,
      business: 123,
      credit: 89
    },
    byStatus: {
      active: 1156,
      pending: 45,
      suspended: 23,
      closed: 10
    },
    topUsers: [
      { name: 'Michael Agbonifo', accounts: 2, balance: 29640.00, transactions: 156 },
      { name: 'Cynthia Ekeh', accounts: 2, balance: 5000.00, transactions: 89 },
      { name: 'Tracy Agbonifo', accounts: 2, balance: 25.00, transactions: 12 }
    ],
    recentRegistrations: [
      { name: 'Bose Agbonifo', date: '2026-02-16', status: 'pending' },
      { name: 'Test User', date: '2026-02-16', status: 'active' },
      { name: 'Tracy Agbonifo', date: '2026-02-15', status: 'active' }
    ]
  });

  const [transactionReport] = useState({
    period: '2026-02-01 to 2026-02-17',
    summary: {
      total: 32450,
      volume: 8923456.78,
      avgSize: 275.00,
      largest: 50000.00
    },
    byStatus: {
      completed: 31234,
      pending: 876,
      failed: 234,
      flagged: 106
    },
    byType: {
      deposit: { count: 10834, volume: 3123456.78 },
      withdrawal: { count: 9876, volume: 2234567.89 },
      transfer: { count: 7654, volume: 2345678.90 },
      payment: { count: 4086, volume: 1223456.78 }
    },
    riskAnalysis: {
      high: 45,
      medium: 234,
      low: 32171
    }
  });

  const handleGenerateReport = () => {
    setGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      if (activeReport === 'daily') setReportData(dailyReport);
      if (activeReport === 'monthly') setReportData(monthlyReport);
      if (activeReport === 'financial') setReportData(financialReport);
      if (activeReport === 'user') setReportData(userReport);
      if (activeReport === 'transaction') setReportData(transactionReport);
      setGenerating(false);
    }, 1500);
  };

  const handleExport = (format) => {
    alert(`Exporting ${activeReport} report as ${format.toUpperCase()}`);
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
    reportTypes: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '10px',
      marginBottom: '20px'
    },
    reportTypeButton: {
      padding: '15px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      background: 'white',
      color: '#333',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.2s'
    },
    activeReportType: {
      background: '#667eea',
      color: 'white'
    },
    controls: {
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
    select: {
      padding: '10px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '150px'
    },
    dateInput: {
      padding: '10px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px'
    },
    generateButton: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginLeft: 'auto'
    },
    reportContainer: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    reportHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #f0f0f0'
    },
    reportTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333'
    },
    reportDate: {
      color: '#666',
      fontSize: '14px'
    },
    exportButtons: {
      display: 'flex',
      gap: '10px'
    },
    exportButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: '1px solid #e0e0e0',
      background: 'white',
      cursor: 'pointer',
      fontSize: '13px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: '#f9f9f9',
      borderRadius: '8px',
      padding: '20px'
    },
    statLabel: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '5px'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333'
    },
    statSub: {
      color: '#22c55e',
      fontSize: '13px',
      marginTop: '5px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      margin: '30px 0 20px 0'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '12px',
      background: '#f8fafc',
      fontSize: '13px',
      fontWeight: '600',
      color: '#333'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '13px'
    },
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    categoryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px',
      borderBottom: '1px solid #f0f0f0'
    },
    loadingOverlay: {
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
    loadingContent: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      textAlign: 'center'
    },
    spinner: {
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Reports & Analytics</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Report Types */}
      <div style={styles.reportTypes}>
        <button 
          style={{...styles.reportTypeButton, ...(activeReport === 'daily' ? styles.activeReportType : {})}}
          onClick={() => setActiveReport('daily')}
        >
          📊 Daily Summary
        </button>
        <button 
          style={{...styles.reportTypeButton, ...(activeReport === 'monthly' ? styles.activeReportType : {})}}
          onClick={() => setActiveReport('monthly')}
        >
          📈 Monthly Report
        </button>
        <button 
          style={{...styles.reportTypeButton, ...(activeReport === 'financial' ? styles.activeReportType : {})}}
          onClick={() => setActiveReport('financial')}
        >
          💰 Financial Statement
        </button>
        <button 
          style={{...styles.reportTypeButton, ...(activeReport === 'user' ? styles.activeReportType : {})}}
          onClick={() => setActiveReport('user')}
        >
          👥 User Analytics
        </button>
        <button 
          style={{...styles.reportTypeButton, ...(activeReport === 'transaction' ? styles.activeReportType : {})}}
          onClick={() => setActiveReport('transaction')}
        >
          💳 Transaction Report
        </button>
      </div>

      {/* Report Controls */}
      <div style={styles.controls}>
        {activeReport === 'daily' && (
          <input
            type="date"
            style={styles.dateInput}
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />
        )}

        {activeReport === 'monthly' && (
          <>
            <select style={styles.select} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="2026-01">January 2026</option>
              <option value="2026-02">February 2026</option>
              <option value="2026-03">March 2026</option>
            </select>
          </>
        )}

        {activeReport === 'financial' && (
          <select style={styles.select} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        )}

        {(activeReport === 'user' || activeReport === 'transaction') && (
          <>
            <input
              type="date"
              style={styles.dateInput}
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
            <span>to</span>
            <input
              type="date"
              style={styles.dateInput}
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </>
        )}

        <button style={styles.generateButton} onClick={handleGenerateReport}>
          Generate Report
        </button>
      </div>

      {/* Report Display */}
      {generating ? (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner}></div>
            <p>Generating report...</p>
          </div>
        </div>
      ) : reportData ? (
        <div style={styles.reportContainer}>
          {/* Report Header */}
          <div style={styles.reportHeader}>
            <div>
              <h2 style={styles.reportTitle}>
                {activeReport === 'daily' && 'Daily Transaction Summary'}
                {activeReport === 'monthly' && 'Monthly Business Report'}
                {activeReport === 'financial' && 'Financial Statement'}
                {activeReport === 'user' && 'User Analytics Report'}
                {activeReport === 'transaction' && 'Transaction Analysis Report'}
              </h2>
              <div style={styles.reportDate}>
                {activeReport === 'daily' && `Date: ${dateRange.startDate}`}
                {activeReport === 'monthly' && `Month: ${selectedMonth}`}
                {activeReport === 'financial' && `As of: ${new Date().toLocaleDateString()}`}
                {(activeReport === 'user' || activeReport === 'transaction') && 
                  `Period: ${dateRange.startDate} to ${dateRange.endDate}`}
              </div>
            </div>
            <div style={styles.exportButtons}>
              <button style={styles.exportButton} onClick={() => handleExport('pdf')}>PDF</button>
              <button style={styles.exportButton} onClick={() => handleExport('csv')}>CSV</button>
              <button style={styles.exportButton} onClick={() => handleExport('excel')}>Excel</button>
            </div>
          </div>

          {/* Daily Report */}
          {activeReport === 'daily' && reportData && (
            <>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Transactions</div>
                  <div style={styles.statValue}>{reportData.summary.totalTransactions.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Volume</div>
                  <div style={styles.statValue}>${reportData.summary.totalVolume.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Average Transaction</div>
                  <div style={styles.statValue}>${reportData.summary.avgTransaction.toFixed(2)}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Unique Customers</div>
                  <div style={styles.statValue}>{reportData.summary.uniqueCustomers}</div>
                </div>
              </div>

              <h3 style={styles.sectionTitle}>Transaction by Type</h3>
              <div style={styles.twoColumnGrid}>
                {Object.entries(reportData.byType).map(([type, data]) => (
                  <div key={type} style={styles.statCard}>
                    <div style={styles.statLabel}>{type.toUpperCase()}</div>
                    <div style={styles.statValue}>{data.count} transactions</div>
                    <div style={styles.statSub}>${data.volume.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <h3 style={styles.sectionTitle}>Top Transactions</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Transaction ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topTransactions.map((tx, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{tx.id}</td>
                      <td style={styles.td}>{tx.customer}</td>
                      <td style={styles.td}>{tx.type}</td>
                      <td style={styles.td}>${tx.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 style={styles.sectionTitle}>Hourly Breakdown</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Hour</th>
                    <th style={styles.th}>Transaction Count</th>
                    <th style={styles.th}>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.hourlyBreakdown.map((hour, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{hour.hour}</td>
                      <td style={styles.td}>{hour.count}</td>
                      <td style={styles.td}>${hour.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Monthly Report */}
          {activeReport === 'monthly' && reportData && (
            <>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Transactions</div>
                  <div style={styles.statValue}>{reportData.summary.totalTransactions.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Volume</div>
                  <div style={styles.statValue}>${reportData.summary.totalVolume.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Active Accounts</div>
                  <div style={styles.statValue}>{reportData.summary.activeAccounts}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Unique Customers</div>
                  <div style={styles.statValue}>{reportData.summary.uniqueCustomers}</div>
                </div>
              </div>

              <h3 style={styles.sectionTitle}>Daily Activity</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Day</th>
                    <th style={styles.th}>Transactions</th>
                    <th style={styles.th}>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.daily.map((day, index) => (
                    <tr key={index}>
                      <td style={styles.td}>Day {day.day}</td>
                      <td style={styles.td}>{day.count}</td>
                      <td style={styles.td}>${day.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 style={styles.sectionTitle}>Transaction by Category</h3>
              <div style={styles.twoColumnGrid}>
                {Object.entries(reportData.byCategory).map(([category, data]) => (
                  <div key={category} style={styles.statCard}>
                    <div style={styles.statLabel}>{category}</div>
                    <div style={styles.statValue}>{data.count} transactions</div>
                    <div style={styles.statSub}>${data.volume.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Financial Report */}
          {activeReport === 'financial' && reportData && (
            <>
              <h3 style={styles.sectionTitle}>Balance Sheet</h3>
              <div style={styles.twoColumnGrid}>
                <div>
                  <h4 style={{marginBottom: '15px'}}>Assets</h4>
                  {Object.entries(reportData.assets).map(([key, value]) => (
                    key !== 'total' && (
                      <div key={key} style={styles.categoryItem}>
                        <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span style={{fontWeight: 'bold'}}>${value.toLocaleString()}</span>
                      </div>
                    )
                  ))}
                  <div style={{...styles.categoryItem, borderTop: '2px solid #333', marginTop: '10px'}}>
                    <span style={{fontWeight: 'bold'}}>Total Assets</span>
                    <span style={{fontWeight: 'bold'}}>${reportData.assets.total.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <h4 style={{marginBottom: '15px'}}>Liabilities</h4>
                  {Object.entries(reportData.liabilities).map(([key, value]) => (
                    key !== 'total' && (
                      <div key={key} style={styles.categoryItem}>
                        <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span>${value.toLocaleString()}</span>
                      </div>
                    )
                  ))}
                  <div style={{...styles.categoryItem, borderTop: '2px solid #333', marginTop: '10px'}}>
                    <span style={{fontWeight: 'bold'}}>Total Liabilities</span>
                    <span style={{fontWeight: 'bold'}}>${reportData.liabilities.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <h3 style={styles.sectionTitle}>Daily Revenue</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.dailyRevenue.map((day, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{day.date}</td>
                      <td style={styles.td}>${day.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* User Report */}
          {activeReport === 'user' && reportData && (
            <>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Users</div>
                  <div style={styles.statValue}>{reportData.totalUsers}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Active Users</div>
                  <div style={styles.statValue}>{reportData.activeUsers}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>New Users</div>
                  <div style={styles.statValue}>{reportData.newUsers}</div>
                </div>
              </div>

              <h3 style={styles.sectionTitle}>Accounts by Type</h3>
              <div style={styles.twoColumnGrid}>
                {Object.entries(reportData.byAccountType).map(([type, count]) => (
                  <div key={type} style={styles.statCard}>
                    <div style={styles.statLabel}>{type}</div>
                    <div style={styles.statValue}>{count}</div>
                  </div>
                ))}
              </div>

              <h3 style={styles.sectionTitle}>Users by Status</h3>
              <div style={styles.twoColumnGrid}>
                {Object.entries(reportData.byStatus).map(([status, count]) => (
                  <div key={status} style={styles.statCard}>
                    <div style={styles.statLabel}>{status}</div>
                    <div style={styles.statValue}>{count}</div>
                  </div>
                ))}
              </div>

              <h3 style={styles.sectionTitle}>Top Users by Balance</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Accounts</th>
                    <th style={styles.th}>Balance</th>
                    <th style={styles.th}>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topUsers.map((user, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{user.name}</td>
                      <td style={styles.td}>{user.accounts}</td>
                      <td style={styles.td}>${user.balance.toLocaleString()}</td>
                      <td style={styles.td}>{user.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Transaction Report */}
          {activeReport === 'transaction' && reportData && (
            <>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Transactions</div>
                  <div style={styles.statValue}>{reportData.summary.total.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Volume</div>
                  <div style={styles.statValue}>${reportData.summary.volume.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Average Size</div>
                  <div style={styles.statValue}>${reportData.summary.avgSize.toFixed(2)}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Largest</div>
                  <div style={styles.statValue}>${reportData.summary.largest.toLocaleString()}</div>
                </div>
              </div>

              <h3 style={styles.sectionTitle}>By Status</h3>
              <div style={styles.twoColumnGrid}>
                {Object.entries(reportData.byStatus).map(([status, count]) => (
                  <div key={status} style={styles.statCard}>
                    <div style={styles.statLabel}>{status}</div>
                    <div style={styles.statValue}>{count}</div>
                  </div>
                ))}
              </div>

              <h3 style={styles.sectionTitle}>By Type</h3>
              <div style={styles.twoColumnGrid}>
                {Object.entries(reportData.byType).map(([type, data]) => (
                  <div key={type} style={styles.statCard}>
                    <div style={styles.statLabel}>{type}</div>
                    <div style={styles.statValue}>{data.count} transactions</div>
                    <div style={styles.statSub}>${data.volume.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <h3 style={styles.sectionTitle}>Risk Analysis</h3>
              <div style={styles.twoColumnGrid}>
                {Object.entries(reportData.riskAnalysis).map(([risk, count]) => (
                  <div key={risk} style={styles.statCard}>
                    <div style={styles.statLabel}>{risk}</div>
                    <div style={styles.statValue}>{count}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{...styles.reportContainer, textAlign: 'center', padding: '60px'}}>
          <p style={{color: '#999'}}>Select report parameters and click Generate Report</p>
        </div>
      )}
    </div>
  );
};

export default AdminReports;