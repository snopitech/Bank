// src/pages/AccountsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRightIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ArrowPathIcon,
  StopCircleIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  XCircleIcon,
  ClockIcon,
  CogIcon,
  WalletIcon,
  ArrowDownTrayIcon,
  BuildingLibraryIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

// Import content components
import AccountSummary from '../components/account-pages/AccountSummary';
import ManageAlerts from '../components/account-pages/ManageAlerts';
import Statements from '../components/account-pages/Statements';
import DownloadActivity from '../components/account-pages/DownloadActivity';
import MyInquiries from '../components/account-pages/MyInquiries';
import VerificationOfDeposit from '../components/account-pages/VerificationOfDeposit';
import ManageAccounts from '../components/account-pages/ManageAccounts';
import OverdraftServices from '../components/account-pages/OverdraftServices';
import StopCheck from '../components/account-pages/StopCheck';
import StopFuturePayments from '../components/account-pages/StopFuturePayments';
import DirectDeposit from '../components/account-pages/DirectDeposit';
import RecurringPayments from '../components/account-pages/RecurringPayments';
import TrackClaims from '../components/account-pages/TrackClaims';
import CloseAccount from '../components/account-pages/CloseAccount';
import ManageCards from '../components/account-pages/ManageCards';
import TurnCardOnOff from '../components/account-pages/TurnCardOnOff';
import ReplaceCard from '../components/account-pages/ReplaceCard';
import ActivateCard from '../components/account-pages/ActivateCard';
import ChangePin from '../components/account-pages/ChangePin';
import DesignCard from '../components/account-pages/DesignCard';
import CardLimits from '../components/account-pages/CardLimits';
import DigitalWallets from '../components/account-pages/DigitalWallets';
import ForeignCurrency from '../components/account-pages/ForeignCurrency';
import BusinessAccountApplications from '../components/account-pages/BusinessAccountApplications';
import CreditAccountApplications from '../components/account-pages/CreditAccountApplications'; // Add this import
import LoanApplicationForm from '../components/account-pages/LoanApplicationForm';
import CheckDeposit from '../components/account-pages/CheckDeposit';

const AccountsPage = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('summary');
  const [showAccountOptions, setShowAccountOptions] = useState(false); // For account type selection

  // Contact Admin Page Component
  const ContactAdmin = () => (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header with Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
          <BuildingOfficeIcon className="h-10 w-10 text-amber-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Closure Request</h2>
        <p className="text-gray-600">
          For security reasons, account closures must be handled by our banking team
        </p>
      </div>

      {/* Information Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Why can't I close my account online?
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700 leading-relaxed">
            At SnopitechBank, we take account security seriously. Account closures require 
            additional verification to:
          </p>
          
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">Verify your identity and prevent unauthorized closures</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">Review and transfer any remaining funds securely</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">Cancel automatic payments and direct deposits</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">Provide you with final statements and tax documents</span>
            </li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-800 flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
              <span>
                <span className="font-semibold">Your security is our priority.</span> Our trained bankers 
                will guide you through the process and ensure all your funds are safely returned.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Contact Card */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            Contact Our Banking Team
          </h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Please reach out to our dedicated account services team. We're available to assist you 
            with account closures and any other banking needs.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Email Card */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group">
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
                Response within 24 hours on business days
              </p>
            </div>

            {/* Phone Card */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group">
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

          {/* Business Hours */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">📞 Live agent assistance available during business hours</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                Available Now
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-4">Prefer to speak with someone in person?</p>
        <button
          onClick={() => window.open('https://maps.google.com/?q=SnopitechBank', '_blank')}
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
        >
          <BuildingLibraryIcon className="h-4 w-4 mr-2" />
          Find a Branch Near You
        </button>
      </div>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setSelectedSection('summary')}
          className="inline-flex items-center text-gray-500 hover:text-amber-700 transition"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Return to Account Summary
        </button>
      </div>
    </div>
  );

  // Sidebar navigation structure
  const sidebarSections = [
    {
      title: 'Accounts',
      items: [
        { id: 'summary', label: 'Account Summary', icon: DocumentTextIcon },
        { id: 'alerts', label: 'Manage Alerts', icon: BellIcon }
      ]
    },
    {
      title: 'Brokerage',
      items: [
        { id: 'manage-accounts', label: 'Manage Accounts', icon: CogIcon },
        { id: 'overdraft', label: 'Add or Change Overdraft Services', icon: ShieldCheckIcon },
        { id: 'stop-future', label: 'Stop Future Payments', icon: ClockIcon },
        { id: 'stop-check', label: 'Stop a Check', icon: StopCircleIcon },
        { id: 'direct-deposit', label: 'Set Up Direct Deposit', icon: CurrencyDollarIcon },
        { id: 'recurring', label: 'Recurring Payments', icon: ArrowPathIcon },
        { id: 'download-activity', label: 'Download Account Activity', icon: ArrowDownTrayIcon },
        { id: 'track-claims', label: 'Track Claims', icon: CheckCircleIcon },
        { id: 'close-account', label: 'Close an Account', icon: XCircleIcon }        
      ]
    },
    {
      title: 'Transfer & Pay',
      items: [
        { id: 'manage-cards', label: 'Manage Cards', icon: CreditCardIcon },
        { id: 'card-on-off', label: 'Turn Card On or Off', icon: ShieldCheckIcon },
        { id: 'replace-card', label: 'Replace My Card', icon: CreditCardIcon },
        { id: 'digital-wallets', label: 'Add Cards to Digital Wallets', icon: WalletIcon },
        { id: 'activate-card', label: 'Activate Debit Card', icon: CheckCircleIcon },
        { id: 'change-pin', label: 'Change Your PIN', icon: CogIcon },
        { id: 'design-card', label: 'Design Card', icon: CreditCardIcon },   
        { id: 'card-limits', label: 'Manage Debit Card Limits', icon: ShieldCheckIcon },
        { id: 'foreign-currency', label: 'Foreign Currency', icon: BanknotesIcon }
      ]
    },
    {
      title: 'Security & Support',
      items: [
        { id: 'statements', label: 'Statements & Documents', icon: DocumentTextIcon },
        { id: 'verification-deposit', label: 'Verification Of Deposit', icon: DocumentTextIcon },
        { id: 'my-inquiries', label: 'My Support History', icon: ChatBubbleLeftIcon },
        { id: 'delivery-preferences', label: 'Manage Delivery Preferences', icon: CogIcon },
        { id: 'military-docs', label: 'Upload Military Documents', icon: DocumentTextIcon }
      ]
    },
    {
      title: 'Checks & Currency',
      items: [
        { id: 'deposit-check', label: 'Deposit Check', icon: DocumentTextIcon }, 
        { id: 'order-checks', label: 'Order Checks', icon: DocumentTextIcon },
        { id: 'cashier-check', label: "Cashier's Check", icon: BanknotesIcon },
        { id: 'view-checks', label: 'View Check Copies', icon: DocumentTextIcon }
      ]
    },
    {
      title: 'New Account Services',
      items: [
        { id: 'open-account', label: 'Open an Account', icon: PlusCircleIcon },
        { id: 'applications', label: 'Access Applications in Progress', icon: ClockIcon },
        { id: 'fees', label: 'View Fees & Information', icon: DocumentTextIcon }
      ]
    }
  ];

  // Account type selection modal
  const AccountTypeSelector = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Account Type</h2>
        <p className="text-gray-600 mb-6">Choose the type of account you'd like to open</p>
        
        <div className="space-y-4">
          {/* Business Account Option */}
          <button
            onClick={() => {
              setSelectedSection('business-account');
              setShowAccountOptions(false);
            }}
            className="w-full p-4 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-left flex items-center"
          >
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Business Account</h3>
              <p className="text-sm text-gray-500">For your business needs</p>
            </div>
          </button>

          {/* Credit Card Option */}
          <button
            onClick={() => {
              setSelectedSection('credit-account');
              setShowAccountOptions(false);
            }}
            className="w-full p-4 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left flex items-center"
          >
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Credit Card</h3>
              <p className="text-sm text-gray-500">Build credit and earn rewards</p>
            </div>
          </button>
          {/* Loan Account Option */}
          <button
          onClick={() => {
          setSelectedSection('loan-account');
          setShowAccountOptions(false);
          }}
          className="w-full p-4 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition text-left flex items-center"
          >
          <div className="bg-green-100 p-3 rounded-full mr-4">
          <BanknotesIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
          <h3 className="font-semibold text-gray-800">Loan Account</h3>
          <p className="text-sm text-gray-500">Apply for a personal loan</p>
          </div>
          </button>

        </div>
        <button
          onClick={() => setShowAccountOptions(false)}
          className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
    );

     // Render the selected content component
    const renderContent = () => {
    switch(selectedSection) {
      case 'summary':
        return <AccountSummary />;
      case 'alerts':
        return <ManageAlerts />;
      case 'statements':
        return <Statements />;
      case 'download-activity':
        return <DownloadActivity />;
      case 'my-inquiries':
        return <MyInquiries />;
      case 'verification-deposit':
        return <VerificationOfDeposit />;
      case 'manage-accounts':
        return <ManageAccounts onNavigate={(section) => setSelectedSection(section)} />;
      case 'overdraft':
        return <OverdraftServices />;
      case 'stop-check':
        return <StopCheck />;
      case 'stop-future':
        return <StopFuturePayments />;
      case 'direct-deposit':
        return <DirectDeposit />;
      case 'recurring':
        return <RecurringPayments />;
      case 'track-claims':
        return <TrackClaims />;
      case 'close-account':
        return <ContactAdmin />;
      case 'manage-cards':
        return <ManageCards />;
      case 'card-on-off':
        return <TurnCardOnOff />;
      case 'replace-card':
        return <ReplaceCard />;
      case 'activate-card':
        return <ActivateCard />;
      case 'change-pin':
        return <ChangePin />;
      case 'design-card':
        return <DesignCard />;
      case 'card-limits':
        return <CardLimits />;
      case 'digital-wallets':
        return <DigitalWallets />;
      case 'foreign-currency':
        return <ForeignCurrency />;
      case 'business-account':
        return <BusinessAccountApplications />;
      case 'credit-account':
        return <CreditAccountApplications />;
      case 'loan-account':
        return <LoanApplicationForm />;
      case 'deposit-check':
        return <CheckDeposit />;
      default:
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {sidebarSections.flatMap(s => s.items).find(i => i.id === selectedSection)?.label || 'Account Services'}
            </h2>
            <p className="text-gray-600">This feature is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Back to Dashboard Button - Fixed at top */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-red-700 transition-colors group"
          >
            <div className="bg-gray-100 p-2 rounded-full group-hover:bg-red-50 mr-3">
              <ArrowLeftIcon className="h-5 w-5 text-gray-600 group-hover:text-red-700" />
            </div>
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-xl font-bold text-red-700">Account Management</h1>
        </div>
      </div>

      {/* Main Content - Takes remaining height with scrolling */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 h-full">
            {/* LEFT SIDEBAR - Fixed width, scrollable if needed */}
            <div className="w-80 flex-shrink-0 h-full overflow-y-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {sidebarSections.map((section, idx) => (
                  <div key={idx} className="border-b border-gray-200 last:border-b-0">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    </div>
                    <div className="py-1">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.id === 'open-account') {
                              setShowAccountOptions(true);
                            } else {
                              setSelectedSection(item.id);
                            }
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center hover:bg-red-50 transition-colors ${
                            selectedSection === item.id 
                              ? 'bg-red-50 text-red-700 border-l-4 border-red-700' 
                              : 'text-gray-700 border-l-4 border-transparent hover:border-l-4 hover:border-red-300'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 mr-3 ${
                            selectedSection === item.id ? 'text-red-700' : 'text-gray-500'
                          }`} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT CONTENT AREA - Takes remaining width, scrollable */}
            <div className="flex-1 h-full overflow-y-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-full">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Type Selector Modal */}
      {showAccountOptions && <AccountTypeSelector />}

      {/* Consistent Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div className="mb-2 md:mb-0">
              © {new Date().getFullYear()} SnopitechBank. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-red-700 transition">Privacy</a>
              <a href="#" className="hover:text-red-700 transition">Terms</a>
              <a href="#" className="hover:text-red-700 transition">Security</a>
              <a href="#" className="hover:text-red-700 transition">Help</a>
            </div>
          </div>
        </div>
      </footer> 
    </div>
  );
};

export default AccountsPage;