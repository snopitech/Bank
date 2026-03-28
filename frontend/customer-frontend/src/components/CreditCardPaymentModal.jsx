import React, { useState } from "react";

const API_BASE = "";

export default function CreditCardPaymentModal({ 
  creditAccount, 
  userAccounts, 
  onClose, 
  onSuccess 
}) {
  const [sourceAccount, setSourceAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to get display name for account
  const getAccountDisplayName = (acc) => {
    if (acc.accountType === "CHECKING") {
      return "Everyday Checking";
    } else if (acc.accountType === "SAVINGS") {
      return "Everyday Savings";
    } else if (acc.accountType === "BUSINESS_CHECKING") {
      return acc.businessName || "Business Account";
    } else {
      return acc.accountType || "Account";
    }
  };

  const validate = () => {
    if (!sourceAccount) return "Please select a source account.";
    if (!amount || Number(amount) <= 0) return "Amount must be greater than zero.";
    if (Number(amount) > creditAccount.currentBalance) {
      return `Payment amount exceeds credit card balance of $${creditAccount.currentBalance.toFixed(2)}`;
    }
    
    // Check if selected source account has sufficient funds
    const selectedAcc = userAccounts?.find(acc => acc.id === parseInt(sourceAccount));
    if (selectedAcc && Number(amount) > selectedAcc.balance) {
      return `Insufficient funds in selected account. Available: $${selectedAcc.balance.toFixed(2)}`;
    }
    
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('loggedInUser');
      if (!userStr) throw new Error('User not logged in');
      const user = JSON.parse(userStr);

      // Get the selected source account details
      const selectedAcc = userAccounts?.find(acc => acc.id === parseInt(sourceAccount));
      if (!selectedAcc) throw new Error('Source account not found');

      // Get credit card number from the credit account's cards
      const creditCardNumber = creditAccount.cards?.[0]?.cardNumber || "7161098952345123";

      const response = await fetch(`${API_BASE}/api/credit-card-payments/payoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: creditCardNumber.replace(/\s/g, ''),
          zipCode: user.zipCode || "21054",
          amount: Number(amount),
          sourceAccountNumber: selectedAcc.accountNumber,
          description: note || "Credit card payment"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      alert(`Payment of $${amount} successful!`);
      if (onSuccess) await onSuccess();
      onClose();
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter to show only accounts that can be used for payment (checking, savings, business)
  const availableAccounts = (userAccounts || []).filter(acc => 
    ['CHECKING', 'SAVINGS', 'BUSINESS_CHECKING'].includes(acc.accountType) && 
    !acc.closed && 
    acc.balance > 0
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn z-[9999]">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 animate-slideUp">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 text-xl">💳</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Pay Credit Card Bill
            </h2>
            <p className="text-xs text-gray-500">
              Current Balance: {formatCurrency(creditAccount?.currentBalance || 0)}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <label className="block mb-2 font-medium text-gray-700">From Account</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          value={sourceAccount}
          onChange={(e) => setSourceAccount(e.target.value)}
        >
          <option value="">Select source account</option>
          {availableAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {getAccountDisplayName(acc)} — {acc.accountNumber?.slice(-4) || '••••'} (${acc.balance?.toFixed(2) || '0.00'})
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium text-gray-700">Amount</label>
        <div className="relative mb-4">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            max={creditAccount?.currentBalance}
            step="0.01"
          />
        </div>
        {creditAccount && Number(amount) > 0 && (
          <p className="text-xs text-gray-500 -mt-2 mb-4">
            Remaining balance after payment: {formatCurrency(creditAccount.currentBalance - Number(amount))}
          </p>
        )}

        <label className="block mb-2 font-medium text-gray-700">Note (optional)</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-6 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="e.g., March payment"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength="50"
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            disabled={loading || !sourceAccount || !amount}
          >
            {loading ? "Processing..." : "Make Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}