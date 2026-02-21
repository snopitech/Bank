import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HRLogin from './HRLogin';
import HRLayout from './HRLayout';
import HRDashboard from './HRDashboard';
import HREmployees from './HREmployees';
import HREmployeeDetail from './HREmployeeDetail';
import HRCreateEmployee from './HRCreateEmployee';
import HRUsers from './HRUsers';
import HRDangerZone from './HRDangerZone';
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
        // Double-check HR permission
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
        
        {/* Protected Routes - wrapped in HRLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <HRLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HRDashboard />} />
          <Route path="employees" element={<HREmployees />} />
          <Route path="employees/create" element={<HRCreateEmployee />} />
          <Route path="employees/:id" element={<HREmployeeDetail />} />
          
          {/* Placeholder routes for future pages */}
          <Route path="reports" element={
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Reports page coming soon...
            </div>
          } />
          <Route path="settings" element={
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Settings page coming soon...
            </div>
          } />
          <Route path="profile" element={
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Profile page coming soon...
            </div>
          } />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/users" element={<HRUsers />} />
        <Route path="/danger-zone" element={<HRDangerZone />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;