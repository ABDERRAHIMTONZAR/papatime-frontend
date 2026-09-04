import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timer from './pages/Timer';
import TimeEntries from './pages/TimeEntries';
import Projects from './pages/Projects';
import { ToastProvider } from './context/ToastContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Chargement...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
            <ToastProvider>

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

<Route path="/timer" element={
  <PrivateRoute><Timer /></PrivateRoute>
} />
<Route path="/entries" element={
  <PrivateRoute><TimeEntries /></PrivateRoute>
} />
<Route path="/projects" element={
  <PrivateRoute><Projects /></PrivateRoute>
} />
        </Routes>
        
      </BrowserRouter>
            </ToastProvider>

    </AuthProvider>
  );
}

export default App;