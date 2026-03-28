/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const API_BASE = "";

export default function LoanDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loan, setLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [showFullAccountNumber, setShowFullAccountNumber] = useState(false);
  const [revealingAccount, setRevealingAccount] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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
    fetchLoanDetails();
    fetchUserAccounts();
    fetchPaymentHistory();
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/loan/accounts/${id}`, {
        headers: { 'sessionId': sessionId }
      });
      
      if (!response.ok) throw new Error('Failed to fetch loan details');
      const data = await response.json();
      setLoan(data);
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAccounts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      const accounts = user?.accounts || [];
      
      // Fetch full account details for checking/savings
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

  const fetchPaymentHistory = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/loan/accounts/${id}/payments`, {
        headers: { 'sessionId': sessionId }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
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
    const response = await fetch(`${API_BASE}/api/loan/accounts/${id}/payment`, {
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
    fetchLoanDetails();
    fetchPaymentHistory();
  } catch (error) {
    alert(error.message);
  } finally {
    setProcessing(false);
  }
};
  const handleTransferFromLoan = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
   const availableCredit = loan.approvedAmount - loan.outstandingBalance;
   if (parseFloat(transferAmount) > availableCredit) {
   alert('Transfer amount cannot exceed available credit');
   return;
    }

    if (!selectedAccount) {
      alert('Please select a destination account');
      return;
    }

    setProcessing(true);
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/loan/accounts/${id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sessionId': sessionId
        },
        body: JSON.stringify({
          amount: parseFloat(transferAmount),
           destinationAccountId: parseInt(selectedAccount)
        })
      });
if (!response.ok) {
  const error = await response.json();
  console.log('BACKEND ERROR RESPONSE:', error);  // ADD THIS LINE
  throw new Error(error.error || 'Transfer failed');
}

      const data = await response.json();
      alert(`✅ Transfer successful! $${transferAmount} transferred to your account.`);
      setShowTransferModal(false);
      setTransferAmount('');
      setSelectedAccount('');
      fetchLoanDetails();
      fetchPaymentHistory();
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
      const response = await fetch(`${API_BASE}/api/loan/accounts/${id}/reveal`, {
        method: 'POST',
        headers: { 'sessionId': sessionId }
      });

      if (!response.ok) {
        throw new Error('Failed to reveal account number');
      }

      const data = await response.json();
      setLoan({ ...loan, fullAccountNumber: data.accountNumber });
      setShowFullAccountNumber(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setRevealingAccount(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loan Not Found</h2>
          <button
            onClick={() => navigate('/accounts')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  const progress = ((loan.approvedAmount - loan.outstandingBalance) / loan.approvedAmount) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-green-700 mb-4"
          >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">Loan Account Details</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600">Account:</p>
            <p className="font-mono text-gray-800">
              {showFullAccountNumber ? loan.fullAccountNumber : loan.maskedAccountNumber}
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
        </div>

        {/* Status Card */}
        <div className={`rounded-lg p-4 mb-6 ${
          loan.status === 'ACTIVE' ? 'bg-green-100 border border-green-300' :
          loan.status === 'PAID' ? 'bg-blue-100 border border-blue-300' :
          loan.status === 'DEFAULTED' ? 'bg-red-100 border border-red-300' :
          'bg-gray-100 border border-gray-300'
        }`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">
              {loan.status === 'ACTIVE' ? '✅' : loan.status === 'PAID' ? '💰' : '⚠️'}
            </span>
            <div>
              <p className="font-semibold">Status: {loan.status}</p>
              {loan.statusReason && (
                <p className="text-sm mt-1">{loan.statusReason}</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Original Amount</p>
            <p className="text-2xl font-bold text-gray-800">${loan.approvedAmount?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Outstanding Balance</p>
            <p className="text-2xl font-bold text-red-600">${loan.outstandingBalance?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
            <p className="text-2xl font-bold text-gray-800">{loan.interestRate}% APR</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Schedule</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Payment:</span>
                <span className="font-semibold">${loan.monthlyPayment?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Payment Due:</span>
                <span className="font-semibold">{formatDate(loan.nextPaymentDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payments Made:</span>
                <span className="font-semibold">{loan.paymentsMade || 0} / {loan.totalPayments || loan.termMonths}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Payment:</span>
                <span className="font-semibold">{loan.lastPaymentDate ? formatDate(loan.lastPaymentDate) : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Terms</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-semibold">{formatDate(loan.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maturity Date:</span>
                <span className="font-semibold">{formatDate(loan.maturityDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Term:</span>
                <span className="font-semibold">{loan.termMonths} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Principal Paid:</span>
                <span className="font-semibold text-green-600">
                  ${(loan.approvedAmount - loan.outstandingBalance).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Repayment Progress</h3>
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>${(loan.approvedAmount - loan.outstandingBalance).toLocaleString()} paid</span>
            <span>${loan.outstandingBalance.toLocaleString()} remaining</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-gray-500 mt-2">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Payments</h3>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              View All
            </button>
          </div>
          {paymentHistory.length > 0 ? (
            <div className="space-y-2">
              {paymentHistory.slice(0, 3).map((payment, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">${payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(payment.date)}</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Completed</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No payments made yet</p>
          )}
        </div>

        {/* Action Buttons */}
        {loan.status === 'ACTIVE' && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
           
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition text-lg font-semibold"
            >
              Transfer from Loan
            </button>
          </div>
        )}
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
                disabled={processing || !paymentAmount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Pay Now'}
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Transfer from Loan</h2>
            
            <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Available Credit:</p>
            <p className="text-2xl font-bold text-green-600">${(loan.approvedAmount - loan.outstandingBalance).toLocaleString()}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Amount
              </label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={loan.approvedAmount - loan.outstandingBalance}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
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

            <div className="flex gap-3">
              <button
                onClick={handleTransferFromLoan}
                disabled={processing || !transferAmount || !selectedAccount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Transfer'}
              </button>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferAmount('');
                  setSelectedAccount('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment History</h2>
            
            {paymentHistory.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paymentHistory.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-800">{formatDateTime(payment.date)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-green-600">${payment.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No payment history available</p>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}