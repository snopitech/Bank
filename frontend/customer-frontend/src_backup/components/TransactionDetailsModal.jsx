import React from "react";

export default function TransactionDetailsModal({ tx, onClose }) {
  if (!tx) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 animate-fadeIn">
        <h2 className="text-xl font-bold text-red-700 mb-4">
          Transaction Details
        </h2>

        <div className="space-y-3 text-gray-700">
          <p><strong>Type:</strong> {tx.type}</p>
          <p><strong>Description:</strong> {tx.description || "—"}</p>
          <p><strong>Amount:</strong> ${tx.amount.toFixed(2)}</p>
          <p><strong>Balance Before:</strong> {tx.balanceBefore != null ? `$${tx.balanceBefore.toFixed(2)}` : "—"}</p>
          <p><strong>Balance After:</strong> ${tx.balanceAfter.toFixed(2)}</p>
          <p><strong>Category:</strong> {tx.category || "—"}</p>
          <p><strong>Note:</strong> {tx.note || "—"}</p>
          <p><strong>Sender Account ID:</strong> {tx.accountId}</p>
          {tx.targetAccountId && (
            <p><strong>Receiver Account ID:</strong> {tx.targetAccountId}</p>
          )}
          <p><strong>Transaction ID:</strong> {tx.id}</p>
          <p><strong>Timestamp:</strong> {new Date(tx.timestamp).toLocaleString()}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-red-700 text-white py-2 rounded-lg hover:bg-red-800 transition font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
