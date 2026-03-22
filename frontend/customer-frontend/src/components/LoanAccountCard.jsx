import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8080";

export default function LoanAccountCard({ loan, onRefresh }) {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showFullAccountNumber, setShowFullAccountNumber] = useState(false);
  const [revealingAccount, setRevealingAccount] = useState(false);
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState('');
  const [userAccounts, setUserAccounts] = useState([]);

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

  const fetchUserAccounts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      const accounts = user?.accounts || [];
      
      const accountPromises = accounts.map(async (acc) => {
        if (acc.accountType === 'CHECKING' || acc.accountType === 'SAVINGS') {
          const response = await fetch(`${API_BASE}/api/accounts/${acc.id}`);
          if (response.ok) {
            return await response.json();
          }
        }
        return acc;
      });
      
      const detailedAccounts = await Promise.all(accountPromises);
      setUserAccounts(detailedAccounts);
    } catch (error) {
      console.error('Error fetching user accounts:', error);
    }
  };

  useEffect(() => {
    if (showPaymentModal) {
      fetchUserAccounts();
    }
  }, [showPaymentModal]);

  const handleViewDetails = () => {
    navigate(`/loan-details/${loan.id}`);
  };

  const handleMakePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(paymentAmount) > loan.outstandingBalance) {
      alert('Payment amount cannot exceed outstanding balance');
      return;
    }

    if (!selectedPaymentAccount) {
      alert('Please select an account to pay from');
      return;
    }

    setProcessing(true);
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/loan/accounts/${loan.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sessionId': sessionId
        },
        body: JSON.stringify({ 
          amount: parseFloat(paymentAmount),
          fromAccountId: parseInt(selectedPaymentAccount)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment failed');
      }

      const data = await response.json();
      alert(`✅ Payment successful! New balance: $${data.newBalance.toLocaleString()}`);
      setShowPaymentModal(false);
      setPaymentAmount('');
      setSelectedPaymentAccount('');
      if (onRefresh) onRefresh();
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRevealAccountNumber = async () => {
    if (showFullAccountNumber) {
      setShowFullAccountNumber(false);
      return;
    }

    setRevealingAccount(true);
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/loan/accounts/${loan.id}/reveal`, {
        method: 'POST',
        headers: { 'sessionId': sessionId }
      });

      if (!response.ok) {
        throw new Error('Failed to reveal account number');
      }

      const data = await response.json();
      loan.fullAccountNumber = data.accountNumber;
      setShowFullAccountNumber(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setRevealingAccount(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-green-50 to-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-200 transform hover:scale-[1.01] transition-transform duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <h3 className="text-lg font-semibold text-gray-800">Loan Account</h3>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                loan.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                loan.status === 'DEFAULTED' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {loan.status}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm text-gray-500 font-mono">
                {showFullAccountNumber ? loan.fullAccountNumber || 'Loading...' : loan.maskedAccountNumber}
              </p>
              <button
                onClick={handleRevealAccountNumber}
                disabled={revealingAccount}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                title={showFullAccountNumber ? 'Hide account number' : 'Show full account number'}
              >
                {revealingAccount ? (
                  <span className="text-xs">...</span>
                ) : showFullAccountNumber ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
           {/* Simple Loan Card Design */}
           <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Total Credit Limit</p>
            <p className="text-xl font-bold text-gray-800">${loan.approvedAmount?.toLocaleString()}</p>
            </div>
  
            <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Available to Borrow</p>
            <p className="text-lg font-bold text-blue-600">${(loan.approvedAmount - loan.outstandingBalance).toLocaleString()}</p>
            </div>
  
            <div className="col-span-2 bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Total Due</p>
            <p className="text-xl font-bold text-purple-600">${loan.outstandingBalance?.toLocaleString()}</p>
            </div>
  
            
  
            <div className="col-span-2 text-xs text-gray-500 text-center mt-1">
             Interest Rate: {loan.interestRate}% APR
            </div>
          </div>
          </div>
          
          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-row lg:flex-col gap-2">
            <button
              onClick={handleViewDetails}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              View Details
            </button>
            {loan.status === 'ACTIVE' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition text-sm font-medium"
              >
                Make Payment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Make a Payment</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Outstanding Balance:</p>
              <p className="text-2xl font-bold text-red-600">${loan.outstandingBalance.toLocaleString()}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Account
              </label>
              <select
                value={selectedPaymentAccount}
                onChange={(e) => setSelectedPaymentAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select an account</option>
                {userAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountType} ••••{acc.accountNumber?.slice(-4)} (${acc.balance?.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={loan.outstandingBalance}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleMakePayment}
                disabled={processing || !paymentAmount || !selectedPaymentAccount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Pay Now'}
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount('');
                  setSelectedPaymentAccount('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}