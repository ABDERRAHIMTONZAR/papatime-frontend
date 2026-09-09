import { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
export default function Rapport() {
  const { toast } = useToast();
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/projets').then(res => setProjets(res.data));
  }, []);

  const generateRapport = async () => {
    if (!selectedProjet) {
      toast.warning('Sélectionnez un projet !', '⚠️');
      return;
    }
    setLoading(true);
    setRapport(null);
    try {
      const res = await api.get(`/rapports/${selectedProjet}`);
      setRapport(res.data);
      toast.success('Rapport généré !', '🤖');
    } catch (error) {
      toast.error('Erreur génération rapport', '❌');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">

        <h1 className="text-2xl font-bold text-white mb-8">
          Rapport IA
        </h1>

        {/* Sélection projet */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Sélectionnez un projet</h2>
          <div className="flex gap-4">
            <select
              value={selectedProjet}
              onChange={e => setSelectedProjet(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choisir un projet...</option>
              {projets.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={generateRapport}
              disabled={loading || !selectedProjet}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition font-semibold"
            >
              {loading ? (
                <><FiRefreshCw className="animate-spin" /> Génération...</>
              ) : (
                <><FiFileText /> Générer</>
              )}
            </button>
          </div>
        </div>

        {/* Stats rapides */}
        {rapport && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Temps total</p>
                <p className="text-white font-bold text-xl">
                  {formatDuration(rapport.stats.totalDuration)}
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Tâches</p>
                <p className="text-white font-bold text-xl">{rapport.stats.tachesCount}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Membres</p>
                <p className="text-white font-bold text-xl">{rapport.stats.membresCount}</p>
              </div>
            </div>

            {/* Rapport IA */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  🤖
                </div>
                <h2 className="text-white font-semibold text-lg">
                  Analyse IA — {rapport.projet}
                </h2>
              </div>
              <div className="text-gray-300 leading-relaxed prose prose-invert max-w-none">
<ReactMarkdown 
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeRaw]}
  components={{
    table: ({node, ...props}) => (
      <table className="w-full border-collapse mb-4" {...props} />
    ),
    th: ({node, ...props}) => (
      <th className="border border-gray-600 px-3 py-2 text-left text-gray-300 bg-gray-800" {...props} />
    ),
    td: ({node, ...props}) => (
      <td className="border border-gray-600 px-3 py-2 text-gray-300" {...props} />
    ),
    h2: ({node, ...props}) => (
      <h2 className="text-white font-bold text-lg mt-6 mb-3" {...props} />
    ),
    h3: ({node, ...props}) => (
      <h3 className="text-white font-semibold mt-4 mb-2" {...props} />
    ),
    strong: ({node, ...props}) => (
      <strong className="text-white font-bold" {...props} />
    ),
    p: ({node, ...props}) => (
      <p className="text-gray-300 mb-3" {...props} />
    ),
    li: ({node, ...props}) => (
      <li className="text-gray-300 ml-4 mb-1" {...props} />
    ),
    hr: ({node, ...props}) => (
      <hr className="border-gray-700 my-4" {...props} />
    ),
  }}
>
  {rapport.rapport}
</ReactMarkdown>                </div>
            </div>
          </>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-gray-900 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-white font-semibold text-lg mb-2">Analyse en cours...</p>
            <p className="text-gray-400">L'IA analyse votre projet</p>
          </div>
        )}

      </div>
    </div>
  );
}