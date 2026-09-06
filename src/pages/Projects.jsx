import { useState, useEffect } from "react";
import {
  FiPlus,
  FiTrash2,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiUser,
} from "react-icons/fi";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
];

export default function Projects() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [projets, setProjets] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [membres, setMembres] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedProjet, setExpandedProjet] = useState(null);
  const [taches, setTaches] = useState({});
  const [showTacheForm, setShowTacheForm] = useState(null);
  const [tacheForm, setTacheForm] = useState({
    name: "",
    description: "",
    equipeId: "",
    assignedId: "",
  });
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#6366f1",
  });

  useEffect(() => {
    fetchProjets();
    if (isAdmin) {
      fetchEquipes();
      fetchMembres();
    }
  }, []);

  const fetchProjets = () => {
    api.get("/projets").then((res) => setProjets(res.data));
  };

  const fetchEquipes = async () => {
    const res = await api.get("/equipes/all");
    setEquipes(res.data);
  };

  const fetchMembres = async () => {
    const res = await api.get("/equipes");
    setMembres(res.data?.members || []);
  };

  const fetchTaches = async (projetId) => {
    const res = await api.get(`/taches/${projetId}`);
    setTaches((prev) => ({ ...prev, [projetId]: res.data }));
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
    await api.post("/projets", form);
    setShowForm(false);
    setForm({ name: "", description: "", color: "#6366f1" });
    fetchProjets();
    toast.success("Projet créé !", "📁 Nouveau projet");
  };

  const deleteProjet = async (id) => {
    await api.delete(`/projets/${id}`);
    fetchProjets();
    toast.error("Projet supprimé", "🗑️");
  };

  const createTache = async (projetId) => {
    if (!tacheForm.name.trim()) {
      toast.warning("Le nom de la tâche est obligatoire !", "⚠️");
      return;
    }
    await api.post(`/taches/${projetId}`, {
      name: tacheForm.name,
      description: tacheForm.description,
      equipeId: tacheForm.equipeId || null,
      assignedId: tacheForm.assignedId || null,
    });
    setTacheForm({ name: "", description: "", equipeId: "", assignedId: "" });
    setShowTacheForm(null);
    fetchTaches(projetId);
    toast.success("Tâche créée !", "✅");
  };

  const deleteTache = async (id, projetId) => {
    await api.delete(`/taches/${id}`);
    fetchTaches(projetId);
    toast.error("Tâche supprimée", "🗑️");
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white">Projets</h1>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <FiPlus /> Nouveau projet
            </button>
          )}
        </div>

        {/* Formulaire projet — Admin seulement */}
        {isAdmin && showForm && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-4">Nouveau projet</h2>
            <input
              type="text"
              placeholder="Nom du projet"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-3 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none"
            />
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">
                Couleur
              </label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-full transition ${form.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""}`}
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
          {projets.map((projet) => (
            <div
              key={projet.id}
              className="bg-gray-900 rounded-xl overflow-hidden"
            >
              {/* Header projet */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: projet.color }}
                  />
                  <div>
                    <p className="text-white font-semibold">{projet.name}</p>
                    {projet.description && (
                      <p className="text-gray-400 text-sm">
                        {projet.description}
                      </p>
                    )}
                    {isAdmin && projet.createdBy && (
                      <p className="text-gray-500 text-xs">
                        Créé par{" "}
                        {projet.createdBy.name || projet.createdBy.email}
                      </p>
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
                    {expandedProjet === projet.id ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => deleteProjet(projet.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>

              {/* Tâches */}
              {expandedProjet === projet.id && (
                <div className="border-t border-gray-800 px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-400 text-sm font-semibold">
                      TÂCHES
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() =>
                          setShowTacheForm(
                            showTacheForm === projet.id ? null : projet.id,
                          )
                        }
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm transition"
                      >
                        <FiPlus /> Ajouter
                      </button>
                    )}
                  </div>

                  {/* Formulaire tâche — Admin seulement */}
                  {isAdmin && showTacheForm === projet.id && (
                    <div className="bg-gray-800 rounded-lg p-4 mb-3">
                      <input
                        type="text"
                        placeholder="Nom de la tâche *"
                        value={tacheForm.name}
                        onChange={(e) =>
                          setTacheForm({ ...tacheForm, name: e.target.value })
                        }
                        className={`w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-2 focus:outline-none text-sm
    ${
      !tacheForm.name.trim() && tacheForm.name !== ""
        ? "ring-2 ring-red-500"
        : "focus:ring-2 focus:ring-indigo-500"
    }`}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Description (optionnel)"
                        value={tacheForm.description}
                        onChange={(e) =>
                          setTacheForm({
                            ...tacheForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-2 focus:outline-none text-sm"
                      />
                      <select
                        value={tacheForm.equipeId}
                        onChange={(e) => {
                          setTacheForm({
                            ...tacheForm,
                            equipeId: e.target.value,
                            assignedId: "",
                          });
                        }}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-2 focus:outline-none text-sm"
                      >
                        <option value="">Toutes les équipes</option>
                        {equipes.map((eq) => (
                          <option key={eq.id} value={eq.id}>
                            {eq.name}
                          </option>
                        ))}
                      </select>

                      {/* Select membre — apparaît seulement si équipe sélectionnée */}
                      {tacheForm.equipeId && (
                        <select
                          value={tacheForm.assignedId}
                          onChange={(e) =>
                            setTacheForm({
                              ...tacheForm,
                              assignedId: e.target.value,
                            })
                          }
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-3 focus:outline-none text-sm"
                        >
                          <option value="">Tous les membres de l'équipe</option>
                          {equipes
                            .find(
                              (eq) => eq.id === parseInt(tacheForm.equipeId),
                            )
                            ?.members?.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name || m.email}
                              </option>
                            ))}
                        </select>
                      )}
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
                    {taches[projet.id]?.map((tache) => (
                      <div
                        key={tache.id}
                        className="bg-gray-800 rounded-lg px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">
                            {tache.name}
                          </p>
                          {tache.equipe && (
                            <p className="text-yellow-400 text-xs flex items-center gap-1 mt-1">
                              👥 {tache.equipe.name}
                            </p>
                          )}
                          {tache.assignedTo && (
                            <p className="text-indigo-400 text-xs flex items-center gap-1 mt-1">
                              <FiUser size={10} />
                              {tache.assignedTo.name || tache.assignedTo.email}
                            </p>
                          )}
                          {!tache.equipe && !tache.assignedTo && (
                            <p className="text-gray-500 text-xs mt-1">
                              Tous les membres
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-indigo-400 text-sm font-mono">
                            {formatDuration(tache.totalDuration || 0)}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => deleteTache(tache.id, projet.id)}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {taches[projet.id]?.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-2">
                        Aucune tâche
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {projets.length === 0 && (
          <p className="text-gray-400 text-center mt-12">
            {isAdmin
              ? "Aucun projet — créez-en un !"
              : "Aucun projet assigné pour le moment"}
          </p>
        )}
      </div>
    </div>
  );
}
