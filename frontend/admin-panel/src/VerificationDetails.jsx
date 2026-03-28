import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const VerificationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchVerificationDetails();
    }, [id]);

    const fetchVerificationDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/verifications/${id}`);
            setVerification(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load verification details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setProcessing(true);
            await axios.post(`/api/admin/verifications/${id}/approve`, null, {
                params: { adminUsername: 'admin' } // Replace with actual admin username
            });
            navigate('/admin/verifications');
        } catch (err) {
            setError('Failed to approve verification');
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        try {
            setProcessing(true);
            await axios.post(`/api/admin/verifications/${id}/reject`, null, {
                params: { 
                    adminUsername: 'admin',
                    notes: adminNotes 
                }
            });
            navigate('/admin/verifications');
        } catch (err) {
            setError('Failed to reject verification');
            setProcessing(false);
        }
    };

    const viewDocument = () => {
        window.open(`/api/admin/verifications/${id}/download`, '_blank');
    };

    if (loading) {
        return <div className="text-center p-5">Loading verification details...</div>;
    }

    if (error) {
        return <div className="alert alert-danger m-4">{error}</div>;
    }

    if (!verification) {
        return <div className="alert alert-warning m-4">Verification not found</div>;
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3>Verification Details #{verification.id}</h3>
                    <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/admin/verifications')}
                    >
                        ← Back
                    </button>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <h5>Document Information</h5>
                            <table className="table table-sm">
                                <tbody>
                                    <tr>
                                        <th>Type:</th>
                                        <td>{verification.documentType}</td>
                                    </tr>
                                    <tr>
                                        <th>File Name:</th>
                                        <td>{verification.documentFileName}</td>
                                    </tr>
                                    <tr>
                                        <th>File Size:</th>
                                        <td>{verification.fileSize}</td>
                                    </tr>
                                    <tr>
                                        <th>Document Number:</th>
                                        <td>{verification.documentNumber || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <th>Issuing Country:</th>
                                        <td>{verification.issuingCountry || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <th>Expiry Date:</th>
                                        <td>{verification.expiryDate || 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <h5>Submission Information</h5>
                            <table className="table table-sm">
                                <tbody>
                                    <tr>
                                        <th>User ID:</th>
                                        <td>{verification.userId}</td>
                                    </tr>
                                    <tr>
                                        <th>Submitted:</th>
                                        <td>{new Date(verification.submittedAt).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <th>Status:</th>
                                        <td>
                                            <span className={`badge bg-${
                                                verification.status === 'PENDING_REVIEW' ? 'warning' :
                                                verification.status === 'APPROVED' ? 'success' : 'danger'
                                            }`}>
                                                {verification.status}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col-12">
                            <button 
                                className="btn btn-primary me-2"
                                onClick={viewDocument}
                            >
                                View Document
                            </button>
                        </div>
                    </div>

                    {verification.status === 'PENDING_REVIEW' && (
                        <div className="row mt-4">
                            <div className="col-12">
                                <h5>Admin Review</h5>
                                <div className="mb-3">
                                    <label htmlFor="adminNotes" className="form-label">Notes (for rejection)</label>
                                    <textarea
                                        className="form-control"
                                        id="adminNotes"
                                        rows="3"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Enter reason for rejection if applicable..."
                                    ></textarea>
                                </div>
                                <button 
                                    className="btn btn-success me-2"
                                    onClick={handleApprove}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Approve'}
                                </button>
                                <button 
                                    className="btn btn-danger"
                                    onClick={handleReject}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationDetails;
