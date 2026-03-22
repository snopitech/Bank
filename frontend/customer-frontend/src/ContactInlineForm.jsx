import React, { useState, useEffect } from 'react';
import './ContactInlineForm.css';

const ContactInlineForm = ({ isExpanded, onClose, userData, presetCategory, presetSubject }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [referenceNumber, setReferenceNumber] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        category: presetCategory || 'GENERAL_INQUIRY',
        subject: presetSubject || '',
        message: '',
        accountNumber: ''
    });

    const categories = [
        { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
        { value: 'ACCOUNT_ISSUE', label: 'Account Issue' },
        { value: 'TECHNICAL_SUPPORT', label: 'Technical Support' },
        { value: 'FRAUD_SECURITY', label: 'Fraud/Security Concern' },
        { value: 'LOAN_APPLICATION', label: 'Loan Application' },
        { value: 'CARD_ISSUE', label: 'Card Issue' },
        { value: 'FEEDBACK_SUGGESTION', label: 'Feedback/Suggestion' }
    ];

    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
                email: userData.email || '',
                phone: userData.phone || ''
            }));
        }
    }, [userData]);

    useEffect(() => {
        if (isExpanded) {
            setSubmitStatus(null);
            setReferenceNumber('');
            setShowDetails(false);
        }
    }, [isExpanded]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // SIMPLE FIX: Always use the public endpoint, just like the login page
            const response = await fetch('/api/inquiries/public', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    setSubmitStatus('success');
                    setReferenceNumber(result.data.referenceNumber);
                    
                    // Reset form
                    setFormData(prev => ({
                        ...prev,
                        category: 'GENERAL_INQUIRY',
                        subject: '',
                        message: '',
                        accountNumber: ''
                    }));
                    
                    // Auto-close after 3 seconds
                    setTimeout(() => {
                        onClose();
                    }, 3000);
                } else {
                    setSubmitStatus('error');
                }
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            fullName: userData?.fullName || `${userData?.firstName} ${userData?.lastName}` || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            category: 'GENERAL_INQUIRY',
            subject: '',
            message: '',
            accountNumber: ''
        });
        setShowDetails(false);
        onClose();
    };

    if (!isExpanded) return null;

    return (
        <div className="contact-inline-form-container">
            <div className="contact-inline-form">
                <div className="inline-form-header">
                    <h3 className="inline-form-title">
                        <span className="inline-form-icon">📧</span>
                        Contact Support
                    </h3>
                    <button 
                        className="inline-form-close" 
                        onClick={handleCancel}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {submitStatus === 'success' && (
                    <div className="inline-success-message">
                        <div className="inline-success-icon">✓</div>
                        <h4>Thank You!</h4>
                        <p>Inquiry submitted successfully.</p>
                        <div className="inline-reference">
                            Ref: <strong>{referenceNumber}</strong>
                        </div>
                        <button 
                            className="inline-close-btn"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="inline-error-message">
                        <div className="inline-error-icon">✗</div>
                        <h4>Submission Failed</h4>
                        <p>Please try again.</p>
                        <button 
                            className="inline-try-again"
                            onClick={() => setSubmitStatus(null)}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!submitStatus && (
                    <form onSubmit={handleSubmit} className="inline-contact-form">
                        <div className="inline-form-grid">
                            <div className="inline-form-group">
                                <label htmlFor="inline-category">Category *</label>
                                <select
                                    id="inline-category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="inline-select"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="inline-form-group">
                                <label htmlFor="inline-subject">Subject *</label>
                                <input
                                    type="text"
                                    id="inline-subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="What is this about?"
                                    className="inline-input"
                                />
                            </div>

                            <div className="inline-form-group full-width">
                                <label htmlFor="inline-message">Message *</label>
                                <textarea
                                    id="inline-message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    placeholder="Please provide details..."
                                    minLength="10"
                                    maxLength="1000"
                                    className="inline-textarea"
                                />
                                <div className="inline-char-counter">
                                    {formData.message.length}/1000 characters
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="inline-details-toggle"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? '▲ Hide Details' : '▼ Show Details'}
                        </button>

                        {showDetails && (
                            <div className="inline-details-section">
                                <div className="inline-form-grid">
                                    <div className="inline-form-group">
                                        <label htmlFor="inline-fullName">Full Name *</label>
                                        <input
                                            type="text"
                                            id="inline-fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            disabled={!!userData}
                                            className={`inline-input ${userData ? 'disabled-field' : ''}`}
                                        />
                                    </div>

                                    <div className="inline-form-group">
                                        <label htmlFor="inline-email">Email *</label>
                                        <input
                                            type="email"
                                            id="inline-email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={!!userData}
                                            className={`inline-input ${userData ? 'disabled-field' : ''}`}
                                        />
                                    </div>

                                    <div className="inline-form-group">
                                        <label htmlFor="inline-phone">Phone</label>
                                        <input
                                            type="tel"
                                            id="inline-phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Optional"
                                            className="inline-input"
                                        />
                                    </div>

                                    <div className="inline-form-group">
                                        <label htmlFor="inline-accountNumber">Account #</label>
                                        <input
                                            type="text"
                                            id="inline-accountNumber"
                                            name="accountNumber"
                                            value={formData.accountNumber}
                                            onChange={handleChange}
                                            placeholder="Optional"
                                            className="inline-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="inline-form-actions">
                            <button
                                type="button"
                                className="inline-btn-cancel"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-btn-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="inline-spinner"></span>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContactInlineForm;