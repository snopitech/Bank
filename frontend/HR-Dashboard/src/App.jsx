import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HRLogin from './HRLogin';
import HRLayout from './HRLayout';
import HRDashboard from './HRDashboard';
import HREmployees from './HREmployees';
import HREmployeeDetail from './HREmployeeDetail';
import HREmployeeApproval from './HREmployeeApproval';
import HRCreateEmployee from './HRCreateEmployee';
import HRUsers from './HRUsers';
import HRDangerZone from './HRDangerZone';
import HRProfile from './HRProfile';
import HRSettings from './HRSettings'; // 👈 KEEP THIS IMPORT
import TOTPReset from './TOTPReset';
import UnlockMFA from './UnlockMFA';
import HRCleanup from './HRCleanup';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const hrUser = localStorage.getItem('hrUser');
      if (!hrUser) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const user = JSON.parse(hrUser);
        if (user.permissions?.manageEmployees === true) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('hrUser');
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem('hrUser');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<HRLogin />} />
        
        {/* Public Approval Route */}
        <Route path="/employee-approval" element={<HREmployeeApproval />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <HRLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HRDashboard />} />
          <Route path="employees" element={<HREmployees />} />
          <Route path="employees/create" element={<HRCreateEmployee />} />
          <Route path="employees/:id" element={<HREmployeeDetail />} />
          <Route path="users" element={<HRUsers />} />
          <Route path="danger-zone" element={<HRDangerZone />} />
          <Route path="profile" element={<HRProfile />} />
          <Route path="settings" element={<HRSettings />} /> {/* 👈 MOVED INSIDE - REPLACES PLACEHOLDER */}
          <Route path="/totp-reset" element={<TOTPReset />} />
          <Route path="/unlock-mfa" element={<UnlockMFA />} />
          <Route path="/cleanup" element={<HRCleanup />} />
          {/* Placeholder routes */}
          <Route path="reports" element={
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Reports page coming soon...
            </div>
          } />
        </Route>

        {/* Catch all - REMOVED duplicate settings route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
