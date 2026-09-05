
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiActivity, FiPlay } from 'react-icons/fi';
import api from '../services/api';
import Navbar from '../components/Navbar';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        <h1 className="text-2xl font-bold text-white mb-8">
    Bonjour, {user?.name || user?.email}
    </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiClock className="text-indigo-400 text-xl" />
              <span className="text-gray-400">Aujourd'hui</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {data ? formatDuration(data.todayDuration) : '0h 0m 0s'}
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiActivity className="text-green-400 text-xl" />
              <span className="text-gray-400">Cette semaine</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {data ? formatDuration(data.weekDuration) : '0h 0m 0s'}
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiPlay className="text-yellow-400 text-xl" />
              <span className="text-gray-400">Timer actif</span>
            </div>
            <p className="text-xl font-bold text-white">
              {data?.activeTimer ? data.activeTimer.description || 'En cours...' : 'Aucun'}
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-4">Activité récente</h2>
          {data?.recentEntries?.length === 0 && (
            <p className="text-gray-400">Aucune entrée récente</p>
          )}
          <div className="space-y-3">
            {data?.recentEntries?.map(entry => (
              <div key={entry.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <div>
                  <p className="text-white">{entry.description || 'Sans description'}</p>
                  <p className="text-gray-400 text-sm">{entry.projet?.name || 'Sans projet'}</p>
                </div>
                <span className="text-indigo-400 font-mono">
                  {formatDuration(entry.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}