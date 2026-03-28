// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { ContactModalProvider } from "./ContactModalContext";
import ContactModal from "./ContactModal";
import Homepage from "./Homepage";
import Register from "./Register";
import AccountCreated from "./AccountCreated";
import Dashboard from "./Dashboard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import ProfilePage from "./pages/ProfilePage";
import VerifyEmailChange from "./pages/VerifyEmailChange";
import SettingsPage from "./pages/SettingsPage";
import AlertsPage from "./pages/AlertsPage";
import AccountsPage from './pages/AccountsPage';
import LoanDetailsPage from './components/account-pages/LoanDetailsPage';
import ZellePage from './pages/ZellePage';
function App() {
  return (
    <ContactModalProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account-created" element={<AccountCreated />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/verify-email-change" element={<VerifyEmailChange />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/loan-details/:id" element={<LoanDetailsPage />} />
        <Route path="/zelle" element={<ZellePage />} />        
        <Route path="*" element={
          <div style={{padding: '20px', textAlign: 'center'}}>
            <h2>404 - Page Not Found</h2>
            <p>Current path: <strong>{window.location.pathname}</strong></p>
            <p>Full URL: {window.location.href}</p>
          </div>
        } />
      </Routes>
      <ContactModal />
    </ContactModalProvider>
  );
}

export default App;