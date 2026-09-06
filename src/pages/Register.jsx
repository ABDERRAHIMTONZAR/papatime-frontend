import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [equipeInfo, setEquipeInfo] = useState(null);
  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Récupérer le code depuis l'URL
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setCode(codeFromUrl);
      verifyCode(codeFromUrl);
    }
  }, []);

  const verifyCode = async (c) => {
    try {
      const res = await api.get(`/equipes/invitations/${c}`);
      setEquipeInfo(res.data);
      setCodeError('');
    } catch (err) {
      setEquipeInfo(null);
      setCodeError(err.response?.data?.message || 'Code invalide');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    try {
      await register(email, password, name, code);
      navigate('/');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (!err.response) {
        setGeneralError('Serveur inaccessible — vérifiez votre connexion');
      } else if (status === 400) {
        if (message === 'Email déjà utilisé') {
          setEmailError('Cet email est déjà utilisé');
        } else if (message?.includes('invitation')) {
          setCodeError(message);
        } else {
          setGeneralError(message || 'Erreur de validation');
        }
      } else if (status === 500) {
        setGeneralError('Erreur serveur — réessayez plus tard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-xl">

        <h1 className="text-3xl font-bold text-white text-center mb-2">⏱ PapaTime</h1>
        <p className="text-gray-400 text-center mb-6">Simple time tracking for Papa in Shape</p>

        {/* Equipe info */}
        {equipeInfo && (
          <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 p-3 rounded-lg mb-6 text-sm text-center">
            ✅ Invité à rejoindre <strong>{equipeInfo.equipe}</strong>
          </div>
        )}

        {generalError && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              className={`w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${nameError ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}`}
              placeholder="Abderrahim Tonzar"
              required
            />
            {nameError && <p className="text-red-400 text-sm mt-1">{nameError}</p>}
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              className={`w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${emailError ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}`}
              placeholder="vous@example.com"
              required
            />
            {emailError && <p className="text-red-400 text-sm mt-1">{emailError}</p>}
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              className={`w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${passwordError ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}`}
              placeholder="••••••••"
              required
            />
            {passwordError && <p className="text-red-400 text-sm mt-1">{passwordError}</p>}
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Code d'invitation <span className="text-gray-500">(optionnel)</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => { 
                setCode(e.target.value.toUpperCase()); 
                setCodeError('');
                if (e.target.value.length === 8) verifyCode(e.target.value.toUpperCase());
              }}
              className={`w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 font-mono ${codeError ? 'ring-2 ring-red-500' : equipeInfo ? 'ring-2 ring-green-500' : 'focus:ring-indigo-500'}`}
              placeholder="ABC12345"
              maxLength={8}
            />
            {codeError && <p className="text-red-400 text-sm mt-1">{codeError}</p>}
            {equipeInfo && <p className="text-green-400 text-sm mt-1">✅ Code valide</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Créer mon compte
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Déjà un compte ?
          <Link to="/login" className="text-indigo-400 ml-1 hover:underline">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
}