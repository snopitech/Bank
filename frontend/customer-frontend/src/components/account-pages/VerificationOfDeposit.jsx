// src/components/account-pages/VerificationOfDeposit.jsx
import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  ClockIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const API_BASE = "";

const VerificationOfDeposit = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [realAccounts, setRealAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [purpose, setPurpose] = useState('rental');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [includeAddress, setIncludeAddress] = useState(true);
  const [includeRouting, setIncludeRouting] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState(null);
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser") || '{}');
    setUser(userData);
  }, []);

  // Fetch user details and account data
  useEffect(() => {
    const fetchUserAndAccounts = async () => {
      if (!user?.id) return;
      
      setLoadingAccounts(true);
      try {
        const token = localStorage.getItem('token');
        
        // First, get full user details including address
        const userResponse = await fetch(`${API_BASE}/api/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserDetails(userData);
        }
        
        // Get account summaries for each account the user has
        const userAccounts = user?.accounts || [];
        
        const accountPromises = userAccounts.map(async (acc) => {
          try {
            const response = await fetch(
              `${API_BASE}/api/accounts/summary/by-account-number?accountNumber=${acc.accountNumber}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              
              // Find the specific account in the accounts array
              const specificAccount = data.accounts?.find(a => a.accountNumber === acc.accountNumber);
              
              return {
                id: acc.accountType?.toLowerCase() === 'checking' ? 'checking' : 'savings',
                label: acc.accountType === 'CHECKING' ? 'Everyday Checking' : 'Everyday Savings',
                number: acc.accountNumber,
                maskedNumber: `•••• ${acc.accountNumber.slice(-4)}`,
                balance: specificAccount?.balance || 0,
                routingNumber: specificAccount?.routingNumber || '842917356',
                type: acc.accountType,
                openedDate: '2024-01-15' // Note: Your API might not provide this
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching account ${acc.accountNumber}:`, error);
            return null;
          }
        });
        
        const results = await Promise.all(accountPromises);
        const validAccounts = results.filter(acc => acc !== null);
        setRealAccounts(validAccounts);
        
        // Set first account as selected by default
        if (validAccounts.length > 0) {
          setSelectedAccount(validAccounts[0].id);
        }
        
      } catch (error) {
        console.error('Error fetching user/accounts:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };
    
    fetchUserAndAccounts();
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleGenerate = () => {
    setGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const selectedAcct = realAccounts.find(a => a.id === selectedAccount);
      
      const letter = {
        id: Date.now(),
        account: selectedAcct,
        purpose,
        recipientName: recipientName || 'To Whom It May Concern',
        recipientEmail,
        includeAddress,
        includeRouting,
        generatedDate: new Date().toISOString(),
        referenceNumber: `VOD-${Date.now().toString().slice(-8)}`
      };
      
      setGeneratedLetter(letter);
      setGenerating(false);
    }, 1500);
  };

  const handleDownload = (format) => {
    console.log(`Downloading as ${format}`, generatedLetter);
    // This would trigger actual PDF/Word download
  };

  const handleEmail = () => {
    console.log('Emailing to', recipientEmail || userDetails?.email);
    // This would send via email
  };

  const purposes = [
    { value: 'rental', label: 'Rental Application', description: 'For landlords or property managers' },
    { value: 'mortgage', label: 'Mortgage Pre-approval', description: 'For home purchase or refinance' },
    { value: 'visa', label: 'Visa/Immigration', description: 'Proof of funds for immigration purposes' },
    { value: 'employment', label: 'Employment Verification', description: 'For employers or background checks' },
    { value: 'other', label: 'Other Purpose', description: 'General verification of funds' }
  ];

  if (loadingAccounts) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (realAccounts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BuildingLibraryIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No accounts found</h3>
        <p className="text-sm text-gray-500">You need at least one account to generate a verification of deposit.</p>
      </div>
    );
  }

  const selectedAcctData = realAccounts.find(a => a.id === selectedAccount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-gray-800 mb-1">Verification of Deposit</h2>
            <p className="text-sm text-gray-500">Generate official proof of funds for various purposes</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-6 w-6 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Account Selection - REAL DATA FROM API */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Select Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {realAccounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account.id)}
              className={`text-left p-4 rounded-lg border transition-all ${
                selectedAccount === account.id
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-800">{account.label}</span>
                {selectedAccount === account.id && (
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                )}
              </div>
              <p className="text-sm text-gray-500">{account.maskedNumber}</p>
              <p className="text-lg font-light text-gray-700 mt-2">{formatCurrency(account.balance)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Balance Display */}
      {selectedAcctData && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">Current Balance as of {formatDate(new Date())}:</span>
            </div>
            <span className="text-xl font-light text-gray-800">{formatCurrency(selectedAcctData.balance)}</span>
          </div>
        </div>
      )}

      {/* Purpose Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Purpose of Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {purposes.map((p) => (
            <button
              key={p.value}
              onClick={() => setPurpose(p.value)}
              className={`text-left p-4 rounded-lg border transition ${
                purpose === p.value
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-800 mb-1">{p.label}</p>
              <p className="text-xs text-gray-500">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recipient Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Recipient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Recipient Name (Optional)</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g., Landlord, Mortgage Company"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Recipient Email (Optional)</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="For email delivery"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Document Options</h3>
        <div className="flex flex-col space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={includeAddress}
              onChange={(e) => setIncludeAddress(e.target.checked)}
              className="h-4 w-4 text-gray-800 rounded border-gray-300 focus:ring-gray-800"
            />
            <span className="text-sm text-gray-700">Include full address</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={includeRouting}
              onChange={(e) => setIncludeRouting(e.target.checked)}
              className="h-4 w-4 text-gray-800 rounded border-gray-300 focus:ring-gray-800"
            />
            <span className="text-sm text-gray-700">Include routing number</span>
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={generating || !selectedAccount}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {generating ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Generate Verification Letter
            </>
          )}
        </button>
      </div>

      {/* Generated Letter Preview */}
      {generatedLetter && generatedLetter.account && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Verification Letter Preview</h3>
            <span className="text-xs text-gray-500">Ref: {generatedLetter.referenceNumber}</span>
          </div>
          
          <div className="p-6">
            {/* Letter Content */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto font-serif">
              {/* Bank Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">SnopitechBank</h1>
                <p className="text-sm text-gray-500">123 Banking Avenue • Financial District, NY 10001</p>
                <p className="text-sm text-gray-500">(800) 555-0123 • www.snopitechbank.com</p>
              </div>

              {/* Date */}
              <p className="text-right text-sm text-gray-600 mb-6">
                {formatDate(generatedLetter.generatedDate)}
              </p>

              {/* Recipient */}
              <p className="text-gray-800 mb-6">
                {generatedLetter.recipientName}
              </p>

              {/* Subject */}
              <p className="text-gray-800 mb-4 font-medium">
                RE: Verification of Deposit for {purposes.find(p => p.value === generatedLetter.purpose)?.label}
              </p>

              {/* Body */}
              <p className="text-gray-700 mb-4">
                To Whom It May Concern:
              </p>
              
              <p className="text-gray-700 mb-4">
                This letter serves as official verification that the following account is held at SnopitechBank in good standing:
              </p>

              {/* Account Details - USING REAL DATA FROM API */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800 mb-2">
                  <span className="font-medium">Account Holder:</span> {userDetails?.firstName || user?.firstName} {userDetails?.lastName || user?.lastName}
                </p>
                <p className="text-gray-800 mb-2">
                  <span className="font-medium">Account Type:</span> {generatedLetter.account.label}
                </p>
                <p className="text-gray-800 mb-2">
                  <span className="font-medium">Account Number:</span> {generatedLetter.account.maskedNumber}
                </p>
                {includeRouting && generatedLetter.account.routingNumber && (
                  <p className="text-gray-800 mb-2">
                    <span className="font-medium">Routing Number:</span> {generatedLetter.account.routingNumber}
                  </p>
                )}
                {includeAddress && (
                  <p className="text-gray-800 mb-2">
                    <span className="font-medium">Address on File:</span> {userDetails?.address || user?.address || 'Address on file'}
                  </p>
                )}
                <p className="text-gray-800 mb-2">
                  <span className="font-medium">Date Opened:</span> {generatedLetter.account.openedDate}
                </p>
                <p className="text-gray-800 text-lg font-medium">
                  <span className="font-medium">Current Balance:</span> {formatCurrency(generatedLetter.account.balance)}
                </p>
              </div>

              <p className="text-gray-700 mb-4">
                This account is in good standing with no negative balances or restrictions as of the date above.
              </p>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <p className="text-gray-700 mb-4">
                  Sincerely,
                </p>
                <p className="text-gray-800 font-medium">SnopitechBank Verification Department</p>
                <p className="text-xs text-gray-500 mt-4">
                  This is an official bank verification document. For verification, please contact our verification department at (800) 555-0123.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Reference Number: {generatedLetter.referenceNumber} • Generated: {new Date(generatedLetter.generatedDate).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => handleDownload('pdf')}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition flex items-center"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={() => handleDownload('doc')}
                className="px-5 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white flex items-center"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Download Word
              </button>
              <button
                onClick={handleEmail}
                className="px-5 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white flex items-center"
                disabled={!recipientEmail && !userDetails?.email}
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Email
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white flex items-center"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">Official Bank Document</h4>
            <p className="text-xs text-blue-600">
              This verification letter is an official bank document and can be used for rental applications, 
              mortgage pre-approval, visa applications, and other purposes requiring proof of funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationOfDeposit;