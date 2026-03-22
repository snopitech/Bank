import { useState } from 'react';
import {
  CreditCardIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

const CardImage = ({ card, onFlip }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getCardGradient = (color) => {
    const gradients = {
      '#1E3A8A': 'from-blue-900 to-blue-700', // Default blue
      '#FF5733': 'from-orange-600 to-red-500', // Orange/Red
      '#2E7D32': 'from-green-800 to-green-600', // Green
      '#8E24AA': 'from-purple-800 to-purple-600', // Purple
      '#C2185B': 'from-pink-800 to-pink-600', // Pink
      '#F57C00': 'from-amber-700 to-orange-600', // Amber
      '#000000': 'from-gray-900 to-gray-700', // Black
      '#FFFFFF': 'from-gray-100 to-white border-2 border-gray-300' // White
    };
    
    return gradients[color] || 'from-blue-900 to-blue-700';
  };

  const getCardLogo = (type) => {
    if (type === 'VIRTUAL') {
      return (
        <div className="flex items-center space-x-1">
          <span className="text-xs font-medium opacity-90">VIRTUAL</span>
          <ShieldCheckIcon className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1">
        <span className="text-xs font-medium opacity-90">PHYSICAL</span>
        <BuildingLibraryIcon className="h-4 w-4" />
      </div>
    );
  };

  const formatCardNumber = (number) => {
    if (!number) return '**** **** **** ****';
    const last4 = number.slice(-4);
    return `**** **** **** ${last4}`;
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'MM/YY';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        year: '2-digit' 
      });
    } catch {
      return 'MM/YY';
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) onFlip(!isFlipped);
  };

  return (
    <div 
      className="relative w-full max-w-sm cursor-pointer perspective"
      onClick={handleFlip}
    >
      <div className={`relative w-full h-48 transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of card */}
        <div className={`absolute inset-0 rounded-xl p-5 shadow-xl backface-hidden bg-gradient-to-br ${getCardGradient(card.designColor)} text-white`}>
          {/* Card Header with Logo and Bank Name */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <CpuChipIcon className="h-8 w-8 opacity-80" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider">SNOPITECH</span>
                <span className="text-[10px] opacity-80 -mt-1">BANK</span>
              </div>
            </div>
            <div className="text-right">
              {getCardLogo(card.cardType)}
            </div>
          </div>

          {/* Bank Logo in the middle (optional decorative element) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
            <img 
              src="https://snopitechstore.online/public-images/Mylogo.png" 
              alt="SnopitechBank" 
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* Card Number */}
          <div className="mt-6 relative z-10">
            <p className="text-xs opacity-80 mb-1">Card Number</p>
            <p className="text-lg tracking-wider font-mono">
              {formatCardNumber(card.cardNumber)}
            </p>
          </div>

          {/* Card Details */}
          <div className="mt-4 relative z-10">
            <div className="flex justify-between items-end">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs opacity-80 mb-1">Card Holder</p>
                <p className="text-base font-bold uppercase truncate" title={card.cardHolderName || 'CARDHOLDER NAME'}>
                  {card.cardHolderName || 'CARDHOLDER NAME'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs opacity-80">Expires</p>
                <p className="text-sm font-medium">
                  {formatExpiryDate(card.expiryDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Small Bank Name at Bottom */}
          <div className="absolute bottom-2 left-5 text-[8px] opacity-50 tracking-wider">
            SNOPITECHBANK • MEMBER FDIC
          </div>

          {/* Status Badge */}
          {card.status !== 'ACTIVE' && (
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                card.status === 'FROZEN' ? 'bg-blue-500 text-white' :
                card.status === 'INACTIVE' ? 'bg-yellow-500 text-white' :
                card.status === 'REPLACED' ? 'bg-gray-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {card.status}
              </span>
            </div>
          )}
        </div>

        {/* Back of card */}
        <div className={`absolute inset-0 rounded-xl p-5 shadow-xl backface-hidden rotate-y-180 bg-gradient-to-br from-gray-800 to-gray-900 text-white`}>
          {/* Magnetic Strip */}
          <div className="absolute top-6 left-0 w-full h-8 bg-black"></div>

          {/* Bank Logo on Back */}
          <div className="absolute top-8 right-4 opacity-30">
            <img 
              src="https://snopitechstore.online/public-images/Mylogo.png" 
              alt="SnopitechBank" 
              className="w-8 h-8 object-contain"
            />
          </div>

          {/* CVV Area */}
          <div className="mt-16 px-3">
            <div className="bg-white rounded p-3 text-gray-900">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">CVV</span>
                <span className="font-mono font-bold text-lg">***</span>
              </div>
            </div>
          </div>

          {/* Signature Line */}
          <div className="mt-4 px-3">
            <div className="bg-gray-300 h-8 rounded flex items-center px-3">
              <span className="text-gray-600 text-xs italic">Authorized Signature</span>
            </div>
          </div>

          {/* Card Info with Bank Name */}
          <div className="absolute bottom-4 left-4 right-4 text-xs opacity-70">
            <p className="text-center">
              This card is the property of <span className="font-semibold">SnopitechBank</span>.
              If found, please return to any branch.
            </p>
          </div>

          {/* Flip Hint */}
          <div className="absolute top-3 right-3">
            <span className="text-xs opacity-50">Click to flip</span>
          </div>
        </div>
      </div>

      {/* Add custom CSS for 3D effect */}
      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default CardImage;