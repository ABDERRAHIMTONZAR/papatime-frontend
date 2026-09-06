import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiGrid, FiList, FiFolderPlus, FiLogOut, FiMenu, FiX, FiSettings, FiGlobe } from 'react-icons/fi';
import { FiFileText } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItem = (path, icon, label) => {
    const isActive = location.pathname === path;
    return (
      <button
        onClick={() => { navigate(path); setMenuOpen(false); }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium
          ${isActive 
            ? 'bg-indigo-600 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
      >
        {icon} {label}
      </button>
    );
  };

  const isAdmin = user?.role === 'ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <FiClock className="text-indigo-400 text-2xl" />
          <span className="text-white font-bold text-xl">PapaTime</span>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-2">
          {isSuperAdmin ? (
            navItem('/super-admin', <FiGlobe />, 'Super Admin')
          ) : isAdmin ? (
            <>
              {navItem('/admin', <FiSettings />, 'Admin')}
              {navItem('/timer', <FiClock />, 'Timer')}
              {navItem('/entries', <FiList />, 'Entrées')}
              {navItem('/projects', <FiFolderPlus />, 'Projets')}
              {navItem('/rapport', <FiFileText />, 'Rapport IA')}
            </>
          ) : (
            <>
              {navItem('/', <FiGrid />, 'Dashboard')}
              {navItem('/timer', <FiClock />, 'Timer')}
              {navItem('/entries', <FiList />, 'Entrées')}
              {navItem('/projects', <FiFolderPlus />, 'Projets')}
            </>
          )}
        </div>

        {/* Desktop user */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.name || user?.email}</span>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-1 transition">
            <FiLogOut /> Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-400 hover:text-white text-2xl"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-2">
          {isSuperAdmin ? (
            navItem('/super-admin', <FiGlobe />, 'Super Admin')
          ) : isAdmin ? (
            <>
              {navItem('/admin', <FiSettings />, 'Admin')}
              {navItem('/timer', <FiClock />, 'Timer')}
              {navItem('/entries', <FiList />, 'Entrées')}
              {navItem('/projects', <FiFolderPlus />, 'Projets')}
              {navItem('/rapport', <FiFileText />, 'Rapport IA')}
            </>
          ) : (
            <>
              {navItem('/', <FiGrid />, 'Dashboard')}
              {navItem('/timer', <FiClock />, 'Timer')}
              {navItem('/entries', <FiList />, 'Entrées')}
              {navItem('/projects', <FiFolderPlus />, 'Projets')}
            </>
          )}
          <div className="border-t border-gray-800 pt-3 mt-2">
            <span className="text-gray-400 text-sm block mb-2">{user?.name || user?.email}</span>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-1">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      )}

    </nav>
  );
}