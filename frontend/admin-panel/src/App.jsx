import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminHomepage from "./AdminHomepage";
import AdminDashboard from "./AdminDashboard";
import AdminApplications from "./AdminApplications";
import AdminOpenAccount from "./AdminOpenAccount";
import AdminTransactions from "./AdminTransactions";
import AdminSupport from "./AdminSupport";
import AdminClaims from "./AdminClaims";
import AdminCurrency from "./AdminCurrency";
import AdminTeller from "./AdminTeller";
import AdminAudit from "./AdminAudit";
import AdminReports from "./AdminReports";
import AdminSettings from "./AdminSettings";
import AdminFreezeAccount from "./AdminFreezeAccount";
import AdminUpdateLimits from "./AdminUpdateLimits";
import AdminGenerateReport from "./AdminGenerateReport";
import AdminTotalAccounts from "./AdminTotalAccounts";
import AdminTotalBalance from "./AdminTotalBalance";
import AdminActiveCards from "./AdminActiveCards";
import AdminAlerts from "./AdminAlerts";
import CreateEmployee from "./CreateEmployee"; 
import EmployeeApproval from "./EmployeeApproval";
import EmployeeLogin from "./EmployeeLogin";
import EmployeeDashboard from "./EmployeeDashboard";
import AdminProfile from "./AdminProfile";
import AdminBusinessApplications from "./AdminBusinessApplications";
import AdminUsers from './AdminUsers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage Routes */}
        <Route path="/" element={<AdminHomepage />} />
        <Route path="/admin" element={<AdminHomepage />} />
        
        {/* Create Employee Profile */}
        <Route path="/create-employee" element={<CreateEmployee />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        
        {/* Applications */}
        <Route path="/applications" element={<AdminApplications />} />
        
        {/* Account Operations */}
        <Route path="/open-account" element={<AdminOpenAccount />} />
        <Route path="/freeze-account" element={<AdminFreezeAccount />} />
        <Route path="/update-limits" element={<AdminUpdateLimits />} />
        
        {/* Transactions */}
        <Route path="/transactions" element={<AdminTransactions />} />
        <Route path="/teller" element={<AdminTeller />} />
        
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
        
        {/* System */}
        <Route path="/audit" element={<AdminAudit />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/employee-approval" element={<EmployeeApproval />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/business-applications" element={<AdminBusinessApplications />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;