import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../services/api';
import Navbar from '../components/Navbar';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

export default function TimeEntries() {
  const [entries, setEntries] = useState([]);
  const [projets, setProjets] = useState([]);
  const [showManual, setShowManual] = useState(false);
  const [form, setForm] = useState({
    description: '', projetId: '',
    startTime: '', endTime: ''
  });

  useEffect(() => {
    fetchEntries();
    api.get('/projets').then(res => setProjets(res.data));
  }, []);

  const fetchEntries = () => {
    api.get('/time-entries').then(res => setEntries(res.data));
  };

  const deleteEntry = async (id) => {
    await api.delete(`/time-entries/${id}`);
    fetchEntries();
  };

  const submitManual = async () => {
    await api.post('/time-entries/manual', {
      ...form,
      projetId: form.projetId || null
    });
    setShowManual(false);
    setForm({ description: '', projetId: '', startTime: '', endTime: '' });
    fetchEntries();
  };

  // Grouper par date
  const grouped = entries.reduce((acc, entry) => {
    const date = new Date(entry.startTime).toLocaleDateString('fr-FR');
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">📋 Time Entries</h1>
          <button
            onClick={() => setShowManual(!showManual)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiPlus /> Ajouter manuellement
          </button>
        </div>

        {/* Formulaire manuel */}
        {showManual && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-4">Entrée manuelle</h2>
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-3 focus:outline-none"
            />
            <select
              value={form.projetId}
              onChange={e => setForm({...form, projetId: e.target.value})}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-3 focus:outline-none"
            >
              <option value="">Sans projet</option>
              {projets.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Début</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={e => setForm({...form, startTime: e.target.value})}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Fin</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={e => setForm({...form, endTime: e.target.value})}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={submitManual}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
            >
              Ajouter
            </button>
          </div>
        )}

        {/* Liste groupée par date */}
        {Object.entries(grouped).map(([date, dayEntries]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-400 font-semibold">{date}</h2>
              <span className="text-gray-400 text-sm">
                Total: {formatDuration(dayEntries.reduce((sum, e) => sum + e.duration, 0))}
              </span>
            </div>
            <div className="space-y-2">
              {dayEntries.map(entry => (
                <div key={entry.id} className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white">{entry.description || 'Sans description'}</p>
                        <p className="text-gray-400 text-sm">
                        {entry.projet?.name || 'Sans projet'}
                        {entry.tache && (
                            <span className="text-indigo-400 ml-2">→ Tache: {entry.tache.name}</span>
                        )}
                        </p>                  
                        </div>
                  <div className="flex items-center gap-4">
                    <span className="text-indigo-400 font-mono">
                      {formatDuration(entry.duration)}
                    </span>
                    <button onClick={() => deleteEntry(entry.id)} className="text-red-400 hover:text-red-300">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-gray-400 text-center mt-12">Aucune entrée — démarrez un timer !</p>
        )}

      </div>
    </div>
  );
}