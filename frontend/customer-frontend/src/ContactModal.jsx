import React, { useState, useEffect } from 'react';
import './ContactModal.css';
import { useContactModal } from './ContactModalContext';

const ContactModal = () => {
    const { isOpen, closeModal, userData, presetCategory, presetSubject } = useContactModal();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [referenceNumber, setReferenceNumber] = useState('');
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
        if (isOpen) {
            setSubmitStatus(null);
            setReferenceNumber('');
        }
    }, [isOpen]);

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
            // SIMPLE FIX: Always use the public endpoint with fetch API
            // Just like the login page does
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
                    
                    // Reset form but keep user data
                    setFormData(prev => ({
                        ...prev,
                        category: 'GENERAL_INQUIRY',
                        subject: '',
                        message: '',
                        accountNumber: ''
                    }));
                    
                    // Auto-close modal after 3 seconds on success
                    setTimeout(() => {
                        closeModal();
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

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="contact-modal-overlay" onClick={handleBackdropClick}>
            <div className="contact-modal">
                <div className="contact-modal-header">
                    <h2 className="contact-modal-title">
                        {userData ? 'Contact Support' : 'Contact Us'}
                    </h2>
                    <button 
                        className="contact-modal-close" 
                        onClick={closeModal}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {submitStatus === 'success' && (
                    <div className="contact-success-message">
                        <div className="success-icon">✓</div>
                        <h3>Thank You for Contacting Us!</h3>
                        <p>Your inquiry has been submitted successfully.</p>
                        <div className="reference-number">
                            Reference: <strong>{referenceNumber}</strong>
                        </div>
                        <p className="success-note">
                            We've sent a confirmation to your email. Our support team will 
                            respond within 24-48 hours.
                        </p>
                        <button 
                            className="btn-new-inquiry"
                            onClick={() => setSubmitStatus(null)}
                        >
                            Submit Another Inquiry
                        </button>
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="contact-error-message">
                        <div className="error-icon">✗</div>
                        <h3>Submission Failed</h3>
                        <p>There was an error submitting your inquiry. Please try again.</p>
                        <button 
                            className="btn-try-again"
                            onClick={() => setSubmitStatus(null)}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!submitStatus && (
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-section">
                            <h3 className="section-title">Personal Information</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        disabled={!!userData}
                                        className={userData ? 'disabled-field' : ''}
                                    />
                                    {userData && (
                                        <small className="field-note">(Pre-filled from your profile)</small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={!!userData}
                                        className={userData ? 'disabled-field' : ''}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Optional"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="accountNumber">Account Number</label>
                                    <input
                                        type="text"
                                        id="accountNumber"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        placeholder="Optional - if related to specific account"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">Inquiry Details</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="category">Category *</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="subject">Subject *</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="Brief description of your inquiry"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="message">Message *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        placeholder="Please provide details about your inquiry..."
                                        minLength="10"
                                        maxLength="5000"
                                    />
                                    <div className="char-counter">
                                        {formData.message.length}/5000 characters
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={closeModal}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Inquiry'
                                )}
                            </button>
                        </div>

                        <div className="privacy-note">
                            <p>
                                <strong>Privacy Note:</strong> Your information is secure. 
                                We use encryption to protect your data and will only use it 
                                to respond to your inquiry.
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContactModal;