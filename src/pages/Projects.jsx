import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899',
  '#f59e0b', '#10b981', '#3b82f6',
  '#ef4444', '#14b8a6'
];

export default function Projects() {
  const { toast } = useToast();
  const [projets, setProjets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedProjet, setExpandedProjet] = useState(null);
  const [taches, setTaches] = useState({});
  const [showTacheForm, setShowTacheForm] = useState(null);
  const [tacheForm, setTacheForm] = useState({ name: '', description: '' });
  const [form, setForm] = useState({
    name: '', description: '', color: '#6366f1'
  });

  useEffect(() => { fetchProjets(); }, []);

  const fetchProjets = () => {
    api.get('/projets').then(res => setProjets(res.data));
  };

  const fetchTaches = async (projetId) => {
    const res = await api.get(`/taches/${projetId}`);
    setTaches(prev => ({ ...prev, [projetId]: res.data }));
  };

  const toggleProjet = (projetId) => {
    if (expandedProjet === projetId) {
      setExpandedProjet(null);
    } else {
      setExpandedProjet(projetId);
      fetchTaches(projetId);
    }
  };

  const createProjet = async () => {
    if (!form.name) return;
    await api.post('/projets', form);
    setShowForm(false);
    setForm({ name: '', description: '', color: '#6366f1' });
    fetchProjets();
    toast.success('Projet créé avec succès !', '📁 Nouveau projet');
  };

  const deleteProjet = async (id) => {
    await api.delete(`/projets/${id}`);
    fetchProjets();
    toast.error('Projet supprimé', '🗑️ Suppression');
  };

  const createTache = async (projetId) => {
    if (!tacheForm.name) return;
    await api.post(`/taches/${projetId}`, tacheForm);
    setTacheForm({ name: '', description: '' });
    setShowTacheForm(null);
    fetchTaches(projetId);
    toast.success('Tâche créée !', '✅ Nouvelle tâche');
  };

  const deleteTache = async (id, projetId) => {
    await api.delete(`/taches/${id}`);
    fetchTaches(projetId);
    toast.error('Tâche supprimée', '🗑️ Suppression');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
<div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">📁 Projets</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiPlus /> Nouveau projet
          </button>
        </div>

        {/* Formulaire projet */}
        {showForm && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-4">Nouveau projet</h2>
            <input
              type="text"
              placeholder="Nom du projet"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-3 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none"
            />
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Couleur</label>
              <div className="flex gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm({...form, color})}
                    className={`w-8 h-8 rounded-full transition ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={createProjet}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
            >
              Créer
            </button>
          </div>
        )}

        {/* Liste projets */}
        <div className="space-y-3">
          {projets.map(projet => (
            <div key={projet.id} className="bg-gray-900 rounded-xl overflow-hidden">
              
              {/* Header projet */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: projet.color }} />
                  <div>
                    <p className="text-white font-semibold">{projet.name}</p>
                    {projet.description && (
                      <p className="text-gray-400 text-sm">{projet.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiClock />
                    <span>{formatDuration(projet.totalDuration || 0)}</span>
                  </div>
                  <button
                    onClick={() => toggleProjet(projet.id)}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {expandedProjet === projet.id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  <button
                    onClick={() => deleteProjet(projet.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* Tâches */}
              {expandedProjet === projet.id && (
                <div className="border-t border-gray-800 px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-400 text-sm font-semibold">TÂCHES</p>
                    <button
                      onClick={() => setShowTacheForm(showTacheForm === projet.id ? null : projet.id)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm transition"
                    >
                      <FiPlus /> Ajouter
                    </button>
                  </div>

                  {/* Formulaire tâche */}
                  {showTacheForm === projet.id && (
                    <div className="bg-gray-800 rounded-lg p-4 mb-3">
                      <input
                        type="text"
                        placeholder="Nom de la tâche"
                        value={tacheForm.name}
                        onChange={e => setTacheForm({...tacheForm, name: e.target.value})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-2 focus:outline-none text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Description (optionnel)"
                        value={tacheForm.description}
                        onChange={e => setTacheForm({...tacheForm, description: e.target.value})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-3 focus:outline-none text-sm"
                      />
                      <button
                        onClick={() => createTache(projet.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
                      >
                        Créer la tâche
                      </button>
                    </div>
                  )}

                  {/* Liste tâches */}
                  <div className="space-y-2">
                    {taches[projet.id]?.map(tache => (
                      <div key={tache.id} className="bg-gray-800 rounded-lg px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">{tache.name}</p>
                          {tache.description && (
                            <p className="text-gray-400 text-xs">{tache.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-indigo-400 text-sm font-mono">
                            {formatDuration(tache.totalDuration || 0)}
                          </span>
                          <button
                            onClick={() => deleteTache(tache.id, projet.id)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {taches[projet.id]?.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-2">Aucune tâche</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        {projets.length === 0 && (
          <p className="text-gray-400 text-center mt-12">Aucun projet — créez-en un !</p>
        )}

      </div>
    </div>
  );
}