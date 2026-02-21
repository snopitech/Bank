import { useState, useEffect } from 'react';
import CardImage from '../ui/CardImage';
import {
  CreditCardIcon,
  PauseIcon,
  PlayIcon,
  PencilIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const ManageCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [revealedCard, setRevealedCard] = useState(null);
  const [revealTimer, setRevealTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  // Function to get logged-in user ID from localStorage
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
    
    // Cleanup timer on unmount
    return () => {
      if (revealTimer) clearInterval(revealTimer);
    };
  }, []);

  // Timer effect for revealed card
  useEffect(() => {
    if (revealedCard && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setRevealedCard(null);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [revealedCard, timeLeft]);

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
      setCards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevealNumber = async (card) => {
    try {
      // In production, call the reveal endpoint to get a token
      // const response = await fetch(`/api/cards/${card.id}/reveal`, { method: 'POST' });
      // const data = await response.json();
      
      // For demo, we'll simulate revealing the number
      setRevealedCard({
        id: card.id,
        number: card.cardNumber
      });
      setTimeLeft(30);
      
      // Auto-hide after 30 seconds
      if (revealTimer) clearInterval(revealTimer);
      
    } catch (err) {
      alert('Failed to reveal card number');
    }
  };

  const handleCopyNumber = (cardNumber) => {
    navigator.clipboard.writeText(cardNumber);
    setCopiedId(cardNumber.slice(-4));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActivate = async (cardId) => {
    const pin = prompt('Enter a 4-digit PIN for your card:');
    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      alert('Please enter a valid 4-digit PIN');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/cards/${cardId}/activate?pin=${pin}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to activate card');
      }

      await fetchCards();
      alert('Card activated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFreezeToggle = async (card) => {
    const newStatus = card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    const action = newStatus === 'FROZEN' ? 'freeze' : 'unfreeze';
    
    if (!confirm(`Are you sure you want to ${action} this card?`)) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/cards/${card.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reason: `User requested to ${action} card`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${action} card`);
      }

      await fetchCards();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplace = async (card) => {
    const reason = prompt('Reason for replacement? (LOST, STOLEN, DAMAGED)');
    if (!reason) return;

    const expedite = confirm('Do you want expedited shipping?');

    setActionLoading(true);
    try {
      const response = await fetch(`/api/cards/${card.id}/replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.toUpperCase(),
          expediteShipping: expedite
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to replace card');
      }

      await fetchCards();
      alert('New card ordered successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDesign = async (card) => {
    const color = prompt('Enter color code (e.g., #FF5733 for orange, #2E7D32 for green):');
    if (!color) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/cards/${card.id}/design`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designColor: color,
          useDefaultImage: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update design');
      }

      await fetchCards();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewLimits = (card) => {
    alert(`💰 Card Limits\n\n` +
          `Daily Limit: $${card.dailyLimit?.toLocaleString()}\n` +
          `Per Transaction: $${card.transactionLimit?.toLocaleString()}\n` +
          `Monthly Limit: $${card.monthlyLimit?.toLocaleString()}`);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-yellow-100 text-yellow-800',
      'FROZEN': 'bg-blue-100 text-blue-800',
      'REPLACED': 'bg-gray-100 text-gray-800',
      'EXPIRED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manage Cards</h2>
        <p className="text-sm text-gray-600 mt-1">
          View and manage your debit cards
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No cards found</h3>
          <p className="text-sm text-gray-600 mb-4">
            You don't have any cards yet. Cards are automatically created when you open a checking account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              {/* Card Image */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200 flex justify-center">
                <CardImage card={card} />
              </div>

              {/* Card Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {card.cardType} Card
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(card.status)}`}>
                        {card.status}
                      </span>
                    </div>
                    
                    {/* Card Number Section with Reveal */}
                    <div className="mt-2 space-y-2">
                      {/* Masked Number with Copy */}
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm font-mono text-gray-700">
                          {card.maskedCardNumber}
                        </span>
                        <button
                          onClick={() => handleCopyNumber(card.cardNumber)}
                          className="text-gray-500 hover:text-red-700 transition relative"
                          title="Copy full card number"
                        >
                          <DocumentDuplicateIcon className="h-5 w-5" />
                          {copiedId === card.cardNumber.slice(-4) && (
                            <span className="absolute -top-8 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                              Copied!
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Revealed Number (shown for 30 seconds) */}
                      {revealedCard?.id === card.id && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 animate-pulse">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-yellow-600 mb-1">Full Card Number (visible for {timeLeft}s)</p>
                              <p className="text-lg font-mono font-bold text-gray-900 tracking-wider">
                                {revealedCard.number.replace(/(.{4})/g, '$1 ')}
                              </p>
                            </div>
                            <button
                              onClick={() => setRevealedCard(null)}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Hide now"
                            >
                              <EyeSlashIcon className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="w-full bg-yellow-200 h-1 mt-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-yellow-600 h-1 transition-all duration-1000"
                              style={{ width: `${(timeLeft / 30) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Reveal Button (only if not revealed) */}
                      {revealedCard?.id !== card.id && card.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevealNumber(card)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>Show full card number (30 sec)</span>
                        </button>
                      )}
                    </div>

                    {/* Card Holder Name */}
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-500 mb-1">Card Holder</p>
                      <p className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                        {card.cardHolderName}
                      </p>
                    </div>

                    {/* Expiry Date */}
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-gray-500">Expires:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(card.expiryDate).toLocaleDateString('en-US', { 
                          month: '2-digit', 
                          year: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Limits */}
                <div className="grid grid-cols-3 gap-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <span className="text-xs text-gray-600 block">Daily</span>
                    <p className="text-sm font-bold text-gray-900">${card.dailyLimit?.toLocaleString()}</p>
                  </div>
                  <div className="text-center border-x border-gray-200">
                    <span className="text-xs text-gray-600 block">Per TXN</span>
                    <p className="text-sm font-bold text-gray-900">${card.transactionLimit?.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-600 block">Monthly</span>
                    <p className="text-sm font-bold text-gray-900">${card.monthlyLimit?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {card.status === 'INACTIVE' && (
                    <button
                      onClick={() => handleActivate(card.id)}
                      disabled={actionLoading}
                      className="col-span-4 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      Activate Card
                    </button>
                  )}

                  {card.status === 'ACTIVE' && (
                    <>
                      <button
                        onClick={() => handleFreezeToggle(card)}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                        title="Freeze Card"
                      >
                        <PauseIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReplace(card)}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                        title="Replace Card"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDesign(card)}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                        title="Customize Design"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewLimits(card)}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center"
                        title="View Limits"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {card.status === 'FROZEN' && (
                    <>
                      <button
                        onClick={() => handleFreezeToggle(card)}
                        disabled={actionLoading}
                        className="col-span-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Unfreeze
                      </button>
                      <button
                        onClick={() => handleReplace(card)}
                        disabled={actionLoading}
                        className="col-span-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Replace
                      </button>
                    </>
                  )}

                  {card.status === 'REPLACED' && (
                    <div className="col-span-4 text-center text-sm text-gray-500 py-2 bg-gray-50 rounded-lg">
                      This card has been replaced. Use your new card.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCards;