// src/components/account-pages/MyInquiries.jsx
import { useState, useEffect } from 'react';
import {
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  DocumentTextIcon,
  EyeIcon,
  CreditCardIcon  // ✅ Added missing icon
} from '@heroicons/react/24/outline';

const API_BASE = "";

const MyInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [user, setUser] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser") || '{}');
    setUser(userData);
  }, []);

  // Mock data for development (since API is returning 404)
  useEffect(() => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockInquiries = [
        {
          id: 1,
          referenceNumber: 'INQ-2026-001',
          category: 'ACCOUNT_ISSUE',
          subject: 'Unable to access online banking',
          message: 'I have been trying to log in to my account for the past 2 days but keep getting an error message.',
          status: 'RESOLVED',
          createdAt: '2026-02-10T14:30:00',
          updatedAt: '2026-02-11T09:15:00',
          priority: 'HIGH',
          responses: [
            { id: 1, message: 'We have reset your password. Please check your email.', createdAt: '2026-02-10T15:45:00', staff: 'Support Team' },
            { id: 2, message: 'Is the issue resolved now?', createdAt: '2026-02-11T09:00:00', staff: 'Support Team' }
          ]
        },
        {
          id: 2,
          referenceNumber: 'INQ-2026-045',
          category: 'TRANSACTION',
          subject: 'Foreign transaction fee question',
          message: 'I was charged a foreign transaction fee but I made the purchase in USD. Can you explain?',
          status: 'IN_PROGRESS',
          createdAt: '2026-02-09T11:20:00',
          updatedAt: '2026-02-09T16:30:00',
          priority: 'MEDIUM',
          responses: [
            { id: 3, message: 'We are looking into your transaction. Our team will respond within 24 hours.', createdAt: '2026-02-09T16:30:00', staff: 'Support Team' }
          ]
        },
        {
          id: 3,
          referenceNumber: 'INQ-2026-089',
          category: 'CARD',
          subject: 'Replace lost debit card',
          message: 'I lost my debit card yesterday. Please help me block it and request a replacement.',
          status: 'OPEN',
          createdAt: '2026-02-12T08:15:00',
          updatedAt: '2026-02-12T08:15:00',
          priority: 'URGENT',
          responses: []
        },
        {
          id: 4,
          referenceNumber: 'INQ-2026-112',
          category: 'GENERAL',
          subject: 'Interest rate inquiry',
          message: 'What is the current interest rate for savings accounts?',
          status: 'RESOLVED',
          createdAt: '2026-02-05T13:45:00',
          updatedAt: '2026-02-06T10:20:00',
          priority: 'LOW',
          responses: [
            { id: 4, message: 'Current savings account interest rate is 2.25% APY.', createdAt: '2026-02-06T10:20:00', staff: 'Support Team' }
          ]
        }
      ];
      
      setInquiries(mockInquiries);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      'OPEN': 'bg-amber-50 text-amber-700 border-amber-200',
      'IN_PROGRESS': 'bg-blue-50 text-blue-700 border-blue-200',
      'RESOLVED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'CLOSED': 'bg-gray-50 text-gray-600 border-gray-200'
    };
    
    const labels = {
      'OPEN': 'Open',
      'IN_PROGRESS': 'In Progress',
      'RESOLVED': 'Resolved',
      'CLOSED': 'Closed'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
        {status === 'OPEN' && <ClockIcon className="h-3 w-3 mr-1" />}
        {status === 'IN_PROGRESS' && <ArrowPathIcon className="h-3 w-3 mr-1" />}
        {status === 'RESOLVED' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
        {status === 'CLOSED' && <XCircleIcon className="h-3 w-3 mr-1" />}
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'URGENT': 'bg-red-50 text-red-700 border-red-200',
      'HIGH': 'bg-orange-50 text-orange-700 border-orange-200',
      'MEDIUM': 'bg-blue-50 text-blue-700 border-blue-200',
      'LOW': 'bg-gray-50 text-gray-600 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[priority] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
        {priority}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'account_issue': return <UserIcon className="h-4 w-4" />;
      case 'transaction': return <DocumentTextIcon className="h-4 w-4" />;
      case 'card': return <CreditCardIcon className="h-4 w-4" />;
      default: return <ChatBubbleLeftIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter !== 'all' && inquiry.status !== filter.toUpperCase()) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        inquiry.subject.toLowerCase().includes(term) ||
        inquiry.message.toLowerCase().includes(term) ||
        inquiry.referenceNumber.toLowerCase().includes(term) ||
        inquiry.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const stats = {
    total: inquiries.length,
    open: inquiries.filter(i => i.status === 'OPEN').length,
    inProgress: inquiries.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: inquiries.filter(i => i.status === 'RESOLVED').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
        <div>
          <h2 className="text-2xl font-light text-gray-800 mb-1">My Support History</h2>
          <p className="text-sm text-gray-500">View and track all your support inquiries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-light text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Open</p>
          <p className="text-2xl font-light text-amber-600">{stats.open}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">In Progress</p>
          <p className="text-2xl font-light text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Resolved</p>
          <p className="text-2xl font-light text-emerald-600">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'open' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'in_progress' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'resolved' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Resolved
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inquiries..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 w-full md:w-64 text-sm"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      )}

      {/* Inquiries List */}
      {!loading && (
        <div className="space-y-4">
          {filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry) => (
              <div 
                key={inquiry.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Summary Row */}
                <div 
                  className="p-5 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        inquiry.status === 'RESOLVED' ? 'bg-emerald-100' :
                        inquiry.status === 'IN_PROGRESS' ? 'bg-blue-100' :
                        inquiry.status === 'OPEN' ? 'bg-amber-100' : 'bg-gray-100'
                      }`}>
                        {getCategoryIcon(inquiry.category)}
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <h3 className="font-medium text-gray-800">{inquiry.subject}</h3>
                          {getStatusBadge(inquiry.status)}
                          {getPriorityBadge(inquiry.priority)}
                        </div>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{inquiry.message}</p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-gray-400">Ref: {inquiry.referenceNumber}</span>
                          <span className="text-gray-400 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {formatDate(inquiry.createdAt)}
                          </span>
                          <span className="text-gray-400">
                            {inquiry.responses.length} response{inquiry.responses.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedId === inquiry.id ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === inquiry.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50">
                    {/* Full Message */}
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Your Message</h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">{inquiry.message}</p>
                      </div>
                    </div>

                    {/* Responses */}
                    {inquiry.responses.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Support Responses</h4>
                        <div className="space-y-3">
                          {inquiry.responses.map((response) => (
                            <div key={response.id} className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-gray-800">{response.staff}</span>
                                <span className="text-xs text-gray-400">{formatDateTime(response.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-600">{response.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-4">
                      {inquiry.status !== 'RESOLVED' && inquiry.status !== 'CLOSED' && (
                        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition">
                          Add Response
                        </button>
                      )}
                      <button className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white">
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No inquiries found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : "You haven't submitted any support requests yet"}
              </p>
              {(searchTerm || filter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* New Inquiry Button */}
      <div className="flex justify-center md:justify-end">
        <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center">
          <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
          New Support Inquiry
        </button>
      </div>
    </div>
  );
};

export default MyInquiries;