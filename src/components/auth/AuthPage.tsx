import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'register' | 'reset';

const TITLES: Record<AuthMode, string> = {
  login: 'Zaloguj się',
  register: 'Utwórz konto',
  reset: 'Resetuj hasło',
};

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Nieprawidłowy email lub hasło',
  'User already registered': 'Konto z tym emailem już istnieje',
  'Email not confirmed': 'Email nie został potwierdzony. Sprawdź skrzynkę.',
  'Password should be at least 6 characters': 'Hasło musi mieć minimum 8 znaków',
};

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          toast.error('Hasła nie są identyczne');
          return;
        }
        if (password.length < 8) {
          toast.error('Hasło musi mieć minimum 8 znaków');
          return;
        }
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(ERROR_MESSAGES[error.message] || 'Wystąpił błąd. Spróbuj ponownie.');
        } else {
          toast.success('Konto utworzone! Sprawdź email, aby je aktywować.');
          setMode('login');
        }
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(ERROR_MESSAGES[error.message] || 'Wystąpił błąd. Spróbuj ponownie.');
        }
      } else {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(ERROR_MESSAGES[error.message] || 'Wystąpił błąd. Spróbuj ponownie.');
        } else {
          toast.success('Link do resetu hasła wysłany na email.');
          setMode('login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4">
            <span className="text-3xl">🛒</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50">
            Lista Zakupów
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
            Twoja inteligentna lista zakupów
          </p>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-surface-800 dark:text-surface-100 mb-6">
            {TITLES[mode]}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-500 dark:text-surface-400 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="twoj@email.pl"
                required
                autoComplete="email"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-surface-500 dark:text-surface-400 mb-1.5">
                  Hasło
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Minimum 8 znaków"
                  required
                  minLength={8}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-500 dark:text-surface-400 mb-1.5">
                  Potwierdź hasło
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Powtórz hasło"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Spinner />}
              {TITLES[mode]}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('register')}
                  className="text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Nie masz konta? Zarejestruj się
                </button>
                <br />
                <button
                  onClick={() => setMode('reset')}
                  className="text-surface-500 hover:text-surface-300 transition-colors"
                >
                  Zapomniałeś hasła?
                </button>
              </>
            )}
            {mode === 'register' && (
              <button
                onClick={() => setMode('login')}
                className="text-brand-400 hover:text-brand-300 transition-colors"
              >
                Masz już konto? Zaloguj się
              </button>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => setMode('login')}
                className="text-brand-400 hover:text-brand-300 transition-colors"
              >
                Wróć do logowania
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
