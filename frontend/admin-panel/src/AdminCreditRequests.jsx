import { useState, useEffect } from 'react';

const API_BASE = "";

const AdminCreditRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
  const [searchTerm, setSearchTerm] = useState('');

  // Get sessionId from localStorage
  const getSessionId = () => {
    try {
      const userStr = localStorage.getItem('loggedInUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.sessionId;
      }
      return null;
    } catch (err) {
      console.error('Error getting sessionId:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      
      let url = `${API_BASE}/api/admin/credit/increase-requests`;
      if (filter !== 'ALL') {
        url += `?status=${filter}`;
      }

      const response = await fetch(url, {
        headers: { 'sessionId': sessionId }
      });

      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this increase request?')) return;

    setActionLoading(true);
    try {
      const sessionId = getSessionId();
      
      const response = await fetch(`${API_BASE}/api/admin/credit/increase-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'sessionId': sessionId }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve request');
      }

      const data = await response.json();
      alert(`✅ Request approved! New limit: $${data.newCreditLimit.toLocaleString()}`);
      
      setShowDetailsModal(false);
      fetchRequests(); // Refresh the list
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const sessionId = getSessionId();
      
      const response = await fetch(`${API_BASE}/api/admin/credit/increase-requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: { 
          'sessionId': sessionId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason,
          adminNotes: adminNotes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject request');
      }

      alert('❌ Request rejected');
      
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setRejectionReason('');
      setAdminNotes('');
      fetchRequests(); // Refresh the list
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;
    
    const fullName = `${request.user?.firstName} ${request.user?.lastName}`.toLowerCase();
    const email = request.user?.email?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    
    return fullName.includes(term) || email.includes(term);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Credit Limit Increase Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Review and process customer credit limit increase requests</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'PENDING' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'APPROVED' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'REJECTED' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'ALL' 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or email..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.submittedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.user?.firstName} {request.user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{request.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.creditAccount?.maskedAccountNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(request.currentLimit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(request.requestedLimit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Credit Increase Request Details</h2>
                  <p className="text-sm text-gray-500">Request ID: {selectedRequest.id}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{selectedRequest.user?.firstName} {selectedRequest.user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{selectedRequest.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{selectedRequest.user?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium">{formatDate(selectedRequest.user?.memberSince)}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-700 mb-2">Request Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-blue-600">Current Limit</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedRequest.currentLimit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Requested Limit</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedRequest.requestedLimit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Increase Type</p>
                    <p className="text-sm font-medium">{selectedRequest.getIncreaseDescription?.() || 'Standard Increase'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Submitted</p>
                    <p className="text-sm font-medium">{formatDate(selectedRequest.submittedDate)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-blue-600 mb-1">Reason</p>
                  <p className="text-sm bg-white p-3 rounded border border-blue-200">
                    {selectedRequest.reason}
                  </p>
                </div>
              </div>

              {/* Employment & Income */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Employment & Income</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Employment Status</p>
                    <p className="text-sm font-medium">{selectedRequest.employmentStatus || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Annual Income</p>
                    <p className="text-sm font-medium">{selectedRequest.annualIncome ? formatCurrency(selectedRequest.annualIncome) : 'Not specified'}</p>
                  </div>
                  {selectedRequest.employerName && (
                    <div>
                      <p className="text-xs text-gray-500">Employer</p>
                      <p className="text-sm font-medium">{selectedRequest.employerName}</p>
                    </div>
                  )}
                  {selectedRequest.yearsAtEmployer && (
                    <div>
                      <p className="text-xs text-gray-500">Years at Employer</p>
                      <p className="text-sm font-medium">{selectedRequest.yearsAtEmployer}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'PENDING' && (
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Approve Request'}
                  </button>
                </div>
              )}

              {selectedRequest.status !== 'PENDING' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Review Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Reviewed By</p>
                      <p className="text-sm font-medium">{selectedRequest.reviewedBy || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Review Date</p>
                      <p className="text-sm font-medium">{formatDate(selectedRequest.reviewedDate)}</p>
                    </div>
                    {selectedRequest.rejectionReason && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Rejection Reason</p>
                        <p className="text-sm bg-red-50 p-2 rounded border border-red-200">{selectedRequest.rejectionReason}</p>
                      </div>
                    )}
                    {selectedRequest.adminNotes && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Admin Notes</p>
                        <p className="text-sm bg-gray-100 p-2 rounded">{selectedRequest.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Reject Increase Request</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="3"
                  placeholder="Explain why this request is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Internal)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  placeholder="Add internal notes about this rejection..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreditRequests;
