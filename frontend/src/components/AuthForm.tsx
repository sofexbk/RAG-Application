import { useState } from "react";
import { Login, Register } from "../api";
import { FaEye, FaEyeSlash, FaSpinner, FaUser, FaLock, FaEnvelope, FaCheck, FaTimes } from "react-icons/fa";

type Props = {
  onAuth: (token: string, email?: string) => void;
  darkMode?: boolean;
};

type AuthMode = 'login' | 'register';
type ValidationState = {
  email: { valid: boolean; message: string };
  password: { valid: boolean; message: string };
};

export default function AuthForm({ onAuth, darkMode = false }: Props) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [validation, setValidation] = useState<ValidationState>({
    email: { valid: true, message: '' },
    password: { valid: true, message: '' }
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      valid: emailRegex.test(email),
      message: emailRegex.test(email) ? '' : 'Adresse email invalide'
    };
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    if (!minLength) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    if (!hasNumber || !hasLetter) {
      return { valid: false, message: 'Le mot de passe doit contenir des lettres et des chiffres' };
    }
    return { valid: true, message: '' };
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setValidation(prev => ({
      ...prev,
      email: validateEmail(newEmail)
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (mode === 'register') {
      setValidation(prev => ({
        ...prev,
        password: validatePassword(newPassword)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation finale
    const emailValidation = validateEmail(email);
    const passwordValidation = mode === 'register' ? validatePassword(password) : { valid: true, message: '' };
    
    if (!emailValidation.valid || !passwordValidation.valid) {
      setValidation({
        email: emailValidation,
        password: passwordValidation
      });
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setMessage({ text: 'Les mots de passe ne correspondent pas', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: mode === 'login' ? 'Connexion...' : 'Création du compte...', type: 'info' });

    try {
      const data = mode === 'login' 
        ? await Login(email, password)
        : await Register(email, password);
      
      setMessage({ text: 'Connexion réussie !', type: 'success' });
      setTimeout(() => {
        onAuth(data.access_token, email);
      }, 500);
    } catch (e: any) {
      const errorMessage = e.message || (mode === 'login' ? 'Erreur de connexion' : 'Erreur lors de la création du compte');
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setMessage(null);
    setValidation({
      email: { valid: true, message: '' },
      password: { valid: true, message: '' }
    });
    setConfirmPassword("");
  };

  const inputClasses = (hasError: boolean) => `
    w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-200
    ${hasError 
      ? darkMode 
        ? 'border-red-500 bg-red-900/20 text-white focus:border-red-400' 
        : 'border-red-500 bg-red-50 text-red-900 focus:border-red-400'
      : darkMode
        ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:bg-gray-600'
        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:bg-white'
    }
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${darkMode ? 'focus:ring-blue-400' : 'focus:ring-blue-500'}
    placeholder:${darkMode ? 'text-gray-400' : 'text-gray-500'}
  `;

  return (
    <div className={`w-full max-w-md mx-auto p-8 rounded-2xl shadow-2xl border backdrop-blur-sm ${
      darkMode 
        ? 'bg-gray-800/90 border-gray-700' 
        : 'bg-white/90 border-gray-200'
    }`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex p-3 rounded-full mb-4 ${
          darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
        }`}>
          <FaUser className={`text-2xl ${
            darkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {mode === 'login' 
            ? 'Connectez-vous à votre compte' 
            : 'Créez votre compte pour commencer'
          }
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Email Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Adresse email
          </label>
          <div className="relative">
            <FaEnvelope className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
              validation.email.valid 
                ? darkMode ? 'text-gray-400' : 'text-gray-500'
                : 'text-red-500'
            }`} />
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="votre@email.com"
              className={inputClasses(!validation.email.valid)}
              required
              disabled={loading}
            />
            {!validation.email.valid && email && (
              <FaTimes className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500" />
            )}
            {validation.email.valid && email && (
              <FaCheck className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500" />
            )}
          </div>
          {!validation.email.valid && (
            <p className="mt-1 text-sm text-red-500">{validation.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Mot de passe
          </label>
          <div className="relative">
            <FaLock className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
              validation.password.valid 
                ? darkMode ? 'text-gray-400' : 'text-gray-500'
                : 'text-red-500'
            }`} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder={mode === 'register' ? 'Au moins 8 caractères' : 'Votre mot de passe'}
              className={inputClasses(!validation.password.valid)}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
              disabled={loading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {!validation.password.valid && mode === 'register' && (
            <p className="mt-1 text-sm text-red-500">{validation.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field (Register only) */}
        {mode === 'register' && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <FaLock className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                className={inputClasses(false)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
                disabled={loading}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' ? 
              darkMode ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-green-50 text-green-800 border border-green-200'
            : message.type === 'error' ?
              darkMode ? 'bg-red-900/50 text-red-400 border border-red-700' : 'bg-red-50 text-red-800 border border-red-200'
            : darkMode ? 'bg-blue-900/50 text-blue-400 border border-blue-700' : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.type === 'success' && <FaCheck />}
            {message.type === 'error' && <FaTimes />}
            {message.type === 'info' && loading && <FaSpinner className="animate-spin" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !validation.email.valid || (mode === 'register' && !validation.password.valid)}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
            loading || !validation.email.valid || (mode === 'register' && !validation.password.valid)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {loading && <FaSpinner className="animate-spin" />}
          <span>{mode === 'login' ? 'Se connecter' : 'Créer le compte'}</span>
        </button>
      </div>

      {/* Switch Mode */}
      <div className="mt-6 text-center">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {mode === 'login' ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}
        </p>
        <button
          type="button"
          onClick={switchMode}
          className={`mt-2 text-sm font-medium transition-colors duration-200 ${
            darkMode 
              ? 'text-blue-400 hover:text-blue-300' 
              : 'text-blue-600 hover:text-blue-700'
          }`}
          disabled={loading}
        >
          {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
        </button>
      </div>
    </div>
  );
}