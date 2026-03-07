import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user);
      else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (user) => {
    try {
      const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();
      const loginType = localStorage.getItem('loginType') || 'student';

      if (user.email === 'rnxkhan@gmail.com') {
        // Admin user directly gets super admin portal
        setRole('super_admin');
      } else if (data && data.role) {
        setRole(data.role);
      } else {
        // Fallback for unconfigured accounts
        setRole(loginType === 'faculty' ? 'teacher' : 'student');
      }
    } catch (e) {
      console.error(e);
      const loginType = localStorage.getItem('loginType') || 'student';
      setRole(user.email === 'rnxkhan@gmail.com' ? 'super_admin' : 'student');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Router>
      <div className="app-layout">
        {role === 'super_admin' ? (
          <SuperAdminSidebar user={session.user} handleLogout={handleLogout} />
        ) : role === 'teacher' ? (
          <AdminSidebar user={session.user} handleLogout={handleLogout} />
        ) : (
          <Sidebar user={session.user} handleLogout={handleLogout} />
        )}

        <Routes>
          {role === 'super_admin' ? (
            <>
              <Route path="/superadmin/dashboard" element={<div className="main-content"><div className="page-header"><h1 className="page-title">System Overview</h1><p className="page-description">Welcome to the core system controls.</p></div></div>} />
              <Route path="/superadmin/users" element={<ManageUsers />} />
              <Route path="/superadmin/timetable" element={<Timetable />} />
              <Route path="/superadmin/courses" element={<Courses role="teacher" />} />
              <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
            </>
          ) : role === 'teacher' ? (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/monitor" element={<CameraMonitor />} />
              <Route path="/admin/courses" element={<Courses role="teacher" />} />
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
