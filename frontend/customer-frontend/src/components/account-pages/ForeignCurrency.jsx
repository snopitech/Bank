import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  GlobeAltIcon,
  CalculatorIcon,
  TruckIcon,
  BuildingLibraryIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const ForeignCurrency = () => {
  const [rates, setRates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Calculator state
  const [calculator, setCalculator] = useState({
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    amount: '',
    calculation: null
  });

  // Order form state
  const [orderForm, setOrderForm] = useState({
    accountId: '',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    amount: '',
    deliveryMethod: 'BRANCH_PICKUP',
    deliveryAddress: '',
    notes: ''
  });

  // User accounts
  const [accounts, setAccounts] = useState([]);

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
    fetchRates();
    fetchOrders();
    fetchAccounts();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/currency/rates');
      if (!response.ok) throw new Error('Failed to fetch rates');
      const data = await response.json();
      setRates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const userId = getLoggedInUserId();
      if (!userId) return;

      const response = await fetch(`/api/currency/orders/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const userId = getLoggedInUserId();
      if (!userId) return;

      const response = await fetch(`/api/accounts/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      // Only show checking accounts with sufficient balance
      const checkingAccounts = data.filter(acc => 
        acc.accountType === 'CHECKING' && !acc.closed
      );
      setAccounts(checkingAccounts);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const handleCalculate = async () => {
    if (!calculator.amount || calculator.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/currency/calculate?fromCurrency=${calculator.fromCurrency}&toCurrency=${calculator.toCurrency}&amount=${calculator.amount}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Calculation failed');
      }

      const data = await response.json();
      setCalculator(prev => ({ ...prev, calculation: data }));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderForm.accountId) {
      alert('Please select an account');
      return;
    }

    if (!orderForm.amount || orderForm.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (orderForm.deliveryMethod === 'HOME_DELIVERY' && !orderForm.deliveryAddress.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    setActionLoading(true);
    try {
      const userId = getLoggedInUserId();
      const response = await fetch(`/api/currency/order?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderForm)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place order');
      }

      await fetchOrders();
      setShowOrderModal(false);
      setOrderForm({
        accountId: '',
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: '',
        deliveryMethod: 'BRANCH_PICKUP',
        deliveryAddress: '',
        notes: ''
      });
      setSuccess('Currency order placed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/currency/orders/${orderId}/cancel`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel order');
      }

      await fetchOrders();
      setSuccess('Order cancelled successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryIcon = (method) => {
    return method === 'HOME_DELIVERY' ? TruckIcon : BuildingLibraryIcon;
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
          <h2 className="text-2xl font-bold text-gray-800">Foreign Currency</h2>
          <p className="text-sm text-gray-500 mt-1">
            Exchange rates and foreign currency orders
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCalculator(true)}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            <CalculatorIcon className="h-5 w-5 mr-2" />
            Calculate
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
          >
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Order Currency
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Exchange Rates Grid with Scroll */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Current Exchange Rates</h3>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {rates[0]?.lastUpdated ? new Date(rates[0].lastUpdated).toLocaleString() : 'N/A'} • Showing {rates.length} currencies
          </p>
        </div>
        
        {/* Scrollable Container */}
        <div className="p-6">
          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rates.map((rate) => (
                <div key={rate.toCurrency} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{rate.symbol}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{rate.toCurrency}</h4>
                        <p className="text-xs text-gray-500">{rate.countryName}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      1 USD
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{rate.rate.toFixed(4)}</p>
                      <p className="text-xs text-gray-500">{rate.toCurrency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Inverse</p>
                      <p className="text-sm font-medium">1 {rate.toCurrency} = {rate.inverseRate.toFixed(4)} USD</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {orders.map((order) => {
                const DeliveryIcon = getDeliveryIcon(order.deliveryMethod);
                return (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-800">
                            Order #{order.orderNumber}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">From</p>
                            <p className="font-medium">{order.formattedFromAmount}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">To</p>
                            <p className="font-medium">{order.formattedToAmount}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Rate</p>
                            <p className="font-medium">{order.exchangeRate.toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Fee</p>
                            <p className="font-medium">${order.fee.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <DeliveryIcon className="h-3 w-3 mr-1" />
                            {order.deliveryMethod === 'HOME_DELIVERY' ? 'Home Delivery' : 'Branch Pickup'}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Ready: {new Date(order.deliveryDate).toLocaleDateString()}
                          </div>
                          {order.trackingNumber && (
                            <div className="flex items-center">
                              <ArrowPathIcon className="h-3 w-3 mr-1" />
                              Track: {order.trackingNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={actionLoading}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 rounded-lg transition disabled:opacity-50"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Currency Calculator</h3>
            
            <div className="space-y-4">
              {/* From/To Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                  <select
                    value={calculator.fromCurrency}
                    onChange={(e) => setCalculator(prev => ({ ...prev, fromCurrency: e.target.value, calculation: null }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                  <select
                    value={calculator.toCurrency}
                    onChange={(e) => setCalculator(prev => ({ ...prev, toCurrency: e.target.value, calculation: null }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    {rates.map(rate => (
                      <option key={rate.toCurrency} value={rate.toCurrency}>
                        {rate.toCurrency} - {rate.countryName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Amount (USD)</label>
                <input
                  type="number"
                  value={calculator.amount}
                  onChange={(e) => setCalculator(prev => ({ ...prev, amount: e.target.value, calculation: null }))}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={actionLoading || !calculator.amount}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {actionLoading ? 'Calculating...' : 'Calculate'}
              </button>

              {/* Results */}
              {calculator.calculation && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Exchange Rate:</span>
                    <span className="font-medium">1 USD = {calculator.calculation.exchangeRate.toFixed(4)} {calculator.toCurrency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">You'll receive:</span>
                    <span className="font-medium text-green-600">
                      {calculator.calculation.toAmount.toFixed(2)} {calculator.toCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee:</span>
                    <span className="font-medium">${calculator.calculation.fee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total to charge:</span>
                      <span>${calculator.calculation.totalUsd.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCalculator(false);
                  setCalculator({ fromCurrency: 'USD', toCurrency: 'EUR', amount: '', calculation: null });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Foreign Currency</h3>
            
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              {/* Account Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From Account</label>
                <select
                  value={orderForm.accountId}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, accountId: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  required
                >
                  <option value="">Select an account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountType} • {acc.maskedAccountNumber || `****${acc.accountNumber.slice(-4)}`} (${acc.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Order Currency</label>
                <select
                  value={orderForm.toCurrency}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, toCurrency: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  required
                >
                  {rates.map(rate => (
                    <option key={rate.toCurrency} value={rate.toCurrency}>
                      {rate.toCurrency} - {rate.countryName} ({rate.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Amount (USD)</label>
                <input
                  type="number"
                  value={orderForm.amount}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>

              {/* Delivery Method */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Delivery Method</label>
                <select
                  value={orderForm.deliveryMethod}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryMethod: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  required
                >
                  <option value="BRANCH_PICKUP">Branch Pickup (Next Day)</option>
                  <option value="HOME_DELIVERY">Home Delivery (3-5 Business Days)</option>
                </select>
              </div>

              {/* Delivery Address (conditional) */}
              {orderForm.deliveryMethod === 'HOME_DELIVERY' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Delivery Address</label>
                  <textarea
                    value={orderForm.deliveryAddress}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    rows="2"
                    placeholder="Enter your delivery address"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g., Trip to Paris"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              {/* Fee Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 flex items-start">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                  <span>
                    Service fee applies based on order amount. Funds will be deducted immediately upon order.
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowOrderModal(false);
                    setOrderForm({
                      accountId: '',
                      fromCurrency: 'USD',
                      toCurrency: 'EUR',
                      amount: '',
                      deliveryMethod: 'BRANCH_PICKUP',
                      deliveryAddress: '',
                      notes: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
};

export default ForeignCurrency;