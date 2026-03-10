import { useState } from 'react';
import { 
  CameraIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

const API_BASE = "http://localhost:8080";

const CheckDeposit = () => {
  const [formData, setFormData] = useState({
    amount: '',
    checkNumber: '',
    routingNumber: '',
    accountNumber: '',
    payeeName: '',
    checkDate: ''
  });

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [successCheckId, setSuccessCheckId] = useState(null);

  // Get user and account info from localStorage
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const accounts = user?.accounts || [];
  const checkingAccount = accounts.find(a => a.accountType?.toUpperCase() === 'CHECKING');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFrontImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontImage(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleBackImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackImage(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const removeFrontImage = () => {
    setFrontImage(null);
    setFrontPreview(null);
  };

  const removeBackImage = () => {
    setBackImage(null);
    setBackPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!checkingAccount) {
      setError('No checking account found. Please ensure you have a checking account.');
      setLoading(false);
      return;
    }

    if (!frontImage) {
      setError('Please upload the front of your check');
      setLoading(false);
      return;
    }

    // Create form data for multipart request
    const submitData = new FormData();
    submitData.append('userId', user.id);
    submitData.append('accountId', checkingAccount.id);
    submitData.append('amount', formData.amount);
    submitData.append('checkNumber', formData.checkNumber);
    submitData.append('routingNumber', formData.routingNumber);
    submitData.append('accountNumber', formData.accountNumber);
    submitData.append('payeeName', formData.payeeName);
    submitData.append('checkDate', formData.checkDate);
    submitData.append('frontImage', frontImage);

    console.log('Submitting check deposit with data:');
console.log('userId:', user.id);
console.log('accountId:', checkingAccount.id);
console.log('amount:', formData.amount);
console.log('checkNumber:', formData.checkNumber);
console.log('routingNumber:', formData.routingNumber);
console.log('accountNumber:', formData.accountNumber);
console.log('payeeName:', formData.payeeName);
console.log('checkDate:', formData.checkDate);
console.log('frontImage:', frontImage);
console.log('backImage:', backImage);
    
    if (backImage) {
      submitData.append('backImage', backImage);
    }

    try {
      const response = await fetch(`${API_BASE}/api/checks/deposit`, {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit check deposit');
      }

      setSuccess(true);
      setSuccessCheckId(data.checkId); // Save the check ID

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!checkingAccount) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-700">
              You need a checking account to deposit checks. Please open a checking account first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Deposit a Check</h2>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-700">Check deposited successfully! It will be reviewed by our team.</p>
        </div>
      )}

      {success && (
  <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-8 text-center">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <CheckCircleIcon className="h-10 w-10 text-green-600" />
    </div>
    
    <h2 className="text-2xl font-bold text-gray-900 mb-3">Check Submitted Successfully! 🎉</h2>
    
    <div className="bg-white rounded-lg p-6 mb-6 text-left">
      <p className="text-gray-700 mb-4">
        Thank you for submitting your check deposit. Here's what happens next:
      </p>
      
      <ul className="space-y-3 text-gray-600">
        <li className="flex items-start">
          <span className="text-green-600 mr-2">•</span>
          <span>Your check has been received and is pending review</span>
        </li>
        <li className="flex items-start">
          <span className="text-green-600 mr-2">•</span>
          <span>Our team will verify the check details within <strong>1-3 business days</strong></span>
        </li>
        <li className="flex items-start">
          <span className="text-green-600 mr-2">•</span>
          <span>You'll receive an email notification once a decision is made</span>
        </li>
        <li className="flex items-start">
          <span className="text-green-600 mr-2">•</span>
          <span>If approved, the funds will be credited to your checking account</span>
        </li>
        <li className="flex items-start">
          <span className="text-green-600 mr-2">•</span>
          <span>We'll contact you if we need any additional information</span>
        </li>
      </ul>
    </div>
    
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
      <p className="text-sm text-blue-800">
        <span className="font-semibold">Reference ID:</span> #{successCheckId || 'CHK' + Date.now().toString().slice(-6)}
      </p>
      <p className="text-xs text-blue-600 mt-1">
        Please keep this reference for your records
      </p>
    </div>
    
    <button
      onClick={() => {
        setSuccess(false);
        setSuccessCheckId(null);
        setFormData({
          amount: '',
          checkNumber: '',
          routingNumber: '',
          accountNumber: '',
          payeeName: '',
          checkDate: ''
        });
        setFrontImage(null);
        setBackImage(null);
        setFrontPreview(null);
        setBackPreview(null);
      }}
      className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition font-medium"
    >
      Deposit Another Check
    </button>
    
    <p className="text-xs text-gray-500 mt-4">
      You can track the status of your check in the "View Check Copies" section
    </p>
    </div>
)}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Check Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Check Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check Number
              </label>
              <input
                type="text"
                name="checkNumber"
                value={formData.checkNumber}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter check number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Routing Number
              </label>
              <input
                type="text"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleInputChange}
                required
                maxLength="9"
                pattern="[0-9]{9}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="9-digit routing number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number (on check)
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Account number from check"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payee Name
              </label>
              <input
                type="text"
                name="payeeName"
                value={formData.payeeName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Who is the check payable to?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check Date
              </label>
              <input
                type="date"
                name="checkDate"
                value={formData.checkDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Check Images */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Check Images</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front of Check */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Front of Check <span className="text-red-500">*</span>
              </label>
              {!frontPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFrontImageChange}
                    className="hidden"
                    id="front-image"
                  />
                  <label htmlFor="front-image" className="cursor-pointer block">
                    <CameraIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload front of check</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={frontPreview} 
                    alt="Front of check" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeFrontImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Back of Check */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Back of Check <span className="text-gray-500">(optional)</span>
              </label>
              {!backPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackImageChange}
                    className="hidden"
                    id="back-image"
                  />
                  <label htmlFor="back-image" className="cursor-pointer block">
                    <CameraIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload back of check</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={backPreview} 
                    alt="Back of check" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeBackImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Make sure the check images are clear and all details are visible
          </p>
        </div>

        {/* Destination Account */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Deposit To</h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Checking Account</p>
            <p className="text-lg font-medium text-gray-900">
              {checkingAccount.maskedAccountNumber || checkingAccount.accountNumber}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Funds will be deposited to this account after verification
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-700 hover:bg-red-800'
          }`}
        >
          {loading ? 'Submitting...' : 'Deposit Check'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          By submitting, you confirm that this check is valid and payable to you
        </p>
      </form>
    </div>
  );
};

export default CheckDeposit;