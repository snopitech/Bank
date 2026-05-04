import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VideoCall from './pages/VideoCall';
import TeamsPage from './pages/TeamsPage';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <AppRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

function AppRoutes({ user, setUser }) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard user={user} onLogout={() => setUser(null)} />} />
      <Route path="/video-call" element={<VideoCall onClose={() => navigate('/dashboard')} />} />
      <Route path="/teams" element={<TeamsPage user={user} />} />
    </Routes>
  );
}

export default App;