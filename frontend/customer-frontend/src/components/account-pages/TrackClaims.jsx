import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const TrackClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedClaim, setExpandedClaim] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState(false);

  // Fetch claims on component mount
  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      // TODO: Replace with actual user ID from context/state
      const userId = 1; // This should come from auth context
      const response = await fetch(`/api/claims/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      const data = await response.json();
      setClaims(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (claimId) => {
    try {
      const response = await fetch(`/api/claims/${claimId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(prev => ({ ...prev, [claimId]: data }));
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleFileUpload = async (claimId, file, description = '') => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    try {
      const response = await fetch(`/api/claims/${claimId}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload document');
      
      // Refresh documents
      await fetchDocuments(claimId);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const response = await fetch(`/api/claims/documents/${documentId}/download`);
      if (!response.ok) throw new Error('Failed to download document');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteDocument = async (claimId, documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/claims/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete document');
      
      // Refresh documents
      await fetchDocuments(claimId);
    } catch (err) {
      setError(err.message);
    }
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

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'SUBMITTED':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'UNDER_REVIEW':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'RESOLVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'CLOSED':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleExpand = (claimId) => {
    if (expandedClaim === claimId) {
      setExpandedClaim(null);
    } else {
      setExpandedClaim(claimId);
      if (!documents[claimId]) {
        fetchDocuments(claimId);
      }
    }
  };

  const viewDetails = (claim) => {
    setSelectedClaim(claim);
    setShowDetails(true);
    if (!documents[claim.id]) {
      fetchDocuments(claim.id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Track Claims & Disputes</h2>
        <p className="text-sm text-gray-600 mt-1">
          View and manage your claims, disputes, and supporting documents
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No claims found</h3>
          <p className="text-sm text-gray-600 mb-4">
            You haven't filed any claims or disputes yet
          </p>
          <button
            onClick={() => window.location.href = '/support/file-claim'}
            className="inline-flex items-center px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            File a Claim
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Claim Header - Always visible */}
              <div className="p-6 hover:bg-gray-50 transition cursor-pointer" onClick={() => toggleExpand(claim.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(claim.status)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{claim.claimNumber}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(claim.priority)}`}>
                          {claim.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{claim.subject}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Filed: {formatDate(claim.filedDate)}</span>
                        <span>•</span>
                        <span>Amount: {formatCurrency(claim.disputedAmount)}</span>
                        {claim.merchantName && (
                          <>
                            <span>•</span>
                            <span>Merchant: {claim.merchantName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewDetails(claim);
                      }}
                      className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {expandedClaim === claim.id ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedClaim === claim.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="space-y-4">
                    {/* Claim Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Claim Details</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">Type:</span> <span className="text-gray-900">{claim.claimType}</span></p>
                          <p><span className="text-gray-500">Description:</span> <span className="text-gray-900">{claim.description}</span></p>
                          {claim.transactionDate && (
                            <p><span className="text-gray-500">Transaction Date:</span> <span className="text-gray-900">{formatDate(claim.transactionDate)}</span></p>
                          )}
                          {claim.resolution && (
                            <p><span className="text-gray-500">Resolution:</span> <span className="text-gray-900">{claim.resolution}</span></p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">Filed:</span> <span className="text-gray-900">{formatDate(claim.filedDate)}</span></p>
                          <p><span className="text-gray-500">Last Updated:</span> <span className="text-gray-900">{formatDate(claim.lastUpdatedDate)}</span></p>
                          {claim.resolvedDate && (
                            <p><span className="text-gray-500">Resolved:</span> <span className="text-gray-900">{formatDate(claim.resolvedDate)}</span></p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Documents ({documents[claim.id]?.length || 0})</h4>
                      
                      {/* Upload Button */}
                      <div className="mb-3">
                        <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                          <PaperClipIcon className="h-4 w-4 mr-2" />
                          Upload Document
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleFileUpload(claim.id, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        {uploading && <span className="ml-3 text-sm text-gray-500">Uploading...</span>}
                      </div>

                      {/* Documents List */}
                      {documents[claim.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {documents[claim.id].map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex items-center space-x-3">
                                <PaperClipIcon className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                                  <p className="text-xs text-gray-500">
                                    {doc.formattedFileSize} • Uploaded {formatDate(doc.uploadDate)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                                  className="p-1 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                                  title="Download"
                                >
                                  <ArrowDownTrayIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(claim.id, doc.id)}
                                  className="p-1 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedClaim && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Claim Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Claim Number</p>
                  <p className="font-medium">{selectedClaim.claimNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClaim.status)}`}>
                    {selectedClaim.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p>{selectedClaim.claimType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedClaim.priority)}`}>
                    {selectedClaim.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p>{selectedClaim.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Disputed Amount</p>
                  <p className="font-semibold">{formatCurrency(selectedClaim.disputedAmount)}</p>
                </div>
                {selectedClaim.merchantName && (
                  <div>
                    <p className="text-sm text-gray-500">Merchant</p>
                    <p>{selectedClaim.merchantName}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedClaim.description}</p>
              </div>

              {selectedClaim.resolution && (
                <div>
                  <p className="text-sm text-gray-500">Resolution</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedClaim.resolution}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Filed Date</p>
                  <p>{formatDate(selectedClaim.filedDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p>{formatDate(selectedClaim.lastUpdatedDate)}</p>
                </div>
                {selectedClaim.resolvedDate && (
                  <div>
                    <p className="text-gray-500">Resolved Date</p>
                    <p>{formatDate(selectedClaim.resolvedDate)}</p>
                  </div>
                )}
              </div>

              {/* Documents in Modal */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Documents ({documents[selectedClaim.id]?.length || 0})</h4>
                {documents[selectedClaim.id]?.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {documents[selectedClaim.id].map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <PaperClipIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">{doc.formattedFileSize}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                          className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No documents uploaded</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
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

export default TrackClaims;