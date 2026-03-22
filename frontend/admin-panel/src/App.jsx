import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminHomepage from "./AdminHomepage";
import AdminDashboard from "./AdminDashboard";
import AdminApplications from "./AdminApplications";
import AdminOpenAccount from "./AdminOpenAccount";
import AdminTransactions from "./AdminTransactions";
import AdminSupport from "./AdminSupport";
import AdminClaims from "./AdminClaims";
import AdminCurrency from "./AdminCurrency";
import TellerOperationsPage from './TellerOperationsPage';
import AdminAudit from "./AdminAudit";
import AdminReports from "./AdminReports";
import AdminSettings from "./AdminSettings";
import AdminUpdateLimits from "./AdminUpdateLimits";
import AdminGenerateReport from "./AdminGenerateReport";
import AdminTotalAccounts from "./AdminTotalAccounts";
import AdminTotalBalance from "./AdminTotalBalance";
import AdminActiveCards from "./AdminActiveCards";
import AdminAlerts from "./AdminAlerts";
import AdminProfile from "./AdminProfile";
import AdminBusinessApplications from "./AdminBusinessApplications";
import AdminCreditApplications from "./AdminCreditApplications"; 
import AdminUsers from './AdminUsers';
import AdminTotalUsers from './AdminTotalUsers';
import AdminCreditRequests from "./AdminCreditRequests"; 
import EmployeeTOTPSetup from './EmployeeTOTPSetup';
import AdminUnlockUser from './AdminUnlockUser';
import AdminNonUSVerifications from "./AdminNonUSVerifications";
import VerificationDetails from "./VerificationDetails";
import AdminUSVerifications from "./AdminUSVerifications";
import AdminLoanApplications from "./AdminLoanApplications";
import VerifyChecks from './VerifyChecks';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage Routes */}
        <Route path="/" element={<AdminHomepage />} />
        <Route path="/admin" element={<AdminHomepage />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        
        {/* Applications */}
        <Route path="/applications" element={<AdminApplications />} />
        
        {/* Account Operations */}
        <Route path="/open-account" element={<AdminOpenAccount />} />
        {/* REMOVED: /freeze-account route */}
        <Route path="/update-limits" element={<AdminUpdateLimits />} />
        
        {/* Transactions */}
        <Route path="/transactions" element={<AdminTransactions />} />
        <Route path="/teller" element={<TellerOperationsPage />} />
        
        {/* Support & Claims */}
        <Route path="/support" element={<AdminSupport />} />
        <Route path="/claims" element={<AdminClaims />} />
        
        {/* Currency */}
        <Route path="/currency" element={<AdminCurrency />} />
        
        {/* Reports & Analytics */}
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/generate-report" element={<AdminGenerateReport />} />
        
        {/* Overview Pages */}
        <Route path="/total-accounts" element={<AdminTotalAccounts />} />
        <Route path="/total-balance" element={<AdminTotalBalance />} />
        <Route path="/active-cards" element={<AdminActiveCards />} />
        <Route path="/alerts" element={<AdminAlerts />} />
        <Route path="/users" element={<AdminTotalUsers />} />
        
        {/* System */}
        <Route path="/audit" element={<AdminAudit />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/profile" element={<AdminProfile />} />
        
        {/* Business Applications */}
        <Route path="/business-applications" element={<AdminBusinessApplications />} />
        
        {/* Credit Applications */}
        <Route path="/credit-applications" element={<AdminCreditApplications />} />
        
        {/* Credit Increase Requests - NEW */}
        <Route path="/credit-increase-requests" element={<AdminCreditRequests />} />
        
        {/* User Management */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/totp-setup" element={<EmployeeTOTPSetup />} />
        <Route path="/admin/unlock-user" element={<AdminUnlockUser />} />
        
        {/* ⭐ NON-US CITIZEN VERIFICATIONS - THIS IS THE ONE WE'RE TESTING */}
        <Route path="/admin/non-us-verifications" element={<AdminNonUSVerifications />} />
        
        {/* US CITIZEN VERIFICATIONS */}
        <Route path="/admin/us-verifications" element={<AdminUSVerifications />} />
        
        {/* Verification Details (keep if needed) */}
        <Route path="/admin/verifications/:id" element={<VerificationDetails />} />
        <Route path="/admin/loan-applications" element={<AdminLoanApplications />} />
        <Route path="/admin/verify-checks" element={<VerifyChecks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;