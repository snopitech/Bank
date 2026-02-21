import React from "react";

export default function PromoCard({ text }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-gray-700 transition transform hover:scale-[1.02] hover:shadow-lg">
      {text}
    </div>
  );
}
