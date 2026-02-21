// src/App.jsx - UPDATED VERSION WITH CONTACT MODAL INTEGRATION
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ContactModalProvider } from "./ContactModalContext";
import ContactModal from "./ContactModal";

import Homepage from "./Homepage"; // Your renamed Login component
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
import HeaderTest from "./components/HeaderTest";

function App() {
  return (
    <ContactModalProvider>
      <Router>
        <Routes>
          {/* Homepage - Your main landing page */}
          <Route path="/" element={<Homepage />} />
          
          {/* Register page */}
          <Route path="/register" element={<Register />} />
          
          {/* Other routes */}
          <Route path="/account-created" element={<AccountCreated />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/verify-email-change" element={<VerifyEmailChange />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
        </Routes>
      </Router>
      {/* Global Contact Modal - accessible from any page */}
      <ContactModal />
    </ContactModalProvider>
  );
}

export default App;