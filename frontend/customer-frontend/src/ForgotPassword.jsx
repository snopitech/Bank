// src/ForgotPassword.jsx - COMPLETE UPDATED VERSION
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      // First, clone the response to read it multiple times if needed
      const responseClone = res.clone();
      
      let data;
      let isJson = true;
      
      // Try to parse as JSON first
      try {
        data = await res.json();
      } catch (jsonError) {
        // If JSON fails, try text on the cloned response
        isJson = false;
        try {
          data = await responseClone.text();
          console.log("Backend returned non-JSON response:", data);
        } catch (textError) {
          console.error("Failed to read response as text:", textError);
          data = "Unknown response format";
        }
      }

      // Debug logging
      console.log("Forgot Password - Backend Response:");
      console.log("  Status:", res.status);
      console.log("  OK?", res.ok);
      console.log("  Is JSON?", isJson);
      console.log("  Data:", data);

      if (res.ok) {
        // Handle success - show backend message or default
        let successMessage = "Reset link sent! Check your email for instructions.";
        
        if (isJson && data && typeof data === 'object' && data.message) {
          successMessage = data.message;
        } else if (!isJson && data && data.trim() !== '') {
          successMessage = data;
        }
        
        setMessage({
          type: "success",
          text: successMessage
        });
        setEmail("");
      } else {
        // Handle error - show backend error message or default
        let errorMessage = "Failed to send reset link. Please try again.";
        
        if (isJson && data && typeof data === 'object' && data.message) {
          errorMessage = data.message;
        } else if (!isJson && data && data.trim() !== '') {
          errorMessage = data;
        }
        
        setMessage({
          type: "error",
          text: errorMessage
        });
      }
    } catch (err) {
      console.error("Forgot password error details:", err);
      
      let errorMessage = "Failed to send reset link. Please try again.";
      
      // More specific error messages
      if (err.message && err.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to the server. Make sure Spring Boot is running on port 8080.";
      } else if (err.message && err.message.includes("NetworkError")) {
        errorMessage = "Network issue. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setMessage({
        type: "error",
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logoUrl = "https://snopitechstore.online/public-images/Mylogo.png";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Same Header as Login Page */}
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
              <Link to="/" className="hover:text-red-200 transition">Home</Link>
              <Link to="/login" className="hover:text-red-200 transition">Sign In</Link>
              <button 
                onClick={() => navigate("/register")}
                className="bg-white text-red-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Open Account
              </button>
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
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
              <p className="text-gray-600">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Success/Error Messages */}
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
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-700 text-white py-3 rounded-lg font-semibold text-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
              <div className="text-center">
                <p className="text-gray-600">
                  Remember your password?{" "}
                  <Link to="/login" className="text-red-600 font-semibold hover:underline">
                    Back to Sign In
                  </Link>
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-red-600 font-semibold hover:underline">
                    Open one for free
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Your security is important to us. Reset links expire in 1 hour.
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
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
        </div>
      </footer>
    </div>
  );
}