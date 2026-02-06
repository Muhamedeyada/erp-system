import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-erp-slate-50 dark:bg-erp-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-erp-slate-900 dark:text-white tracking-tight">
            ERP System
          </h1>
          <p className="mt-2 text-erp-slate-600 dark:text-erp-slate-400">Register your company</p>
        </div>

        <div className="erp-card p-6 sm:p-8 shadow-erp-md">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-2">
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
              <label htmlFor="email" className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-2">
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
              <label htmlFor="password" className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-2">
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
              <label htmlFor="name" className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-2">
                Your Name <span className="text-erp-slate-400 text-xs">(optional)</span>
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

            <p className="text-center text-sm text-erp-slate-600 dark:text-erp-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-erp-primary-600 dark:text-erp-primary-400 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
