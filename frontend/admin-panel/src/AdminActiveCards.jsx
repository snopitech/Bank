import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8080";

const AdminActiveCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Form states
  const [limitForm, setLimitForm] = useState({
    dailyLimit: '',
    transactionLimit: '',
    monthlyLimit: ''
  });
  
  const [statusForm, setStatusForm] = useState({
    status: '',
    reason: ''
  });
  
  const [designForm, setDesignForm] = useState({
    designColor: '#1E3A8A',
    useDefaultImage: true
  });
  
  const [replaceForm, setReplaceForm] = useState({
    reason: 'LOST',
    expediteShipping: false
  });

  const [printForm, setPrintForm] = useState({
    cardIds: [],
    batchPrint: false
  });

  // Stats
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    frozenCards: 0,
    physicalCards: 0,
    virtualCards: 0,
    totalBalance: 0,
    cardsPerUser: 0
  });

  // Fetch all cards on component mount
  useEffect(() => {
    fetchAllCards();
  }, []);

  const fetchAllCards = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get all users first
      const usersResponse = await fetch(`${API_BASE}/api/users`);
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const users = await usersResponse.json();
      
      let allCards = [];
      let activeCount = 0;
      let frozenCount = 0;
      let physicalCount = 0;
      let virtualCount = 0;
      let totalBalance = 0;
      let usersWithCards = 0;
      
      // Fetch cards for each user
      for (const user of users) {
        let userHasCards = false;
        
        try {
          const cardsResponse = await fetch(`${API_BASE}/api/cards/user/${user.id}`);
          if (cardsResponse.ok) {
            const userCards = await cardsResponse.json();
            
            if (userCards.length > 0) {
              userHasCards = true;
              usersWithCards++;
              
              // Add user info to each card
              const cardsWithUser = userCards.map(card => ({
                ...card,
                userName: `${user.firstName} ${user.lastName}`,
                userEmail: user.email,
                userId: user.id,
                userBalance: user.accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0
              }));
              
              allCards = [...allCards, ...cardsWithUser];
              
              // Update counts
              cardsWithUser.forEach(card => {
                if (card.status === 'ACTIVE') activeCount++;
                if (card.status === 'FROZEN') frozenCount++;
                if (card.cardType === 'PHYSICAL') physicalCount++;
                if (card.cardType === 'VIRTUAL') virtualCount++;
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching cards for user ${user.id}:`, err);
        }
        
        // Add user balance to total
        if (user.accounts) {
          user.accounts.forEach(account => {
            totalBalance += account.balance || 0;
          });
        }
      }
      
      setCards(allCards);
      setStats({
        totalCards: allCards.length,
        activeCards: activeCount,
        frozenCards: frozenCount,
        physicalCards: physicalCount,
        virtualCards: virtualCount,
        totalBalance: totalBalance,
        cardsPerUser: usersWithCards > 0 ? (allCards.length / usersWithCards).toFixed(1) : 0
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCards = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    // This is a placeholder - you'd implement pagination if your API supports it
    setTimeout(() => {
      setHasMore(false);
      setLoadingMore(false);
    }, 1000);
  };

  // Filter cards based on search and status
  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.cardHolderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.cardNumber?.includes(searchTerm) ||
      card.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || card.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (card) => {
    setSelectedCard(card);
    setShowDetailsModal(true);
  };

  const handleViewLimits = async (card) => {
    setSelectedCard(card);
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cards/${card.id}/limits`);
      if (!response.ok) throw new Error('Failed to fetch limits');
      const limits = await response.json();
      setLimitForm({
        dailyLimit: limits.dailyLimit || '',
        transactionLimit: limits.transactionLimit || '',
        monthlyLimit: limits.monthlyLimit || ''
      });
      setShowLimitsModal(true);
    } catch (err) {
      alert('Failed to fetch card limits');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLimits = async () => {
    if (!selectedCard) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cards/${selectedCard.id}/limits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(limitForm)
      });

      if (!response.ok) throw new Error('Failed to update limits');
      
      alert('Card limits updated successfully');
      setShowLimitsModal(false);
      fetchAllCards(); // Refresh data
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedCard || !statusForm.status) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cards/${selectedCard.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusForm.status,
          reason: statusForm.reason
        })
      });

      if (!response.ok) throw new Error('Failed to update card status');
      
      alert(`Card ${statusForm.status.toLowerCase()} successfully`);
      setShowStatusModal(false);
      fetchAllCards(); // Refresh data
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDesign = async () => {
    if (!selectedCard) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cards/${selectedCard.id}/design`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(designForm)
      });

      if (!response.ok) throw new Error('Failed to update card design');
      
      alert('Card design updated successfully');
      setShowDesignModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplaceCard = async () => {
    if (!selectedCard) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cards/${selectedCard.id}/replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replaceForm)
      });

      if (!response.ok) throw new Error('Failed to request card replacement');
      
      alert('Card replacement requested successfully');
      setShowReplaceModal(false);
      fetchAllCards(); // Refresh data
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateCard = async (card) => {
    const pin = prompt('Enter 4-digit PIN to activate card:');
    if (!pin || pin.length !== 4) {
      alert('PIN must be 4 digits');
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cards/${card.id}/activate?pin=${pin}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to activate card');
      
      alert('Card activated successfully');
      fetchAllCards(); // Refresh data
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintCard = async (card) => {
    try {
      const response = await fetch(`${API_BASE}/api/cards/admin/${card.id}/print`);
      if (!response.ok) throw new Error('Failed to get card details for printing');
      
      const cardData = await response.json();
      
      // Create a printable view
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Card Print - ${card.cardHolderName}</title>
            <style>
              body { font-family: monospace; padding: 40px; }
              .card { border: 2px solid #000; padding: 20px; width: 350px; margin: 0 auto; }
              .number { font-size: 18px; letter-spacing: 2px; margin: 10px 0; }
              .name { font-size: 16px; margin: 5px 0; }
              .expiry { font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <div class="card">
              <h3>${cardData.cardHolderName}</h3>
              <div class="number">${cardData.cardNumber}</div>
              <div class="expiry">Expires: ${cardData.expiryDate}</div>
              <div>CVV: ${cardData.cvv}</div>
              <hr>
              <p style="font-size: 12px; color: #999;">This is a system generated card print</p>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      
    } catch (err) {
      alert('Failed to generate print view');
    }
  };

  const handleBatchPrint = () => {
    if (cards.length === 0) {
      alert('No cards to print');
      return;
    }
    
    setPrintForm({ ...printForm, batchPrint: true, cardIds: cards.map(c => c.id) });
    setShowPrintModal(true);
  };

  const executeBatchPrint = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cards/admin/print-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds: printForm.cardIds })
      });
      
      if (!response.ok) throw new Error('Failed to generate batch print');
      
      const data = await response.json();
      
      // Open batch print view
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Batch Card Print</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              .card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
              .card { border: 1px solid #000; padding: 15px; page-break-inside: avoid; }
              .number { font-size: 14px; letter-spacing: 1px; }
              @media print { .card { border: 1px solid #000; } }
            </style>
          </head>
          <body>
            <h2>Batch Card Print - ${new Date().toLocaleDateString()}</h2>
            <div class="card-grid">
              ${data.cards.map(card => `
                <div class="card">
                  <strong>${card.cardHolderName}</strong>
                  <div class="number">${card.cardNumber}</div>
                  <div>Exp: ${card.expiryDate} | CVV: ${card.cvv}</div>
                </div>
              `).join('')}
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      setShowPrintModal(false);
    } catch (err) {
      alert('Failed to generate batch print');
    }
  };

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollWidth - scrollLeft - clientWidth < 100 && hasMore && !loadingMore) {
      loadMoreCards();
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return '#10b981';
      case 'INACTIVE': return '#f59e0b';
      case 'FROZEN': return '#3b82f6';
      case 'BLOCKED': return '#ef4444';
      case 'EXPIRED': return '#6b7280';
      case 'REPLACED': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getCardTypeIcon = (type) => {
    return type === 'PHYSICAL' ? '💳' : '📱';
  };

  const formatCardNumber = (number) => {
    if (!number) return '****-****-****-****';
    return number.replace(/(\d{4})/g, '$1-').slice(0, -1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p>Loading cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '16px' }}>Error: {error}</div>
        <button 
          onClick={fetchAllCards}
          style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    content: {
      padding: '24px'
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
    title: {
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
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#111827'
    },
    filters: {
      background: 'white',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      gap: '16px'
    },
    searchInput: {
      flex: 1,
      padding: '10px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      fontSize: '14px'
    },
    filterSelect: {
      padding: '10px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      fontSize: '14px',
      minWidth: '150px'
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
    card: {
      minWidth: '380px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb',
      transition: 'transform 0.2s, boxShadow 0.2s'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    cardType: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    cardNumber: {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#333',
      letterSpacing: '1px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    },
    cardDetails: {
      marginTop: '16px',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '8px'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '13px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
      flexWrap: 'wrap'
    },
    button: {
      padding: '6px 10px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: '500'
    },
    adminButton: {
      background: '#8b5cf6',
      color: 'white'
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
    modalOverlay: {
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
      padding: '24px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    modalFooter: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Card Management</h1>
          <div>
            <button 
              style={{ ...styles.backButton, marginRight: '12px', background: '#8b5cf6' }}
              onClick={handleBatchPrint}
            >
              🖨️ Batch Print
            </button>
            <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Cards</div>
            <div style={styles.statValue}>{stats.totalCards.toLocaleString()}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active</div>
            <div style={styles.statValue}>{stats.activeCards.toLocaleString()}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Frozen</div>
            <div style={styles.statValue}>{stats.frozenCards.toLocaleString()}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Physical</div>
            <div style={styles.statValue}>{stats.physicalCards.toLocaleString()}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Virtual</div>
            <div style={styles.statValue}>{stats.virtualCards.toLocaleString()}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Cards/User</div>
            <div style={styles.statValue}>{stats.cardsPerUser}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Search by card holder, user, email, or card number..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            style={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="FROZEN">Frozen</option>
            <option value="BLOCKED">Blocked</option>
            <option value="EXPIRED">Expired</option>
            <option value="REPLACED">Replaced</option>
          </select>
        </div>

        {/* Horizontal Scrollable Cards Gallery */}
        <div style={styles.gallerySection}>
          <div style={styles.galleryHeader}>
            <h2 style={styles.galleryTitle}>Card Gallery</h2>
            <span style={styles.scrollHint}>Scroll right →</span>
          </div>
          
          <div 
            style={styles.cardsContainer}
            onScroll={handleScroll}
          >
            {filteredCards.map(card => (
              <div 
                key={card.id} 
                style={styles.card}
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
                  <div style={styles.cardType}>
                    <span style={{ fontSize: '24px' }}>{getCardTypeIcon(card.cardType)}</span>
                    <span style={{ fontWeight: '600' }}>{card.cardType}</span>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: `${getStatusColor(card.status)}20`,
                    color: getStatusColor(card.status)
                  }}>
                    {card.status}
                  </span>
                </div>
                
                <div style={styles.cardNumber}>
                  {formatCardNumber(card.cardNumber)}
                </div>
                
                <div style={styles.cardDetails}>
                  <div style={styles.detailRow}>
                    <span>Card Holder:</span>
                    <span style={{ fontWeight: '500' }}>{card.cardHolderName}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Expires:</span>
                    <span>{card.expiryDate}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>User:</span>
                    <span>{card.userName}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>User Balance:</span>
                    <span>{formatCurrency(card.userBalance || 0)}</span>
                  </div>
                </div>

                <div style={styles.buttonGroup}>
                  <button 
                    style={{ ...styles.button, background: '#3b82f6', color: 'white' }}
                    onClick={() => handleViewDetails(card)}
                  >
                    View
                  </button>
                  
                  {card.status === 'INACTIVE' && (
                    <button 
                      style={{ ...styles.button, background: '#10b981', color: 'white' }}
                      onClick={() => handleActivateCard(card)}
                    >
                      Activate
                    </button>
                  )}
                  
                  <button 
                    style={{ ...styles.button, background: '#8b5cf6', color: 'white' }}
                    onClick={() => handleViewLimits(card)}
                  >
                    Limits
                  </button>
                  
                  <button 
                    style={{ ...styles.button, background: '#f59e0b', color: 'white' }}
                    onClick={() => { setSelectedCard(card); setShowStatusModal(true); }}
                  >
                    Status
                  </button>
                  
                  <button 
                    style={{ ...styles.button, background: '#6366f1', color: 'white' }}
                    onClick={() => { setSelectedCard(card); setShowDesignModal(true); }}
                  >
                    Design
                  </button>
                  
                  <button 
                    style={{ ...styles.button, background: '#ef4444', color: 'white' }}
                    onClick={() => { setSelectedCard(card); setShowReplaceModal(true); }}
                  >
                    Replace
                  </button>

                  <button 
                    style={{ ...styles.button, ...styles.adminButton }}
                    onClick={() => handlePrintCard(card)}
                  >
                    Print
                  </button>
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

        {/* Beautiful Footer Section */}
        <div style={styles.footer}>
          <div style={styles.footerGrid}>
            {/* About Section */}
            <div>
              <h3 style={styles.footerTitle}>About Card Management</h3>
              <p style={styles.footerText}>
                Complete control over all bank-issued cards. Monitor status, update limits, 
                manage security, and handle replacements from one centralized dashboard.
              </p>
              <div>
                <span style={styles.footerBadge}>💳 Real-time status</span>
                <span style={styles.footerBadge}>🔒 PCI compliant</span>
                <span style={styles.footerBadge}>📊 Usage tracking</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 style={styles.footerTitle}>Card Statistics</h3>
              <ul style={styles.footerStats}>
                <li style={styles.footerStatItem}>
                  <span style={{ color: '#cbd5e1' }}>Active Rate</span>
                  <span style={{ fontWeight: '600', color: 'white' }}>
                    {stats.totalCards > 0 ? ((stats.activeCards / stats.totalCards) * 100).toFixed(1) : 0}%
                  </span>
                </li>
                <li style={styles.footerStatItem}>
                  <span style={{ color: '#cbd5e1' }}>Physical/Virtual Ratio</span>
                  <span style={{ fontWeight: '600', color: 'white' }}>
                    {stats.physicalCards}:{stats.virtualCards}
                  </span>
                </li>
                <li style={styles.footerStatItem}>
                  <span style={{ color: '#cbd5e1' }}>Frozen Cards</span>
                  <span style={{ fontWeight: '600', color: '#f59e0b' }}>{stats.frozenCards}</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 style={styles.footerTitle}>Quick Actions</h3>
              <a href="#" style={styles.footerLink}>📋 View All Cards</a>
              <a href="#" style={styles.footerLink}>🔍 Search by User</a>
              <a href="#" style={styles.footerLink}>📊 Generate Card Report</a>
              <a href="#" style={styles.footerLink}>🖨️ Batch Print Cards</a>
            </div>

            {/* Support */}
            <div>
              <h3 style={styles.footerTitle}>Card Support</h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '12px' }}>
                Need help with card management?
              </p>
              <div style={{ background: '#334155', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>📞 +1 (713) 870-1132</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>✉️ cards@snopitech.com</div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={styles.footerBottom}>
            <div>
              © 2026 SnopitechBank Card Management System. All card data is PCI compliant.
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Security</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Compliance</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Audit Log</a>
            </div>
          </div>
        </div>
      </div>

      {/* All Modals */}
      {/* Details Modal */}
      {showDetailsModal && selectedCard && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Card Details</h2>
              <button style={styles.closeButton} onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            
            <div>
              <p><strong>Card ID:</strong> {selectedCard.id}</p>
              <p><strong>Card Number:</strong> {selectedCard.cardNumber}</p>
              <p><strong>Card Holder:</strong> {selectedCard.cardHolderName}</p>
              <p><strong>Type:</strong> {selectedCard.cardType}</p>
              <p><strong>Status:</strong> {selectedCard.status}</p>
              <p><strong>Expiry:</strong> {selectedCard.expiryDate}</p>
              <p><strong>Virtual:</strong> {selectedCard.isVirtual ? 'Yes' : 'No'}</p>
              <p><strong>Issued:</strong> {new Date(selectedCard.issuedDate).toLocaleString()}</p>
              {selectedCard.lastUsedDate && (
                <p><strong>Last Used:</strong> {new Date(selectedCard.lastUsedDate).toLocaleString()}</p>
              )}
              <p><strong>User:</strong> {selectedCard.userName}</p>
              <p><strong>Email:</strong> {selectedCard.userEmail}</p>
              <p><strong>User ID:</strong> {selectedCard.userId}</p>
              {selectedCard.designColor && (
                <p><strong>Design Color:</strong> <span style={{ color: selectedCard.designColor }}>⬤</span> {selectedCard.designColor}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Limits Modal */}
      {showLimitsModal && selectedCard && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Card Limits</h2>
              <button style={styles.closeButton} onClick={() => setShowLimitsModal(false)}>×</button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Daily Limit ($)</label>
              <input
                type="number"
                style={styles.input}
                value={limitForm.dailyLimit}
                onChange={(e) => setLimitForm({ ...limitForm, dailyLimit: e.target.value })}
                placeholder="0.00"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Transaction Limit ($)</label>
              <input
                type="number"
                style={styles.input}
                value={limitForm.transactionLimit}
                onChange={(e) => setLimitForm({ ...limitForm, transactionLimit: e.target.value })}
                placeholder="0.00"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Monthly Limit ($)</label>
              <input
                type="number"
                style={styles.input}
                value={limitForm.monthlyLimit}
                onChange={(e) => setLimitForm({ ...limitForm, monthlyLimit: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div style={styles.modalFooter}>
              <button style={{ ...styles.button, background: '#e5e7eb' }} onClick={() => setShowLimitsModal(false)}>
                Cancel
              </button>
              <button style={{ ...styles.button, background: '#3b82f6', color: 'white' }} onClick={handleUpdateLimits}>
                Update Limits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedCard && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Update Card Status</h2>
              <button style={styles.closeButton} onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select style={styles.select} value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                <option value="">Select status</option>
                <option value="ACTIVE">Active</option>
                <option value="FROZEN">Frozen</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Reason</label>
              <input
                type="text"
                style={styles.input}
                value={statusForm.reason}
                onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                placeholder="Reason for status change"
              />
            </div>

            <div style={styles.modalFooter}>
              <button style={{ ...styles.button, background: '#e5e7eb' }} onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
              <button style={{ ...styles.button, background: '#3b82f6', color: 'white' }} onClick={handleUpdateStatus}>
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Design Modal */}
      {showDesignModal && selectedCard && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Update Card Design</h2>
              <button style={styles.closeButton} onClick={() => setShowDesignModal(false)}>×</button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Design Color</label>
              <input
                type="color"
                style={{ ...styles.input, height: '50px' }}
                value={designForm.designColor}
                onChange={(e) => setDesignForm({ ...designForm, designColor: e.target.value })}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={designForm.useDefaultImage}
                  onChange={(e) => setDesignForm({ ...designForm, useDefaultImage: e.target.checked })}
                />
                Use default card image
              </label>
            </div>

            <div style={styles.modalFooter}>
              <button style={{ ...styles.button, background: '#e5e7eb' }} onClick={() => setShowDesignModal(false)}>
                Cancel
              </button>
              <button style={{ ...styles.button, background: '#3b82f6', color: 'white' }} onClick={handleUpdateDesign}>
                Update Design
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Modal */}
      {showReplaceModal && selectedCard && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Replace Card</h2>
              <button style={styles.closeButton} onClick={() => setShowReplaceModal(false)}>×</button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Reason</label>
              <select style={styles.select} value={replaceForm.reason} onChange={(e) => setReplaceForm({ ...replaceForm, reason: e.target.value })}>
                <option value="LOST">Lost</option>
                <option value="STOLEN">Stolen</option>
                <option value="DAMAGED">Damaged</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={replaceForm.expediteShipping}
                  onChange={(e) => setReplaceForm({ ...replaceForm, expediteShipping: e.target.checked })}
                />
                Expedite Shipping
              </label>
            </div>

            <div style={styles.modalFooter}>
              <button style={{ ...styles.button, background: '#e5e7eb' }} onClick={() => setShowReplaceModal(false)}>
                Cancel
              </button>
              <button style={{ ...styles.button, background: '#ef4444', color: 'white' }} onClick={handleReplaceCard}>
                Request Replacement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Print Modal */}
      {showPrintModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Batch Print Cards</h2>
              <button style={styles.closeButton} onClick={() => setShowPrintModal(false)}>×</button>
            </div>
            
            <p>You are about to print {cards.length} cards.</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              This will generate a printable document with all card details.
            </p>

            <div style={styles.modalFooter}>
              <button style={{ ...styles.button, background: '#e5e7eb' }} onClick={() => setShowPrintModal(false)}>
                Cancel
              </button>
              <button style={{ ...styles.button, background: '#8b5cf6', color: 'white' }} onClick={executeBatchPrint}>
                Generate Batch Print
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default AdminActiveCards;