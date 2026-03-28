import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(0); // Changed to start at 0 for verification type
  // Password visibility states
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Verification type state
  const [verificationType, setVerificationType] = useState(null); // 'us', 'non-us', 'test'
  const [idDocument, setIdDocument] = useState(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState('');
  const [idDocumentName, setIdDocumentName] = useState('');

  const [form, setForm] = useState({
    // Step 1: Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    
    // Step 2: Address Info - Now free text for global use
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    
    // Step 3: Identity & Financial
    ssn: "", // Only for US citizens
    birthCity: "",
    birthState: "",
    birthCountry: "",
    // Financial Information
    employmentStatus: "",
    annualIncome: "",
    sourceOfFunds: "",
    investmentObjective: "",
    taxBracket: "",
    
    // Step 4: Account Security
    securityQuestion1: "",
    securityAnswer1: "",
    securityQuestion2: "",
    securityAnswer2: "",
    securityQuestion3: "",
    securityAnswer3: "",
    
    // Password
    password: "",
    confirmPassword: ""
  });

  // Security questions array
  const securityQuestions = [
    "What was the name of your first pet?",
    "What was your childhood nickname?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What was the name of your elementary school?",
    "What is your favorite book?",
    "What is your favorite movie?",
    "What was the make of your first car?",
    "What is your father's middle name?",
    "What hospital were you born in?"
  ];

  // Employment Status options
  const employmentStatuses = [
    "Employed Full-Time",
    "Employed Part-Time",
    "Self-Employed",
    "Retired",
    "Student",
    "Homemaker",
    "Unemployed",
    "Disabled"
  ];

  // Annual Income ranges
  const incomeRanges = [
    "Under $25,000",
    "$25,000 - $49,999",
    "$50,000 - $74,999",
    "$75,000 - $99,999",
    "$100,000 - $149,999",
    "$150,000 - $199,999",
    "$200,000 - $299,999",
    "$300,000+"
  ];

  // Source of Funds options
  const sourceOfFundsOptions = [
    "Employment Salary",
    "Self-Employment/Business Income",
    "Investments",
    "Retirement/Pension",
    "Inheritance",
    "Family Support",
    "Savings",
    "Other"
  ];

  // Investment Objectives
  const investmentObjectives = [
    "Capital Preservation",
    "Income Generation",
    "Growth",
    "Aggressive Growth",
    "Retirement Planning",
    "Education Savings",
    "Wealth Transfer",
    "Tax Minimization"
  ];

  // Tax Brackets
  const taxBrackets = [
    "10% - $0 to $11,000",
    "12% - $11,001 to $44,725",
    "22% - $44,726 to $95,375",
    "24% - $95,376 to $182,100",
    "32% - $182,101 to $231,250",
    "35% - $231,251 to $578,125",
    "37% - $578,126+",
    "Not Sure"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // Handle file upload for ID documents
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size exceeds 5MB. Please choose a smaller file (max 5MB).");
      // Clear the file input
      e.target.value = null;
      return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload JPG, PNG, or PDF files only.");
      e.target.value = null;
      return;
    }
    
    setIdDocument(file);
    setIdDocumentName(file.name);
    setError(""); // Clear any previous errors
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdDocumentPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

  // Format SSN as XXX-XX-XXXX
  const handleSSNChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3 && value.length <= 5) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 5) {
      value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 9);
    }
    setForm({ ...form, ssn: value });
  };

 // Simple phone input - accepts any format for global use
const handlePhoneChange = (e) => {
  setForm({ ...form, phone: e.target.value });
};

  // Format zip code
  const handleZipChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5, 9);
    }
    setForm({ ...form, zipCode: value });
  };

  // Format annual income with commas
  const handleIncomeChange = (e) => {
    const value = e.target.value;
    // If it's not one of the preset options, allow custom input with formatting
    if (!incomeRanges.includes(value)) {
      let numericValue = value.replace(/\D/g, '');
      if (numericValue) {
        numericValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        setForm({ ...form, annualIncome: numericValue });
      } else {
        setForm({ ...form, annualIncome: '' });
      }
    } else {
      setForm({ ...form, annualIncome: value });
    }
  };

  const validateStep0 = () => {
    if (!verificationType) {
      setError("Please select a verification type");
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, phone, dateOfBirth } = form;
    
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !dateOfBirth) {
      setError("Please fill in all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate age (18+)
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setError("You must be at least 18 years old to open an account");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const { addressLine1, city, state, zipCode, country } = form;
    
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
      setError("Please fill in all address fields");
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    const { birthCity, birthState, birthCountry, employmentStatus, annualIncome, sourceOfFunds, investmentObjective } = form;
    
    if (!birthCity.trim() || !birthState.trim() || !birthCountry.trim()) {
      setError("Please fill in all identity verification fields");
      return false;
    }

    // Validate SSN only for US citizens
    if (verificationType === 'us') {
      if (!form.ssn.trim()) {
        setError("SSN is required for US citizens");
        return false;
      }
      const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
      if (!ssnRegex.test(form.ssn)) {
        setError("SSN must be in format: XXX-XX-XXXX");
        return false;
      }
    }

    // Validate file upload for non-US citizens
    if (verificationType === 'non-us' && !idDocument) {
      setError("Please upload your passport or national ID");
      return false;
    }

     // Validate document details for non-US citizens
if (verificationType === 'non-us') {
  if (!form.documentNumber.trim()) {
    setError("Please enter your document number");
    return false;
  }
  if (!form.issuingCountry.trim()) {
    setError("Please enter the issuing country");
    return false;
  }
  if (!form.expiryDate) {
    setError("Please enter the document expiry date");
    return false;
  }
}


    if (!employmentStatus || !annualIncome || !sourceOfFunds || !investmentObjective) {
      setError("Please fill in all financial information fields");
      return false;
    }

    return true;
  };

  const validateStep4 = () => {
    const { password, confirmPassword, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2, securityQuestion3, securityAnswer3 } = form;
    
    if (!password || !confirmPassword) {
      setError("Please enter a password");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!securityQuestion1 || !securityAnswer1.trim() || !securityQuestion2 || !securityAnswer2.trim() || !securityQuestion3 || !securityAnswer3.trim()) {
      setError("Please complete all three security questions");
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (currentStep === 0 && validateStep0()) {
      setCurrentStep(1);
      setError("");
    } else if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setError("");
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      setError("");
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
      setError("");
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

 // Helper function to convert income range to median value
const getIncomeValue = (incomeString) => {
  if (!incomeString) return null;
  
  // Handle custom amount (already a number string with commas)
  if (!incomeRanges.includes(incomeString)) {
    // Remove commas and convert to number
    const numericValue = parseFloat(incomeString.replace(/,/g, ''));
    return isNaN(numericValue) ? null : numericValue;
  }
  
  // Handle preset ranges - extract the first number from the range
  if (incomeString === "Under $25,000") return 12500;
  if (incomeString === "$25,000 - $49,999") return 37500;
  if (incomeString === "$50,000 - $74,999") return 62500;
  if (incomeString === "$75,000 - $99,999") return 87500;
  if (incomeString === "$100,000 - $149,999") return 125000;
  if (incomeString === "$150,000 - $199,999") return 175000;
  if (incomeString === "$200,000 - $299,999") return 250000;
  if (incomeString === "$300,000+") return 300000;
  
  return null;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateStep4()) return;

    setLoading(true);

    try {
      console.log("Registration data:", form);
      console.log("Verification type:", verificationType);
      if (verificationType === 'non-us') {
        console.log("ID Document:", idDocumentName);
      }

     // STEP 1: Register user (basic info + financial info + all data for non-us)
const registrationData = {
  firstName: form.firstName,
  lastName: form.lastName,
  email: form.email,
  phone: form.phone,
  dateOfBirth: form.dateOfBirth,
  // Only send SSN for US citizens, null for others
  ssn: verificationType === 'us' ? form.ssn : null,
  birthCity: form.birthCity,
  birthState: form.birthState,
  birthCountry: form.birthCountry,
  employmentStatus: form.employmentStatus,
  annualIncome: form.annualIncome,
  sourceOfFunds: form.sourceOfFunds,
  // ⭐ MAP investmentObjective TO riskTolerance
  riskTolerance: form.investmentObjective,
  taxBracket: form.taxBracket,
  password: form.password,
  confirmPassword: form.confirmPassword,
  // Add verification type for backend processing
  verificationType: verificationType,
  // Flags for backend based on verification type
  ...(verificationType === 'test' && { 
    testMode: true,
    skipVerification: true 
  }),
  ...(verificationType === 'non-us' && { 
    requiresManualReview: true,
    hasIdDocument: !!idDocument 
  })
};

// For US citizens, add address fields
if (verificationType === 'us') {
  registrationData.addressLine1 = form.addressLine1;
  registrationData.addressLine2 = form.addressLine2 || "";
  registrationData.city = form.city;
  registrationData.state = form.state;
  registrationData.zipCode = form.zipCode;
  registrationData.country = form.country;
  
  // Add security questions for US citizens too
  registrationData.securityQuestion1 = form.securityQuestion1;
  registrationData.securityAnswer1 = form.securityAnswer1;
  registrationData.securityQuestion2 = form.securityQuestion2;
  registrationData.securityAnswer2 = form.securityAnswer2;
  registrationData.securityQuestion3 = form.securityQuestion3;
  registrationData.securityAnswer3 = form.securityAnswer3;
}

// For non-US citizens, add address and security questions to the registration data
if (verificationType === 'non-us') {
  // Add address fields
  registrationData.addressLine1 = form.addressLine1;
  registrationData.addressLine2 = form.addressLine2 || "";
  registrationData.city = form.city;
  registrationData.state = form.state;
  registrationData.zipCode = form.zipCode;
  registrationData.country = form.country;
  
  // Add security questions
  registrationData.securityQuestion1 = form.securityQuestion1;
  registrationData.securityAnswer1 = form.securityAnswer1;
  registrationData.securityQuestion2 = form.securityQuestion2;
  registrationData.securityAnswer2 = form.securityAnswer2;
  registrationData.securityQuestion3 = form.securityQuestion3;
  registrationData.securityAnswer3 = form.securityAnswer3;
  // Add document details
registrationData.documentNumber = form.documentNumber;
registrationData.issuingCountry = form.issuingCountry;
registrationData.expiryDate = form.expiryDate;
}

// Choose the right endpoint based on verification type
let registerUrl = "/auth/register";
let regRes;

if (verificationType === 'non-us' && idDocument) {
  // For non-US with document, use FormData to send file
  registerUrl = "/auth/register/pending";
  
  // Create FormData and append data
  const formData = new FormData();
  
  // Add all registration data as a JSON string
  formData.append('userData', JSON.stringify(registrationData));
  
  // Add the actual file
  formData.append('document', idDocument);
  
  // Send with FormData (no Content-Type header - browser sets it automatically)
  regRes = await fetch(registerUrl, {
    method: "POST",
    body: formData
  });
} 
else if (verificationType === 'us') {
  // For US citizens, send to US verification endpoint
  registerUrl = "/auth/us-verification/submit";
  
  regRes = await fetch(registerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registrationData)
  });
}
else {
  // For test mode, use regular JSON
  regRes = await fetch(registerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registrationData)
  });
}


      const regText = await regRes.text();
      console.log("Registration response:", regText);

      if (!regRes.ok) {
        throw new Error(regText || "Registration failed");
      }

const regData = JSON.parse(regText);

// Check if this is a pending registration (non-US or US citizen)
if (regData.status === "PENDING_REVIEW") {
  setSuccess(regData.message);
  setTimeout(() => {
    navigate("/"); // Send to home page
  }, 3000);
  return; // Stop here - don't continue with profile setup
}

setSuccess("Account created! Setting up your profile...");

// STEP 2: Get user ID from registration response
const userId = regData.id;
console.log("User ID from registration:", userId);

      // Save basic user info (without session)
      localStorage.setItem("registeredUser", JSON.stringify({
        id: userId,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        verificationType: verificationType
      }));

      // STEP 3: Update profile with ADDRESS
      setSuccess("Adding your address...");
      
      const profileUpdateRes = await fetch(`/api/users/${userId}/update-profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || "",
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country
        })
      });

      if (!profileUpdateRes.ok) {
        const errorText = await profileUpdateRes.text();
        console.warn("Profile update warning:", errorText);
      } else {
        console.log("Address updated successfully");
      }

      // STEP 4: Update financial information
      setSuccess("Saving your financial information...");
      
      const parsedAnnualIncome = getIncomeValue(form.annualIncome);

      const financialUpdateRes = await fetch(`/api/users/${userId}/update-profile-safe`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employmentStatus: form.employmentStatus,
          annualIncome: parsedAnnualIncome,
          riskTolerance: form.investmentObjective,
          sourceOfFunds: form.sourceOfFunds,
          taxBracket: form.taxBracket
        })
      });
 
      if (!financialUpdateRes.ok) {
        const errorText = await financialUpdateRes.text();
        console.warn("Financial update warning:", errorText);
      } else {
        console.log("Financial information updated successfully");
      }

      // STEP 5: Add security questions
      setSuccess("Setting up security questions...");
      
      const securityRes = await fetch(`/api/users/${userId}/security-questions`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            question: form.securityQuestion1,
            answer: form.securityAnswer1
          },
          {
            question: form.securityQuestion2,
            answer: form.securityAnswer2
          },
          {
            question: form.securityQuestion3,
            answer: form.securityAnswer3
          }
        ])
      });

      if (!securityRes.ok) {
        const errorText = await securityRes.text();
        console.warn("Security questions update warning:", errorText);
      } else {
        console.log("Security questions updated successfully");
      }

      // STEP 6: Fetch updated user profile with all information
      setSuccess("Loading your complete profile...");

      const profileRes = await fetch(`/api/users/${userId}`, {
        method: "GET",
      });

      if (profileRes.ok) {
        const updatedUser = await profileRes.json();
        const completeUser = { ...regData, ...updatedUser };
        
        // STEP 7: Fetch security questions separately
        try {
          const securityQuestionsRes = await fetch(`/api/users/${userId}/security-questions`, {
            method: "GET",
          });
          
          if (securityQuestionsRes.ok) {
            const securityQuestions = await securityQuestionsRes.json();
            completeUser.securityQuestions = securityQuestions;
            console.log("Security questions loaded:", securityQuestions);
          } else {
            console.warn("Could not fetch security questions, status:", securityQuestionsRes.status);
          }
        } catch (secErr) {
          console.warn("Error fetching security questions:", secErr);
        }
        
        localStorage.setItem("loggedInUser", JSON.stringify(completeUser));
        console.log("Complete user profile saved:", completeUser);
      }

      setSuccess("Welcome to Snopitech Bank! Redirecting to dashboard...");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="mb-10">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {[
          { num: 0, label: "Verification", icon: "🆔" },
          { num: 1, label: "Personal Info", icon: "👤" },
          { num: 2, label: "Address", icon: "🏠" },
          { num: 3, label: "Identity & Financial", icon: "💰" },
          { num: 4, label: "Security", icon: "🔒" }
        ].map((step) => (
          <div key={step.num} className="flex flex-col items-center">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 
              ${currentStep > step.num ? 'bg-green-500 text-white' : 
                currentStep === step.num ? 'bg-red-600 text-white ring-4 ring-red-100' : 
                'bg-gray-200 text-gray-600'}`}>
              <span className="text-xl">
                {currentStep > step.num ? '✓' : step.icon}
              </span>
            </div>
            <span className={`mt-2 text-sm font-medium ${
              currentStep >= step.num ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-4 max-w-4xl mx-auto">
        <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded"></div>
        <div 
          className="absolute top-0 left-0 h-1 bg-red-600 rounded transition-all duration-300"
          style={{ width: `${(currentStep) * 25}%` }}
        ></div>
      </div>
    </div>
  );

  // Your logo URL
  const logoUrl = "https://snopitechstore.online/public-images/Mylogo.png";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
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
              <Link
                to="/"
                className="bg-white text-red-700 px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center space-x-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-3 md:hidden">
              <Link
                to="/"
                className="bg-white text-red-700 p-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center"
                aria-label="Sign In"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              
              <button className="text-white p-2 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - FULL WIDTH */}
      <main className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Open Your Account
              </h1>
              <p className="text-gray-600 text-lg">
                Step {currentStep + 1} of 5: {
                  currentStep === 0 ? "Verification Type" :
                  currentStep === 1 ? "Personal Information" :
                  currentStep === 2 ? "Residential Address" :
                  currentStep === 3 ? "Identity & Financial Information" :
                  "Account Security Setup"
                }
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <StepIndicator />

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit}>
                  {/* STEP 0: VERIFICATION TYPE */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🆔</span>
                          <div>
                            <h3 className="font-semibold text-gray-800">Identity Verification</h3>
                            <p className="text-sm text-gray-600">Choose how you want to verify your identity</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* US Citizen Option */}
                        <div 
                          onClick={() => setVerificationType('us')}
                          className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                            verificationType === 'us' 
                              ? 'border-red-500 bg-red-50 shadow-md' 
                              : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-center">
                            <span className="text-4xl mb-3 block">🇺🇸</span>
                            <h4 className="font-semibold text-lg mb-2">US Citizen</h4>
                            <p className="text-sm text-gray-600">Verify with your Social Security Number</p>
                            {verificationType === 'us' && (
                              <span className="inline-block mt-3 text-red-600 text-sm font-medium">✓ Selected</span>
                            )}
                          </div>
                        </div>

                        {/* Non-US Citizen Option */}
                        <div 
                          onClick={() => setVerificationType('non-us')}
                          className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                            verificationType === 'non-us' 
                              ? 'border-red-500 bg-red-50 shadow-md' 
                              : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-center">
                            <span className="text-4xl mb-3 block">🌍</span>
                            <h4 className="font-semibold text-lg mb-2">Non-US Citizen</h4>
                            <p className="text-sm text-gray-600">Upload your passport or national ID</p>
                            {verificationType === 'non-us' && (
                              <span className="inline-block mt-3 text-red-600 text-sm font-medium">✓ Selected</span>
                            )}
                          </div>
                        </div>

                        {/* Test Mode Option */}
                        <div 
                          onClick={() => setVerificationType('test')}
                          className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                            verificationType === 'test' 
                              ? 'border-red-500 bg-red-50 shadow-md' 
                              : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-center">
                            <span className="text-4xl mb-3 block">🧪</span>
                            <h4 className="font-semibold text-lg mb-2">Test Mode</h4>
                            <p className="text-sm text-gray-600">Skip verification for testing purposes</p>
                            {verificationType === 'test' && (
                              <span className="inline-block mt-3 text-red-600 text-sm font-medium">✓ Selected</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                        <p className="text-sm text-yellow-800">
                          <span className="font-semibold">📋 Note:</span> Your verification method determines how your identity is confirmed. Test mode accounts are for demonstration only.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 1: PERSONAL INFO */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">👤</span>
                          <div>
                            <h3 className="font-semibold text-gray-800">Personal Information</h3>
                            <p className="text-sm text-gray-600">Your legal name and contact details</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">First Name *</label>
                          <input
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Last Name *</label>
                          <input
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Doe"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 text-sm font-medium mb-2">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="john.doe@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number *</label>
                          <input
                           type="tel"
                           name="phone"
                           value={form.phone}
                           onChange={handlePhoneChange}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="+1 123 456 7890 (or your local format)"
                           />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Date of Birth *</label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={form.dateOfBirth}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: ADDRESS INFO - GLOBAL FREE TEXT */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🏠</span>
                          <div>
                            <h3 className="font-semibold text-gray-800">Residential Address</h3>
                            <p className="text-sm text-gray-600">Where you currently live (global addresses accepted)</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Street Address *</label>
                          <input
                            type="text"
                            name="addressLine1"
                            value={form.addressLine1}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="123 Main Street"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Apt/Suite/Unit (Optional)</label>
                          <input
                            type="text"
                            name="addressLine2"
                            value={form.addressLine2}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Apt 4B"
                          />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-medium mb-2">City *</label>
                            <input
                              type="text"
                              name="city"
                              value={form.city}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Enter your city"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">State/Province *</label>
                            <input
                              type="text"
                              name="state"
                              value={form.state}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Enter state/province"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">ZIP/Postal Code *</label>
                            <input
                              type="text"
                              name="zipCode"
                              value={form.zipCode}
                              onChange={handleZipChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Enter postal code"
                              maxLength="10"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Country *</label>
                          <input
                            type="text"
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Enter your country"
                          />
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <span className="font-semibold">📋 Why we need this:</span> Your address is required for account verification, card delivery, and regulatory compliance. International addresses are accepted.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: IDENTITY & FINANCIAL INFO */}
                  {currentStep === 3 && (
                    <div className="space-y-8">
                      {/* Identity Verification Section */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🆔</span>
                          <div>
                            <h3 className="font-semibold text-gray-800">Identity Verification</h3>
                            <p className="text-sm text-gray-600">Help us verify who you are</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Conditional SSN field - only for US citizens */}
                        {verificationType === 'us' && (
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Social Security Number *</label>
                            <input
                              type="text"
                              name="ssn"
                              value={form.ssn}
                              onChange={handleSSNChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="XXX-XX-XXXX"
                              maxLength="11"
                            />
                            <p className="text-xs text-gray-500 mt-1">🔒 Encrypted - We never store your full SSN</p>
                          </div>
                        )}

                        {/* File upload for non-US citizens */}
                       {verificationType === 'non-us' && (
  <>
    {/* Document Upload */}
    <div className="md:col-span-2">
      <label className="block text-gray-700 text-sm font-medium mb-2">Passport or National ID *</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-300 transition">
        {!idDocumentPreview ? (
          <div>
            <input
              type="file"
              id="idDocument"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="idDocument"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Choose File
            </label>
            <p className="mt-2 text-sm text-gray-500">or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
          </div>
        ) : (
          <div>
            <img src={idDocumentPreview} alt="ID Preview" className="max-h-48 mx-auto mb-3 rounded" />
            <p className="text-sm text-gray-700 mb-2">{idDocumentName}</p>
            <button
              type="button"
              onClick={() => {
                setIdDocument(null);
                setIdDocumentPreview('');
                setIdDocumentName('');
              }}
              className="text-red-600 text-sm hover:underline"
            >
              Remove and choose another
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Document Number */}
    <div className="md:col-span-2">
      <label className="block text-gray-700 text-sm font-medium mb-2">Document Number *</label>
      <input
        type="text"
        name="documentNumber"
        value={form.documentNumber}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        placeholder="Enter the document ID number"
      />
    </div>

    {/* Issuing Country */}
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-2">Issuing Country *</label>
      <input
        type="text"
        name="issuingCountry"
        value={form.issuingCountry}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        placeholder="Country that issued the document"
      />
    </div>

    {/* Expiry Date */}
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-2">Expiry Date *</label>
      <input
        type="date"
        name="expiryDate"
        value={form.expiryDate}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
      />
    </div>
  </>
)}

                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Birth City *</label>
                          <input
                            type="text"
                            name="birthCity"
                            value={form.birthCity}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="City of birth"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2">Birth State/Province *</label>
                          <input
                            type="text"
                            name="birthState"
                            value={form.birthState}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="State/Province of birth"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 text-sm font-medium mb-2">Birth Country *</label>
                          <input
                            type="text"
                            name="birthCountry"
                            value={form.birthCountry}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Country of birth"
                          />
                        </div>
                      </div>

                      {/* Financial Information Section */}
                      <div className="border-t pt-8">
                        <div className="bg-green-50 p-4 rounded-lg mb-6">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">💰</span>
                            <div>
                              <h3 className="font-semibold text-gray-800">Financial Information</h3>
                              <p className="text-sm text-gray-600">This helps us recommend the right products for you</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Employment Status *</label>
                            <select
                              name="employmentStatus"
                              value={form.employmentStatus}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="">Select Employment Status</option>
                              {employmentStatuses.map((status, index) => (
                                <option key={index} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Annual Income *</label>
                            <select
                              name="annualIncome"
                              value={form.annualIncome}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="">Select Income Range</option>
                              {incomeRanges.map((range, index) => (
                                <option key={index} value={range}>{range}</option>
                              ))}
                              <option value="custom">Enter Custom Amount</option>
                            </select>
                            {form.annualIncome === "custom" && (
                              <input
                                type="text"
                                name="annualIncome"
                                value={form.annualIncome === "custom" ? "" : form.annualIncome}
                                onChange={handleIncomeChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mt-2"
                                placeholder="Enter annual income"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Source of Funds *</label>
                            <select
                              name="sourceOfFunds"
                              value={form.sourceOfFunds}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="">Select Source of Funds</option>
                              {sourceOfFundsOptions.map((source, index) => (
                                <option key={index} value={source}>{source}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Investment Objective *</label>
                            <select
                              name="investmentObjective"
                              value={form.investmentObjective}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="">Select Objective</option>
                              {investmentObjectives.map((objective, index) => (
                                <option key={index} value={objective}>{objective}</option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Tax Bracket (Optional)</label>
                            <select
                              name="taxBracket"
                              value={form.taxBracket}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="">Select Tax Bracket</option>
                              {taxBrackets.map((bracket, index) => (
                                <option key={index} value={bracket}>{bracket}</option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Helps with tax-efficient investment recommendations</p>
                          </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                          <p className="text-sm text-yellow-800">
                            <span className="font-semibold">📋 Important:</span> Your financial information helps us comply with regulatory requirements and provide you with appropriate financial products. This information is encrypted and secure.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: SECURITY SETUP - WITH 3 QUESTIONS */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🔒</span>
                          <div>
                            <h3 className="font-semibold text-gray-800">Account Security</h3>
                            <p className="text-sm text-gray-600">Set up your password and security questions</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                       
  <label className="block text-gray-700 text-sm font-medium mb-2">Password *</label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={form.password}
      onChange={handleChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
      placeholder="Create a strong password"
    />
    <button
      type="button"
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  </div>
  <div className="mt-2">
    <div className="flex items-center">
      <div className={`w-2 h-2 rounded-full mr-2 ${form.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      <span className={`text-xs ${form.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
        At least 8 characters
      </span>
    </div>
  </div>
</div>
<div>
  <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password *</label>
  <div className="relative">
    <input
      type={showConfirmPassword ? "text" : "password"}
      name="confirmPassword"
      value={form.confirmPassword}
      onChange={handleChange}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12 ${
        form.confirmPassword && form.password !== form.confirmPassword 
          ? 'border-red-500 bg-red-50' 
          : 'border-gray-300'
      }`}
      placeholder="Re-enter your password"
    />
    <button
      type="button"
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    >
      {showConfirmPassword ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  </div>
</div>

                      </div>

                      <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-800 mb-4">Security Questions (For account recovery)</h4>
                        <div className="space-y-6">
                          {/* Question 1 */}
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Question 1 *</label>
                            <select
                              name="securityQuestion1"
                              value={form.securityQuestion1}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="">Select a question</option>
                              {securityQuestions.map((q, index) => (
                                <option key={index} value={q}>{q}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Answer 1 *</label>
                            <input
                              type="text"
                              name="securityAnswer1"
                              value={form.securityAnswer1}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Your answer"
                            />
                          </div>
                          
                          {/* Question 2 */}
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Question 2 *</label>
                            <select
                              name="securityQuestion2"
                              value={form.securityQuestion2}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="">Select a question</option>
                              {securityQuestions.map((q, index) => (
                                <option key={index} value={q}>{q}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Answer 2 *</label>
                            <input
                              type="text"
                              name="securityAnswer2"
                              value={form.securityAnswer2}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Your answer"
                            />
                          </div>
                          
                          {/* Question 3 */}
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Question 3 *</label>
                            <select
                              name="securityQuestion3"
                              value={form.securityQuestion3}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="">Select a question</option>
                              {securityQuestions.map((q, index) => (
                                <option key={index} value={q}>{q}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Answer 3 *</label>
                            <input
                              type="text"
                              name="securityAnswer3"
                              value={form.securityAnswer3}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Your answer"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <span className="font-semibold">📋 Note:</span> Security questions help you recover your account if you forget your password. Choose answers you'll remember.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TERMS CHECKBOX - Only on final step */}
                  {currentStep === 4 && (
                    <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="terms"
                          className="mt-1 mr-3"
                          required
                        />
                        <label htmlFor="terms" className="text-sm text-gray-700">
                          I agree to the Snopitech Bank <a href="#" className="text-red-600 hover:underline">Terms of Service</a>, 
                          <a href="#" className="text-red-600 hover:underline"> Privacy Policy</a>, and 
                          <a href="#" className="text-red-600 hover:underline"> Electronic Communications Disclosure</a>. 
                          I am at least 18 years old and I agree to receive all communications electronically.
                        </label>
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION BUTTONS */}
                  <div className="flex justify-between mt-8 pt-4 border-t">
                    {currentStep > 0 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition duration-200"
                      >
                        ← Back
                      </button>
                    )}
                    
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition duration-200 shadow-md hover:shadow-lg ml-auto"
                      >
                        Continue →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md hover:shadow-lg ml-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </div>
                        ) : 'Complete Registration ✓'}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Features/Benefits */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-2xl">🔒</span>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Bank-Level Security</h4>
                  <p className="text-gray-600">Your information is protected with 256-bit encryption</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-2xl">⚡</span>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Instant Account Setup</h4>
                  <p className="text-gray-600">Get your account numbers immediately after registration</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-2xl">💰</span>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">2 Accounts Included</h4>
                  <p className="text-gray-600">Checking and Savings accounts created automatically</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - FULL WIDTH */}
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
                  <li><a href="#" className="text-sm text-gray-400 hover:text-white transition">Contact Support</a></li>
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
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}