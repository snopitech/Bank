import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowLeftIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const CardLimits = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchUserCards();
  }, []);

  const fetchUserCards = async () => {
    try {
      // Get logged in user
      const userStr = localStorage.getItem('loggedInUser');
      if (!userStr) {
        navigate('/login');
        return;
      }
      const user = JSON.parse(userStr);
      
      // Fetch user's cards
      const response = await fetch(`/api/cards/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCardTypeIcon = (type) => {
    return type === 'PHYSICAL' ? '💳' : '📱';
  };

  const formatCardNumber = (number) => {
    if (!number) return '****-****-****-****';
    return number.replace(/(\d{4})/g, '$1-').slice(0, -1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Card Spending Limits</h2>
        <button
          onClick={() => navigate('/accounts')}
          className="flex items-center text-gray-600 hover:text-red-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Accounts
        </button>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              For your security, spending limits cannot be changed online. Please contact our banking team to request limit adjustments.
            </p>
          </div>
        </div>
      </div>

      {/* Cards List */}
      {cards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Cards Found</h3>
          <p className="text-sm text-gray-500">
            You don't have any active cards at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCardTypeIcon(card.cardType)}</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {card.cardType} Card • {card.cardHolderName}
                    </p>
                    <p className="text-sm text-gray-600 font-mono mt-1">
                      {formatCardNumber(card.cardNumber)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {card.expiryDate}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  card.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {card.status}
                </span>
              </div>

              {/* Current Limits Display */}
              <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Daily Limit</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${card.dailyLimit?.toLocaleString() || '1,000'}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Per Transaction</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${card.transactionLimit?.toLocaleString() || '500'}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Monthly Limit</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${card.monthlyLimit?.toLocaleString() || '5,000'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Card for Limit Increases */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-lg border border-amber-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Request a Limit Increase
          </h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Need higher spending limits? Our banking team is here to help. Contact us to discuss your needs and request a limit adjustment.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Email Card */}
            <div className="bg-white rounded-lg p-5 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all group">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-amber-200 transition">
                  <EnvelopeIcon className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Email Support</h4>
              </div>
              <a 
                href="mailto:snopitech@gmail.com" 
                className="text-lg font-mono text-amber-700 hover:text-amber-800 hover:underline break-all"
              >
                snopitech@gmail.com
              </a>
              <p className="text-xs text-gray-500 mt-2">
                Include your card details and requested limit
              </p>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-lg p-5 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all group">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-amber-200 transition">
                  <PhoneIcon className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Phone Support</h4>
              </div>
              <a 
                href="tel:+17138701132" 
                className="text-lg font-mono text-amber-700 hover:text-amber-800"
              >
                +1 (713) 870-1132
              </a>
              <p className="text-xs text-gray-500 mt-2">
                Mon-Fri: 8am - 8pm EST | Sat: 9am - 5pm EST
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-4 border-t border-amber-200">
            <div className="flex items-center justify-between text-sm">
              <div className="space-y-2">
                <p className="text-gray-600 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-amber-600" />
                  Limit increase requests are typically processed within 24 hours
                </p>
                <p className="text-gray-600 flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-2 text-amber-600" />
                  All requests are verified for your security
                </p>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                Available Now
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h4>
        <div className="space-y-3">
          <div className="border-b border-gray-200 pb-3">
            <p className="font-medium text-gray-800 mb-1">Why can't I change my limits online?</p>
            <p className="text-sm text-gray-600">
              For your security, limit changes require verification to prevent unauthorized increases. This protects your funds from potential fraud.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-3">
            <p className="font-medium text-gray-800 mb-1">How long do limit increases take?</p>
            <p className="text-sm text-gray-600">
              Most requests are processed within 24 hours. You'll receive an email confirmation once your new limits are active.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-1">What information do I need to provide?</p>
            <p className="text-sm text-gray-600">
              Please have your card number ready and be prepared to verify your identity. Let us know your desired daily, per transaction, and monthly limits.
            </p>
          </div>
        </div>
      </div>

      {/* Find a Branch */}
      <div className="mt-6 text-center">
        <button
          onClick={() => window.open('https://maps.google.com/?q=SnopitechBank', '_blank')}
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
        >
          <BuildingLibraryIcon className="h-4 w-4 mr-2" />
          Find a Branch Near You
        </button>
      </div>
    </div>
  );
};

export default CardLimits;