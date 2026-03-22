import { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const ActivateCard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(null);
  
  // PIN form state
  const [pinForm, setPinForm] = useState({
    pin: '',
    confirmPin: '',
    showPin: false
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
      
      // Show only inactive cards that need activation
      const inactiveCards = data.filter(card => card.status === 'INACTIVE');
      setCards(inactiveCards);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateClick = (card) => {
    setSelectedCard(card);
    setPinForm({
      pin: '',
      confirmPin: '',
      showPin: false
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

  const toggleShowPin = () => {
    setPinForm(prev => ({ ...prev, showPin: !prev.showPin }));
  };

  const validatePin = () => {
    if (pinForm.pin.length !== 4) {
      alert('PIN must be exactly 4 digits');
      return false;
    }
    if (pinForm.pin !== pinForm.confirmPin) {
      alert('PINs do not match');
      return false;
    }
    return true;
  };

  const handleSubmitActivation = async () => {
    if (!validatePin() || !selectedCard) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/cards/${selectedCard.id}/activate?pin=${pinForm.pin}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to activate card');
      }

      const activatedCard = await response.json();
      
      setActivationSuccess({
        cardId: activatedCard.id,
        cardLast4: activatedCard.cardNumber.slice(-4),
        cardType: activatedCard.cardType
      });

      setShowPinModal(false);
      await fetchCards(); // Refresh the list
      
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
        <h2 className="text-2xl font-bold text-gray-800">Activate Debit Card</h2>
        <p className="text-sm text-gray-500 mt-1">
          Activate your new card and set up your PIN
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {activationSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">
                Card Activated Successfully!
              </h3>
              <p className="text-xs text-green-700">
                Your {activationSuccess.cardType} card ending in {activationSuccess.cardLast4} is now active and ready to use.
              </p>
              <button
                onClick={() => setActivationSuccess(null)}
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
          <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No cards to activate</h3>
          <p className="text-sm text-gray-500 mb-4">
            All your cards are already activated. New cards will appear here when issued.
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      Needs Activation
                    </span>
                  </div>
                  
                  <p className="text-sm font-mono text-gray-600 mb-1">
                    {formatCardNumber(card.maskedCardNumber)}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    Card holder: {card.cardHolderName}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Expires: {new Date(card.expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
                  </p>
                </div>

                {/* Activate Button */}
                <button
                  onClick={() => handleActivateClick(card)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap"
                >
                  <KeyIcon className="h-4 w-4" />
                  Activate Card
                </button>
              </div>
            </div>
          ))}

          {/* Information Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">About Card Activation</h4>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Choose a 4-digit PIN that you'll remember</li>
                  <li>• Never share your PIN with anyone</li>
                  <li>• We'll never ask for your PIN via email or phone</li>
                  <li>• Your card is ready to use immediately after activation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Setup Modal */}
      {showPinModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Activate {selectedCard.cardType} Card
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Card ending in <span className="font-mono font-medium">{selectedCard.cardNumber.slice(-4)}</span>
            </p>

            <div className="space-y-4">
              {/* PIN input */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Create 4-digit PIN
                </label>
                <div className="relative">
                  <input
                    type={pinForm.showPin ? 'text' : 'password'}
                    name="pin"
                    value={pinForm.pin}
                    onChange={handlePinChange}
                    maxLength="4"
                    placeholder="****"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 pr-10 font-mono text-center text-lg tracking-widest"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={toggleShowPin}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {pinForm.showPin ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Confirm PIN
                </label>
                <input
                  type={pinForm.showPin ? 'text' : 'password'}
                  name="confirmPin"
                  value={pinForm.confirmPin}
                  onChange={handlePinChange}
                  maxLength="4"
                  placeholder="****"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 font-mono text-center text-lg tracking-widest"
                />
              </div>

              {/* PIN Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium">Remember:</span> Your PIN is confidential. 
                    Never share it with anyone, including bank employees.
                  </span>
                </p>
              </div>

              {/* PIN Match Indicator */}
              {pinForm.pin && pinForm.confirmPin && (
                <div className={`text-xs ${pinForm.pin === pinForm.confirmPin ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                  {pinForm.pin === pinForm.confirmPin ? (
                    <>
                      <CheckCircleIcon className="h-3 w-3" />
                      PINs match
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-3 w-3" />
                      PINs do not match
                    </>
                  )}
                </div>
              )}
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
                onClick={handleSubmitActivation}
                disabled={pinForm.pin.length !== 4 || pinForm.confirmPin.length !== 4 || pinForm.pin !== pinForm.confirmPin || actionLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Activating...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Activate Card
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

export default ActivateCard;