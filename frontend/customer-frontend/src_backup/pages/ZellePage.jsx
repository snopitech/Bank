import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserIcon, PhoneIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const API_BASE = "http://localhost:8080";

export default function ZellePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [checkingAccounts, setCheckingAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('send'); // 'send', 'confirm', 'success'
  const [enrollment, setEnrollment] = useState(null);
  const [recentContacts, setRecentContacts] = useState([]);
  const [searchMethod, setSearchMethod] = useState('email'); // 'email' or 'phone'
  const [transferResult, setTransferResult] = useState(null);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');

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
  console.log('Session ID:', getSessionId());
  console.log('User from storage:', JSON.parse(localStorage.getItem('loggedInUser')));
  loadUserData();
  loadEnrollment();
  loadCheckingAccounts();
  loadContacts();
}, []);

  const loadUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('loggedInUser'));
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

 const loadEnrollment = async () => {
  try {
    const sessionId = getSessionId();
    console.log('1. Loading enrollment with sessionId:', sessionId);
    
    if (!sessionId) {
      console.error('2. No session ID found');
      return;
    }

    const response = await fetch(`${API_BASE}/api/zelle/enrollment`, {
      headers: { 'sessionId': sessionId }
    });
    
    console.log('3. Enrollment response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('4. Enrollment error:', errorData);
      return;
    }
    
    const data = await response.json();
    console.log('5. Enrollment data:', data);
    setEnrollment(data);
  } catch (error) {
    console.error('6. Error loading enrollment:', error);
  }
};

  const loadCheckingAccounts = async () => {
    try {
      const sessionId = getSessionId();
      const userData = JSON.parse(localStorage.getItem('loggedInUser'));
      const accounts = userData?.accounts || [];
      
      const checkingPromises = accounts
        .filter(acc => acc.accountType === 'CHECKING')
        .map(async (acc) => {
          const response = await fetch(`${API_BASE}/api/accounts/${acc.id}`, {
            headers: { 'sessionId': sessionId }
          });
          if (response.ok) {
            return await response.json();
          }
          return acc;
        });
      
      const detailedAccounts = await Promise.all(checkingPromises);
      setCheckingAccounts(detailedAccounts);
      
      if (detailedAccounts.length > 0) {
        setSelectedAccount(detailedAccounts[0].id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading checking accounts:', error);
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/zelle/contacts`, {
        headers: { 'sessionId': sessionId }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentContacts(data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

const handleEnroll = async () => {
  if (!selectedAccount) {
    alert('Please select an account');
    return;
  }

  if (!enrollEmail) {
    alert('Please enter your email');
    return;
  }

  setProcessing(true);
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE}/api/zelle/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sessionId': sessionId
      },
      body: JSON.stringify({
        email: enrollEmail,
        phone: enrollPhone || null,
        accountId: parseInt(selectedAccount)
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Enrollment failed');
    }

    const data = await response.json();
    alert('Successfully enrolled in Zelle!');
    
    // Reload enrollment status
    loadEnrollment();
    
    // Clear form
    setEnrollEmail('');
    setEnrollPhone('');
    
  } catch (error) {
    alert(error.message);
  } finally {
    setProcessing(false);
  }
};

  const handleSendMoney = () => {
    // Validate
    if (!selectedAccount) {
      alert('Please select an account to send from');
      return;
    }

    if (searchMethod === 'email' && !recipientEmail) {
      alert('Please enter recipient email');
      return;
    }

    if (searchMethod === 'phone' && !recipientPhone) {
      alert('Please enter recipient phone number');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Check if amount exceeds balance
    const selectedAcc = checkingAccounts.find(acc => acc.id === parseInt(selectedAccount));
    if (selectedAcc && parseFloat(amount) > selectedAcc.balance) {
      alert('Insufficient funds in selected account');
      return;
    }

    // Move to confirmation step
    setStep('confirm');
  };

  const handleConfirmSend = async () => {
    setProcessing(true);
    
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE}/api/zelle/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sessionId': sessionId
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          fromAccountId: parseInt(selectedAccount),
          recipientEmail: searchMethod === 'email' ? recipientEmail : null,
          recipientPhone: searchMethod === 'phone' ? recipientPhone : null,
          recipientName: recipientName || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transfer failed');
      }

      const data = await response.json();
      setTransferResult(data);
      setStep('success');
      
      // Refresh contacts
      loadContacts();
      
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleNewTransfer = () => {
    setStep('send');
    setRecipientEmail('');
    setRecipientPhone('');
    setRecipientName('');
    setAmount('');
    setTransferResult(null);
  };

  const selectContact = (contact) => {
    setRecipientEmail(contact.email || '');
    setRecipientPhone(contact.phone || '');
    setRecipientName(contact.name || '');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center">
            <img 
              src="https://www.zellepay.com/themes/custom/zelle/logo.svg" 
              alt="Zelle" 
              className="h-8 mr-3"
              onError={(e) => e.target.style.display = 'none'}
            />
            <h1 className="text-3xl font-bold text-gray-800">Send Money with Zelle®</h1>
          </div>
          <p className="text-gray-600 mt-2">Fast, safe and easy — send money directly to bank accounts</p>
        </div>

                {/* Enrollment Status */}
       
        {enrollment && enrollment.enrolled ? (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
        <CheckCircleIcon className="h-6 w-6 text-purple-600 mr-2" />
        <div>
        <p className="font-medium text-purple-800">You're enrolled with:</p>
        <p className="text-sm text-purple-600">
          {enrollment.email} {enrollment.phone && `• ${enrollment.phone}`}
        </p>
      </div>
    </div>
  </div>
) : (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">Enroll in Zelle®</h2>
    <p className="text-gray-600 mb-4">Enroll your email or phone number to start sending money with Zelle.</p>
    
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Account to Link
      </label>
      <select
        value={selectedAccount}
        onChange={(e) => setSelectedAccount(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      >
        <option value="">Select an account</option>
        {checkingAccounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            Checking ••••{acc.accountNumber?.slice(-4)} (${acc.balance?.toFixed(2)})
          </option>
        ))}
      </select>
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email Address
      </label>
      <input
        type="email"
        value={enrollEmail}
        onChange={(e) => setEnrollEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      />
    </div>
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Phone Number (Optional)
        </label>
        <input
        type="tel"
        value={enrollPhone}
        onChange={(e) => setEnrollPhone(e.target.value)}
        placeholder="(123) 456-7890"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
        </div>

        <button
        onClick={handleEnroll}
        disabled={!selectedAccount || !enrollEmail}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
        >
         Enroll in Zelle
        </button>
        </div>
        )}

        {step === 'send' && (
          <>
            {/* Recent Contacts */}
            {recentContacts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Contacts</h2>
                <div className="space-y-2">
                  {recentContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => selectContact(contact)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 flex items-center"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{contact.name}</p>
                        <p className="text-xs text-gray-500">
                          {contact.email} {contact.phone && `• ${contact.phone}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Send Money Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Send Money</h2>
              
              {/* From Account */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Account
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select an account</option>
                  {checkingAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      Checking ••••{acc.accountNumber?.slice(-4)} (${acc.balance?.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Method Toggle */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Find Recipient By
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSearchMethod('email')}
                    className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center ${
                      searchMethod === 'email'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Email
                  </button>
                  <button
                    onClick={() => setSearchMethod('phone')}
                    className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center ${
                      searchMethod === 'phone'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Phone
                  </button>
                </div>
              </div>

              {/* Recipient Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {searchMethod === 'email' ? 'Recipient Email' : 'Recipient Phone Number'}
                </label>
                {searchMethod === 'email' ? (
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="friend@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                ) : (
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="(123) 456-7890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                )}
              </div>

              {/* Recipient Name (optional) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name (Optional)
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMoney}
                disabled={!selectedAccount || (!recipientEmail && !recipientPhone) || !amount}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Continue
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By continuing, you agree to the Zelle® Transfer Service Agreement.
                Transfers typically arrive within minutes.
              </p>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Transfer</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">
                  Checking ••••{checkingAccounts.find(acc => acc.id === parseInt(selectedAccount))?.accountNumber?.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">
                  {recipientName || (searchMethod === 'email' ? recipientEmail : recipientPhone)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-lg text-purple-600">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estimated arrival:</span>
                <span className="font-medium text-green-600">Within minutes</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('send')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && transferResult && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Transfer Sent!</h2>
            <p className="text-gray-600 mb-2">
              ${parseFloat(amount).toFixed(2)} sent to {transferResult.recipient}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Reference: {transferResult.reference}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleNewTransfer}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Send Another
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}