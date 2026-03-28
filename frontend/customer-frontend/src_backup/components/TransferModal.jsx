import React, { useState } from "react";

const API_BASE = "http://localhost:8080";

export default function TransferModal({ accounts, onClose, onSuccess }) {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!fromAccount) return "Please select a FROM account.";
    if (!toAccount) return "Please enter a TO account number.";
    if (toAccount.length !== 10) return "Account number must be 10 digits.";
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
      // ⭐ UPDATED: note is now included in the request
      const url = `${API_BASE}/api/accounts/transfer/account-number?fromAccountNumber=${fromAccount}&toAccountNumber=${toAccount}&amount=${amount}&note=${encodeURIComponent(
        note
      )}`;

      const res = await fetch(url, { method: "POST" });

      if (!res.ok) {
        const text = await res.text();
        console.error("Transfer error:", text);
        setError("Transfer failed. Please check the account number or balance.");
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
        <h2 className="text-xl font-semibold text-red-700 mb-4">
          Transfer Money
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <label className="block mb-2 font-medium">From Account</label>
        <select
          className="w-full border rounded px-3 py-2 mb-4"
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
        >
          <option value="">Select account</option>
          {(accounts || []).map((acc, i) => (
            <option key={i} value={acc.accountNumber}>
              {acc.accountType} — {acc.accountNumber}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium">To Account Number</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Enter 10‑digit account number"
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
          maxLength={10}
        />

        <label className="block mb-2 font-medium">Amount</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label className="block mb-2 font-medium">Note (optional)</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-6"
          placeholder="Description"
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
            {loading ? "Processing..." : "Confirm Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
}
