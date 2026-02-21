import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HeaderQuickStats from "./HeaderComponents/hooks/HeaderQuickStats";

function Header({ name }) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    zipCode: "",
    amount: "",
    recipientAccountNumber: "",
    description: ""
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [cardInfo, setCardInfo] = useState(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setSearchOpen(false); // close search if open
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    setMenuOpen(false); // close dropdown if open
  };

  const handleSignOff = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
    navigate("/"); // CHANGED: from "/login" to "/"
  };

  const handleProfileClick = () => {
    setMenuOpen(false); // Close the dropdown menu
    navigate("/profile"); // Navigate to profile page
  };

  const handleSettingsClick = () => {
    setMenuOpen(false); // Close the dropdown menu
    navigate("/settings"); // Navigate to settings page
  };

  const handleAlertsClick = () => {
    setMenuOpen(false); // Close the dropdown menu
    navigate("/alerts"); // Navigate to alerts page
  };

  const handleAccountsClick = (e) => {
    e.preventDefault();
    navigate("/accounts");
  };

  const handleTransferClick = (e) => {
    e.preventDefault();
    navigate("/transfer");
  };

  const handleSecurityClick = (e) => {
    e.preventDefault();
    navigate("/security");
  };

  const handleSupportClick = (e) => {
    e.preventDefault();
    navigate("/support");
  };

  const handleInvestmentsClick = (e) => {
    e.preventDefault();
    navigate("/investments");
  };

  // New handler for Make Payment
  const handleMakePaymentClick = (e) => {
    e.preventDefault();
    setPaymentModalOpen(true);
    resetPaymentForm();
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
    
    // If card number is 16 digits, try to fetch card info
    if (name === 'cardNumber' && value.replace(/\s/g, '').length === 16) {
      fetchCardInfo(value.replace(/\s/g, ''));
    }
  };

  const fetchCardInfo = async (cardNumber) => {
    try {
      const response = await fetch(`/api/card-payments/card-info?cardNumber=${cardNumber}`);
      if (response.ok) {
        const data = await response.json();
        setCardInfo(data);
      } else {
        setCardInfo(null);
      }
    } catch (err) {
      console.error('Error fetching card info:', err);
      setCardInfo(null);
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      cardNumber: "",
      zipCode: "",
      amount: "",
      recipientAccountNumber: "",
      description: ""
    });
    setPaymentResult(null);
    setCardInfo(null);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentResult(null);

    try {
      const response = await fetch('/api/card-payments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: paymentForm.cardNumber.replace(/\s/g, ''),
          zipCode: paymentForm.zipCode,
          amount: parseFloat(paymentForm.amount),
          recipientAccountNumber: paymentForm.recipientAccountNumber,
          description: paymentForm.description || 'Card payment'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setPaymentResult({ success: true, data });
        setTimeout(() => {
          setPaymentModalOpen(false);
          resetPaymentForm();
        }, 3000);
      } else {
        setPaymentResult({ success: false, error: data.error || 'Payment failed' });
      }
    } catch (err) {
      setPaymentResult({ success: false, error: 'Network error. Please try again.' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Close search or menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".menu-area") && !e.target.closest(".search-area") && !e.target.closest(".payment-modal")) {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      {/* MAIN HEADER — RED */}
      <header className="bg-red-700 text-white shadow-sm border-b relative z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 relative">
          <div className="flex justify-between items-center mx-auto" style={{ maxWidth: '100%' }}>
            
            {/* LEFT: LOGO */}
            <div className="flex-shrink-0">
              <img
                src="https://snopitechstore.online/public-images/Mylogo.png"
                alt="SnopitechBank Logo"
                className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto"
              />
            </div>

            {/* CENTER: TITLE */}
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-wide text-center flex-1 mx-4">
              SNOPITECHBANK
            </h1>

            {/* RIGHT SIDE */}
            <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 relative flex-shrink-0">
              
              {/* WELCOME + DROPDOWN */}
              <div className="hidden sm:block menu-area">
                <span
                  onClick={toggleMenu}
                  className="text-xs sm:text-sm md:text-base cursor-pointer hover:text-gray-200 whitespace-nowrap"
                >
                  Welcome, <span className="font-semibold">{name}</span>
                </span>
              </div>
              
              {/* MOBILE WELCOME */}
              <div className="sm:hidden menu-area">
                <span
                  onClick={toggleMenu}
                  className="text-xs cursor-pointer hover:text-gray-200"
                >
                  Hi, <span className="font-semibold">{name}</span>
                </span>
              </div>

              {/* SEARCH ICON + EXPANDING SEARCH BAR */}
              <div className="relative search-area">
                <svg
                  onClick={toggleSearch}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 cursor-pointer hover:text-gray-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
                  />
                </svg>

                {searchOpen && (
                  <input
                    type="text"
                    placeholder="Search..."
                    className="absolute right-0 top-full mt-2 w-48 sm:w-56 md:w-64 lg:w-72 bg-white text-black rounded-md shadow-lg px-3 sm:px-4 py-2 border border-gray-300 transition-all duration-200 text-sm sm:text-base"
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* DROPDOWN MENU */}
            {menuOpen && (
              <div className="absolute right-4 sm:right-6 md:right-8 top-full mt-2 bg-white text-black shadow-xl rounded-lg w-48 sm:w-56 md:w-64 py-2 z-50 border border-gray-200">
                <button 
                  onClick={handleProfileClick}
                  className="block w-full text-left px-4 py-2 sm:py-3 hover:bg-red-50 hover:text-red-700 transition-colors text-sm sm:text-base"
                >
                  Profile
                </button>
                <button 
                  onClick={handleSettingsClick}
                  className="block w-full text-left px-4 py-2 sm:py-3 hover:bg-red-50 hover:text-red-700 transition-colors text-sm sm:text-base"
                >
                  Settings
                </button>
                <button 
                  onClick={handleAlertsClick}
                  className="block w-full text-left px-4 py-2 sm:py-3 hover:bg-red-50 hover:text-red-700 transition-colors text-sm sm:text-base"
                >
                  Alerts & Notifications
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleSignOff}
                  className="block w-full text-left px-4 py-2 sm:py-3 hover:bg-red-50 text-red-600 font-semibold transition-colors text-sm sm:text-base"
                >
                  Sign Off
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SUB HEADER — WHITE, WITH QUICK STATS */}
      <div className="bg-white text-black border-b sticky top-0 z-40 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between mx-auto" style={{ maxWidth: '100%' }}>
            
            {/* LEFT: NAVIGATION LINKS - NOW WITH MAKE PAYMENT */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-2 sm:mb-0">
              <a 
                href="/accounts" 
                onClick={handleAccountsClick}
                className="hover:text-red-700 transition-colors text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
              >
                Accounts
              </a>
              <a 
                href="/transfer" 
                onClick={handleTransferClick}
                className="hover:text-red-700 transition-colors text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
              >
                Transfer & Pay
              </a>
              <a 
                href="/security" 
                onClick={handleSecurityClick}
                className="hover:text-red-700 transition-colors text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
              >
                Security
              </a>
              <a 
                href="/support" 
                onClick={handleSupportClick}
                className="hover:text-red-700 transition-colors text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
              >
                Support
              </a>
              <a 
                href="/investments" 
                onClick={handleInvestmentsClick}
                className="hover:text-red-700 transition-colors text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
              >
                Investments
              </a>
              {/* NEW: Make Payment Link */}
              <a 
                href="#" 
                onClick={handleMakePaymentClick}
                className="text-gray-600 hover:text-red-700 transition-colors text-xs sm:text-sm md:text-base font-medium whitespace-nowrap border-l-2 border-gray-300 pl-3 sm:pl-4"
              >
                Make Payment
              </a>
            </div>
            
            {/* RIGHT: QUICK STATS */}
            <div className="w-full sm:w-auto">
              <HeaderQuickStats />
            </div>
            
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL - Subtle gray theme */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 payment-modal">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Make a Payment</h3>
                <button
                  onClick={() => {
                    setPaymentModalOpen(false);
                    resetPaymentForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Success Message */}
              {paymentResult?.success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">✓ Payment successful!</p>
                  <p className="text-xs text-green-600 mt-1">
                    Sent ${paymentResult.data.amount} to {paymentResult.data.toName}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {paymentResult?.success === false && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">✗ Payment failed</p>
                  <p className="text-xs text-red-600 mt-1">{paymentResult.error}</p>
                </div>
              )}

              {/* Payment Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {/* Card Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formatCardNumber(paymentForm.cardNumber)}
                    onChange={handlePaymentInputChange}
                    placeholder="**** **** **** ****"
                    maxLength="19"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
                    required
                  />
                  {cardInfo && (
                    <p className="text-xs text-gray-500 mt-1">
                      Card holder: {cardInfo.cardHolderName}
                    </p>
                  )}
                </div>

                {/* ZIP Code */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Billing ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={paymentForm.zipCode}
                    onChange={handlePaymentInputChange}
                    placeholder="12345"
                    maxLength="5"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    name="amount"
                    value={paymentForm.amount}
                    onChange={handlePaymentInputChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
                    required
                  />
                </div>

                {/* Recipient Account */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Recipient Account Number</label>
                  <input
                    type="text"
                    name="recipientAccountNumber"
                    value={paymentForm.recipientAccountNumber}
                    onChange={handlePaymentInputChange}
                    placeholder="Enter account number"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
                    required
                  />
                </div>

                {/* Description (Optional) */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    name="description"
                    value={paymentForm.description}
                    onChange={handlePaymentInputChange}
                    placeholder="e.g., Dinner, Rent, Gift"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="w-full mt-6 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? 'Processing...' : 'Make Payment'}
                </button>
              </form>

              {/* Security Note */}
              <p className="text-xs text-gray-400 text-center mt-4">
                Secure payment • No CVV required • ZIP code verification
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;