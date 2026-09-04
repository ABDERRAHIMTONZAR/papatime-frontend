import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiGrid, FiList, FiFolderPlus, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItem = (path, icon, label) => {
    const isActive = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
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

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FiClock className="text-indigo-400 text-2xl" />
        <span className="text-white font-bold text-xl">PapaTime</span>
      </div>

      <div className="flex items-center gap-2">
        {navItem('/', <FiGrid />, 'Dashboard')}
        {navItem('/timer', <FiClock />, 'Timer')}
        {navItem('/entries', <FiList />, 'Entrées')}
        {navItem('/projects', <FiFolderPlus />, 'Projets')}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">{user?.email}</span>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-1 transition">
          <FiLogOut /> Logout
        </button>
      </div>
    </nav>
  );
}