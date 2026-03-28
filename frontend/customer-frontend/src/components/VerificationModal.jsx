import React, { useState, useEffect } from "react";

const API_BASE = "";

export default function VerificationModal({ userId, email, onClose, onSuccess }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle code input
  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle key press (backspace)
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
  };

  // Handle verify submit
  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          code: fullCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(typeof data === "string" ? data : data.error || "Invalid code");
      }

      // Save user to localStorage
      localStorage.setItem("loggedInUser", JSON.stringify(data));
      
      onSuccess(data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend code
  const handleResend = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId })
      });

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || "Failed to resend code");
      }

      // Reset timer and code
      setTimeLeft(300);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);
      
      // Focus first input
      document.getElementById("code-0")?.focus();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Verification Code</h2>
          <p className="text-gray-600 mt-2">
            We've sent a 6-digit code to<br />
            <span className="font-semibold">{email}</span>
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Code expires in <span className="font-mono font-bold text-red-600">{formatTime()}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              autoFocus={index === 0}
            />
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleVerify}
            disabled={loading || code.join("").length !== 6}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          {canResend ? (
            <button
              onClick={handleResend}
              disabled={loading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
            >
              Resend Code
            </button>
          ) : (
            <p className="text-center text-sm text-gray-500">
              Didn't receive code? Wait {formatTime()} to resend
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition"
          >
            Cancel and return to login
          </button>
        </div>
      </div>
    </div>
  );
}