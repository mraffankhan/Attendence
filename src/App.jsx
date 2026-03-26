import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './lib/api';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CameraMonitor from './pages/CameraMonitor';

// Super Admin Pages
import ManageUsers from './pages/superadmin/ManageUsers';
import Timetable from './pages/superadmin/Timetable';

// Components
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import SuperAdminSidebar from './components/SuperAdminSidebar';

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setSession({ user: data.user });
      setRole(data.user.role);
    } catch (err) {
      console.error('Session expired or invalid:', err);
      localStorage.removeItem('token');
      setSession(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginType');
    setSession(null);
    setRole(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Passing setSession down so Login can update Auth State immediately
  if (!session) {
    return <Login onLoginSuccess={checkSession} />;
  }

  return (
    <Router>
      <div className="app-layout">
        {(role === 'super_admin' || role === 'admin') ? (
          <SuperAdminSidebar user={session.user} handleLogout={handleLogout} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        ) : role === 'teacher' ? (
          <AdminSidebar user={session.user} handleLogout={handleLogout} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        ) : (
          <Sidebar user={session.user} handleLogout={handleLogout} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        )}

        <Routes>
          {(role === 'super_admin' || role === 'admin') ? (
            <>
              <Route path="/superadmin/dashboard" element={<div className="main-content"><div className="page-header"><h1 className="page-title">System Overview</h1><p className="page-description">Welcome to the core system controls.</p></div></div>} />
              <Route path="/superadmin/users" element={<ManageUsers />} />
              <Route path="/superadmin/timetable" element={<Timetable />} />
              <Route path="/superadmin/courses" element={<Courses role="super_admin" />} />
              <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
            </>
          ) : role === 'teacher' ? (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/monitor" element={<CameraMonitor />} />
              <Route path="/admin/courses" element={<Courses role="teacher" /> } />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses role="student" />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
