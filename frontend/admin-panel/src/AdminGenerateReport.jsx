import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminGenerateReport = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState('custom');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [format, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [scheduleReport, setScheduleReport] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const reportTypes = [
    { 
      id: 'daily-transactions', 
      name: 'Daily Transaction Report', 
      icon: '📊',
      description: 'Summary of all transactions for a specific day',
      categories: ['transactions', 'daily']
    },
    { 
      id: 'monthly-statement', 
      name: 'Monthly Account Statement', 
      icon: '📑',
      description: 'Complete account statement for a month',
      categories: ['accounts', 'monthly']
    },
    { 
      id: 'user-activity', 
      name: 'User Activity Report', 
      icon: '👥',
      description: 'User registrations, logins, and activity',
      categories: ['users', 'activity']
    },
    { 
      id: 'financial-summary', 
      name: 'Financial Summary', 
      icon: '💰',
      description: 'Bank-wide financial metrics and balances',
      categories: ['financial', 'summary']
    },
    { 
      id: 'transaction-volume', 
      name: 'Transaction Volume Analysis', 
      icon: '📈',
      description: 'Analysis of transaction volumes by type',
      categories: ['transactions', 'analytics']
    },
    { 
      id: 'fraud-detection', 
      name: 'Fraud Detection Report', 
      icon: '🚩',
      description: 'Flagged and suspicious transactions',
      categories: ['security', 'fraud']
    },
    { 
      id: 'card-usage', 
      name: 'Card Usage Report', 
      icon: '💳',
      description: 'Card transaction patterns and limits',
      categories: ['cards', 'usage']
    },
    { 
      id: 'fee-analysis', 
      name: 'Fee Analysis Report', 
      icon: '💸',
      description: 'Fee collection and waiver analysis',
      categories: ['financial', 'fees']
    },
    { 
      id: 'customer-onboarding', 
      name: 'Customer Onboarding Report', 
      icon: '🚀',
      description: 'New customer registrations and account openings',
      categories: ['users', 'onboarding']
    },
    { 
      id: 'loan-portfolio', 
      name: 'Loan Portfolio Report', 
      icon: '🏦',
      description: 'Loan balances, payments, and performance',
      categories: ['loans', 'portfolio']
    },
    { 
      id: 'currency-exchange', 
      name: 'Currency Exchange Report', 
      icon: '💱',
      description: 'Foreign currency orders and rates',
      categories: ['currency', 'exchange']
    },
    { 
      id: 'audit-log', 
      name: 'Audit Log Report', 
      icon: '📋',
      description: 'Admin actions and system changes',
      categories: ['audit', 'security']
    }
  ];

  const dateRangeOptions = [
    { id: 'today', name: 'Today' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'last7days', name: 'Last 7 Days' },
    { id: 'last30days', name: 'Last 30 Days' },
    { id: 'thisMonth', name: 'This Month' },
    { id: 'lastMonth', name: 'Last Month' },
    { id: 'thisQuarter', name: 'This Quarter' },
    { id: 'lastQuarter', name: 'Last Quarter' },
    { id: 'thisYear', name: 'This Year' },
    { id: 'lastYear', name: 'Last Year' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const formatOptions = [
    { id: 'pdf', name: 'PDF Document', icon: '📄', description: 'Printable document with formatting' },
    { id: 'csv', name: 'CSV File', icon: '📊', description: 'Spreadsheet compatible data' },
    { id: 'excel', name: 'Excel Spreadsheet', icon: '📗', description: 'Microsoft Excel format' },
    { id: 'json', name: 'JSON Data', icon: '📦', description: 'Raw data for developers' },
    { id: 'html', name: 'HTML Page', icon: '🌐', description: 'Web page format' }
  ];

  const scheduleOptions = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'quarterly', name: 'Quarterly' }
  ];

  const handleReportTypeSelect = (type) => {
    setReportType(type);
    setStep(2);
  };

  const handleGenerateReport = () => {
    if (!startDate && dateRange === 'custom') {
      alert('Please select start date');
      return;
    }

    setGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      const report = reportTypes.find(r => r.id === reportType);
      const now = new Date();
      
      setGeneratedReport({
        id: 'RPT-' + Math.floor(Math.random() * 10000),
        name: report.name,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        format: format,
        size: Math.floor(Math.random() * 5000) + 500 + ' KB',
        pages: Math.floor(Math.random() * 50) + 5,
        generatedBy: 'Admin User'
      });

      setGenerating(false);
      setStep(4);
    }, 3000);
  };

  const handleDownload = () => {
    alert(`Downloading ${generatedReport.name} as ${format.toUpperCase()}`);
  };

  const handleEmailReport = () => {
    if (!scheduleEmail) {
      alert('Please enter an email address');
      return;
    }
    alert(`Report will be sent to ${scheduleEmail}`);
  };

  const resetForm = () => {
    setStep(1);
    setReportType('');
    setDateRange('custom');
    setStartDate('');
    setEndDate('');
    setSelectedAccounts([]);
    setSelectedCustomers([]);
    setFormat('pdf');
    setIncludeCharts(true);
    setIncludeSummary(true);
    setIncludeDetails(true);
    setScheduleReport(false);
    setScheduleFrequency('daily');
    setScheduleEmail('');
    setGeneratedReport(null);
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
      maxWidth: '800px',
      margin: '0 auto'
    },
    reportTypesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '15px',
      marginTop: '20px'
    },
    reportTypeCard: {
      padding: '20px',
      border: '2px solid #f0f0f0',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    reportTypeIcon: {
      fontSize: '32px',
      marginBottom: '10px'
    },
    reportTypeName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '5px'
    },
    reportTypeDesc: {
      fontSize: '12px',
      color: '#666'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '2px solid #f0f0f0'
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '20px'
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
    dateInputs: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginTop: '10px'
    },
    checkboxGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '20px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    checkboxLabel: {
      fontSize: '14px',
      color: '#333'
    },
    radioGroup: {
      display: 'flex',
      gap: '15px',
      marginBottom: '15px'
    },
    radio: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    formatCard: {
      padding: '15px',
      border: '2px solid #f0f0f0',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center'
    },
    formatIcon: {
      fontSize: '24px',
      marginBottom: '5px'
    },
    formatName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    scheduleSection: {
      background: '#f9f9f9',
      padding: '20px',
      borderRadius: '8px',
      marginTop: '20px'
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
    reportDetails: {
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
    buttonGroup: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginTop: '20px'
    },
    downloadButton: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    emailButton: {
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Generate Report</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Step Indicator */}
      {!generating && step < 4 && (
        <div style={styles.stepIndicator}>
          <div style={styles.stepItem}>
            <div style={{...styles.stepCircle, ...(step >= 1 ? styles.stepActive : styles.stepInactive)}}>1</div>
            <span style={{color: step >= 1 ? '#333' : '#999'}}>Select Report Type</span>
          </div>
          <div style={styles.stepItem}>
            <div style={{...styles.stepCircle, ...(step >= 2 ? styles.stepActive : styles.stepInactive)}}>2</div>
            <span style={{color: step >= 2 ? '#333' : '#999'}}>Configure Parameters</span>
          </div>
          <div style={styles.stepItem}>
            <div style={{...styles.stepCircle, ...(step >= 3 ? styles.stepActive : styles.stepInactive)}}>3</div>
            <span style={{color: step >= 3 ? '#333' : '#999'}}>Generate Report</span>
          </div>
        </div>
      )}

      {/* Step 1: Select Report Type */}
      {step === 1 && (
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>Select Report Type</h2>
          
          <div style={styles.reportTypesGrid}>
            {reportTypes.map(type => (
              <div
                key={type.id}
                style={{
                  ...styles.reportTypeCard,
                  borderColor: reportType === type.id ? '#667eea' : '#f0f0f0',
                  background: reportType === type.id ? '#f5f3ff' : 'white'
                }}
                onClick={() => handleReportTypeSelect(type.id)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={styles.reportTypeIcon}>{type.icon}</div>
                <div style={styles.reportTypeName}>{type.name}</div>
                <div style={styles.reportTypeDesc}>{type.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Configure Parameters */}
      {step === 2 && reportType && (
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>Configure Report Parameters</h2>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Date Range</label>
            <select
              style={styles.select}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              {dateRangeOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>

          {dateRange === 'custom' && (
            <div style={styles.dateInputs}>
              <div>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>End Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Output Format</label>
            <div style={styles.grid2}>
              {formatOptions.map(opt => (
                <div
                  key={opt.id}
                  style={{
                    ...styles.formatCard,
                    borderColor: format === opt.id ? '#667eea' : '#f0f0f0',
                    background: format === opt.id ? '#f5f3ff' : 'white'
                  }}
                  onClick={() => setFormat(opt.id)}
                >
                  <div style={styles.formatIcon}>{opt.icon}</div>
                  <div style={styles.formatName}>{opt.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={includeSummary}
                onChange={(e) => setIncludeSummary(e.target.checked)}
              />
              <span style={styles.checkboxLabel}>Include Executive Summary</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
              />
              <span style={styles.checkboxLabel}>Include Charts & Graphs</span>
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
              />
              <span style={styles.checkboxLabel}>Include Detailed Data</span>
            </label>
          </div>

          <div style={styles.scheduleSection}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={scheduleReport}
                onChange={(e) => setScheduleReport(e.target.checked)}
              />
              <span style={styles.checkboxLabel}>Schedule this report</span>
            </label>

            {scheduleReport && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Frequency</label>
                  <select
                    style={styles.select}
                    value={scheduleFrequency}
                    onChange={(e) => setScheduleFrequency(e.target.value)}
                  >
                    {scheduleOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={scheduleEmail}
                    onChange={(e) => setScheduleEmail(e.target.value)}
                    placeholder="admin@snopitech.com"
                  />
                </div>
              </>
            )}
          </div>

          <button
            style={styles.button}
            onClick={() => setStep(3)}
          >
            Continue to Generate
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => setStep(1)}
          >
            ← Back to Report Types
          </button>
        </div>
      )}

      {/* Step 3: Confirm and Generate */}
      {step === 3 && reportType && (
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>Review and Generate Report</h2>
          
          <div style={styles.reportDetails}>
            <div style={styles.detailRow}>
              <span>Report Type:</span>
              <span style={{fontWeight: 'bold'}}>{reportTypes.find(r => r.id === reportType)?.name}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Date Range:</span>
              <span style={{fontWeight: 'bold'}}>
                {dateRange === 'custom' 
                  ? `${startDate} to ${endDate}`
                  : dateRangeOptions.find(d => d.id === dateRange)?.name}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span>Format:</span>
              <span style={{fontWeight: 'bold'}}>{formatOptions.find(f => f.id === format)?.name}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Include Charts:</span>
              <span style={{fontWeight: 'bold'}}>{includeCharts ? 'Yes' : 'No'}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Include Summary:</span>
              <span style={{fontWeight: 'bold'}}>{includeSummary ? 'Yes' : 'No'}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Include Details:</span>
              <span style={{fontWeight: 'bold'}}>{includeDetails ? 'Yes' : 'No'}</span>
            </div>
            {scheduleReport && (
              <>
                <div style={styles.detailRow}>
                  <span>Scheduled:</span>
                  <span style={{fontWeight: 'bold'}}>Yes ({scheduleFrequency})</span>
                </div>
                <div style={styles.detailRow}>
                  <span>Email:</span>
                  <span style={{fontWeight: 'bold'}}>{scheduleEmail}</span>
                </div>
              </>
            )}
          </div>

          <button
            style={styles.button}
            onClick={handleGenerateReport}
          >
            Generate Report
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => setStep(2)}
          >
            ← Back to Configuration
          </button>
        </div>
      )}

      {/* Step 4: Report Generated */}
      {step === 4 && generatedReport && (
        <div style={styles.content}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={{color: '#22c55e', marginBottom: '20px'}}>Report Generated Successfully!</h2>
            
            <div style={styles.reportDetails}>
              <div style={styles.detailRow}>
                <span>Report Name:</span>
                <span style={{fontWeight: 'bold'}}>{generatedReport.name}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Report ID:</span>
                <span style={{fontWeight: 'bold'}}>{generatedReport.id}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Generated:</span>
                <span style={{fontWeight: 'bold'}}>{generatedReport.date} at {generatedReport.time}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Format:</span>
                <span style={{fontWeight: 'bold'}}>{format.toUpperCase()}</span>
              </div>
              <div style={styles.detailRow}>
                <span>File Size:</span>
                <span style={{fontWeight: 'bold'}}>{generatedReport.size}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Pages:</span>
                <span style={{fontWeight: 'bold'}}>{generatedReport.pages}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Generated By:</span>
                <span style={{fontWeight: 'bold'}}>{generatedReport.generatedBy}</span>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button style={styles.downloadButton} onClick={handleDownload}>
                ⬇️ Download Report
              </button>
              <button style={styles.emailButton} onClick={handleEmailReport}>
                📧 Email Report
              </button>
            </div>

            <button
              style={styles.secondaryButton}
              onClick={resetForm}
            >
              Generate Another Report
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {generating && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner}></div>
            <p>Generating your report...</p>
            <p style={{fontSize: '12px', color: '#666'}}>This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenerateReport;
