import { useState, useEffect } from 'react';
import { FiUsers, FiFolder, FiClock, FiPlus, FiCopy, FiCheck, FiEdit2, FiTrash2  } from 'react-icons/fi';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [equipe, setEquipe] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [membresStats, setMembresStats] = useState([]);
  const [copied, setCopied] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [equipeRes, invitationsRes, statsRes] = await Promise.all([
        api.get('/equipes'),
        api.get('/equipes/invitations'),
        api.get('/equipes/membres/stats')
      ]);
      setEquipe(equipeRes.data);
      setInvitations(invitationsRes.data);
      setMembresStats(statsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
const deleteInvitation = async (id) => {
  try {
    await api.delete(`/equipes/invitations/${id}`);
    setInvitations(prev => prev.filter(i => i.id !== id));
    toast.success('Invitation supprimée !', '🗑️');
  } catch (error) {
    toast.error('Erreur suppression');
  }
};
  const updateEquipeName = async () => {
    if (!newName.trim()) return;
    try {
      await api.put('/equipes', { name: newName });
      setEquipe(prev => ({ ...prev, name: newName }));
      setEditingName(false);
      toast.success('Nom mis à jour !', '✅');
    } catch (error) {
      toast.error('Erreur mise à jour');
    }
  };

  const createInvitation = async () => {
    try {
      const res = await api.post('/equipes/invitations', { role: 'EMPLOYEE' });
      setInvitations(prev => [res.data, ...prev]);
      toast.success('Invitation créée !', '🔗');
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    toast.success('Lien copié !', '📋');
    setTimeout(() => setCopied(null), 2000);
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

        {/* Titre avec renommer */}
        <div className="flex items-center gap-3 mb-8">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none text-xl font-bold"
                autoFocus
              />
              <button onClick={updateEquipeName} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition">
                Sauvegarder
              </button>
              <button onClick={() => setEditingName(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition">
                Annuler
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                Administration — {equipe?.name}
              </h1>
              <button
                onClick={() => { setNewName(equipe?.name); setEditingName(true); }}
                className="text-gray-400 hover:text-white transition"
              >
                <FiEdit2 />
              </button>
            </div>
          )}
        </div>

        {/* Stats équipe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiUsers className="text-indigo-400 text-xl" />
              <span className="text-gray-400">Membres</span>
            </div>
            <p className="text-3xl font-bold text-white">{equipe?.members?.length || 0}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiFolder className="text-green-400 text-xl" />
              <span className="text-gray-400">Projets</span>
            </div>
            <p className="text-3xl font-bold text-white">{equipe?.projets?.length || 0}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiClock className="text-yellow-400 text-xl" />
              <span className="text-gray-400">Invitations actives</span>
            </div>
            <p className="text-3xl font-bold text-white">{invitations.filter(i => !i.usedAt).length}</p>
          </div>
        </div>

        {/* Stats membres */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-4">Temps par membre</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-800">
                  <th className="text-left pb-3">Membre</th>
                  <th className="text-left pb-3">Rôle</th>
                  <th className="text-right pb-3">Aujourd'hui</th>
                  <th className="text-right pb-3">Cette semaine</th>
                  <th className="text-right pb-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {membresStats.map(membre => (
                  <tr key={membre.id} className="border-b border-gray-800">
                    <td className="py-3">
                      <p className="text-white">{membre.name || membre.email}</p>
                      <p className="text-gray-400 text-xs">{membre.email}</p>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${membre.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-700 text-gray-300'}`}>
                        {membre.role}
                      </span>
                    </td>
                    <td className="py-3 text-right text-indigo-400 font-mono">{formatDuration(membre.todayDuration)}</td>
                    <td className="py-3 text-right text-green-400 font-mono">{formatDuration(membre.weekDuration)}</td>
                    <td className="py-3 text-right text-white font-mono">{formatDuration(membre.totalDuration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Membres */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-4">Membres de l'équipe</h2>
          <div className="space-y-3">
            {equipe?.members?.map(member => (
              <div key={member.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <div>
                  <p className="text-white font-medium">{member.name || member.email}</p>
                  <p className="text-gray-400 text-sm">{member.email}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${member.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-700 text-gray-300'}`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Invitations */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Invitations</h2>
            <button
              onClick={createInvitation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <FiPlus /> Nouvelle invitation
            </button>
          </div>
          <div className="space-y-3">
            {invitations.map(inv => (
              <div key={inv.id} className="bg-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-mono text-sm">{inv.code}</p>
                    <p className="text-gray-400 text-xs mt-1">Expire : {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {inv.usedAt ? (
                      <span className="text-green-400 text-xs">Utilisé par {inv.usedBy?.name || inv.usedBy?.email}</span>
                    ) : (
                      <button
                        onClick={() => copyLink(inv.link, inv.id)}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm transition"
                      >
                        {copied === inv.id ? <FiCheck /> : <FiCopy />}
                        {copied === inv.id ? 'Copié !' : 'Copier lien'}
                      </button>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${inv.usedAt ? 'bg-green-500/20 text-green-400' : new Date() > new Date(inv.expiresAt) ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {inv.usedAt ? 'Utilisé' : new Date() > new Date(inv.expiresAt) ? 'Expiré' : 'En attente'}
                    </span>
                    {!inv.usedAt && (
                    <button
                      onClick={() => deleteInvitation(inv.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                  </div>
                </div>
              </div>
            ))}
            {invitations.length === 0 && (
              <p className="text-gray-400 text-center py-4">Aucune invitation</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}