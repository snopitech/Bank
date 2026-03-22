import { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ChangePin = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(null);
  
  // PIN form state
  const [pinForm, setPinForm] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
    showPins: false
  });

  // Get logged-in user ID
  const getLoggedInUserId = () => {
    try {
      const userStr = localStorage.getItem('loggedInUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
      return null;
    } catch (err) {
      console.error('Error getting logged-in user:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const userId = getLoggedInUserId();
      if (!userId) {
        setError('Please log in to view your cards');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/cards/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch cards');
      const data = await response.json();
      
      // Show only active cards that can have PIN changed
      const activeCards = data.filter(card => card.status === 'ACTIVE');
      setCards(activeCards);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePinClick = (card) => {
    setSelectedCard(card);
    setPinForm({
      currentPin: '',
      newPin: '',
      confirmPin: '',
      showPins: false
    });
    setShowPinModal(true);
  };

  const handlePinChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setPinForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleShowPins = () => {
    setPinForm(prev => ({ ...prev, showPins: !prev.showPins }));
  };

  const validatePins = () => {
    if (pinForm.currentPin.length !== 4) {
      alert('Current PIN must be 4 digits');
      return false;
    }
    if (pinForm.newPin.length !== 4) {
      alert('New PIN must be 4 digits');
      return false;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      alert('New PINs do not match');
      return false;
    }
    if (pinForm.currentPin === pinForm.newPin) {
      alert('New PIN must be different from current PIN');
      return false;
    }
    return true;
  };

  const handleSubmitChangePin = async () => {
    if (!validatePins() || !selectedCard) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/cards/${selectedCard.id}/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPin: pinForm.currentPin,
          newPin: pinForm.newPin,
          confirmPin: pinForm.confirmPin
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change PIN');
      }

      const updatedCard = await response.json();
      
      setChangeSuccess({
        cardId: updatedCard.id,
        cardLast4: updatedCard.cardNumber.slice(-4),
        cardType: updatedCard.cardType
      });

      setShowPinModal(false);
      
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCardNumber = (number) => {
    if (!number) return '**** **** **** ****';
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Change Your PIN</h2>
        <p className="text-sm text-gray-500 mt-1">
          Update the PIN for your active debit cards
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {changeSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">
                PIN Changed Successfully!
              </h3>
              <p className="text-xs text-green-700">
                Your {changeSuccess.cardType} card ending in {changeSuccess.cardLast4} now has a new PIN.
              </p>
              <button
                onClick={() => setChangeSuccess(null)}
                className="mt-3 text-xs text-green-700 hover:text-green-800 font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <KeyIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No active cards found</h3>
          <p className="text-sm text-gray-500 mb-4">
            You don't have any active cards to change PIN. Activate your cards first.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Card Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {card.cardType} Card
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  </div>
                  
                  <p className="text-sm font-mono text-gray-600 mb-1">
                    {formatCardNumber(card.maskedCardNumber)}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    Card holder: {card.cardHolderName}
                  </p>
                </div>

                {/* Change PIN Button */}
                <button
                  onClick={() => handleChangePinClick(card)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap"
                >
                  <KeyIcon className="h-4 w-4" />
                  Change PIN
                </button>
              </div>
            </div>
          ))}

          {/* Information Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">PIN Security Tips</h4>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Never use obvious numbers like 1234 or 0000</li>
                  <li>• Don't share your PIN with anyone</li>
                  <li>• Memorize your PIN - never write it down</li>
                  <li>• Change your PIN regularly for better security</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {showPinModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Change PIN - {selectedCard.cardType} Card
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Card ending in <span className="font-mono font-medium">{selectedCard.cardNumber.slice(-4)}</span>
            </p>

            <div className="space-y-4">
              {/* Current PIN */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Current PIN
                </label>
                <input
                  type={pinForm.showPins ? 'text' : 'password'}
                  name="currentPin"
                  value={pinForm.currentPin}
                  onChange={handlePinChange}
                  maxLength="4"
                  placeholder="****"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 font-mono text-center text-lg tracking-widest"
                  autoFocus
                />
              </div>

              {/* New PIN */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  New PIN
                </label>
                <input
                  type={pinForm.showPins ? 'text' : 'password'}
                  name="newPin"
                  value={pinForm.newPin}
                  onChange={handlePinChange}
                  maxLength="4"
                  placeholder="****"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 font-mono text-center text-lg tracking-widest"
                />
              </div>

              {/* Confirm New PIN */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Confirm New PIN
                </label>
                <input
                  type={pinForm.showPins ? 'text' : 'password'}
                  name="confirmPin"
                  value={pinForm.confirmPin}
                  onChange={handlePinChange}
                  maxLength="4"
                  placeholder="****"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 font-mono text-center text-lg tracking-widest"
                />
              </div>

              {/* Show/Hide PIN Toggle */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={toggleShowPins}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  {pinForm.showPins ? (
                    <>
                      <EyeSlashIcon className="h-3 w-3" />
                      Hide PINs
                    </>
                  ) : (
                    <>
                      <EyeIcon className="h-3 w-3" />
                      Show PINs
                    </>
                  )}
                </button>
              </div>

              {/* PIN Validation Indicators */}
              <div className="space-y-2 text-xs">
                {pinForm.newPin && pinForm.confirmPin && (
                  <div className={`flex items-center gap-1 ${pinForm.newPin === pinForm.confirmPin ? 'text-green-600' : 'text-red-600'}`}>
                    {pinForm.newPin === pinForm.confirmPin ? (
                      <>
                        <CheckCircleIcon className="h-3 w-3" />
                        New PINs match
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="h-3 w-3" />
                        New PINs do not match
                      </>
                    )}
                  </div>
                )}
                
                {pinForm.currentPin && pinForm.newPin && pinForm.currentPin === pinForm.newPin && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    New PIN must be different from current PIN
                  </div>
                )}
              </div>

              {/* Security Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-700 flex items-start gap-2">
                  <ShieldCheckIcon className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium">Security Notice:</span> Never share your PIN. 
                    We will never ask for your PIN via email, phone, or text.
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setSelectedCard(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitChangePin}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyIcon className="h-4 w-4" />
                    Change PIN
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePin;