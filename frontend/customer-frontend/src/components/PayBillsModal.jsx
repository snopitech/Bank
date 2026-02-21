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
  "Credit Card - Snopitech",
  "Credit Card - Visa",
  "Credit Card - MasterCard",
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

  const handleSubmit = async () => {
    if (!biller || !fromAccount || !amount) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE}/api/accounts/withdraw/account-number?accountNumber=${fromAccount}&amount=${amount}`;
      const res = await fetch(url, { method: "POST" });

      if (!res.ok) {
        const text = await res.text();
        console.error("Bill payment error:", text);
        alert("Bill payment failed. Please check console for details.");
      } else {
        alert(`Bill payment to ${biller} successful.`);
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      }
    } catch (err) {
      console.error("Bill payment error:", err);
      alert("An error occurred while processing the bill payment.");
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
              {acc.accountType} — {acc.accountNumber}
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
        />

        <label className="block mb-2 font-medium">Note (optional)</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-6"
          placeholder="e.g. Account #12345"
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
