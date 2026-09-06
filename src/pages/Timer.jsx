import { useState, useEffect, useRef } from 'react';
import { FiPlay, FiSquare } from 'react-icons/fi';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const formatTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export default function Timer() {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [projetId, setProjetId] = useState('');
  const [tacheId, setTacheId] = useState('');
  const [projets, setProjets] = useState([]);
  const [taches, setTaches] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
const { user } = useAuth();
  useEffect(() => {
    api.get('/projets').then(res => setProjets(res.data));
    api.get('/dashboard').then(res => {
      if (res.data.activeTimer) {
        setActiveEntry(res.data.activeTimer);
        const start = new Date(res.data.activeTimer.startTime);
        const diff = Math.floor((new Date() - start) / 1000);
        setElapsed(diff);
      }
    });
  }, []);

  // Charger tâches quand projet change
useEffect(() => {
  if (projetId) {
    api.get(`/taches/${projetId}`).then(res => {
      const filtered = res.data.filter(t => 
        !t.assignedTo || t.assignedTo.id === user?.id
      );
      setTaches(filtered);
    });
  } else {
    setTaches([]);
    setTacheId('');
  }
}, [projetId]);

  useEffect(() => {
    if (activeEntry) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [activeEntry]);

  const startTimer = async () => {
    if (!description) return;
    const res = await api.post('/time-entries/start', {
      description,
      projetId: projetId || null,
      tacheId: tacheId || null
    });
    setActiveEntry(res.data);
    toast.success('Timer démarré !', '▶️ C\'est parti');
  };

  const stopTimer = async () => {
    if (elapsed < 10) {
      await api.delete(`/time-entries/${activeEntry.id}`);
      setActiveEntry(null);
      setDescription('');
      setProjetId('');
      setTacheId('');
      toast.warning('Timer trop court !', 'Minimum 10 secondes requis');
      return;
    }

    await api.put(`/time-entries/stop/${activeEntry.id}`);

    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;

    toast.success(`Durée : ${h}h ${m}m ${s}s`, '✅ Timer enregistré !');

    setActiveEntry(null);
    setDescription('');
    setProjetId('');
    setTacheId('');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-2xl font-bold text-white mb-8">⏱ Timer</h1>

        <div className="bg-gray-900 rounded-2xl p-8 mb-8">
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What are you working on?"
            disabled={!!activeEntry}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />

          <select
            value={projetId}
            onChange={e => setProjetId(e.target.value)}
            disabled={!!activeEntry}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-3 focus:outline-none disabled:opacity-50"
          >
            <option value="">Sans projet</option>
            {projets.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Select tâches — apparaît seulement si projet sélectionné */}
          {taches.length > 0 && (
            <select
              value={tacheId}
              onChange={e => setTacheId(e.target.value)}
              disabled={!!activeEntry}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-3 focus:outline-none disabled:opacity-50"
            >
              <option value="">Sans tâche</option>
              {taches.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          <div className="flex items-center justify-between mt-4">
            <span className="text-5xl font-mono font-bold text-white">
              {formatTime(elapsed)}
            </span>

            {!activeEntry ? (
              <button
                onClick={startTimer}
                disabled={!description}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-4 rounded-xl flex items-center gap-2 text-lg font-semibold transition"
              >
                <FiPlay /> Start
              </button>
            ) : (
              <button
                onClick={stopTimer}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl flex items-center gap-2 text-lg font-semibold transition"
              >
                <FiSquare /> Stop
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}