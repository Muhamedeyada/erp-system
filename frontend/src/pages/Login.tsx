import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DEMO_EMAIL = 'demo@demo.com';
const DEMO_PASSWORD = 'demo123';

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string; errors?: string[] } } }).response?.data;
    if (res?.errors?.length) return res.errors.join('. ');
    if (res?.message) return res.message;
  }
  return 'Login failed';
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-erp-slate-50 dark:bg-erp-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-erp-slate-900 dark:text-white tracking-tight">
            ERP System
          </h1>
          <p className="mt-2 text-erp-slate-600 dark:text-erp-slate-400">Sign in to your account</p>
        </div>

        <div className="erp-card p-6 sm:p-8 shadow-erp-md">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleDemoClick}
            className="w-full mb-6 py-2.5 px-4 rounded-lg bg-erp-slate-100 dark:bg-erp-slate-700 hover:bg-erp-slate-200 dark:hover:bg-erp-slate-600 text-erp-slate-700 dark:text-erp-slate-300 font-medium transition-colors text-sm"
          >
            Use Demo Account
          </button>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={`erp-input ${
                  fieldErrors.email ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                required
                minLength={6}
                autoComplete="current-password"
                className={`erp-input ${
                  fieldErrors.password ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="erp-btn-primary w-full py-2.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>

            <p className="text-center text-sm text-erp-slate-600 dark:text-erp-slate-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-erp-primary-600 dark:text-erp-primary-400 hover:underline font-medium">
                Register company
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
