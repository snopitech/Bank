import React, { useState } from "react";

const API_BASE = "";

export default function InternalTransferModal({ accounts, onClose, onSuccess }) {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
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
      // Use business name if available, otherwise generic
      return acc.businessName || "Business Account";
    } else {
      return acc.accountType || "Account";
    }
  };

  // Filter out the selected fromAccount from the toAccount options
  const getAvailableToAccounts = () => {
    if (!fromAccount) return accounts || [];
    return (accounts || []).filter(acc => acc.accountNumber !== fromAccount);
  };

  const validate = () => {
    if (!fromAccount) return "Please select a FROM account.";
    if (!toAccount) return "Please select a TO account.";
    if (fromAccount === toAccount)
      return "You cannot transfer to the same account.";
    if (!amount || Number(amount) <= 0)
      return "Amount must be greater than zero.";
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
      const url = `${API_BASE}/api/accounts/transfer/account-number?fromAccountNumber=${fromAccount}&toAccountNumber=${toAccount}&amount=${amount}&note=${encodeURIComponent(
        note
      )}`;

      const res = await fetch(url, { method: "POST" });

      if (!res.ok) {
        const text = await res.text();
        console.error("Transfer error:", text);
        setError("Transfer failed. Please check your balance.");
      } else {
        if (onSuccess) await onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Transfer error:", err);
      setError("An unexpected error occurred during the transfer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn z-[9999]">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 animate-slideUp">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 text-xl">🔄</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Transfer Between My Accounts
            </h2>
            <p className="text-xs text-gray-500">Instant • No fee</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <label className="block mb-2 font-medium text-gray-700">From Account</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={fromAccount}
          onChange={(e) => {
            setFromAccount(e.target.value);
            setToAccount("");
          }}
        >
          <option value="">Select account</option>
          {(accounts || []).map((acc, i) => (
            <option key={i} value={acc.accountNumber}>
              {getAccountDisplayName(acc)} — {acc.accountNumber?.slice(-4) || '••••'} (${acc.balance?.toFixed(2) || '0.00'})
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium text-gray-700">To Account</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
          disabled={!fromAccount}
        >
          <option value="">
            {!fromAccount ? "Select FROM account first" : "Select account"}
          </option>
          {getAvailableToAccounts().map((acc, i) => (
            <option key={i} value={acc.accountNumber}>
              {getAccountDisplayName(acc)} — {acc.accountNumber?.slice(-4) || '••••'} (${acc.balance?.toFixed(2) || '0.00'})
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium text-gray-700">Amount</label>
        <div className="relative mb-4">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
          />
        </div>

        <label className="block mb-2 font-medium text-gray-700">Note (optional)</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Description"
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
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            disabled={loading || !fromAccount || !toAccount || !amount}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Transfer Money"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}