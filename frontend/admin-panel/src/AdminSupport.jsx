import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSupport = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [assignTo, setAssignTo] = useState('');

  const [tickets] = useState([
    {
      id: 'TKT-1001',
      subject: 'Cannot access online banking',
      customer: 'Michael Agbonifo',
      email: 'michael@snopitech.com',
      category: 'Technical',
      priority: 'high',
      status: 'open',
      created: '2026-02-17 09:30 AM',
      lastUpdate: '2026-02-17 09:30 AM',
      assignedTo: null,
      messages: [
        { from: 'customer', text: 'I tried to log in but keep getting error message "Invalid credentials" even though my password is correct.', time: '09:30 AM' }
      ]
    },
    {
      id: 'TKT-1002',
      subject: 'Dispute transaction - unauthorized charge',
      customer: 'Cynthia Ekeh',
      email: 'cynthiaekeh360@gmail.com',
      category: 'Dispute',
      priority: 'high',
      status: 'open',
      created: '2026-02-17 08:15 AM',
      lastUpdate: '2026-02-17 08:15 AM',
      assignedTo: null,
      messages: [
        { from: 'customer', text: 'I see a charge for $299.99 at Amazon that I did not authorize. Please help dispute this.', time: '08:15 AM' }
      ]
    },
    {
      id: 'TKT-1003',
      subject: 'Increase credit card limit',
      customer: 'Tracy Agbonifo',
      email: 'tracy@email.com',
      category: 'Card Services',
      priority: 'medium',
      status: 'in-progress',
      created: '2026-02-16 03:45 PM',
      lastUpdate: '2026-02-17 10:00 AM',
      assignedTo: 'Sarah Johnson',
      messages: [
        { from: 'customer', text: 'I would like to request a credit limit increase on my card.', time: '03:45 PM' },
        { from: 'agent', text: 'I can help with that. What is your annual income?', time: '10:00 AM', agent: 'Sarah' }
      ]
    },
    {
      id: 'TKT-1004',
      subject: 'Foreign currency order status',
      customer: 'Bose Agbonifo',
      email: 'bose@email.com',
      category: 'Currency',
      priority: 'low',
      status: 'resolved',
      created: '2026-02-15 11:20 AM',
      lastUpdate: '2026-02-16 02:30 PM',
      assignedTo: 'John Smith',
      messages: [
        { from: 'customer', text: 'I ordered Euros on Feb 14, when will they arrive?', time: '11:20 AM' },
        { from: 'agent', text: 'Your order is processing and will be ready for pickup tomorrow.', time: '02:30 PM', agent: 'John' }
      ]
    },
    {
      id: 'TKT-1005',
      subject: 'Lost debit card',
      customer: 'Test User',
      email: 'test@email.com',
      category: 'Card Services',
      priority: 'urgent',
      status: 'open',
      created: '2026-02-17 11:05 AM',
      lastUpdate: '2026-02-17 11:05 AM',
      assignedTo: null,
      messages: [
        { from: 'customer', text: 'I lost my debit card. Please block it immediately.', time: '11:05 AM' }
      ]
    },
    {
      id: 'TKT-1006',
      subject: 'Question about fees',
      customer: 'Michael Agbonifo',
      email: 'michael@snopitech.com',
      category: 'Billing',
      priority: 'low',
      status: 'closed',
      created: '2026-02-14 01:20 PM',
      lastUpdate: '2026-02-15 10:30 AM',
      assignedTo: 'Sarah Johnson',
      messages: [
        { from: 'customer', text: 'I was charged a $35 overdraft fee. Can you explain?', time: '01:20 PM' },
        { from: 'agent', text: 'The fee was for an overdraft on Feb 13. Would you like me to waive it as a courtesy?', time: '02:00 PM', agent: 'Sarah' },
        { from: 'customer', text: 'Yes please, that would be great.', time: '02:30 PM' },
        { from: 'agent', text: 'I have waived the fee. It will reflect in 24 hours.', time: '10:30 AM', agent: 'Sarah' }
      ]
    }
  ]);

  const [admins] = useState([
    { id: 1, name: 'Sarah Johnson', role: 'Senior Agent', active: 3 },
    { id: 2, name: 'John Smith', role: 'Agent', active: 2 },
    { id: 3, name: 'Mike Wilson', role: 'Agent', active: 1 },
    { id: 4, name: 'Lisa Brown', role: 'Manager', active: 0 }
  ]);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#ef4444';
      case 'in-progress': return '#eab308';
      case 'resolved': return '#22c55e';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Technical': return '🔧';
      case 'Dispute': return '⚖️';
      case 'Card Services': return '💳';
      case 'Currency': return '💱';
      case 'Billing': return '💰';
      default: return '📋';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'open') return matchesSearch && ticket.status === 'open';
    if (filter === 'in-progress') return matchesSearch && ticket.status === 'in-progress';
    if (filter === 'resolved') return matchesSearch && ticket.status === 'resolved';
    if (filter === 'urgent') return matchesSearch && ticket.priority === 'urgent';
    if (filter === 'unassigned') return matchesSearch && !ticket.assignedTo;
    return matchesSearch;
  });

  const handleAssign = (ticketId) => {
    if (!assignTo) {
      alert('Please select an admin to assign');
      return;
    }
    alert(`Ticket ${ticketId} assigned to ${assignTo}`);
    setShowDetails(false);
    setAssignTo('');
  };

  const handleReply = (ticketId) => {
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }
    alert(`Reply sent to customer:\n${replyText}`);
    setShowReplyModal(false);
    setReplyText('');
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
    unassigned: tickets.filter(t => !t.assignedTo).length
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
      gridTemplateColumns: 'repeat(5, 1fr)',
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
      gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr 1.5fr 2fr',
      padding: '15px',
      background: '#f8fafc',
      borderRadius: '8px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px'
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr 1.5fr 2fr',
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      alignItems: 'center'
    },
    priorityBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      width: '70px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textAlign: 'center',
      width: '90px'
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
    assignButton: {
      background: '#8b5cf6',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      marginRight: '8px'
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
    messageThread: {
      background: '#f9f9f9',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      maxHeight: '300px',
      overflowY: 'auto'
    },
    messageCustomer: {
      background: '#e3f2fd',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '10px',
      marginRight: '20%'
    },
    messageAgent: {
      background: '#f0f0f0',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '10px',
      marginLeft: '20%'
    },
    messageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px',
      fontSize: '11px',
      color: '#666'
    },
    messageText: {
      fontSize: '13px',
      color: '#333'
    },
    detailRow: {
      display: 'flex',
      marginBottom: '12px',
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    detailLabel: {
      width: '100px',
      color: '#666',
      fontSize: '14px'
    },
    detailValue: {
      flex: 1,
      fontWeight: '500',
      color: '#333'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '20px',
      background: 'white'
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
        <h1 style={styles.headerTitle}>Support Tickets</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Tickets</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Open</div>
          <div style={{...styles.statValue, color: '#ef4444'}}>{stats.open}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>In Progress</div>
          <div style={{...styles.statValue, color: '#eab308'}}>{stats.inProgress}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Urgent</div>
          <div style={{...styles.statValue, color: '#ef4444'}}>{stats.urgent}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Unassigned</div>
          <div style={{...styles.statValue, color: '#8b5cf6'}}>{stats.unassigned}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by ID, subject, customer..."
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
          style={{...styles.filterButton, ...(filter === 'open' ? styles.activeFilter : {})}}
          onClick={() => setFilter('open')}
        >
          🔴 Open
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'in-progress' ? styles.activeFilter : {})}}
          onClick={() => setFilter('in-progress')}
        >
          🟡 In Progress
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'urgent' ? styles.activeFilter : {})}}
          onClick={() => setFilter('urgent')}
        >
          ⚠️ Urgent
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'unassigned' ? styles.activeFilter : {})}}
          onClick={() => setFilter('unassigned')}
        >
          👤 Unassigned
        </button>
      </div>

      {/* Tickets Table */}
      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div>ID</div>
          <div>Subject</div>
          <div>Customer</div>
          <div>Category</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} style={styles.tableRow}>
            <div style={{fontSize: '12px', fontWeight: '500'}}>{ticket.id}</div>
            <div>
              <div style={{fontWeight: '500', fontSize: '13px'}}>
                {getCategoryIcon(ticket.category)} {ticket.subject}
              </div>
              <div style={{color: '#999', fontSize: '10px'}}>{ticket.created}</div>
            </div>
            <div>
              <div style={{fontWeight: '500', fontSize: '13px'}}>{ticket.customer}</div>
              <div style={{color: '#666', fontSize: '11px'}}>{ticket.email}</div>
            </div>
            <div style={{fontSize: '13px'}}>{ticket.category}</div>
            <div>
              <span style={{...styles.priorityBadge, background: `${getPriorityColor(ticket.priority)}20`, color: getPriorityColor(ticket.priority)}}>
                {ticket.priority}
              </span>
            </div>
            <div>
              <span style={{...styles.statusBadge, background: `${getStatusColor(ticket.status)}20`, color: getStatusColor(ticket.status)}}>
                {ticket.status}
              </span>
            </div>
            <div>
              <button 
                style={styles.actionButton}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setShowDetails(true);
                }}
              >
                View
              </button>
              {!ticket.assignedTo && (
                <button 
                  style={styles.assignButton}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setShowDetails(true);
                  }}
                >
                  Assign
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
            No tickets found matching your criteria
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedTicket && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Ticket #{selectedTicket.id}</h2>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Subject:</div>
              <div style={styles.detailValue}>{selectedTicket.subject}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Customer:</div>
              <div style={styles.detailValue}>{selectedTicket.customer} ({selectedTicket.email})</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Category:</div>
              <div style={styles.detailValue}>{selectedTicket.category}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Priority:</div>
              <div>
                <span style={{...styles.priorityBadge, background: `${getPriorityColor(selectedTicket.priority)}20`, color: getPriorityColor(selectedTicket.priority)}}>
                  {selectedTicket.priority}
                </span>
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Status:</div>
              <div>
                <span style={{...styles.statusBadge, background: `${getStatusColor(selectedTicket.status)}20`, color: getStatusColor(selectedTicket.status)}}>
                  {selectedTicket.status}
                </span>
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Assigned To:</div>
              <div style={styles.detailValue}>{selectedTicket.assignedTo || 'Unassigned'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Created:</div>
              <div style={styles.detailValue}>{selectedTicket.created}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Last Update:</div>
              <div style={styles.detailValue}>{selectedTicket.lastUpdate}</div>
            </div>

            {/* Message Thread */}
            <h3 style={{marginTop: '20px', marginBottom: '10px', fontSize: '16px'}}>Conversation</h3>
            <div style={styles.messageThread}>
              {selectedTicket.messages.map((msg, idx) => (
                <div key={idx} style={msg.from === 'customer' ? styles.messageCustomer : styles.messageAgent}>
                  <div style={styles.messageHeader}>
                    <span>{msg.from === 'customer' ? selectedTicket.customer : msg.agent || 'Support Agent'}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div style={styles.messageText}>{msg.text}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={styles.modalButtons}>
              {!selectedTicket.assignedTo && (
                <>
                  <select 
                    style={styles.select}
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                  >
                    <option value="">Select Admin</option>
                    {admins.map(admin => (
                      <option key={admin.id} value={admin.name}>{admin.name} ({admin.role})</option>
                    ))}
                  </select>
                  <button 
                    style={styles.assignButton}
                    onClick={() => handleAssign(selectedTicket.id)}
                  >
                    Assign
                  </button>
                </>
              )}
              <button 
                style={styles.actionButton}
                onClick={() => {
                  setShowReplyModal(true);
                }}
              >
                Reply
              </button>
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

      {/* Reply Modal */}
      {showReplyModal && selectedTicket && (
        <div style={styles.modal} onClick={() => setShowReplyModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Reply to {selectedTicket.customer}</h2>
            
            <textarea
              style={styles.textarea}
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <div style={styles.modalButtons}>
              <button 
                style={{...styles.backButton, background: '#666'}}
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                }}
              >
                Cancel
              </button>
              <button 
                style={styles.actionButton}
                onClick={() => handleReply(selectedTicket.id)}
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
