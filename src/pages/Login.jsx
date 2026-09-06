import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (!err.response) {
        setGeneralError('Serveur inaccessible — vérifiez votre connexion');
      } else if (status === 400) {
        if (message === 'Utilisateur non trouvé') {
          setEmailError('Aucun compte avec cet email');
        } else if (message === 'Mot de passe incorrect') {
          setPasswordError('Mot de passe incorrect');
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
        <h1 className="text-3xl font-bold text-white text-center mb-2">
        ⏱ PapaTime
        </h1>
        <p className="text-gray-400 text-center mb-8">
        Simple time tracking for Papa in Shape
        </p>        

        {generalError && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Se connecter
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
        Contactez votre administrateur pour créer un compte.
      </p>

      </div>
    </div>
  );
}