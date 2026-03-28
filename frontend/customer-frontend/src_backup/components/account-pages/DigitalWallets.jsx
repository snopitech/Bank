import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  FingerPrintIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const DigitalWallets = () => {
  const [wallets, setWallets] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  // Form states
  const [newWalletForm, setNewWalletForm] = useState({
    walletType: 'APPLE_PAY',
    deviceName: ''
  });

  const [addCardForm, setAddCardForm] = useState({
    cardId: '',
    setAsPrimary: false,
    enableBiometrics: true
  });

  // Wallet type options
  const walletTypes = [
    { type: 'APPLE_PAY', name: 'Apple Pay', icon: '🍎', color: 'bg-gray-900' },
    { type: 'GOOGLE_PAY', name: 'Google Pay', icon: '📱', color: 'bg-blue-600' },
    { type: 'SAMSUNG_PAY', name: 'Samsung Pay', icon: '📲', color: 'bg-blue-800' },
    { type: 'PAYPAL', name: 'PayPal', icon: '💸', color: 'bg-blue-500' },
    { type: 'VENMO', name: 'Venmo', icon: '💳', color: 'bg-indigo-600' }
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
    fetchWallets();
    fetchCards();
  }, []);

  const fetchWallets = async () => {
    try {
      const userId = getLoggedInUserId();
      if (!userId) {
        setError('Please log in to view wallets');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/wallets/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch wallets');
      const data = await response.json();
      setWallets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const userId = getLoggedInUserId();
      if (!userId) return;

      const response = await fetch(`/api/cards/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch cards');
      const data = await response.json();
      // Only show active physical cards that can be added to wallets
      const activePhysicalCards = data.filter(card => 
        !card.isVirtual && card.status === 'ACTIVE'
      );
      setCards(activePhysicalCards);
    } catch (err) {
      console.error('Error fetching cards:', err);
    }
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    if (!newWalletForm.deviceName.trim()) {
      alert('Please enter a device name');
      return;
    }

    setActionLoading(true);
    try {
      const userId = getLoggedInUserId();
      const response = await fetch(
        `/api/wallets/create?userId=${userId}&walletType=${newWalletForm.walletType}&deviceName=${encodeURIComponent(newWalletForm.deviceName)}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create wallet');
      }

      await fetchWallets();
      setShowAddWalletModal(false);
      setNewWalletForm({ walletType: 'APPLE_PAY', deviceName: '' });
      setSuccess({ message: 'Wallet created successfully!' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!addCardForm.cardId) {
      alert('Please select a card');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/wallets/${selectedWallet.id}/add-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: addCardForm.cardId,
          deviceName: selectedWallet.deviceName,
          setAsPrimary: addCardForm.setAsPrimary,
          enableBiometrics: addCardForm.enableBiometrics
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add card');
      }

      await fetchWallets();
      setShowAddCardModal(false);
      setAddCardForm({ cardId: '', setAsPrimary: false, enableBiometrics: true });
      setSuccess({ message: 'Card added to wallet successfully!' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveCard = async (walletId, cardId) => {
    if (!confirm('Are you sure you want to remove this card from the wallet?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/wallets/${walletId}/remove-card/${cardId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove card');
      }

      await fetchWallets();
      setSuccess({ message: 'Card removed from wallet' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPrimary = async (walletId) => {
    setActionLoading(true);
    try {
      const userId = getLoggedInUserId();
      const response = await fetch(`/api/wallets/${walletId}/primary?userId=${userId}`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to set primary wallet');
      }

      await fetchWallets();
      setSuccess({ message: 'Primary wallet updated' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getWalletTypeInfo = (type) => {
    return walletTypes.find(w => w.type === type) || walletTypes[0];
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Digital Wallets</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your connected digital wallets and cards
          </p>
        </div>
        <button
          onClick={() => setShowAddWalletModal(true)}
          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Wallet
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          {success.message}
        </div>
      )}

      {/* Wallets Grid */}
      {wallets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <DevicePhoneMobileIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No wallets connected</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add your cards to Apple Pay, Google Pay, and other digital wallets
          </p>
          <button
            onClick={() => setShowAddWalletModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Connect a Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {wallets.map((wallet) => {
            const walletInfo = getWalletTypeInfo(wallet.walletType);
            return (
              <div key={wallet.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* Wallet Header */}
                <div className={`${walletInfo.color} px-6 py-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{walletInfo.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{walletInfo.name}</h3>
                        <p className="text-sm opacity-90">{wallet.deviceName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {wallet.isPrimary && (
                        <span className="flex items-center text-xs bg-white/20 px-3 py-1 rounded-full">
                          <StarIcon className="h-3 w-3 mr-1" />
                          Primary
                        </span>
                      )}
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        wallet.status === 'ACTIVE' ? 'bg-green-500/20 text-green-100' : 'bg-gray-500/20 text-gray-100'
                      }`}>
                        {wallet.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cards in Wallet */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Cards in Wallet ({wallet.cardCount})
                    </h4>
                    {!wallet.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(wallet.id)}
                        disabled={actionLoading}
                        className="text-xs text-gray-600 hover:text-gray-800 font-medium flex items-center"
                      >
                        <StarIcon className="h-4 w-4 mr-1" />
                        Set as Primary
                      </button>
                    )}
                  </div>

                  {wallet.cards.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                      <CreditCardIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No cards added yet</p>
                      <button
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setShowAddCardModal(true);
                        }}
                        className="mt-2 text-xs text-gray-600 hover:text-gray-800 font-medium"
                      >
                        + Add a card
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wallet.cards.map((card) => (
                        <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CreditCardIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {card.cardType} Card • {card.maskedCardNumber}
                              </p>
                              <p className="text-xs text-gray-500">
                                Added {new Date(card.addedDate).toLocaleDateString()}
                                {card.lastUsedDate && ` • Last used ${new Date(card.lastUsedDate).toLocaleDateString()}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {card.status === 'ACTIVE' && (
                              <>
                                {wallet.biometricEnabled && (
                                  <FingerPrintIcon className="h-4 w-4 text-green-600" title="Biometric enabled" />
                                )}
                                <button
                                  onClick={() => handleRemoveCard(wallet.id, card.cardId)}
                                  disabled={actionLoading}
                                  className="p-1 text-gray-400 hover:text-red-600 transition"
                                  title="Remove from wallet"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add another card button */}
                      <button
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setShowAddCardModal(true);
                        }}
                        className="w-full mt-2 text-sm text-gray-600 hover:text-gray-800 font-medium py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition"
                      >
                        + Add another card
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Digital Wallet</h3>
            
            <form onSubmit={handleCreateWallet}>
              <div className="space-y-4">
                {/* Wallet Type Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Select Wallet Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {walletTypes.map((wallet) => (
                      <button
                        key={wallet.type}
                        type="button"
                        onClick={() => setNewWalletForm(prev => ({ ...prev, walletType: wallet.type }))}
                        className={`p-3 rounded-lg border-2 transition ${
                          newWalletForm.walletType === wallet.type
                            ? 'border-gray-600 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{wallet.icon}</span>
                        <span className="text-xs font-medium">{wallet.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Device Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Device Name
                  </label>
                  <input
                    type="text"
                    value={newWalletForm.deviceName}
                    onChange={(e) => setNewWalletForm(prev => ({ ...prev, deviceName: e.target.value }))}
                    placeholder="e.g., iPhone 15 Pro, Galaxy S23"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    required
                  />
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    Your card details are securely tokenized when added to digital wallets.
                    The actual card number is never shared.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddWalletModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center"
                >
                  {actionLoading ? 'Creating...' : 'Create Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCardModal && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add Card to {getWalletTypeInfo(selectedWallet.walletType).name}
            </h3>
            
            <form onSubmit={handleAddCard}>
              <div className="space-y-4">
                {/* Card Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Select Card
                  </label>
                  {cards.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">No active cards available</p>
                      <p className="text-xs text-gray-400 mt-1">Activate a card first</p>
                    </div>
                  ) : (
                    <select
                      value={addCardForm.cardId}
                      onChange={(e) => setAddCardForm(prev => ({ ...prev, cardId: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      required
                    >
                      <option value="">Select a card</option>
                      {cards.map(card => (
                        <option key={card.id} value={card.id}>
                          {card.cardType} • {card.maskedCardNumber}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={addCardForm.setAsPrimary}
                      onChange={(e) => setAddCardForm(prev => ({ ...prev, setAsPrimary: e.target.checked }))}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Set as primary wallet</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={addCardForm.enableBiometrics}
                      onChange={(e) => setAddCardForm(prev => ({ ...prev, enableBiometrics: e.target.checked }))}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Enable biometric authentication</span>
                  </label>
                </div>

                {/* Security Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 flex items-start">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                    <span>
                      A tokenized version of your card will be stored in the wallet.
                      Your actual card number remains secure.
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCardModal(false);
                    setSelectedWallet(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || cards.length === 0}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center"
                >
                  {actionLoading ? 'Adding...' : 'Add to Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalWallets;