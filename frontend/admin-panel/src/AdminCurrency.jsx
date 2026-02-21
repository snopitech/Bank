import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminCurrency = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rates'); // 'rates', 'orders', 'history'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editRate, setEditRate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newRate, setNewRate] = useState('');

  // Exchange rates data
  const [exchangeRates, setExchangeRates] = useState([
    { id: 1, from: 'USD', to: 'EUR', rate: 0.92, symbol: '€', country: 'Eurozone', change: '+0.2%', volume: 'High' },
    { id: 2, from: 'USD', to: 'GBP', rate: 0.79, symbol: '£', country: 'United Kingdom', change: '-0.1%', volume: 'High' },
    { id: 3, from: 'USD', to: 'JPY', rate: 148.50, symbol: '¥', country: 'Japan', change: '+0.5%', volume: 'High' },
    { id: 4, from: 'USD', to: 'CAD', rate: 1.35, symbol: 'C$', country: 'Canada', change: '+0.1%', volume: 'Medium' },
    { id: 5, from: 'USD', to: 'AUD', rate: 1.52, symbol: 'A$', country: 'Australia', change: '-0.3%', volume: 'Medium' },
    { id: 6, from: 'USD', to: 'CHF', rate: 0.88, symbol: 'CHF', country: 'Switzerland', change: '+0.4%', volume: 'Low' },
    { id: 7, from: 'USD', to: 'CNY', rate: 7.19, symbol: '¥', country: 'China', change: '0.0%', volume: 'Medium' },
    { id: 8, from: 'USD', to: 'INR', rate: 83.12, symbol: '₹', country: 'India', change: '+0.3%', volume: 'Medium' },
    { id: 9, from: 'USD', to: 'MXN', rate: 16.95, symbol: '$', country: 'Mexico', change: '-0.2%', volume: 'Low' },
    { id: 10, from: 'USD', to: 'BRL', rate: 4.97, symbol: 'R$', country: 'Brazil', change: '+0.7%', volume: 'Low' },
    { id: 11, from: 'USD', to: 'ZAR', rate: 18.76, symbol: 'R', country: 'South Africa', change: '+0.1%', volume: 'Low' },
    { id: 12, from: 'USD', to: 'SGD', rate: 1.34, symbol: 'S$', country: 'Singapore', change: '0.0%', volume: 'Low' },
    { id: 13, from: 'USD', to: 'NGN', rate: 1550.50, symbol: '₦', country: 'Nigeria', change: '+1.2%', volume: 'Medium' },
    { id: 14, from: 'USD', to: 'KES', rate: 145.30, symbol: 'KSh', country: 'Kenya', change: '+0.4%', volume: 'Low' },
    { id: 15, from: 'USD', to: 'EGP', rate: 48.50, symbol: 'E£', country: 'Egypt', change: '-0.5%', volume: 'Low' }
  ]);

  // Currency orders
  const [currencyOrders] = useState([
    {
      id: 'ORD-1001',
      orderNumber: 'FX20260216001',
      customer: 'Michael Agbonifo',
      email: 'michael@snopitech.com',
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      fromAmount: 500.00,
      toAmount: 460.00,
      exchangeRate: 0.92,
      fee: 10.00,
      deliveryMethod: 'BRANCH_PICKUP',
      status: 'COMPLETED',
      orderDate: '2026-02-16 10:30 AM',
      deliveryDate: '2026-02-17',
      trackingNumber: 'FX20260216001'
    },
    {
      id: 'ORD-1002',
      orderNumber: 'FX20260216002',
      customer: 'Cynthia Ekeh',
      email: 'cynthiaekeh360@gmail.com',
      fromCurrency: 'USD',
      toCurrency: 'GBP',
      fromAmount: 1000.00,
      toAmount: 790.00,
      exchangeRate: 0.79,
      fee: 15.00,
      deliveryMethod: 'HOME_DELIVERY',
      deliveryAddress: '12902 trail hollow ct, Pearland, TX 77584',
      status: 'PROCESSING',
      orderDate: '2026-02-16 02:15 PM',
      deliveryDate: '2026-02-19',
      trackingNumber: 'FX20260216002'
    },
    {
      id: 'ORD-1003',
      orderNumber: 'FX20260215003',
      customer: 'Tracy Agbonifo',
      email: 'tracy@email.com',
      fromCurrency: 'USD',
      toCurrency: 'JPY',
      fromAmount: 2000.00,
      toAmount: 297000.00,
      exchangeRate: 148.50,
      fee: 20.00,
      deliveryMethod: 'BRANCH_PICKUP',
      status: 'PENDING',
      orderDate: '2026-02-15 11:45 AM',
      deliveryDate: '2026-02-16',
      trackingNumber: 'FX20260215003'
    },
    {
      id: 'ORD-1004',
      orderNumber: 'FX20260215004',
      customer: 'Bose Agbonifo',
      email: 'bose@email.com',
      fromCurrency: 'USD',
      toCurrency: 'CAD',
      fromAmount: 750.00,
      toAmount: 1012.50,
      exchangeRate: 1.35,
      fee: 10.00,
      deliveryMethod: 'HOME_DELIVERY',
      deliveryAddress: '3727 slocom drive, Houston, TX 77095',
      status: 'CANCELLED',
      orderDate: '2026-02-15 09:20 AM',
      deliveryDate: null,
      trackingNumber: 'FX20260215004'
    },
    {
      id: 'ORD-1005',
      orderNumber: 'FX20260214005',
      customer: 'Michael Agbonifo',
      email: 'michael@snopitech.com',
      fromCurrency: 'USD',
      toCurrency: 'NGN',
      fromAmount: 300.00,
      toAmount: 465150.00,
      exchangeRate: 1550.50,
      fee: 5.00,
      deliveryMethod: 'BRANCH_PICKUP',
      status: 'COMPLETED',
      orderDate: '2026-02-14 03:30 PM',
      deliveryDate: '2026-02-15',
      trackingNumber: 'FX20260214005'
    }
  ]);

  const [rateHistory] = useState([
    { id: 1, from: 'USD', to: 'EUR', rate: 0.91, date: '2026-02-15', time: '09:00 AM' },
    { id: 2, from: 'USD', to: 'EUR', rate: 0.92, date: '2026-02-15', time: '12:00 PM' },
    { id: 3, from: 'USD', to: 'EUR', rate: 0.92, date: '2026-02-15', time: '03:00 PM' },
    { id: 4, from: 'USD', to: 'EUR', rate: 0.92, date: '2026-02-16', time: '09:00 AM' },
    { id: 5, from: 'USD', to: 'EUR', rate: 0.92, date: '2026-02-16', time: '12:00 PM' },
    { id: 6, from: 'USD', to: 'GBP', rate: 0.78, date: '2026-02-15', time: '09:00 AM' },
    { id: 7, from: 'USD', to: 'GBP', rate: 0.79, date: '2026-02-15', time: '12:00 PM' },
    { id: 8, from: 'USD', to: 'GBP', rate: 0.79, date: '2026-02-16', time: '09:00 AM' }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return '#22c55e';
      case 'PROCESSING': return '#eab308';
      case 'PENDING': return '#3b82f6';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleUpdateRate = (rate) => {
    setEditRate(rate);
    setNewRate(rate.rate.toString());
    setShowEditModal(true);
  };

  const submitRateUpdate = () => {
    if (!newRate || isNaN(parseFloat(newRate))) {
      alert('Please enter a valid rate');
      return;
    }
    alert(`Rate for ${editRate.from}/${editRate.to} updated to ${newRate}`);
    setShowEditModal(false);
    setEditRate(null);
    setNewRate('');
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    alert(`Order ${orderId} status updated to ${newStatus}`);
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
      marginBottom: '20px'
    },
    tab: {
      padding: '12px 24px',
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
    table: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'auto'
    },
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      padding: '15px',
      background: '#f8fafc',
      borderRadius: '8px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px'
    },
    ordersHeader: {
      gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1.5fr 1.5fr 1.5fr'
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      alignItems: 'center'
    },
    ordersRow: {
      gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1.5fr 1.5fr 1.5fr'
    },
    rateCell: {
      fontWeight: 'bold',
      color: '#333'
    },
    changePositive: {
      color: '#22c55e',
      fontSize: '12px'
    },
    changeNegative: {
      color: '#ef4444',
      fontSize: '12px'
    },
    editButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer'
    },
    viewButton: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      marginRight: '8px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      width: '90px'
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
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333'
    },
    modalText: {
      marginBottom: '20px',
      color: '#666'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '20px'
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
        <h1 style={styles.headerTitle}>Foreign Currency Management</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button 
          style={{...styles.tab, ...(activeTab === 'rates' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('rates')}
        >
          💱 Exchange Rates
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'orders' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('orders')}
        >
          📦 Currency Orders
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'history' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('history')}
        >
          📊 Rate History
        </button>
      </div>

      {/* Stats Cards - Shown on all tabs */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Active Currencies</div>
          <div style={styles.statValue}>{exchangeRates.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pending Orders</div>
          <div style={{...styles.statValue, color: '#eab308'}}>
            {currencyOrders.filter(o => o.status === 'PENDING').length}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Processing</div>
          <div style={{...styles.statValue, color: '#3b82f6'}}>
            {currencyOrders.filter(o => o.status === 'PROCESSING').length}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Volume</div>
          <div style={styles.statValue}>
            ${currencyOrders.reduce((sum, o) => sum + o.fromAmount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Exchange Rates Tab */}
      {activeTab === 'rates' && (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div>Currency</div>
            <div>Country</div>
            <div>Rate (USD → )</div>
            <div>Change</div>
            <div>Volume</div>
            <div>Actions</div>
          </div>
          
          {exchangeRates.map((rate) => (
            <div key={rate.id} style={styles.tableRow}>
              <div style={{fontWeight: '500'}}>
                {rate.symbol} {rate.to}
              </div>
              <div style={{color: '#666'}}>{rate.country}</div>
              <div style={styles.rateCell}>{rate.rate.toFixed(4)}</div>
              <div>
                <span style={rate.change.includes('+') ? styles.changePositive : styles.changeNegative}>
                  {rate.change}
                </span>
              </div>
              <div>
                <span style={{color: rate.volume === 'High' ? '#22c55e' : rate.volume === 'Medium' ? '#eab308' : '#666'}}>
                  {rate.volume}
                </span>
              </div>
              <div>
                <button 
                  style={styles.editButton}
                  onClick={() => handleUpdateRate(rate)}
                >
                  Update Rate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Currency Orders Tab */}
      {activeTab === 'orders' && (
        <div style={styles.table}>
          <div style={{...styles.tableHeader, ...styles.ordersHeader}}>
            <div>Order #</div>
            <div>Customer</div>
            <div>From</div>
            <div>To</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          {currencyOrders.map((order) => (
            <div key={order.id} style={{...styles.tableRow, ...styles.ordersRow}}>
              <div style={{fontSize: '12px', fontWeight: '500'}}>{order.orderNumber}</div>
              <div>
                <div style={{fontWeight: '500'}}>{order.customer}</div>
                <div style={{color: '#666', fontSize: '11px'}}>{order.email}</div>
              </div>
              <div>{order.fromAmount} {order.fromCurrency}</div>
              <div>{order.toAmount.toLocaleString()} {order.toCurrency}</div>
              <div>
                <div>${order.fromAmount + order.fee} total</div>
                <div style={{color: '#666', fontSize: '10px'}}>Fee: ${order.fee}</div>
              </div>
              <div>
                <span style={{...styles.statusBadge, background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status)}}>
                  {order.status}
                </span>
              </div>
              <div>
                <button 
                  style={styles.viewButton}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowDetails(true);
                  }}
                >
                  View
                </button>
                {order.status === 'PENDING' && (
                  <button 
                    style={{...styles.editButton, background: '#eab308'}}
                    onClick={() => handleUpdateOrderStatus(order.id, 'PROCESSING')}
                  >
                    Process
                  </button>
                )}
                {order.status === 'PROCESSING' && (
                  <button 
                    style={{...styles.editButton, background: '#22c55e'}}
                    onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rate History Tab */}
      {activeTab === 'history' && (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div>Date</div>
            <div>Time</div>
            <div>From</div>
            <div>To</div>
            <div>Rate</div>
            <div>Change</div>
          </div>
          
          {rateHistory.map((history) => (
            <div key={history.id} style={styles.tableRow}>
              <div>{history.date}</div>
              <div>{history.time}</div>
              <div>{history.from}</div>
              <div>{history.to}</div>
              <div style={styles.rateCell}>{history.rate}</div>
              <div>
                {history.id > 1 && history.from === 'USD' && history.to === 'EUR' && (
                  <span style={history.rate > 0.91 ? styles.changePositive : styles.changeNegative}>
                    {history.rate > 0.91 ? '+1.1%' : '-0.5%'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Order Details - {selectedOrder.orderNumber}</h2>
            
            <div style={{marginBottom: '20px'}}>
              <p><strong>Customer:</strong> {selectedOrder.customer}</p>
              <p><strong>Email:</strong> {selectedOrder.email}</p>
              <p><strong>Order Date:</strong> {selectedOrder.orderDate}</p>
              <p><strong>From:</strong> {selectedOrder.fromAmount} {selectedOrder.fromCurrency}</p>
              <p><strong>To:</strong> {selectedOrder.toAmount.toLocaleString()} {selectedOrder.toCurrency}</p>
              <p><strong>Exchange Rate:</strong> 1 {selectedOrder.fromCurrency} = {selectedOrder.exchangeRate} {selectedOrder.toCurrency}</p>
              <p><strong>Fee:</strong> ${selectedOrder.fee}</p>
              <p><strong>Total Charged:</strong> ${selectedOrder.fromAmount + selectedOrder.fee}</p>
              <p><strong>Delivery Method:</strong> {selectedOrder.deliveryMethod === 'BRANCH_PICKUP' ? '🏢 Branch Pickup' : '🏠 Home Delivery'}</p>
              {selectedOrder.deliveryAddress && (
                <p><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</p>
              )}
              <p><strong>Status:</strong> <span style={{color: getStatusColor(selectedOrder.status)}}>{selectedOrder.status}</span></p>
              <p><strong>Tracking:</strong> {selectedOrder.trackingNumber}</p>
              {selectedOrder.deliveryDate && (
                <p><strong>Expected Delivery:</strong> {selectedOrder.deliveryDate}</p>
              )}
            </div>

            <div style={styles.modalButtons}>
              <button 
                style={{...styles.backButton, background: '#666'}}
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rate Modal */}
      {showEditModal && editRate && (
        <div style={styles.modal} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Update Exchange Rate</h2>
            <p style={styles.modalText}>
              Updating rate for {editRate.from} → {editRate.to} ({editRate.country})
            </p>
            
            <input
              type="number"
              step="0.0001"
              style={styles.input}
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="Enter new rate"
            />

            <div style={styles.modalButtons}>
              <button 
                style={{...styles.backButton, background: '#666'}}
                onClick={() => {
                  setShowEditModal(false);
                  setEditRate(null);
                }}
              >
                Cancel
              </button>
              <button 
                style={styles.editButton}
                onClick={submitRateUpdate}
              >
                Update Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCurrency;