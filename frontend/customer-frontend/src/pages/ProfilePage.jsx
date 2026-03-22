import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoadingScreen from "../components/LoadingScreen";
// Import Contact Modal Context and Component - ADDED FOR CONTACT SUPPORT
import { useContactModal } from "../ContactModalContext";
import ContactInlineForm from "../ContactInlineForm"; // NEW: Import inline form

const API_BASE = "http://localhost:8080";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
    ssnLastFour: "",
    employmentStatus: "",
    annualIncome: "",
    riskTolerance: "MODERATE"
  });
  
  // ⭐ NEW: State for security questions
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  // ⭐⭐⭐ ADDED: Contact Modal Hook for inline form
  const { toggleInlineForm, isInlineExpanded, inlineUserData, inlinePresetCategory, inlinePresetSubject } = useContactModal();

  // ⭐⭐⭐ ADDED: Handle Contact Support Click
  const handleContactSupport = () => {
    const userData = {
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
    };
    
    const prefillData = {
      userData,
      presetSubject: "Profile Support Request",
      presetCategory: "ACCOUNT_ISSUE"
    };
    
    console.log("Toggling inline contact form with data:", prefillData);
    toggleInlineForm(prefillData);
  };

  // Simulated loading screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // ⭐ NEW: Fetch security questions
  const fetchSecurityQuestions = async (userId, token) => {
    setLoadingSecurity(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}/security-questions`, {
       
      });
      
      if (response.ok) {
        const data = await response.json();
        setSecurityQuestions(Array.isArray(data) ? data : []);
        console.log("Security questions loaded:", data);
      } else {
        console.warn("Failed to load security questions");
        setSecurityQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching security questions:", error);
      setSecurityQuestions([]);
    } finally {
      setLoadingSecurity(false);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!loggedInUser) {
          navigate("/login");
          return;
        }

        setUser(loggedInUser);
        const token = loggedInUser?.sessionId;
        
        // Fetch user details from API
        const response = await fetch(`${API_BASE}/api/users/${loggedInUser.id}`);
        if (response.ok) {
          const userData = await response.json();
          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            // FIXED 1: Use addressLine1 from API if address is not present
            address: userData.addressLine1 || userData.address || "",
            city: userData.city || "",
            state: userData.state || "",
            zipCode: userData.zipCode || "",
            dateOfBirth: userData.dateOfBirth || "",
            ssnLastFour: userData.ssnLastFour || "",
            employmentStatus: userData.employmentStatus || "",
            annualIncome: userData.annualIncome || "",
            riskTolerance: userData.riskTolerance || "MODERATE"
          });
        }

        // Fetch user accounts
        if (loggedInUser.accounts && loggedInUser.accounts.length > 0) {
          setAccounts(loggedInUser.accounts);
        }

        // ⭐ NEW: Fetch security questions
        if (token) {
          fetchSecurityQuestions(loggedInUser.id);
        }

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ⭐ NEW: Toggle answers visibility
  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  // ⭐ NEW: Mask answer for display when not showing
  const maskAnswer = (answer) => {
    if (!answer) return "••••";
    if (showAnswers) return answer;
    // Show first 2 chars + asterisks
    if (answer.length > 2) {
      return answer.substring(0, 2) + "•".repeat(Math.min(answer.length - 2, 10));
    }
    return "•".repeat(answer.length);
  };

  // ⭐⭐⭐ FIXED: Profile Save Function with correct authentication
 const handleSaveProfile = async () => {
  setIsSaving(true);
  setSaveMessage({ type: "", text: "" });

  try {
    // REMOVE token check entirely
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      throw new Error("User not found. Please login again.");
    }

    const userId = loggedInUser.id; // Use loggedInUser.id directly

      console.log("🔄 Updating profile for user ID:", userId);
      
      // 2. Prepare update data - Map frontend fields to backend DTO fields
      // Convert annualIncome from string to number (or null if empty)
      const annualIncomeValue = formData.annualIncome 
        ? parseFloat(formData.annualIncome) 
        : null;
      
      const updateData = {
        phone: formData.phone || "",
        addressLine1: formData.address || "",  // Map "address" to "addressLine1"
        addressLine2: "", // Add if you have addressLine2 field in your form
        city: formData.city || "",
        state: formData.state || "",
        zipCode: formData.zipCode || "",
        country: "US", // Default or get from form if you have it
        
        // Add the 3 new fields
        employmentStatus: formData.employmentStatus || "",
        annualIncome: annualIncomeValue,
        riskTolerance: formData.riskTolerance || "MODERATE"
      };
      
      console.log("📤 Sending update data to backend:", updateData);

      // 3. Use the CORRECT endpoint: /update-profile-safe
      const response = await fetch(`${API_BASE}/api/users/${userId}/update-profile-safe`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log("✅ Profile updated successfully:", updatedUser);
        
        // Update localStorage with the updated user
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
        setUser(updatedUser);

        setSaveMessage({
          type: "success",
          text: "Profile updated successfully!"
        });
        setIsEditing(false);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveMessage({ type: "", text: "" });
        }, 3000);
      } else {
        const errorText = await response.text();
        console.error("❌ Update failed:", response.status, errorText);
        throw new Error(errorText || "Failed to update profile");
      }
    } catch (error) {
      console.error("💥 Error updating profile:", error);
      setSaveMessage({
        type: "error",
        text: error.message || "Failed to update profile. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        // FIXED 2: Use addressLine1 from user object if address is not present
        address: user.addressLine1 || user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        dateOfBirth: user.dateOfBirth || "",
        ssnLastFour: user.ssnLastFour || "",
        employmentStatus: user.employmentStatus || "",
        annualIncome: user.annualIncome || "",
        riskTolerance: user.riskTolerance || "MODERATE"
      });
    }
  };

  const getRiskToleranceLabel = (risk) => {
  switch(risk) {
    case "CONSERVATIVE":
    case "Capital Preservation":
      return "Conservative";
    case "MODERATE":
    case "Income Generation":
    case "Growth":
      return "Moderate";
    case "AGGRESSIVE":
    case "Aggressive Growth":
      return "Aggressive";
    default:
      return risk || "Moderate";
  }
};

  const getEmploymentStatusLabel = (status) => {
    switch(status) {
      case "EMPLOYED": return "Employed";
      case "SELF_EMPLOYED": return "Self-Employed";
      case "UNEMPLOYED": return "Unemployed";
      case "RETIRED": return "Retired";
      case "STUDENT": return "Student";
      default: return status || "Not provided";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const maskSsn = (ssn) => {
    if (!ssn) return "••••";
    return `•••-••-${ssn}`;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        No user found. Please log in again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 animate-fadeIn">
      <Header name={user?.firstName || ""} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Save Message */}
        {saveMessage.text && (
          <div className={`mb-6 animate-slideIn ${saveMessage.type === 'success' ? 'bg-orange-50 border-orange-200' : 'bg-pink-50 border-pink-200'} border rounded-xl p-4 shadow-sm`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${saveMessage.type === 'success' ? 'bg-orange-100' : 'bg-pink-100'}`}>
                <span className={`${saveMessage.type === 'success' ? 'text-orange-600' : 'text-pink-600'}`}>
                  {saveMessage.type === 'success' ? '✓' : '✕'}
                </span>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-orange-800' : 'text-pink-800'}`}>
                  {saveMessage.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="bg-gradient-to-r from-orange-300 to-pink-300 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/40 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl sm:text-3xl text-gray-700">
                    {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-orange-700 text-sm sm:text-base">
                    Member since {new Date(user.createdAt || Date.now()).getFullYear()}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-orange-600 hover:bg-orange-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors shadow-lg"
                    >
                      Edit Profile
                    </button>
                    {/* ⭐⭐⭐ ADDED: Contact Support Button - Toggles inline form */}
                    <button
                      onClick={handleContactSupport}
                      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center ${
                        isInlineExpanded 
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                          : 'bg-gradient-to-r from-orange-400 to-pink-400 text-white hover:from-orange-500 hover:to-pink-500'
                      }`}
                    >
                      <span className="mr-2">{isInlineExpanded ? '✕' : '📧'}</span>
                      {isInlineExpanded ? 'Close Support' : 'Contact Support'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-orange-400 hover:bg-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors shadow-lg"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ⭐⭐⭐ ADDED: Help & Support Section with Inline Form */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl shadow-lg p-4 border border-orange-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center">
                  <span className="text-orange-500 mr-2">❓</span>
                  Need Help with Your Profile?
                </h3>
                <p className="text-sm text-gray-600">
                  Get assistance with profile updates, account settings, or personal information.
                </p>
              </div>
              <button
                onClick={handleContactSupport}
                className={`px-4 py-2 rounded-lg transition-all duration-300 shadow font-medium flex items-center ${
                  isInlineExpanded 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                    : 'bg-gradient-to-r from-orange-400 to-pink-400 text-white hover:from-orange-500 hover:to-pink-500 hover:shadow-lg'
                }`}
              >
                <span className="mr-2">{isInlineExpanded ? '✕' : '💬'}</span>
                {isInlineExpanded ? 'Close Support' : 'Get Profile Support'}
              </button>
            </div>
          </div>
          
          {/* ⭐⭐⭐ INLINE CONTACT FORM RENDERS HERE */}
          <ContactInlineForm
            isExpanded={isInlineExpanded}
            onClose={() => toggleInlineForm()}
            userData={inlineUserData}
            presetCategory={inlinePresetCategory}
            presetSubject={inlinePresetSubject}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column: Personal Information */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Personal Information</h2>
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                  <span className="text-orange-500">👤</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* First Name - NOT EDITABLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <div className="text-gray-900 font-medium text-sm sm:text-base">{user.firstName}</div>
                  <p className="text-xs text-gray-500 mt-1">Contact support to change name</p>
                </div>

                {/* Last Name - NOT EDITABLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <div className="text-gray-900 font-medium text-sm sm:text-base">{user.lastName}</div>
                  <p className="text-xs text-gray-500 mt-1">Contact support to change name</p>
                </div>

                {/* Email - NOT EDITABLE (requires authentication) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="text-gray-900 font-medium text-sm sm:text-base">{user.email}</div>
                  <p className="text-xs text-gray-500 mt-1">Email changes require verification</p>
                </div>

                {/* Phone - EDITABLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm sm:text-base"
                      placeholder="(123) 456-7890"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium text-sm sm:text-base">{user.phone || "Not provided"}</div>
                  )}
                </div>

                {/* Date of Birth - NOT EDITABLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div className="text-gray-900 font-medium text-sm sm:text-base">{formatDate(user.dateOfBirth)}</div>
                  <p className="text-xs text-gray-500 mt-1">Date of birth cannot be changed</p>
                </div>

                {/* SSN Last Four - NOT EDITABLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSN Last 4 Digits</label>
                  <div className="text-gray-900 font-medium text-sm sm:text-base">{maskSsn(user.ssnLastFour)}</div>
                  <p className="text-xs text-gray-500 mt-1">Security information is protected</p>
                </div>
              </div>
            </div>

            {/* Address Information Card - ALL EDITABLE */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Address Information</h2>
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                  <span className="text-orange-500">🏠</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm sm:text-base"
                      placeholder="123 Main St"
                    />
                  ) : (
                    // FIXED 3: Display addressLine1 from user object if address is not present
                    <div className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.addressLine1 || user.address || "Not provided"}
                    </div>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm sm:text-base"
                      placeholder="New York"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium text-sm sm:text-base">{user.city || "Not provided"}</div>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm sm:text-base"
                      placeholder="NY"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium text-sm sm:text-base">{user.state || "Not provided"}</div>
                  )}
                </div>

                {/* Zip Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm sm:text-base"
                      placeholder="10001"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium text-sm sm:text-base">{user.zipCode || "Not provided"}</div>
                  )}
                </div>
              </div>
            </div>

            {/* ⭐ NEW: Security Questions Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-pink-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Security Questions</h2>
                <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center">
                  <span className="text-pink-500">🔐</span>
                </div>
              </div>

              {loadingSecurity ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
                </div>
              ) : securityQuestions.length > 0 ? (
                <div className="space-y-4">
                  {/* Toggle Answers Button */}
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={toggleAnswers}
                      className="flex items-center text-sm text-pink-500 hover:text-pink-600 font-medium transition-colors"
                    >
                      <span className="mr-1">{showAnswers ? '👁️' : '👁️‍🗨️'}</span>
                      {showAnswers ? 'Hide Answers' : 'Show Answers'}
                    </button>
                  </div>

                  {/* Questions List */}
                  {securityQuestions.map((item, index) => (
                    <div key={index} className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-pink-500 text-sm font-bold">Q{index + 1}:</span>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.question}</p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs font-medium text-gray-500 mr-2">Answer:</span>
                            <span className="text-sm font-mono bg-white px-3 py-1 rounded border border-gray-200">
                              {maskAnswer(item.answer)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-orange-50 p-3 rounded-lg mt-4">
                    <p className="text-xs text-orange-600 flex items-center">
                      <span className="mr-1">🔒</span>
                      Your security answers are encrypted. {showAnswers ? 'Answers are visible only to you.' : 'Click "Show Answers" to reveal.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-5xl mb-3">🔐</div>
                  <p className="text-gray-600 font-medium">No security questions set</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Security questions help you recover your account if you forget your password.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Financial Information & Accounts */}
          <div className="space-y-4 sm:space-y-6">
            {/* Financial Information Card - ALL EDITABLE */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Financial Information</h2>
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                  <span className="text-orange-500">💰</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Employment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                  {isEditing ? (
                    <select
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm sm:text-base"
                    >
                      <option value="">Select Status</option>
                      <option value="EMPLOYED">Employed</option>
                      <option value="SELF_EMPLOYED">Self-Employed</option>
                      <option value="UNEMPLOYED">Unemployed</option>
                      <option value="RETIRED">Retired</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  ) : (
                    <div className="text-gray-900 font-medium text-sm sm:text-base">
                      {getEmploymentStatusLabel(user.employmentStatus)}
                    </div>
                  )}
                </div>

                {/* Annual Income */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="annualIncome"
                      value={formData.annualIncome}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm sm:text-base"
                      placeholder="50000"
                      min="0"
                      step="1000"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.annualIncome ? formatCurrency(user.annualIncome) : "Not provided"}
                    </div>
                  )}
                </div>

                {/* Risk Tolerance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
                  {isEditing ? (
                    <select
                      name="riskTolerance"
                      value={formData.riskTolerance}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm sm:text-base"
                    >
                      <option value="CONSERVATIVE">Conservative</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="AGGRESSIVE">Aggressive</option>
                    </select>
                  ) : (
                    <div className="text-gray-900 font-medium text-sm sm:text-base">
                      {getRiskToleranceLabel(user.riskTolerance)}
                    </div>
                  )}
                </div>

                {/* Profile Support Section */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <span className="text-orange-500 mr-2">❓</span>
                      Financial Questions?
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Need help with financial information or risk settings?
                    </p>
                    <button
                      onClick={() => {
                        const userData = {
                          email: user?.email || "",
                          firstName: user?.firstName || "",
                          lastName: user?.lastName || "",
                        };
                        toggleInlineForm({
                          userData,
                          presetSubject: "Financial Profile Assistance",
                          presetCategory: "ACCOUNT_ISSUE"
                        });
                      }}
                      className="w-full text-sm bg-orange-100 hover:bg-orange-200 text-orange-600 px-3 py-2 rounded-md font-medium transition-colors flex items-center justify-center"
                    >
                      <span className="mr-1">💬</span>
                      Contact Financial Support
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Summary Card */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Account Summary</h2>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-500">🏦</span>
                </div>
              </div>

              <div className="space-y-3">
                {accounts.length > 0 ? (
                  accounts.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-800 text-sm sm:text-base">
                          {account.accountType === "CHECKING" ? "Everyday Checking" : "Everyday Savings"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Account ••••{account.accountNumber?.slice(-4) || 'XXXX'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm sm:text-base">
                          ${account.balance?.toFixed(2) || "0.00"}
                        </div>
                        <div className={`text-xs sm:text-sm ${account.balance > 0 ? 'text-orange-500' : 'text-gray-500'}`}>
                          Available
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No accounts found
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base shadow-md"
                >
                  Go to Dashboard
                </button>
                
                {/* Account Support Button */}
                <button
                  onClick={() => {
                    const userData = {
                      email: user?.email || "",
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                    };
                    toggleInlineForm({
                      userData,
                      presetSubject: "Account Inquiry",
                      presetCategory: "ACCOUNT_ISSUE"
                    });
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base shadow"
                >
                  💬 Account Support
                </button>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-pink-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Security</h2>
                <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center">
                  <span className="text-pink-500">🔒</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                      <span className="text-pink-500">🔑</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm sm:text-base">Password</div>
                      <div className="text-xs sm:text-sm text-gray-500">Last changed 30 days ago</div>
                    </div>
                  </div>
                  <button className="text-orange-500 hover:text-orange-600 text-sm font-semibold">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                      <span className="text-pink-500">📱</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm sm:text-base">Two-Factor Auth</div>
                      <div className="text-xs sm:text-sm text-gray-500">SMS verification enabled</div>
                    </div>
                  </div>
                  <button className="text-orange-500 hover:text-orange-600 text-sm font-semibold">
                    Manage
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                      <span className="text-pink-500">📧</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm sm:text-base">Email Notifications</div>
                      <div className="text-xs sm:text-sm text-gray-500">Alerts and statements</div>
                    </div>
                  </div>
                  <button className="text-orange-500 hover:text-orange-600 text-sm font-semibold">
                    Configure
                  </button>
                </div>

                {/* Security Support Section */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="bg-pink-50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <span className="text-pink-500 mr-2">🔒</span>
                      Security Concerns?
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Report security issues or get help with account access.
                    </p>
                    <button
                      onClick={() => {
                        const userData = {
                          email: user?.email || "",
                          firstName: user?.firstName || "",
                          lastName: user?.lastName || "",
                        };
                        toggleInlineForm({
                          userData,
                          presetSubject: "URGENT: Security Concern",
                          presetCategory: "FRAUD_SECURITY"
                        });
                      }}
                      className="w-full text-sm bg-pink-100 hover:bg-pink-200 text-pink-600 px-3 py-2 rounded-md font-medium transition-colors flex items-center justify-center"
                    >
                      <span className="mr-1">🚨</span>
                      Report Security Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}