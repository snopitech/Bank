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
  EyeSlashIcon,
  BuildingLibraryIcon,
  BriefcaseIcon,
  LockClosedIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const ManageCards = () => {
  const [debitCards, setDebitCards] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [businessCards, setBusinessCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [revealedCards, setRevealedCards] = useState({});
  const [revealTimers, setRevealTimers] = useState({});
  const [timeLeft, setTimeLeft] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Function to get logged-in user data from localStorage
  const getLoggedInUser = () => {
    try {
      const userStr = localStorage.getItem('loggedInUser');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (err) {
      console.error('Error getting logged-in user:', err);
      return null;
    }
  };

  useEffect(() => {
    Promise.all([
      fetchDebitCards(),
      fetchCreditCards(),
      fetchBusinessCards()
    ]).finally(() => setLoading(false));
  }, []);

  // Timer effect for revealed cards
  useEffect(() => {
    const timers = {};
    
    Object.keys(timeLeft).forEach(cardId => {
      if (timeLeft[cardId] > 0 && revealedCards[cardId]) {
        timers[cardId] = setInterval(() => {
          setTimeLeft(prev => {
            if (prev[cardId] <= 1) {
              // Hide card when time runs out
              setRevealedCards(prevRevealed => {
                const newRevealed = { ...prevRevealed };
                delete newRevealed[cardId];
                return newRevealed;
              });
              
              const newTimeLeft = { ...prev };
              delete newTimeLeft[cardId];
              return newTimeLeft;
            }
            return {
              ...prev,
              [cardId]: prev[cardId] - 1
            };
          });
        }, 1000);
      }
    });

    setRevealTimers(timers);

    return () => {
      Object.values(timers).forEach(timer => clearInterval(timer));
    };
  }, [timeLeft, revealedCards]);

  const fetchDebitCards = async () => {
    try {
      const user = getLoggedInUser();
      if (!user?.id) return;
      
      const response = await fetch(`/api/cards/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch debit cards');
      const data = await response.json();
      
      // Add account type to each card for identification
      const cardsWithType = data.map(card => ({
        ...card,
        accountType: 'debit',
        uniqueId: `debit-${card.id}` // Create unique ID to avoid conflicts with credit cards
      }));
      
      setDebitCards(cardsWithType);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCreditCards = async () => {
    try {
      const user = getLoggedInUser();
      if (!user?.id) return;
      
      const response = await fetch(`/api/credit/accounts/user/${user.id}`);
      if (!response.ok) return;
      
      const accounts = await response.json();
      
      const allCreditCards = accounts.flatMap(account => 
        (account.cards || []).map(card => ({
          ...card,
          accountType: 'credit',
          creditLimit: account.creditLimit,
          availableCredit: account.availableCredit,
          accountNumber: account.maskedAccountNumber,
          uniqueId: `credit-${card.id}` // Create unique ID to avoid conflicts
        }))
      );
      
      setCreditCards(allCreditCards);
    } catch (err) {
      console.error('Error fetching credit cards:', err);
    }
  };

  const fetchBusinessCards = async () => {
    try {
      const user = getLoggedInUser();
      if (!user?.id) return;
      
      const response = await fetch(`/api/business/accounts/user/${user.id}`);
      if (!response.ok) return;
      
      const accounts = await response.json();
      
      // Extract cards from business accounts (if they exist)
      const allBusinessCards = accounts.flatMap(account => 
        (account.cards || []).map(card => ({
          ...card,
          accountType: 'business',
          businessName: account.businessName,
          accountNumber: account.accountNumber,
          uniqueId: `business-${card.id}` // Create unique ID to avoid conflicts
        }))
      );
      
      setBusinessCards(allBusinessCards);
    } catch (err) {
      console.error('Error fetching business cards:', err);
    }
  };

  const handleRevealNumber = async (card) => {
    try {
      // Check if card is already revealed
      if (revealedCards[card.uniqueId]) {
        // Hide the card
        setRevealedCards(prev => {
          const newRevealed = { ...prev };
          delete newRevealed[card.uniqueId];
          return newRevealed;
        });
        setTimeLeft(prev => {
          const newTimeLeft = { ...prev };
          delete newTimeLeft[card.uniqueId];
          return newTimeLeft;
        });
        
        // Clear timer
        if (revealTimers[card.uniqueId]) {
          clearInterval(revealTimers[card.uniqueId]);
        }
        return;
      }

      const user = getLoggedInUser();
      if (!user?.sessionId) {
        alert('Session expired. Please log in again.');
        return;
      }

      setActionLoading(true);
      
      let response;
      let data;

      try {
        if (card.accountType === 'credit') {
          // Credit card reveal
          response = await fetch(`/api/credit/cards/${card.id}/reveal`, {
            method: 'POST',
            headers: {
              'sessionId': user.sessionId,
              'Content-Type': 'application/json'
            }
          });
        } else {
          // For debit/business cards, we need a reveal endpoint
          // If it doesn't exist, we'll simulate by using the stored card data
          // In production, you'd want a proper reveal endpoint
          response = await fetch(`/api/cards/${card.id}/reveal`, {
            method: 'POST',
            headers: {
              'sessionId': user.sessionId,
              'Content-Type': 'application/json'
            }
          });
        }

        if (!response.ok) {
          // If reveal endpoint doesn't exist, fall back to stored card number
          // This is a temporary solution - you should create the reveal endpoint
          setRevealedCards(prev => ({
            ...prev,
            [card.uniqueId]: {
              number: card.cardNumber,
              cvv: card.cvv || '***'
            }
          }));
          setTimeLeft(prev => ({
            ...prev,
            [card.uniqueId]: 30
          }));
          setActionLoading(false);
          return;
        }

        data = await response.json();
        
        // Show the revealed card with CVV
        setRevealedCards(prev => ({
          ...prev,
          [card.uniqueId]: {
            number: data.cardNumber || card.cardNumber,
            cvv: data.cvv || card.cvv || '***'
          }
        }));
        setTimeLeft(prev => ({
          ...prev,
          [card.uniqueId]: 30
        }));
      } catch (err) {
        // Fallback to stored data if API fails
        setRevealedCards(prev => ({
          ...prev,
          [card.uniqueId]: {
            number: card.cardNumber,
            cvv: card.cvv || '***'
          }
        }));
        setTimeLeft(prev => ({
          ...prev,
          [card.uniqueId]: 30
        }));
      } finally {
        setActionLoading(false);
      }
    } catch (err) {
      alert('Failed to reveal card number: ' + err.message);
    }
  };

  const handleCopyNumber = (cardNumber, lastFour) => {
    navigator.clipboard.writeText(cardNumber);
    setCopiedId(lastFour);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ==================== DEBIT CARD ACTIONS ====================
  const handleDebitActivate = async (cardId) => {
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

      await fetchDebitCards();
      alert('Card activated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDebitFreezeToggle = async (card) => {
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

      await fetchDebitCards();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDebitReplace = async (card) => {
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

      await fetchDebitCards();
      alert('New card ordered successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDebitDesign = async (card) => {
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

      await fetchDebitCards();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== CREDIT CARD ACTIONS ====================
  const handleCreditActivate = async (cardId) => {
    const pin = prompt('Enter a 4-digit PIN for your credit card:');
    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      alert('Please enter a valid 4-digit PIN');
      return;
    }

    const user = getLoggedInUser();
    if (!user?.sessionId) {
      alert('Session expired. Please log in again.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/credit/cards/${cardId}/activate`, {
        method: 'POST',
        headers: {
          'sessionId': user.sessionId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pin })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to activate card');
      }

      await fetchCreditCards();
      alert('Credit card activated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreditFreezeToggle = async (card) => {
    const user = getLoggedInUser();
    if (!user?.sessionId) {
      alert('Session expired. Please log in again.');
      return;
    }

    if (card.status === 'ACTIVE') {
      // Freeze
      const reason = prompt('Reason for freezing your card? (e.g., Lost card, Suspicious activity)');
      if (!reason) return;

      setActionLoading(true);
      try {
        const response = await fetch(`/api/credit/cards/${card.id}/freeze`, {
          method: 'POST',
          headers: {
            'sessionId': user.sessionId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to freeze card');
        }

        await fetchCreditCards();
        alert('Card has been frozen successfully.');
      } catch (err) {
        alert(err.message);
      } finally {
        setActionLoading(false);
      }
    } else if (card.status === 'FROZEN') {
      // Unfreeze
      if (!confirm('Are you sure you want to unfreeze this card?')) return;

      setActionLoading(true);
      try {
        const response = await fetch(`/api/credit/cards/${card.id}/unfreeze`, {
          method: 'POST',
          headers: {
            'sessionId': user.sessionId,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to unfreeze card');
        }

        await fetchCreditCards();
        alert('Card has been unfrozen successfully.');
      } catch (err) {
        alert(err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCreditReplace = async (card) => {
    const user = getLoggedInUser();
    if (!user?.sessionId) {
      alert('Session expired. Please log in again.');
      return;
    }

    const reason = prompt('Reason for replacement? (LOST, STOLEN, DAMAGED)');
    if (!reason) return;

    const confirmReplace = confirm(
      `Are you sure you want to replace this card?\n` +
      `Your current card will be cancelled and a new one will be issued.`
    );
    if (!confirmReplace) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/credit/cards/${card.id}/replace`, {
        method: 'POST',
        headers: {
          'sessionId': user.sessionId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason.toUpperCase() })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to replace card');
      }

      await fetchCreditCards();
      alert('New card has been ordered. You will receive it within 5-7 business days.');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreditChangePin = async (card) => {
    const user = getLoggedInUser();
    if (!user?.sessionId) {
      alert('Session expired. Please log in again.');
      return;
    }

    const oldPin = prompt('Enter your current PIN:');
    if (!oldPin || oldPin.length !== 4 || !/^\d+$/.test(oldPin)) {
      alert('Please enter a valid 4-digit PIN');
      return;
    }

    const newPin = prompt('Enter your new 4-digit PIN:');
    if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      alert('Please enter a valid 4-digit PIN');
      return;
    }

    const confirmPin = prompt('Confirm your new PIN:');
    if (newPin !== confirmPin) {
      alert('PINs do not match');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/credit/cards/${card.id}/change-pin`, {
        method: 'POST',
        headers: {
          'sessionId': user.sessionId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPin, newPin })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change PIN');
      }

      alert('PIN changed successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewLimits = (card) => {
    if (card.accountType === 'credit') {
      alert(`💰 Credit Card Details\n\n` +
            `Credit Limit: $${card.creditLimit?.toLocaleString()}\n` +
            `Available Credit: $${card.availableCredit?.toLocaleString()}\n` +
            `Current Balance: $${card.currentBalance?.toLocaleString()}\n` +
            `Daily Limit: $${card.dailyLimit?.toLocaleString() || 'N/A'}\n` +
            `Per Transaction: $${card.transactionLimit?.toLocaleString() || 'N/A'}`);
    } else if (card.accountType === 'business') {
      alert(`💰 Business Card Details\n\n` +
            `Business: ${card.businessName}\n` +
            `Daily Limit: $${card.dailyLimit?.toLocaleString()}\n` +
            `Per Transaction: $${card.transactionLimit?.toLocaleString()}\n` +
            `Monthly Limit: $${card.monthlyLimit?.toLocaleString()}`);
    } else {
      alert(`💰 Card Limits\n\n` +
            `Daily Limit: $${card.dailyLimit?.toLocaleString()}\n` +
            `Per Transaction: $${card.transactionLimit?.toLocaleString()}\n` +
            `Monthly Limit: $${card.monthlyLimit?.toLocaleString()}`);
    }
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

  const getCardIcon = (accountType) => {
    switch(accountType) {
      case 'business':
        return <BriefcaseIcon className="h-5 w-5 text-purple-600" />;
      case 'credit':
        return <CreditCardIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <BuildingLibraryIcon className="h-5 w-5 text-red-600" />;
    }
  };

  const getCardTypeColor = (accountType) => {
    switch(accountType) {
      case 'business':
        return 'purple';
      case 'credit':
        return 'blue';
      default:
        return 'red';
    }
  };

  const getAllCards = () => {
    const all = [
      ...debitCards,
      ...creditCards,
      ...businessCards
    ];
    return all;
  };

  const getFilteredCards = () => {
    switch(activeTab) {
      case 'debit':
        return debitCards;
      case 'credit':
        return creditCards;
      case 'business':
        return businessCards;
      default:
        return getAllCards();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
      </div>
    );
  }

  const allCards = getAllCards();
  const filteredCards = getFilteredCards();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manage Cards</h2>
        <p className="text-sm text-gray-600 mt-1">
          View and manage all your cards across all accounts
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      {allCards.length > 0 && (
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Cards ({allCards.length})
            </button>
            <button
              onClick={() => setActiveTab('debit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'debit'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Debit ({debitCards.length})
            </button>
            <button
              onClick={() => setActiveTab('credit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'credit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Credit ({creditCards.length})
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Business ({businessCards.length})
            </button>
          </nav>
        </div>
      )}

      {/* Cards Grid */}
      {allCards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No cards found</h3>
          <p className="text-sm text-gray-600 mb-4">
            You don't have any cards yet. Cards are automatically created when you open an account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCards.map((card) => {
            const isRevealed = revealedCards[card.uniqueId];
            const revealedData = revealedCards[card.uniqueId];
            const cardNumber = card.cardNumber || card.number || '';
            const lastFour = cardNumber.slice(-4);
            
            return (
              <div 
                key={card.uniqueId} 
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-md transition ${
                  card.accountType === 'credit' ? 'border-blue-200' :
                  card.accountType === 'business' ? 'border-purple-200' :
                  'border-red-200'
                }`}
              >
                {/* Card Image with Type Indicator */}
                <div className={`p-4 bg-gradient-to-br ${
                  card.accountType === 'credit' ? 'from-blue-50 to-blue-100' :
                  card.accountType === 'business' ? 'from-purple-50 to-purple-100' :
                  'from-red-50 to-red-100'
                } border-b relative`}>
                  <div className="absolute top-2 right-2 flex items-center space-x-1">
                    {getCardIcon(card.accountType)}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      card.accountType === 'credit' ? 'bg-blue-600 text-white' :
                      card.accountType === 'business' ? 'bg-purple-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {card.accountType === 'credit' ? 'CREDIT' :
                       card.accountType === 'business' ? 'BUSINESS' : 'DEBIT'}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <CardImage card={card} />
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          {card.cardType} Card
                          {card.accountType === 'business' && card.businessName && (
                            <span className="ml-2 text-sm text-purple-600">· {card.businessName}</span>
                          )}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(card.status)}`}>
                          {card.status}
                        </span>
                      </div>
                      
                      {/* Credit Limit Info (for credit cards) */}
                      {card.accountType === 'credit' && (
                        <div className="mt-2 bg-blue-50 rounded-lg p-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Credit Limit:</span>
                            <span className="font-semibold text-gray-900">${card.creditLimit?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-gray-600">Available:</span>
                            <span className="font-semibold text-green-600">${card.availableCredit?.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {/* Business Info (for business cards) */}
                      {card.accountType === 'business' && card.businessName && (
                        <div className="mt-2 bg-purple-50 rounded-lg p-2">
                          <p className="text-xs text-purple-700 font-medium">{card.businessName}</p>
                        </div>
                      )}
                      
                      {/* Card Number Section with Reveal */}
                      <div className="mt-3 space-y-2">
                        {/* Card Number Display */}
                        <div className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          isRevealed 
                            ? 'bg-green-50 border-2 border-green-300' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="flex-1">
                            {isRevealed ? (
                              <div>
                                <p className="text-xs text-green-600 mb-1 flex items-center">
                                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                  Card Number Visible
                                </p>
                                <p className="text-lg font-mono font-bold text-gray-900 tracking-wider">
                                  {revealedData?.number?.replace(/(.{4})/g, '$1 ') || cardNumber.replace(/(.{4})/g, '$1 ')}
                                </p>
                                {timeLeft[card.uniqueId] > 0 && (
                                  <div className="mt-2">
                                    <div className="w-full bg-green-200 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-green-600 h-1.5 transition-all duration-1000 rounded-full"
                                        style={{ width: `${(timeLeft[card.uniqueId] / 30) * 100}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-green-600 mt-1">
                                      Auto-hides in {timeLeft[card.uniqueId]} seconds
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Card Number</p>
                                <p className="text-lg font-mono text-gray-700 tracking-wider">
                                  {card.maskedCardNumber || card.maskedNumber}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons for Card Number */}
                          <div className="flex items-center space-x-2 ml-2">
                            <button
                              onClick={() => handleCopyNumber(
                                isRevealed ? revealedData?.number || cardNumber : cardNumber, 
                                lastFour
                              )}
                              className={`p-2 rounded-lg transition relative ${
                                copiedId === lastFour 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'hover:bg-gray-200 text-gray-600'
                              }`}
                              title="Copy card number"
                              disabled={actionLoading}
                            >
                              <DocumentDuplicateIcon className="h-5 w-5" />
                              {copiedId === lastFour && (
                                <span className="absolute -top-8 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
                                  Copied!
                                </span>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleRevealNumber(card)}
                              className={`p-2 rounded-lg transition ${
                                isRevealed 
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                  : 'hover:bg-gray-200 text-gray-600'
                              }`}
                              title={isRevealed ? "Hide card number" : "Show full card number (30 sec)"}
                              disabled={actionLoading}
                            >
                              {isRevealed ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Holder Name */}
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-500 mb-1">Card Holder</p>
                        <p className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                          {card.cardHolderName}
                        </p>
                      </div>

                      {/* Expiry Date & CVV */}
                      <div className="mt-2 flex items-center space-x-4">
                        <div>
                          <p className="text-xs text-gray-500">Expires</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(card.expiryDate).toLocaleDateString('en-US', { 
                              month: '2-digit', 
                              year: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">CVV</p>
                          <p className="text-sm font-medium text-gray-900">
                            {isRevealed ? (revealedData?.cvv || card.cvv || '***') : '***'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Limits */}
                  <div className={`grid grid-cols-3 gap-2 rounded-lg p-3 mb-4 ${
                    card.accountType === 'credit' ? 'bg-blue-50' :
                    card.accountType === 'business' ? 'bg-purple-50' :
                    'bg-red-50'
                  }`}>
                    <div className="text-center">
                      <span className="text-xs text-gray-600 block">Daily</span>
                      <p className="text-sm font-bold text-gray-900">${card.dailyLimit?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div className="text-center border-x border-gray-200">
                      <span className="text-xs text-gray-600 block">Per TXN</span>
                      <p className="text-sm font-bold text-gray-900">${card.transactionLimit?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-600 block">Monthly</span>
                      <p className="text-sm font-bold text-gray-900">${card.monthlyLimit?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Action Buttons - Different for each card type */}
                  <div className="grid grid-cols-4 gap-2">
                    {/* DEBIT CARD ACTIONS */}
                    {card.accountType === 'debit' && card.status === 'INACTIVE' && (
                      <button
                        onClick={() => handleDebitActivate(card.id)}
                        disabled={actionLoading}
                        className="col-span-4 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        Activate Card
                      </button>
                    )}

                    {card.accountType === 'debit' && card.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => handleDebitFreezeToggle(card)}
                          disabled={actionLoading}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                          title="Freeze Card"
                        >
                          <PauseIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDebitReplace(card)}
                          disabled={actionLoading}
                          className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                          title="Replace Card"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDebitDesign(card)}
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

                    {card.accountType === 'debit' && card.status === 'FROZEN' && (
                      <>
                        <button
                          onClick={() => handleDebitFreezeToggle(card)}
                          disabled={actionLoading}
                          className="col-span-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                        >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Unfreeze
                        </button>
                        <button
                          onClick={() => handleDebitReplace(card)}
                          disabled={actionLoading}
                          className="col-span-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Replace
                        </button>
                      </>
                    )}

                    {/* CREDIT CARD ACTIONS */}
                    {card.accountType === 'credit' && card.status === 'INACTIVE' && (
                      <button
                        onClick={() => handleCreditActivate(card.id)}
                        disabled={actionLoading}
                        className="col-span-4 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        Activate Card
                      </button>
                    )}

                    {card.accountType === 'credit' && card.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => handleCreditFreezeToggle(card)}
                          disabled={actionLoading}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                          title="Freeze Card"
                        >
                          <PauseIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCreditReplace(card)}
                          disabled={actionLoading}
                          className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                          title="Replace Card"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCreditChangePin(card)}
                          disabled={actionLoading}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                          title="Change PIN"
                        >
                          <KeyIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewLimits(card)}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {card.accountType === 'credit' && card.status === 'FROZEN' && (
                      <>
                        <button
                          onClick={() => handleCreditFreezeToggle(card)}
                          disabled={actionLoading}
                          className="col-span-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                        >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Unfreeze
                        </button>
                        <button
                          onClick={() => handleCreditReplace(card)}
                          disabled={actionLoading}
                          className="col-span-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Replace
                        </button>
                      </>
                    )}

                    {/* BUSINESS CARD ACTIONS */}
                    {card.accountType === 'business' && (
                      <button
                        onClick={() => handleViewLimits(card)}
                        className="col-span-4 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Limits
                      </button>
                    )}

                    {card.accountType === 'debit' && card.status === 'REPLACED' && (
                      <div className="col-span-4 text-center text-sm text-gray-500 py-2 bg-gray-50 rounded-lg">
                        This card has been replaced. Use your new card.
                      </div>
                    )}

                    {card.accountType === 'credit' && card.status === 'REPLACED' && (
                      <div className="col-span-4 text-center text-sm text-gray-500 py-2 bg-gray-50 rounded-lg">
                        This card has been replaced. Use your new card.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageCards;