import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { DarkModeToggle } from '../components/DarkModeToggle';
import {
  BarChart3,
  FileText,
  CreditCard,
  Shield,
  BookOpen,
  PieChart,
} from 'lucide-react';

/* Static data for landing page previews */
const SAMPLE_STATS = [
  { label: 'Total Invoices', value: '1,247' },
  { label: 'Accounts', value: '48' },
  { label: 'Outstanding', value: '$12,450' },
];

const SAMPLE_INVOICE = {
  number: 'INV-2024-0842',
  customer: 'Acme Corporation',
  date: 'Jan 15, 2024',
  dueDate: 'Feb 14, 2024',
  items: [
    { desc: 'Professional Services', qty: 40, price: 125.0 },
    { desc: 'Consulting', qty: 8, price: 200.0 },
  ],
  total: 6600.0,
};

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Chart of Accounts',
    description: 'Organize your finances with a hierarchical chart of accounts. Track assets, liabilities, equity, revenue, and expenses.',
  },
  {
    icon: FileText,
    title: 'Journal Entries',
    description: 'Record double-entry bookkeeping with ease. Create, edit, and audit journal entries with full transaction history.',
  },
  {
    icon: CreditCard,
    title: 'Invoicing & Payments',
    description: 'Create professional invoices, track payment status, and record payments. Support for cash, bank, and cheque.',
  },
  {
    icon: BarChart3,
    title: 'Trial Balance',
    description: 'Generate trial balance reports for any date range. Verify debits equal credits and export to CSV.',
  },
  {
    icon: PieChart,
    title: 'Dashboard & Analytics',
    description: 'Visualize revenue vs expenses, invoice status distribution, and key metrics at a glance.',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant & Secure',
    description: 'Each company has isolated data. Secure authentication and role-based access control.',
  },
];

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-erp-slate-50 dark:bg-erp-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-erp-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-erp-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-erp-slate-900/80 backdrop-blur-md border-b border-erp-slate-200 dark:border-erp-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-erp-slate-900 dark:text-white tracking-tight">
            ERP System
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6">
            <DarkModeToggle />
            <Link to="/login" className="text-sm font-medium text-erp-slate-600 dark:text-erp-slate-400 hover:text-erp-primary-600 dark:hover:text-erp-primary-400 transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="erp-btn-primary px-4 py-2 text-sm">
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-erp-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight">
              Enterprise Resource Planning
            </h1>
            <p className="text-lg sm:text-xl text-erp-slate-600 dark:text-erp-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Manage accounting, invoicing, payments, and reports in one place. Built for small and medium businesses.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/register" className="erp-btn-primary px-8 py-3 text-base">
                Get Started Free
              </Link>
              <Link to="/login" className="erp-btn-secondary px-8 py-3 text-base">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard preview - static mock */}
        <section className="px-4 pb-16 sm:pb-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-xl sm:text-2xl font-bold text-erp-slate-900 dark:text-white mb-8">
              Your Dashboard at a Glance
            </h2>
            <div className="erp-card overflow-hidden shadow-lg">
              <div className="p-4 sm:p-6 border-b border-erp-slate-200 dark:border-erp-slate-700 bg-erp-slate-50 dark:bg-erp-slate-800/50">
                <p className="text-sm font-medium text-erp-slate-500 dark:text-erp-slate-400">Welcome back, John</p>
                <p className="text-erp-slate-700 dark:text-erp-slate-300">Acme Inc</p>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-1 xs:grid-cols-3 gap-4">
                {SAMPLE_STATS.map((stat, i) => (
                  <div key={i} className="p-4 rounded-lg bg-erp-slate-50 dark:bg-erp-slate-800/50 border border-erp-slate-200 dark:border-erp-slate-700">
                    <p className="text-sm text-erp-slate-500 dark:text-erp-slate-400">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-erp-slate-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-6 border-t border-erp-slate-200 dark:border-erp-slate-700">
                <p className="text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-3">Revenue vs Expenses (This Month)</p>
                <div className="h-32 flex gap-4 items-end">
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-erp-primary-500 rounded-t h-20 max-h-[80px]" style={{ height: '80%' }} />
                    <span className="text-xs text-erp-slate-600 dark:text-erp-slate-400">Revenue</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-red-500/80 rounded-t h-16 max-h-[64px]" style={{ height: '64%' }} />
                    <span className="text-xs text-erp-slate-600 dark:text-erp-slate-400">Expenses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Invoice preview - static mock */}
        <section className="px-4 pb-16 sm:pb-24">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-center text-xl sm:text-2xl font-bold text-erp-slate-900 dark:text-white mb-8">
              Professional Invoices
            </h2>
            <div className="erp-card overflow-hidden shadow-lg">
              <div className="p-4 sm:p-6 border-b border-erp-slate-200 dark:border-erp-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-erp-slate-900 dark:text-white">INVOICE</h3>
                    <p className="text-sm text-erp-slate-600 dark:text-erp-slate-400 mt-1">{SAMPLE_INVOICE.number}</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                    PAID
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-erp-slate-500 dark:text-erp-slate-400">Bill to</p>
                    <p className="font-medium text-erp-slate-900 dark:text-white">{SAMPLE_INVOICE.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-erp-slate-500 dark:text-erp-slate-400">Date / Due</p>
                    <p className="font-medium text-erp-slate-900 dark:text-white">{SAMPLE_INVOICE.date} / {SAMPLE_INVOICE.dueDate}</p>
                  </div>
                </div>
                <div className="border border-erp-slate-200 dark:border-erp-slate-600 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-erp-slate-50 dark:bg-erp-slate-800/50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Description</th>
                        <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-16">Qty</th>
                        <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-24">Price</th>
                        <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_INVOICE.items.map((item, i) => (
                        <tr key={i} className="border-t border-erp-slate-200 dark:border-erp-slate-600">
                          <td className="py-2 px-3 text-erp-slate-900 dark:text-erp-slate-100">{item.desc}</td>
                          <td className="py-2 px-3 text-right text-erp-slate-700 dark:text-erp-slate-300">{item.qty}</td>
                          <td className="py-2 px-3 text-right font-mono text-erp-slate-700 dark:text-erp-slate-300">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-erp-slate-900 dark:text-erp-slate-100">
                            ${(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-erp-slate-600 dark:text-erp-slate-400">Total</p>
                    <p className="text-xl font-bold text-erp-slate-900 dark:text-white">
                      ${SAMPLE_INVOICE.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What you can do - features */}
        <section className="px-4 py-16 sm:py-24 bg-white dark:bg-erp-slate-800/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-xl sm:text-2xl font-bold text-erp-slate-900 dark:text-white mb-4">
              What You Can Do
            </h2>
            <p className="text-center text-erp-slate-600 dark:text-erp-slate-400 mb-12 max-w-2xl mx-auto">
              Everything you need to manage your business finances in one place.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="erp-card p-6 hover:shadow-md transition-shadow">
                    <div className="inline-flex p-3 rounded-xl bg-erp-primary-100 dark:bg-erp-primary-900/30 mb-4">
                      <Icon className="w-6 h-6 text-erp-primary-600 dark:text-erp-primary-400" />
                    </div>
                    <h3 className="font-semibold text-erp-slate-900 dark:text-white text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-erp-slate-600 dark:text-erp-slate-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-erp-primary-600 dark:text-erp-primary-400">500+</p>
                <p className="text-sm text-erp-slate-600 dark:text-erp-slate-400 mt-1">Companies</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-erp-primary-600 dark:text-erp-primary-400">10K+</p>
                <p className="text-sm text-erp-slate-600 dark:text-erp-slate-400 mt-1">Invoices Created</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-erp-primary-600 dark:text-erp-primary-400">99.9%</p>
                <p className="text-sm text-erp-slate-600 dark:text-erp-slate-400 mt-1">Uptime</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-erp-primary-600 dark:text-erp-primary-400">24/7</p>
                <p className="text-sm text-erp-slate-600 dark:text-erp-slate-400 mt-1">Access</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:py-24 bg-erp-primary-600 dark:bg-erp-primary-700">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Streamline Your Business?
            </h2>
            <p className="text-erp-primary-100 mb-8">
              Join hundreds of companies managing their finances with our ERP system.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-erp-primary-600 font-semibold hover:bg-erp-primary-50 transition-colors"
              >
                Register Your Company
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-erp-slate-200 dark:border-erp-slate-700 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-erp-slate-500 dark:text-erp-slate-400">
            © {new Date().getFullYear()} ERP System. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/login" className="text-sm text-erp-slate-500 dark:text-erp-slate-400 hover:text-erp-primary-600 dark:hover:text-erp-primary-400 transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="text-sm text-erp-slate-500 dark:text-erp-slate-400 hover:text-erp-primary-600 dark:hover:text-erp-primary-400 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
