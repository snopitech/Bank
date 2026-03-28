import { useState, useEffect } from 'react';
import { 
  LockClosedIcon, 
  LockOpenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const TurnCardOnOff = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'freeze' or 'unfreeze'

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
      
      // Filter to only show physical cards (virtual cards can't be frozen)
      const physicalCards = data.filter(card => !card.isVirtual);
      setCards(physicalCards);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeClick = (card) => {
    setSelectedCard(card);
    setActionType('freeze');
    setShowConfirmModal(true);
  };

  const handleUnfreezeClick = (card) => {
    setSelectedCard(card);
    setActionType('unfreeze');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedCard) return;

    setActionLoading(true);
    const newStatus = actionType === 'freeze' ? 'FROZEN' : 'ACTIVE';
    const reason = actionType === 'freeze' 
      ? 'User requested to freeze card' 
      : 'User requested to unfreeze card';

    try {
      const response = await fetch(`/api/cards/${selectedCard.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reason: reason
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${actionType} card`);
      }

      // Refresh cards list
      await fetchCards();
      setShowConfirmModal(false);
      setSelectedCard(null);
      setActionType(null);
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

  const getStatusBadge = (status) => {
    const badges = {
      'ACTIVE': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Active',
        icon: CheckCircleIcon
      },
      'FROZEN': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Frozen',
        icon: LockClosedIcon
      },
      'INACTIVE': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Inactive',
        icon: ClockIcon
      },
      'REPLACED': {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Replaced',
        icon: CreditCardIcon
      }
    };
    return badges[status] || badges['INACTIVE'];
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
        <h2 className="text-2xl font-bold text-gray-800">Turn Card On/Off</h2>
        <p className="text-sm text-gray-500 mt-1">
          Quickly freeze or unfreeze your physical cards
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No physical cards found</h3>
          <p className="text-sm text-gray-500 mb-4">
            You don't have any physical cards to manage. Virtual cards cannot be frozen.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => {
            const statusBadge = getStatusBadge(card.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div 
                key={card.id} 
                className={`bg-white border rounded-lg p-6 transition-shadow hover:shadow-md ${
                  card.status === 'FROZEN' ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Card Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {card.cardType} Card
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusBadge.label}
                      </span>
                    </div>
                    
                    <p className="text-sm font-mono text-gray-600 mb-1">
                      {formatCardNumber(card.maskedCardNumber)}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      Card holder: {card.cardHolderName}
                    </p>

                    {/* Status-specific messages */}
                    {card.status === 'FROZEN' && (
                      <p className="text-xs text-blue-600 mt-2 flex items-center">
                        <LockClosedIcon className="h-3 w-3 mr-1" />
                        This card is frozen and cannot be used for transactions
                      </p>
                    )}
                    {card.status === 'ACTIVE' && (
                      <p className="text-xs text-green-600 mt-2 flex items-center">
                        <LockOpenIcon className="h-3 w-3 mr-1" />
                        This card is active and ready to use
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {card.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleFreezeClick(card)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                      >
                        <LockClosedIcon className="h-4 w-4" />
                        Freeze Card
                      </button>
                    )}
                    
                    {card.status === 'FROZEN' && (
                      <button
                        onClick={() => handleUnfreezeClick(card)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                      >
                        <LockOpenIcon className="h-4 w-4" />
                        Unfreeze Card
                      </button>
                    )}

                    {(card.status === 'INACTIVE' || card.status === 'REPLACED') && (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                      >
                        {card.status === 'INACTIVE' ? 'Not Activated' : 'Card Replaced'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Info Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">About Card Freezing</h4>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Frozen cards cannot be used for purchases, withdrawals, or deposits</li>
                  <li>• Recurring payments may be blocked when card is frozen</li>
                  <li>• You can unfreeze your card at any time</li>
                  <li>• Virtual cards cannot be frozen - they are always active</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {actionType === 'freeze' ? 'Freeze Card?' : 'Unfreeze Card?'}
              </h3>
              <p className="text-sm text-gray-600">
                {actionType === 'freeze' 
                  ? `Are you sure you want to freeze your ${selectedCard.cardType} card ending in ${selectedCard.cardNumber.slice(-4)}?`
                  : `Are you sure you want to unfreeze your ${selectedCard.cardType} card ending in ${selectedCard.cardNumber.slice(-4)}?`
                }
              </p>
            </div>

            {actionType === 'freeze' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">Note:</span> While frozen, this card cannot be used for any transactions. You can unfreeze it at any time.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedCard(null);
                  setActionType(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition disabled:opacity-50 ${
                  actionType === 'freeze' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading 
                  ? 'Processing...' 
                  : actionType === 'freeze' 
                    ? 'Yes, Freeze Card' 
                    : 'Yes, Unfreeze Card'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurnCardOnOff;