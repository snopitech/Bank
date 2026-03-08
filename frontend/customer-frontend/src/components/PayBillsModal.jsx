import React, { useState } from "react";

const API_BASE = "http://localhost:8080";

const BILLERS = [
  "Electricity",
  "Water",
  "Internet",
  "Mobile Phone",
  "Rent",
  "Mortgage",
  "Car Loan",
  "Student Loan",
  "Insurance - Auto",
  "Insurance - Home",
  "Insurance - Health",
  "Streaming - Netflix",
  "Streaming - Hulu",
  "Streaming - Disney+",
  "Streaming - YouTube TV",
  "Gym Membership",
  "Property Tax",
  "Gas Utility",
  "Trash & Recycling",
  "Security System",
  "Cloud Storage",
];

export default function PayBillsModal({ accounts, onClose, onSuccess }) {
  const [biller, setBiller] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to check if account is credit card
  const isCreditCard = (acc) => {
    return acc.accountType === "CREDIT" || acc.creditLimit !== undefined;
  };

  const handleSubmit = async () => {
    setError("");
    
    if (!biller || !fromAccount || !amount) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Get the selected account
      const selectedAccount = accounts?.find(acc => acc.accountNumber === fromAccount);
      
      let url;
      let options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };

      // If using credit card to pay bill, use the credit card payment endpoint
      if (isCreditCard(selectedAccount)) {
        // Need credit card number from the account
        const creditCardNumber = selectedAccount.cards?.[0]?.cardNumber || 
                                 prompt("Enter your credit card number:", "7161098952345123");
        
        if (!creditCardNumber) {
          setLoading(false);
          return;
        }

        url = `${API_BASE}/api/credit-card-payments/pay`;
        options.body = JSON.stringify({
          cardNumber: creditCardNumber.replace(/\s/g, ''),
          zipCode: "21054", // You might want to get this from user profile
          amount: parseFloat(amount),
          recipientAccountNumber: "BILLER", // This would need to be handled differently for bills
          description: note || `Payment to ${biller}`
        });
      } else {
        // Regular account withdrawal
        url = `${API_BASE}/api/accounts/withdraw/account-number?accountNumber=${fromAccount}&amount=${amount}`;
      }

      const res = await fetch(url, options);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      alert(`Payment to ${biller} successful.`);
      if (onSuccess) {
        await onSuccess();
      }
      onClose();

    } catch (err) {
      console.error("Bill payment error:", err);
      setError(err.message || "An error occurred while processing the payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn z-[9999]">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 animate-slideUp">
        <h2 className="text-xl font-semibold text-red-700 mb-4">
          Pay Bills
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <label className="block mb-2 font-medium">Biller</label>
        <select
          className="w-full border rounded px-3 py-2 mb-4"
          value={biller}
          onChange={(e) => setBiller(e.target.value)}
        >
          <option value="">Select biller</option>
          {BILLERS.map((b, i) => (
            <option key={i} value={b}>
              {b}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium">From Account</label>
        <select
          className="w-full border rounded px-3 py-2 mb-4"
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
        >
          <option value="">Select account</option>
          {(accounts || []).map((acc, i) => (
            <option key={i} value={acc.accountNumber}>
              {acc.accountType === "CHECKING" && "🏦 "}
              {acc.accountType === "SAVINGS" && "💰 "}
              {acc.accountType === "BUSINESS_CHECKING" && "🏢 "}
              {(acc.accountType === "CREDIT" || acc.creditLimit !== undefined) && "💳 "}
              {acc.accountType || "Account"} — {acc.accountNumber?.slice(-4) || '****'} (${acc.balance?.toFixed(2) || '0.00'})
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium">Amount</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
        />

        <label className="block mb-2 font-medium">Note (optional)</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-6"
          placeholder="e.g., Account #12345"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-red-700 text-white hover:bg-red-800 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}