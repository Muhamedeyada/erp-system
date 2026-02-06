import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DarkModeToggle } from '../components/DarkModeToggle';

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string; errors?: string[] } } }).response?.data;
    if (res?.errors?.length) return res.errors.join('. ');
    if (res?.message) return res.message;
  }
  return 'Registration failed';
}

export function Register() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { registerCompany } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!companyName.trim()) errors.companyName = 'Company name is required';
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
      await registerCompany({ companyName, email, password, name: name || undefined });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-100 via-sky-100 to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-sky-950 px-4 py-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-sky-200/30 dark:bg-sky-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-72 h-72 rounded-full bg-sky-100/50 dark:bg-sky-600/5 blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-48 h-48 rounded-full bg-slate-200/40 dark:bg-slate-600/10 blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-transparent via-transparent to-sky-100/30 dark:to-sky-900/20" />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="block text-center mb-6 sm:mb-8 group">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            ERP System
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Register your company</p>
        </Link>

        <div className="erp-card p-6 sm:p-8 shadow-erp-lg dark:shadow-erp-dark-lg backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  clearFieldError('companyName');
                }}
                required
                placeholder="Acme Inc"
                className={`erp-input ${
                  fieldErrors.companyName ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {fieldErrors.companyName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.companyName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                required
                autoComplete="email"
                placeholder="admin@acme.com"
                className={`erp-input ${
                  fieldErrors.email ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError('password');
                }}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Min 6 characters"
                className={`erp-input ${
                  fieldErrors.password ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your Name <span className="text-slate-400 text-xs">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="erp-input"
              />
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
