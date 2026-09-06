import { useState, useEffect } from 'react';
import { FiUsers, FiFolder, FiClock, FiPlus, FiTrash2, FiGlobe } from 'react-icons/fi';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', equipeName: ''
  });
const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, equipesRes] = await Promise.all([
        api.get('/super-admin/stats'),
        api.get('/super-admin/equipes')
      ]);
      setStats(statsRes.data);
      setEquipes(equipesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    if (!form.name || !form.email || !form.password || !form.equipeName) {
      toast.warning('Tous les champs sont obligatoires !', '⚠️');
      return;
    }
    try {
      await api.post('/super-admin/admins', form);
      setForm({ name: '', email: '', password: '', equipeName: '' });
      setShowForm(false);
      fetchData();
      toast.success(`Admin ${form.name} créé !`, '✅');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur création', '❌');
    }
  };

 const deleteEquipe = async (id, name) => {
  if (confirmDelete === id) {
    try {
      await api.delete(`/super-admin/equipes/${id}`);
      setEquipes(prev => prev.filter(e => e.id !== id));
      setConfirmDelete(null);
      toast.success('Équipe supprimée !', '🗑️');
    } catch (error) {
      toast.error('Erreur suppression');
    }
  } else {
    setConfirmDelete(id);
    setTimeout(() => setConfirmDelete(null), 3000);
  }
};

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Chargement...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">

        <h1 className="text-2xl font-bold text-white mb-8">
          Super Administration — Vue globale
        </h1>

        {/* Stats globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiGlobe className="text-indigo-400" />
              <span className="text-gray-400 text-sm">Équipes</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalEquipes}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiUsers className="text-green-400" />
              <span className="text-gray-400 text-sm">Utilisateurs</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalUsers}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiFolder className="text-yellow-400" />
              <span className="text-gray-400 text-sm">Projets</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalProjets}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiClock className="text-pink-400" />
              <span className="text-gray-400 text-sm">Temps total</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatDuration(stats?.totalDuration || 0)}</p>
          </div>
        </div>

        {/* Créer Admin */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Créer un compte Admin</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <FiPlus /> Nouveau Admin
            </button>
          </div>

          {showForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nom complet *"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                placeholder="Mot de passe *"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Nom de l'équipe *"
                value={form.equipeName}
                onChange={e => setForm({...form, equipeName: e.target.value})}
                className="bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="md:col-span-2">
                <button
                  onClick={createAdmin}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition font-semibold"
                >
                  Créer Admin + Équipe
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste équipes */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-4">Toutes les équipes</h2>
          <div className="space-y-4">
            {equipes.map(equipe => (
              <div key={equipe.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">{equipe.name}</p>
                    <p className="text-gray-400 text-sm">
                      {equipe._count.members} membres · {equipe._count.projets} projets
                    </p>
                  </div>
                 <button
                    onClick={() => deleteEquipe(equipe.id, equipe.name)}
                    className={`transition flex items-center gap-1 text-sm px-3 py-1 rounded-lg
                        ${confirmDelete === equipe.id 
                        ? 'bg-red-600 text-white' 
                        : 'text-red-400 hover:text-red-300'
                        }`}
                    >
                    <FiTrash2 size={14} />
                    {confirmDelete === equipe.id ? 'Confirmer ?' : ''}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {equipe.members.map(m => (
                    <span key={m.id} className={`text-xs px-3 py-1 rounded-full ${
                      m.role === 'ADMIN' 
                        ? 'bg-indigo-500/20 text-indigo-400' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {m.name || m.email} — {m.role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}