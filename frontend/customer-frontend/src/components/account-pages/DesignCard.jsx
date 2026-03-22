import { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  SwatchIcon,
  PhotoIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const DesignCard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [designSuccess, setDesignSuccess] = useState(null);
  
  // Design form state
  const [designForm, setDesignForm] = useState({
    designColor: '#1E3A8A', // Default blue
    customColor: '',
    useDefaultImage: true
  });

  // Predefined color options
  const colorOptions = [
    { name: 'Classic Blue', value: '#1E3A8A' },
    { name: 'Forest Green', value: '#2E7D32' },
    { name: 'Royal Purple', value: '#8E24AA' },
    { name: 'Burgundy', value: '#C2185B' },
    { name: 'Sunset Orange', value: '#F57C00' },
    { name: 'Ruby Red', value: '#C62828' },
    { name: 'Teal', value: '#00695C' },
    { name: 'Charcoal', value: '#424242' },
    { name: 'Slate', value: '#546E7A' },
    { name: 'Golden', value: '#FF8F00' }
  ];

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
      
      // Show only physical cards that can be designed
      const designableCards = data.filter(card => !card.isVirtual);
      setCards(designableCards);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDesignClick = (card) => {
    setSelectedCard(card);
    setDesignForm({
      designColor: card.designColor || '#1E3A8A',
      customColor: '',
      useDefaultImage: true
    });
    setShowDesignModal(true);
  };

  const handleColorSelect = (colorValue) => {
    setDesignForm(prev => ({ ...prev, designColor: colorValue, customColor: '' }));
  };

  const handleCustomColorChange = (e) => {
    const value = e.target.value;
    setDesignForm(prev => ({ 
      ...prev, 
      customColor: value,
      designColor: value // Also update the design color
    }));
  };

  const handleSubmitDesign = async () => {
    if (!selectedCard) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/cards/${selectedCard.id}/design`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designColor: designForm.designColor,
          useDefaultImage: designForm.useDefaultImage
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update card design');
      }

      const updatedCard = await response.json();
      
      setDesignSuccess({
        cardId: updatedCard.id,
        cardLast4: updatedCard.cardNumber.slice(-4),
        cardType: updatedCard.cardType,
        newColor: designForm.designColor
      });

      setShowDesignModal(false);
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

  // Card preview component
  const CardPreview = ({ color }) => {
    return (
      <div 
        className="w-full h-32 rounded-lg p-4 text-white shadow-lg relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <div className="absolute top-2 right-2 opacity-50">
          <CreditCardIcon className="h-6 w-6" />
        </div>
        <div className="absolute top-4 left-4">
          <div className="w-8 h-6 bg-yellow-300/30 rounded"></div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs opacity-80">**** **** **** 1234</p>
              <p className="text-xs font-medium mt-1">CARDHOLDER NAME</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">MM/YY</p>
            </div>
          </div>
        </div>
      </div>
    );
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
        <h2 className="text-2xl font-bold text-gray-800">Design Your Card</h2>
        <p className="text-sm text-gray-500 mt-1">
          Personalize your physical cards with custom colors
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {designSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">
                Card Design Updated!
              </h3>
              <p className="text-xs text-green-700">
                Your {designSuccess.cardType} card ending in {designSuccess.cardLast4} has a new look.
              </p>
              <button
                onClick={() => setDesignSuccess(null)}
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
          <PaintBrushIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No designable cards found</h3>
          <p className="text-sm text-gray-500 mb-4">
            You don't have any physical cards to design. Virtual cards cannot be customized.
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
                {/* Card Info with Color Preview */}
                <div className="flex-1 flex items-center gap-4">
                  {/* Mini card preview */}
                  <div 
                    className="w-16 h-10 rounded shadow-sm flex-shrink-0"
                    style={{ backgroundColor: card.designColor || '#1E3A8A' }}
                  >
                    <CreditCardIcon className="h-4 w-4 text-white/50 m-1" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800">
                        {card.cardType} Card
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {card.designColor || 'Default Blue'}
                      </span>
                    </div>
                    
                    <p className="text-sm font-mono text-gray-600">
                      {formatCardNumber(card.maskedCardNumber)}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      Card holder: {card.cardHolderName}
                    </p>
                  </div>
                </div>

                {/* Design Button */}
                <button
                  onClick={() => handleDesignClick(card)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap"
                >
                  <PaintBrushIcon className="h-4 w-4" />
                  Customize Design
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Design Modal */}
      {showDesignModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Design Your {selectedCard.cardType} Card
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Card ending in <span className="font-mono font-medium">{selectedCard.cardNumber.slice(-4)}</span>
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left side - Color Picker */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <SwatchIcon className="h-4 w-4" />
                  Choose a Color
                </h4>
                
                {/* Predefined colors */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorSelect(color.value)}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${
                        designForm.designColor === color.value 
                          ? 'border-purple-600 scale-105 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>

                {/* Custom color picker */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Or pick a custom color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={designForm.designColor}
                      onChange={handleCustomColorChange}
                      className="h-10 w-20 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designForm.designColor}
                      onChange={handleCustomColorChange}
                      placeholder="#HEX"
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-300"
                    />
                  </div>
                </div>

                {/* Option for default image */}
                <div className="mt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={designForm.useDefaultImage}
                      onChange={(e) => setDesignForm(prev => ({ ...prev, useDefaultImage: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">
                      Use default SnopitechBank logo
                    </span>
                  </label>
                </div>
              </div>

              {/* Right side - Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <PhotoIcon className="h-4 w-4" />
                  Preview
                </h4>
                
                <CardPreview color={designForm.designColor} />
                
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Note:</span> The design will be applied to your physical card. 
                    Virtual cards keep their default appearance.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDesignModal(false);
                  setSelectedCard(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDesign}
                disabled={actionLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Applying...
                  </>
                ) : (
                  <>
                    <PaintBrushIcon className="h-4 w-4" />
                    Apply Design
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

export default DesignCard;