// src/components/account-pages/ManageAlerts.jsx
import { useState, useEffect } from 'react';
import { 
  BellIcon,
  BellSnoozeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const ManageAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, paused
  const [filterType, setFilterType] = useState('all'); // all, security, transaction, account

  // Mock data with soft, elegant colors
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setAlerts([
        {
          id: 1,
          name: 'Large Transaction Alert',
          description: 'Get notified when a transaction over $1,000 occurs',
          type: 'transaction',
          status: 'active',
          frequency: 'instant',
          channels: ['email', 'sms'],
          threshold: 1000,
          lastTriggered: '2026-02-10T14:30:00',
          color: 'slate',
          icon: '💰'
        },
        {
          id: 2,
          name: 'Low Balance Warning',
          description: 'Alert when account balance falls below $500',
          type: 'account',
          status: 'active',
          frequency: 'instant',
          channels: ['email', 'sms', 'push'],
          threshold: 500,
          lastTriggered: '2026-02-08T09:15:00',
          color: 'stone',
          icon: '📉'
        },
        {
          id: 3,
          name: 'Login From New Device',
          description: 'Security alert when account is accessed from unrecognized device',
          type: 'security',
          status: 'active',
          frequency: 'instant',
          channels: ['email', 'sms', 'push'],
          lastTriggered: '2026-02-11T22:45:00',
          color: 'gray',
          icon: '🔐'
        },
        {
          id: 4,
          name: 'Weekly Spending Summary',
          description: 'Receive a summary of your weekly spending every Monday',
          type: 'transaction',
          status: 'paused',
          frequency: 'weekly',
          channels: ['email'],
          lastTriggered: '2026-02-03T08:00:00',
          color: 'zinc',
          icon: '📊'
        },
        {
          id: 5,
          name: 'Password Change Alert',
          description: 'Get notified when your password is changed',
          type: 'security',
          status: 'active',
          frequency: 'instant',
          channels: ['email', 'sms'],
          lastTriggered: '2026-01-28T16:20:00',
          color: 'slate',
          icon: '🔑'
        },
        {
          id: 6,
          name: 'Monthly Statement Ready',
          description: 'Notification when your monthly statement is available',
          type: 'account',
          status: 'active',
          frequency: 'monthly',
          channels: ['email'],
          lastTriggered: '2026-02-01T00:00:00',
          color: 'stone',
          icon: '📄'
        },
        {
          id: 7,
          name: 'Foreign Transaction Alert',
          description: 'Alert when a transaction is made outside your home country',
          type: 'transaction',
          status: 'paused',
          frequency: 'instant',
          channels: ['sms', 'push'],
          threshold: 0,
          lastTriggered: '2026-01-15T11:30:00',
          color: 'gray',
          icon: '🌍'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'security': return <ShieldCheckIcon className="h-4 w-4" />;
      case 'transaction': return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'account': return <UserCircleIcon className="h-4 w-4" />;
      default: return <BellIcon className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'email': return <EnvelopeIcon className="h-3 w-3" />;
      case 'sms': return <DevicePhoneMobileIcon className="h-3 w-3" />;
      case 'push': return <BellIcon className="h-3 w-3" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          <BellSnoozeIcon className="h-3 w-3 mr-1" />
          Paused
        </span>
      );
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      security: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      transaction: 'bg-amber-50 text-amber-700 border-amber-200',
      account: 'bg-sky-50 text-sky-700 border-sky-200'
    };
    const labels = {
      security: 'Security',
      transaction: 'Transaction',
      account: 'Account'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colors[type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
        {getTypeIcon(type)}
        <span className="ml-1">{labels[type]}</span>
      </span>
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    if (filterType !== 'all' && alert.type !== filterType) return false;
    return true;
  });

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const pausedCount = alerts.filter(a => a.status === 'paused').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with soft gradient */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-gray-800 mb-1">Alert Preferences</h2>
            <p className="text-sm text-gray-500">Manage how and when you receive notifications</p>
          </div>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition flex items-center shadow-sm">
            <PlusIcon className="h-4 w-4 mr-1.5" />
            New Alert
          </button>
        </div>
      </div>

      {/* Stats with muted colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Alerts</p>
              <p className="text-2xl font-light text-gray-800">{alerts.length}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <BellIcon className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active</p>
              <p className="text-2xl font-light text-gray-800">{activeCount}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Paused</p>
              <p className="text-2xl font-light text-gray-800">{pausedCount}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <BellSnoozeIcon className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last 24h</p>
              <p className="text-2xl font-light text-gray-800">3</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters - soft and subtle */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filterStatus === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filterStatus === 'active' 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('paused')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filterStatus === 'paused' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paused
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filterType === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('security')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filterType === 'security' 
                  ? 'bg-indigo-700 text-white' 
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setFilterType('transaction')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filterType === 'transaction' 
                  ? 'bg-amber-700 text-white' 
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Transaction
            </button>
            <button
              onClick={() => setFilterType('account')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filterType === 'account' 
                  ? 'bg-sky-700 text-white' 
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              Account
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List - elegant and understated */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div 
            key={alert.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Main row - always visible */}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-xl mr-1">{alert.icon}</span>
                    <h3 className="text-base font-medium text-gray-800">{alert.name}</h3>
                    <div className="flex items-center gap-1.5 ml-2">
                      {getStatusBadge(alert.status)}
                      {getTypeBadge(alert.type)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">{alert.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center text-gray-500">
                      <ClockIcon className="h-3.5 w-3.5 mr-1" />
                      {alert.frequency === 'instant' ? 'Real-time' : alert.frequency}
                    </div>
                    
                    {alert.threshold && (
                      <div className="flex items-center text-gray-500">
                        <CurrencyDollarIcon className="h-3.5 w-3.5 mr-1" />
                        ${alert.threshold.toLocaleString()}+
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1.5">
                      <span className="text-gray-500">Via:</span>
                      {alert.channels.map((channel, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">
                          {getChannelIcon(channel)}
                          <span className="ml-1">{channel}</span>
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-gray-400">
                      Last: {formatDate(alert.lastTriggered)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                  >
                    {expandedId === alert.id ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Expanded details - only shown when expanded */}
            {expandedId === alert.id && (
              <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Delivery Channels</h4>
                    <div className="space-y-2">
                      {['email', 'sms', 'push'].map((channel) => (
                        <label key={channel} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={alert.channels.includes(channel)}
                            className="h-4 w-4 text-gray-800 rounded border-gray-300 focus:ring-gray-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Threshold Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Minimum amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            defaultValue={alert.threshold || 0}
                            className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Frequency</label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 text-sm">
                          <option value="instant" selected={alert.frequency === 'instant'}>Real-time</option>
                          <option value="daily" selected={alert.frequency === 'daily'}>Daily</option>
                          <option value="weekly" selected={alert.frequency === 'weekly'}>Weekly</option>
                          <option value="monthly" selected={alert.frequency === 'monthly'}>Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredAlerts.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellSnoozeIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No alerts found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {filterStatus !== 'all' || filterType !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first alert to get started'}
            </p>
            {(filterStatus !== 'all' || filterType !== 'all') && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterType('all');
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom section with soft CTA */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <BellIcon className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">Never miss important updates</h3>
              <p className="text-xs text-gray-500">Customize how and when you receive notifications</p>
            </div>
          </div>
          <button className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition bg-white hover:bg-gray-50">
            Notification History
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageAlerts;