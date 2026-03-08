// src/pages/VerifyEmailChange.jsx - UPDATED VERSION
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function VerifyEmailChange() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isValidToken, setIsValidToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Extract token and newEmail from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");
    const newEmailFromUrl = params.get("newEmail");
    
    setToken(tokenFromUrl || "");
    setNewEmail(newEmailFromUrl || "");
  }, [location]);

  // Verify token on component mount
  useEffect(() => {
    if (!token || !newEmail) {
      setIsValidToken(false);
      setIsLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        // Call correct endpoint with newEmail as query parameter
        const res = await fetch(
          `${API_BASE}/auth/verify-email-change/${token}?newEmail=${encodeURIComponent(newEmail)}`
        );
        
        if (res.ok) {
          setIsValidToken(true);
        } else {
          const errorText = await res.text();
          console.error("Token verification failed:", errorText);
          setIsValidToken(false);
        }
      } catch (err) {
        console.error("Token verification error:", err);
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token, newEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newEmail) {
      setMessage({ type: "error", text: "Please enter your new email address." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Call correct endpoint for confirmation
      const res = await fetch(`${API_BASE}/auth/confirm-email-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          newEmail: newEmail
        })
      });

      if (res.ok) {
        const data = await res.text();
        
        setMessage({
          type: "success",
          text: "Email updated successfully! Redirecting to login..."
        });
        
        // Clear local storage (user needs to login with new email)
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("token");
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        const errorText = await res.text();
        setMessage({
          type: "error",
          text: errorText || "Failed to update email. Please try again."
        });
      }
    } catch (err) {
      console.error("Email change error:", err);
      
      let errorMessage = "Failed to update email. Please try again.";
      
      if (err.message && err.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to the server. Make sure Spring Boot is running on port 8080.";
      }
      
      setMessage({
        type: "error",
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const logoUrl = "https://snopitechstore.online/public-images/Mylogo.png";

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying email change link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid or Expired Link</h2>
          <p className="text-gray-600 mb-8">
            This email change link is invalid or has expired. Please request a new email change from your profile page.
          </p>
          <div className="space-y-4">
            <Link 
              to="/profile" 
              className="block w-full bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
            >
              Go to Profile
            </Link>
            <Link 
              to="/dashboard" 
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Valid token - show email change form
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-red-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src={logoUrl} 
                  alt="Snopitech Bank Logo" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">SNOPITECH BANK</h1>
                <p className="text-red-200 text-sm">Trusted Since 2026</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="hover:text-red-200 transition">Dashboard</Link>
              <Link to="/profile" className="hover:text-red-200 transition">Profile</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Email Change Verified ✓</h2>
              <p className="text-gray-600">
                Your identity has been verified. Please confirm your new email address below.
              </p>
            </div>

            {/* Information Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Important:</p>
                  <p className="text-sm text-blue-700 mt-1">
                    After updating your email, you will need to login again with your new email address.
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    {message.type === 'success' ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    )}
                  </svg>
                  {message.text}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Email (readonly) */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  New Email Address
                </label>
                <p className="text-lg font-medium text-gray-900">{newEmail}</p>
                <p className="text-sm text-gray-500 mt-2">
                  This email will be updated in our system.
                </p>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start">
                <input
                  id="confirmation"
                  type="checkbox"
                  required
                  className="mt-1 mr-3 h-5 w-5 text-red-600 rounded focus:ring-red-500"
                />
                <label htmlFor="confirmation" className="text-sm text-gray-700">
                  I confirm that I want to change my email address to <strong>{newEmail}</strong>. 
                  I understand that I will need to login with this new email address after the change.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-700 to-red-800 text-white py-3 rounded-lg font-semibold text-lg hover:from-red-800 hover:to-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Email...
                  </>
                ) : (
                  "Confirm Email Change"
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-3 text-center">
              <p className="text-gray-600">
                <Link to="/profile" className="text-red-600 font-semibold hover:underline">
                  ← Back to Profile
                </Link>
              </p>
              <p className="text-gray-600">
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 hover:underline">
                  Go to Dashboard
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="font-bold">SNOPITECH BANK</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2026 Snopitech Bank. All rights reserved. Member FDIC.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Email change requests are processed securely and require verification.
          </p>
        </div>
      </footer>
    </div>
  );
}