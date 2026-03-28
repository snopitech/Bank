
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useContactModal } from "./ContactModalContext";
import ContactModal from "./ContactModal";
import VerificationModal from "./components/VerificationModal";

export default function Login() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const loginRef = useRef(null);
  const buttonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const mobileLoginOverlayRef = useRef(null);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [tempEmail, setTempEmail] = useState("");

  // Get contact modal functions
  const { openModal, isOpen, closeModal } = useContactModal();

  // Handle form field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Fetch complete user profile after login
  const fetchUserProfile = async (userId, token) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        }
      });
      
      if (res.ok) {
        const fullProfile = await res.json();
        return fullProfile;
      }
    } catch (err) {
      console.error("Failed to fetch full profile:", err);
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Invalid email or password");
        return;
      }

      // Check if 2FA is required
      if (data.requiresCode) {
        // Show verification modal
        setShowVerificationModal(true);
        setTempUserId(data.userId);
        setTempEmail(form.email);
        return;
      }

      // If no 2FA required (fallback for backward compatibility)
      console.log("Login response:", data);

      // Fetch complete user profile (includes address, security questions, etc.)
      const fullProfile = await fetchUserProfile(data.id, data.token);
      
      // Merge login response with full profile data
      const completeUserData = {
        ...data,
        ...fullProfile,
        // Preserve token and other auth data
        token: data.token,
        sessionId: data.sessionId,
        id: data.id || fullProfile?.id
      };

      // Save complete user data to localStorage
      localStorage.setItem("loggedInUser", JSON.stringify(completeUserData));
      console.log("Complete user profile saved:", completeUserData);

      // Close dropdown and redirect to dashboard
      setShowLogin(false);
      setIsMobileMenuOpen(false);
      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong.");
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle desktop login dropdown
// Handle desktop login dropdown - ONLY on desktop
if (window.innerWidth >= 768 && showLogin && loginRef.current && buttonRef.current) {
  const clickedInsideDropdown = loginRef.current.contains(event.target);
  const clickedOnButton = buttonRef.current.contains(event.target);
  
  console.log("Desktop - clickedInsideDropdown:", clickedInsideDropdown);
  console.log("Desktop - clickedOnButton:", clickedOnButton);
  
  const isFormElement = event.target.closest('form') !== null;
  const isInsideLoginForm = loginRef.current.contains(event.target) || 
                           (isFormElement && loginRef.current.querySelector('form')?.contains(event.target));
  
  if (!isInsideLoginForm && !clickedOnButton) {
    console.log("Closing desktop login");
    setShowLogin(false);
  }
}
// Handle mobile login overlay
if (showLogin && mobileLoginOverlayRef.current) {
  console.log("Click event:", event.target);
  console.log("Is target overlay background?", event.target === mobileLoginOverlayRef.current);
  console.log("Is click inside form?", mobileLoginOverlayRef.current.querySelector('form')?.contains(event.target));
  
  // Only close if clicking on the overlay background
  if (event.target === mobileLoginOverlayRef.current) {
    console.log("Closing login form");
    setShowLogin(false);
  }
}

      // Handle mobile menu
      if (isMobileMenuOpen && mobileMenuRef.current && mobileMenuButtonRef.current) {
        const clickedInsideMobileMenu = mobileMenuRef.current.contains(event.target);
        const clickedOnMobileButton = mobileMenuButtonRef.current.contains(event.target);
        
        if (!clickedInsideMobileMenu && !clickedOnMobileButton) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showLogin, isMobileMenuOpen]);

  // Close mobile menu when clicking links
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle show login from mobile
  const handleMobileLoginClick = () => {
    setShowLogin(true);
    setIsMobileMenuOpen(false);
  };

  // Your logo URL
  const logoUrl = "https://snopitechstore.online/public-images/Mylogo.png";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Contact Modal */}
      <ContactModal 
        isOpen={isOpen}
        onClose={closeModal}
        userData={null}
      />

      {/* Professional Banking Header - FULL WIDTH */}
      <header className="bg-gradient-to-r from-red-700 to-red-800 text-white shadow-lg sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center relative max-w-[1920px] mx-auto">
            {/* Bank Logo and Name */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  src={logoUrl} 
                  alt="Snopitech Bank Logo" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight whitespace-nowrap">SNOPITECH BANK</h1>
                <p className="text-red-200 text-xs sm:text-sm whitespace-nowrap">Trusted Since 2026</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="hover:text-red-200 transition whitespace-nowrap">Personal</a>
              <a href="#" className="hover:text-red-200 transition whitespace-nowrap">Business</a>
              <a href="#" className="hover:text-red-200 transition whitespace-nowrap">Wealth</a>
              <a href="#" className="hover:text-red-200 transition whitespace-nowrap">About</a>
              <div className="relative">
                <button 
                  ref={buttonRef}
                  onClick={() => setShowLogin(!showLogin)}
                  className="bg-white text-red-700 px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center space-x-2 whitespace-nowrap"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">Sign In</span>
                </button>

                {/* Login Dropdown for Desktop */}
                {showLogin && (
                  <div 
                    ref={loginRef}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl p-4 sm:p-6 z-50 border border-gray-200"
                  >
                    <h3 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
                      Sign In
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <input
                          name="email"
                          type="email"
                          placeholder="Email Address"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          value={form.email}
                          onChange={handleChange}
                          required
                          autoFocus
                        />
                      </div>
                      
                      {/* Password field with eye toggle */}
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500 pr-10 sm:pr-12"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 015.19 6.615M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      {/* FORGOT PASSWORD LINK */}
                      <div className="text-right">
                        <Link 
                          to="/forgot-password"
                          className="text-xs sm:text-sm text-red-600 hover:text-red-800 hover:underline"
                          onClick={() => setShowLogin(false)}
                        >
                          Forgot password?
                        </Link>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-red-700 text-white py-2 sm:py-3 rounded-lg mt-4 hover:bg-red-800 font-semibold text-sm sm:text-lg transition-colors"
                      >
                        Login
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button and Sign In */}
            <div className="flex items-center space-x-3 md:hidden relative">
              <button 
                onClick={handleMobileLoginClick}
                className="bg-white text-red-700 p-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center"
                aria-label="Sign In"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              <button 
                ref={mobileMenuButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>

              {/* Mobile Menu Dropdown */}
              {isMobileMenuOpen && (
                <div 
                  ref={mobileMenuRef}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
                >
                  <div className="py-2">
                    <a 
                      href="#" 
                      className="block px-4 py-3 text-sm text-gray-800 hover:bg-red-50 hover:text-red-700 transition"
                      onClick={handleMobileLinkClick}
                    >
                      Personal
                    </a>
                    <a 
                      href="#" 
                      className="block px-4 py-3 text-sm text-gray-800 hover:bg-red-50 hover:text-red-700 transition"
                      onClick={handleMobileLinkClick}
                    >
                      Business
                    </a>
                    <a 
                      href="#" 
                      className="block px-4 py-3 text-sm text-gray-800 hover:bg-red-50 hover:text-red-700 transition"
                      onClick={handleMobileLinkClick}
                    >
                      Wealth
                    </a>
                    <a 
                      href="#" 
                      className="block px-4 py-3 text-sm text-gray-800 hover:bg-red-50 hover:text-red-700 transition"
                      onClick={handleMobileLinkClick}
                    >
                      About
                    </a>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleMobileLoginClick}
                        className="w-full bg-red-600 text-white px-4 py-3 text-sm rounded mx-4 mb-2 font-semibold hover:bg-red-700 transition flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Sign In</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Login Form Overlay */}
      {showLogin && (
        <div 
  ref={mobileLoginOverlayRef}
  className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 md:hidden overflow-y-auto"
  onClick={(e) => {
    // Only close if clicking directly on the overlay background, not on the form
    if (e.target === mobileLoginOverlayRef.current) {
      setShowLogin(false);
    }
  }}
>
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Sign In
                </h3>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
                
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500 pr-10"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 015.19 6.615M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="text-right">
                  <Link 
                    to="/forgot-password"
                    className="text-xs text-red-600 hover:text-red-800 hover:underline"
                    onClick={() => setShowLogin(false)}
                  >
                    Forgot password?
                  </Link>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-red-700 text-white py-3 rounded-lg mt-4 hover:bg-red-800 font-semibold text-sm transition-colors"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <VerificationModal
          userId={tempUserId}
          email={tempEmail}
          onClose={() => {
            setShowVerificationModal(false);
            setTempUserId(null);
            setTempEmail("");
          }}
  onSuccess={async (userData) => {
  setShowVerificationModal(false);
  
  // Fetch complete user profile
  const fullProfile = await fetchUserProfile(userData.id, userData.token);
  
  const completeUserData = {
    ...userData,
    ...fullProfile,
    token: userData.token,
    sessionId: userData.sessionId,
    id: userData.id || fullProfile?.id
  };
  
  localStorage.setItem("loggedInUser", JSON.stringify(completeUserData));
  setShowLogin(false);
  setIsMobileMenuOpen(false);
  navigate("/dashboard");
}}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-800 text-white w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-32">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                    Banking Made <span className="text-yellow-300">Brilliantly Simple</span>
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-red-100">
                    Join thousands of satisfied customers with our award-winning digital banking. 
                    Get checking, savings, and investment accounts all in one place.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Link
                      to="/register"
                      className="bg-white text-red-700 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-100 transition shadow-lg text-center"
                      onClick={() => setShowLogin(false)}
                    >
                      Open Account Free
                    </Link>
                    <a 
                      href="#features"
                      className="border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-white hover:text-red-700 transition text-center"
                    >
                      Explore Features
                    </a>
                  </div>
                </div>
                
                <div className="relative mt-8 md:mt-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-white/20 p-4 sm:p-6 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">0%</div>
                        <p className="text-xs sm:text-sm text-red-100">APR for 12 months</p>
                      </div>
                      <div className="bg-white/20 p-4 sm:p-6 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">2.5%</div>
                        <p className="text-xs sm:text-sm text-red-100">High-Yield Savings</p>
                      </div>
                      <div className="bg-white/20 p-4 sm:p-6 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">$0</div>
                        <p className="text-xs sm:text-sm text-red-100">Monthly Fees</p>
                      </div>
                      <div className="bg-white/20 p-4 sm:p-6 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">24/7</div>
                        <p className="text-xs sm:text-sm text-red-100">Customer Support</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-red-500 rounded-full -translate-y-16 sm:-translate-y-32 translate-x-16 sm:translate-x-32 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-96 sm:h-96 bg-red-400 rounded-full translate-y-24 sm:translate-y-48 -translate-x-24 sm:-translate-x-48 opacity-10"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-16 md:py-20 bg-white w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 sm:mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Everything You Need In One Bank
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                  From everyday banking to growing your wealth, we've got you covered
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                    <span className="text-xl sm:text-2xl">🏦</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Smart Checking</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Get fee-free checking with early direct deposit, mobile check deposit, and instant notifications.
                  </p>
                  <a href="#" className="text-red-600 font-semibold hover:underline text-sm sm:text-base">Learn more →</a>
                </div>

                <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                    <span className="text-xl sm:text-2xl">💰</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">High-Yield Savings</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Earn 10x the national average with our high-yield savings accounts. No minimum balance required.
                  </p>
                  <a href="#" className="text-red-600 font-semibold hover:underline text-sm sm:text-base">Learn more →</a>
                </div>

                <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                    <span className="text-xl sm:text-2xl">⚡</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Instant Transfers</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Send money to anyone instantly with Zelle®. No fees, no waiting, just fast transfers.
                  </p>
                  <a href="#" className="text-red-600 font-semibold hover:underline text-sm sm:text-base">Learn more →</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-red-50 to-white w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-700 mb-1 sm:mb-2">500K+</div>
                  <p className="text-sm text-gray-600">Happy Customers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-700 mb-1 sm:mb-2">$2.5B+</div>
                  <p className="text-sm text-gray-600">Assets Protected</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-700 mb-1 sm:mb-2">99.9%</div>
                  <p className="text-sm text-gray-600">Uptime Reliability</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-700 mb-1 sm:mb-2">24/7</div>
                  <p className="text-sm text-gray-600">Support Available</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-red-700 to-red-800 text-white w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Ready to Experience Better Banking?
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 text-red-100">
                Join Snopitech Bank today and get your account in minutes. No hidden fees, no paperwork.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link
                  to="/register"
                  className="bg-white text-red-700 px-6 py-3 sm:px-10 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-100 transition shadow-lg text-center"
                  onClick={() => setShowLogin(false)}
                >
                  Open Free Account
                </Link>
                <a 
                  href="#"
                  className="border-2 border-white text-white px-6 py-3 sm:px-10 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-white hover:text-red-700 transition text-center"
                >
                  Schedule a Call
                </a>
              </div>
              <p className="mt-6 sm:mt-8 text-sm sm:text-base text-red-200">
                Already have an account?{" "}
                <button 
                  onClick={() => setShowLogin(true)}
                  className="text-white font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6 sm:pt-16 sm:pb-8 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1920px] mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
              <div>
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={logoUrl} 
                      alt="Snopitech Bank Logo" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold whitespace-nowrap">SNOPITECH BANK</h3>
                    <p className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">Member FDIC</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Redefining banking for the modern world. Secure, simple, and always available.
                </p>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Products</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Personal Banking</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Business Accounts</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Credit Cards</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Loans & Mortgages</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Investment Accounts</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Resources</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Help Center</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Security Center</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Blog</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Community</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Developer API</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Company</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">About Us</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Careers</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Press</a></li>
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Partnerships</a></li>
                  <li>
                    <button 
                      onClick={() => openModal()}
                      className="text-sm text-gray-400 hover:text-white transition text-left w-full"
                    >
                      Contact Support
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 border-t border-gray-800">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-0">
                  © 2026 Snopitech Bank. All rights reserved. FDIC insured up to $250,000.
                </div>
                <div className="flex space-x-4 sm:space-x-6">
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4 1.79-4 4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
                <p className="mb-2 flex flex-wrap justify-center gap-2 sm:gap-4">
                  <a href="#" className="hover:text-white transition">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition">Terms of Service</a>
                  <a href="#" className="hover:text-white transition">Cookie Policy</a>
                  <a href="#" className="hover:text-white transition">Security</a>
                  <a href="#" className="hover:text-white transition">Disclosures</a>
                </p>
                <p>Snopitech Bank N.A. Member FDIC. Equal Housing Lender.</p>
                <p className="mt-4">
                  Need help?{" "}
                  <button 
                    onClick={() => openModal()}
                    className="text-red-300 hover:text-white hover:underline transition"
                  >
                    Contact Support
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}