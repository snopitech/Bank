import { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const ReplaceCard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [replacementSuccess, setReplacementSuccess] = useState(null);
  
  // Form state
  const [replacementForm, setReplacementForm] = useState({
    reason: '',
    expediteShipping: false,
    confirmAddress: true
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
      
      // Show only active cards that can be replaced
      const replaceableCards = data.filter(card => 
        !card.isVirtual && (card.status === 'ACTIVE' || card.status === 'FROZEN')
      );
      setCards(replaceableCards);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceClick = (card) => {
    setSelectedCard(card);
    setReplacementForm({
      reason: '',
      expediteShipping: false,
      confirmAddress: true
    });
    setShowConfirmModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReplacementForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitReplacement = async () => {
    if (!selectedCard || !replacementForm.reason) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/cards/${selectedCard.id}/replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: replacementForm.reason.toUpperCase(),
          expediteShipping: replacementForm.expediteShipping,
          deliveryAddress: replacementForm.confirmAddress ? 'USE_PROFILE_ADDRESS' : null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to replace card');
      }

      const newCard = await response.json();
      
      setReplacementSuccess({
        oldCardId: selectedCard.id,
        oldCardLast4: selectedCard.cardNumber.slice(-4),
        newCardId: newCard.id,
        newCardLast4: newCard.cardNumber.slice(-4),
        expedited: replacementForm.expediteShipping
      });

      setShowConfirmModal(false);
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

  const getReasonLabel = (reason) => {
    const reasons = {
      'LOST': 'Card Lost',
      'STOLEN': 'Card Stolen',
      'DAMAGED': 'Card Damaged',
      'EXPIRED': 'Card Expired'
    };
    return reasons[reason] || reason;
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
        <h2 className="text-2xl font-bold text-gray-800">Replace My Card</h2>
        <p className="text-sm text-gray-500 mt-1">
          Request a replacement for lost, stolen, or damaged cards
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {replacementSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">
                Card Replacement Requested Successfully!
              </h3>
              <p className="text-xs text-green-700 mb-2">
                Your new card has been ordered. Old card ending in {replacementSuccess.oldCardLast4} has been deactivated.
              </p>
              <div className="bg-white bg-opacity-50 rounded p-2 text-xs text-green-700">
                <p className="font-medium mb-1">New Card Details:</p>
                <p>• Card ending in: {replacementSuccess.newCardLast4}</p>
                <p>• Delivery: {replacementSuccess.expedited ? 'Expedited (2-3 business days)' : 'Standard (7-10 business days)'}</p>
                <p className="mt-1">📦 You'll receive your new card at your registered address</p>
              </div>
              <button
                onClick={() => setReplacementSuccess(null)}
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
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No replaceable cards found</h3>
          <p className="text-sm text-gray-500 mb-4">
            You don't have any active cards that need replacement.
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      card.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {card.status}
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

                {/* Replace Button */}
                <button
                  onClick={() => handleReplaceClick(card)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap"
                >
                  <CreditCardIcon className="h-4 w-4" />
                  Request Replacement
                </button>
              </div>
            </div>
          ))}

          {/* Information Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">About Card Replacement</h4>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Lost/Stolen cards will be deactivated immediately</li>
                  <li>• A new card with a new number will be issued</li>
                  <li>• Standard delivery: 7-10 business days (free)</li>
                  <li>• Expedited delivery: 2-3 business days ($15 fee)</li>
                  <li>• Update any automatic payments with your new card number</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replacement Modal */}
      {showConfirmModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Replace {selectedCard.cardType} Card
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Card ending in <span className="font-mono font-medium">{selectedCard.cardNumber.slice(-4)}</span>
            </p>

            <div className="space-y-4">
              {/* Reason for replacement */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Reason for Replacement *
                </label>
                <select
                  name="reason"
                  value={replacementForm.reason}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="LOST">Lost my card</option>
                  <option value="STOLEN">Card was stolen</option>
                  <option value="DAMAGED">Card is damaged</option>
                </select>
              </div>

              {/* Expedited shipping option */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Expedited Shipping</p>
                  <p className="text-xs text-gray-500">$15 fee • 2-3 business days</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="expediteShipping"
                    checked={replacementForm.expediteShipping}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-orange-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {/* Address confirmation */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Your card will be sent to your registered address
                  </p>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      name="confirmAddress"
                      checked={replacementForm.confirmAddress}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-600">
                      I confirm my address is correct
                    </span>
                  </label>
                </div>
              </div>

              {/* Warning for lost/stolen */}
              {replacementForm.reason === 'LOST' || replacementForm.reason === 'STOLEN' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-700 flex items-start gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Warning:</span> Your current card will be immediately deactivated. 
                      You will not be able to use it while waiting for the replacement.
                    </span>
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedCard(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReplacement}
                disabled={!replacementForm.reason || !replacementForm.confirmAddress || actionLoading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <TruckIcon className="h-4 w-4" />
                    Request Replacement
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

export default ReplaceCard;