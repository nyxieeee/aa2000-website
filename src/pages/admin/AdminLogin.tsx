import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { PageHead } from '../../components/ui/PageHead';

const ADMIN_SESSION_KEY = 'aa2000-admin';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  return '';
};

export const isAdminLoggedIn = (): boolean => {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

export const setAdminLoggedIn = () => {
  sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
};

export const setAdminLoggedOut = () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
};

async function loginWithApi(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    const data = await res.json().catch(() => ({}));
    const msg = typeof (data && data.error) === 'string' ? data.error : null;
    if (!res.ok) {
      return { ok: false, error: msg || (res.status === 401 ? 'Invalid username or password.' : 'Login failed.') };
    }
    return data.ok ? { ok: true } : { ok: false, error: msg || 'Login failed.' };
  } catch {
    return { ok: false, error: 'Cannot reach server. Is the API running? (Run: npm run server)' };
  }
}

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (isAdminLoggedIn()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Enter username and password.');
      return;
    }
    setLoading(true);
    const result = await loginWithApi(username, password);
    setLoading(false);
    if (result.ok) {
      setAdminLoggedIn();
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError(result.error || 'Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <PageHead title="Admin Login" />
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-aa-navy text-aa-cyan mx-auto mb-6">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 text-center mb-2">Admin Login</h1>
        <p className="text-slate-600 text-sm text-center mb-6">Sign in with your admin account (credentials are in the database).</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-aa-blue focus:border-aa-blue outline-none"
            autoComplete="username"
            autoFocus
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 focus:ring-2 focus:ring-aa-blue focus:border-aa-blue outline-none"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-700 rounded"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-aa-blue text-slate-900 font-bold rounded-lg hover:bg-aa-blue-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-center">
          <a href="/" className="text-slate-500 hover:text-aa-blue text-sm">Back to site</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
