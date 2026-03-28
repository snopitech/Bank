import React from "react";

export default function DealCard({ merchant, offer, expires, note }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 transition transform hover:scale-[1.02] hover:shadow-lg">
      <h4 className="text-lg font-semibold text-gray-800">{merchant}</h4>
      <p className="text-gray-700">{offer}</p>
      {expires && <p className="text-sm text-gray-500">Expires {expires}</p>}
      {note && <p className="text-sm text-gray-500 italic">{note}</p>}
      <button className="mt-3 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition">
        Activate
      </button>
    </div>
  );
}
