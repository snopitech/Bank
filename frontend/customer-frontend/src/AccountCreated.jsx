import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AccountCreated() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state?.user;

  // Save user to localStorage and auto-login
  useEffect(() => {
    if (user) {
      console.log("Saving user to localStorage:", user);
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      
      // Auto-redirect to dashboard after 5 seconds
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      navigate("/register");
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-700">Account Details Not Found</h1>
        <p className="text-gray-700 mt-2">Please start the registration process again.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800"
        >
          Back to Open Account
        </button>
      </div>
    );
  }

  const accounts = user.accounts || [];
  
  console.log("User accounts from registration:", accounts);

  const checking = accounts.find(
    (a) => a.accountType && a.accountType.toUpperCase() === "CHECKING"
  );
  const savings = accounts.find(
    (a) => a.accountType && a.accountType.toUpperCase() === "SAVINGS"
  );

  const routingNumber =
    checking?.routingNumber || savings?.routingNumber || "842917356";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <EnhancedHeader />
      
      <div className="flex justify-center mt-10 px-4">
        <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-8 md:p-10 text-center">
          {/* Success Animation */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-4xl">✅</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🎉 Account Successfully Created!
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Welcome to Snopitech Bank, {user.firstName}! Your accounts are now active and ready to use.
          </p>

          {/* Account Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-gray-50 border-2 border-blue-100 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-xl font-semibold text-blue-800 mb-6 pb-3 border-b border-blue-200">
              Your New Banking Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Account Holder</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-lg text-gray-800">{user.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 font-medium">Routing Number</p>
                  <p className="text-lg font-mono font-semibold text-gray-800">{routingNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">For direct deposits & wire transfers</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Checking Account */}
                <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">Everyday Checking</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {checking ? (
                          <>
                            Account: <span className="font-mono">{checking.accountNumber}</span>
                          </>
                        ) : "Creating account..."}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-green-600">
                        ${checking?.balance?.toFixed(2) || "0.00"}
                      </p>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Savings Account */}
                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">Everyday Savings</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {savings ? (
                          <>
                            Account: <span className="font-mono">{savings.accountNumber}</span>
                          </>
                        ) : "Creating account..."}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-blue-600">
                        ${savings?.balance?.toFixed(2) || "0.00"}
                      </p>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-8 text-left">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-500 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-yellow-800">Important Security Notice</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• Save your account numbers in a secure location</li>
                  <li>• Your account numbers will not be shown again for security reasons</li>
                  <li>• Enable two-factor authentication for added security</li>
                  <li>• Never share your online banking credentials</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Next Steps:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">🏦</div>
                <p className="font-medium text-gray-800">Make Your First Deposit</p>
                <p className="text-sm text-gray-600 mt-1">Start with as little as $25</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">📱</div>
                <p className="font-medium text-gray-800">Download Our App</p>
                <p className="text-sm text-gray-600 mt-1">Bank on the go</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">🔐</div>
                <p className="font-medium text-gray-800">Set Up Security</p>
                <p className="text-sm text-gray-600 mt-1">Enable alerts & notifications</p>
              </div>
            </div>
          </div>

          {/* Auto-redirect notice */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-700">
              <span className="font-semibold">Note:</span> You will be automatically redirected to your dashboard in 5 seconds. 
              You are now logged in.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
            >
              Go to Dashboard Now
            </button>
            
            <button
              onClick={() => {
                // Print account details
                const printContent = `
                  <h2>Snopitech Bank - Account Details</h2>
                  <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
                `;
                const printWindow = window.open('', '_blank');
                printWindow.document.write(printContent);
                printWindow.print();
              }}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Print Account Details
            </button>
          </div>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}

function EnhancedHeader() {
  return (
    <header className="bg-gradient-to-r from-red-700 to-red-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-700 font-bold text-xl">$</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SNOPITECH BANK</h1>
              <p className="text-sm text-red-100">Secure Banking Solutions</p>
            </div>
          </div>
          <div className="text-sm">
            <span className="bg-green-500 text-white px-3 py-1 rounded-full">New Account</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function EnhancedFooter() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-400">
            Need help? Call us at <span className="text-white font-semibold">1-800-SNOPITECH</span>
          </p>
          <p className="text-gray-400 mt-2">
            Mon-Fri 8AM-8PM EST | Sat 9AM-5PM EST
          </p>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-400">
          <p>© 2026 Snopitech Bank. Member FDIC. Equal Housing Lender. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="/privacy" className="hover:text-white">Privacy Policy</a>
            <a href="/terms" className="hover:text-white">Terms of Service</a>
            <a href="/security" className="hover:text-white">Security Center</a>
            <a href="/contact" className="hover:text-white">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}