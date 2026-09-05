import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
if (isRegister) {
  await register(email, password, name);
}      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-xl">
        
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          ⏱ PapaTime
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Simple time tracking for Papa in Shape
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
  <div>
    <label className="text-gray-400 text-sm mb-1 block">Nom complet</label>
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      placeholder="Abderrahim Tonzar"
      required
    />
  </div>
)}

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="vous@example.com"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {isRegister ? 'Créer un compte' : 'Se connecter'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-indigo-400 ml-1 hover:underline"
          >
            {isRegister ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>

      </div>
    </div>
  );
}