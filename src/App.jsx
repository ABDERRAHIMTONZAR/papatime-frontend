import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Timer from './pages/Timer';
import TimeEntries from './pages/TimeEntries';
import Projects from './pages/Projects';
import AdminDashboard from './pages/AdminDashboard';
import Rapport from './pages/Rapport';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Chargement...</p></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'SUPER_ADMIN') return <Navigate to="/" />;
  return children;
};
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Chargement...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Chargement...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'ADMIN') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/timer" element={<PrivateRoute><Timer /></PrivateRoute>} />
            <Route path="/entries" element={<PrivateRoute><TimeEntries /></PrivateRoute>} />
            <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
           <Route path="/admin" element={
  <AdminRoute><AdminDashboard /></AdminRoute>
} />
<Route path="/super-admin" element={
  <SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>
} />
<Route path="/rapport" element={
  <AdminRoute><Rapport /></AdminRoute>
} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;