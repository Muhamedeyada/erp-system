import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { useInView } from '../hooks/useInView';
import {
  BarChart3,
  FileText,
  CreditCard,
  Shield,
  BookOpen,
  PieChart,
  LayoutDashboard,
  Receipt,
  Sparkles,
  TrendingUp,
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
  const { isAuthenticated, isLoading, user } = useAuth();
  const dashboardRef = useInView();
  const invoiceRef = useInView();
  const featuresRef = useInView();
  const statsRef = useInView();
  const ctaRef = useInView();
  const companyName = user?.tenant?.name || 'Dashboard';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Nav - full width, left and right aligned */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0">
            ERP System
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
            <DarkModeToggle />
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="erp-btn-primary px-3 sm:px-4 py-2 text-sm whitespace-nowrap cursor-pointer"
              >
                {companyName}
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap">
                  Sign in
                </Link>
                <Link to="/register" className="erp-btn-primary px-3 sm:px-4 py-2 text-sm whitespace-nowrap">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero - text left, image fills right L-shaped space */}
        <section className="landing-hero-bg relative min-h-screen flex items-center overflow-hidden">
          <div className="wave-bg-shape" aria-hidden="true" />
          <svg className="wave-svg" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,96 1440,64 L1440,120 L0,120 Z" />
            <path d="M0,80 C240,40 480,100 720,80 C960,60 1200,100 1440,80 L1440,120 L0,120 Z" opacity="0.6" />
          </svg>
          <div className="relative z-10 w-full flex flex-col lg:flex-row min-h-screen">
            <div className="flex-1 flex items-center px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-0">
              <div className="max-w-xl xl:max-w-2xl text-left order-2 lg:order-1">
                <h1 className="font-script text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-semibold text-slate-900 dark:text-white mb-4 sm:mb-6 leading-tight" style={{ fontFamily: "'Caveat', cursive" }}>
                  Everything your business needs{' '}
                  <span className="text-highlight-amber">in one place.</span>
                </h1>
                <p className="font-script text-2xl sm:text-3xl md:text-4xl text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: "'Caveat', cursive" }}>
                  Simple, efficient, yet{' '}
                  <span className="text-highlight-blue">affordable!</span>
                </p>
                <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-lg font-sans">
                  Free to start. Manage accounting, invoicing, payments & reports.
                </p>
                <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-start mb-6">
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="erp-btn-primary px-8 py-3 text-base cursor-pointer">
                      {companyName}
                    </Link>
                  ) : (
                    <>
                      <Link to="/register" className="erp-btn-primary px-8 py-3 text-base">
                        Start now – It&apos;s free
                      </Link>
                      <Link to="/login" className="erp-btn-secondary px-8 py-3 text-base">
                        Sign in
                      </Link>
                    </>
                  )}
                </div>
                <p className="font-script text-xl sm:text-2xl text-slate-600 dark:text-slate-300" style={{ fontFamily: "'Caveat', cursive" }}>
                  Free for all features
                </p>
              </div>
            </div>
            {/* Image fills right L-shaped space - extends to viewport edge */}
            <div className="order-1 lg:order-2 lg:flex-1 lg:min-w-[45%] xl:min-w-[50%] flex items-center justify-center lg:justify-end pt-8 lg:pt-0 lg:pl-0">
              <div className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] lg:h-[calc(100vh-2rem)] lg:min-h-[500px] flex items-center justify-end">
                <div className="relative group h-full flex items-center">
                  <div className="absolute -inset-2 lg:-inset-4 bg-gradient-to-r from-sky-400/20 to-sky-600/30 dark:from-sky-500/20 dark:to-sky-700/30 rounded-2xl blur-xl" />
                  <div className="relative h-full flex items-center pr-0 lg:pr-8 xl:pr-12">
                    <img
                      src="/industry-bg.png"
                      alt="Business management dashboard"
                      className="h-full w-auto max-w-none object-contain object-right rounded-l-2xl lg:rounded-l-3xl shadow-2xl border-l border-slate-200/80 dark:border-slate-600/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard preview - static mock */}
        <section className="landing-section-dashboard px-4 pb-16 sm:pb-24 pt-8 transition-colors duration-300">
          <div
            ref={dashboardRef.ref}
            className={`max-w-5xl mx-auto ${dashboardRef.isInView ? 'animate-on-scroll visible' : 'animate-on-scroll'}`}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/40">
                <LayoutDashboard className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                See Your Dashboard in Seconds
              </h2>
            </div>
            <div className="erp-card overflow-hidden shadow-lg">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Welcome back, John</p>
                <p className="text-slate-700 dark:text-slate-300">Acme Inc</p>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-1 xs:grid-cols-3 gap-4">
                {SAMPLE_STATS.map((stat, i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Revenue vs Expenses (This Month)</p>
                <div className="h-32 flex gap-4 items-end">
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-sky-500 rounded-t h-20 max-h-[80px]" style={{ height: '80%' }} />
                    <span className="text-xs text-slate-600 dark:text-slate-300">Revenue</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-red-500/80 rounded-t h-16 max-h-[64px]" style={{ height: '64%' }} />
                    <span className="text-xs text-slate-600 dark:text-slate-300">Expenses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Invoice preview - static mock */}
        <section className="landing-section-invoice px-4 pb-16 sm:pb-24 transition-colors duration-300">
          <div
            ref={invoiceRef.ref}
            className={`max-w-2xl mx-auto ${invoiceRef.isInView ? 'animate-on-scroll visible' : 'animate-on-scroll'}`}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Professional Invoices
              </h2>
            </div>
            <div className="erp-card overflow-hidden shadow-lg">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">INVOICE</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{SAMPLE_INVOICE.number}</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                    PAID
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Bill to</p>
                    <p className="font-medium text-slate-900 dark:text-white">{SAMPLE_INVOICE.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 dark:text-slate-400">Date / Due</p>
                    <p className="font-medium text-slate-900 dark:text-white">{SAMPLE_INVOICE.date} / {SAMPLE_INVOICE.dueDate}</p>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-slate-700 dark:text-slate-300">Description</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-700 dark:text-slate-300 w-16">Qty</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-700 dark:text-slate-300 w-24">Price</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-700 dark:text-slate-300 w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_INVOICE.items.map((item, i) => (
                        <tr key={i} className="border-t border-slate-200 dark:border-slate-600">
                          <td className="py-2 px-3 text-slate-900 dark:text-slate-100">{item.desc}</td>
                          <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">{item.qty}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-900 dark:text-slate-100">
                            ${(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Total</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      ${SAMPLE_INVOICE.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What you can do - features */}
        <section className="landing-section-features px-4 py-16 sm:py-24 transition-colors duration-300">
          <div
            ref={featuresRef.ref}
            className={`max-w-6xl mx-auto ${featuresRef.isInView ? 'animate-on-scroll visible' : 'animate-on-scroll'}`}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40">
                <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                What You Can Do
              </h2>
            </div>
            <p className="text-center text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
              Everything you need to manage your business finances in one place.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className={`erp-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${featuresRef.isInView ? 'animate-on-scroll visible' : 'animate-on-scroll'}`}
                    style={{ transitionDelay: `${i * 0.08}s` }}
                  >
                    <div className="inline-flex p-3 rounded-xl bg-sky-100 dark:bg-sky-900/40 mb-4">
                      <Icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="landing-section-stats px-4 py-16 sm:py-24 transition-colors duration-300">
          <div
            ref={statsRef.ref}
            className={`max-w-4xl mx-auto ${statsRef.isInView ? 'animate-on-scroll visible' : 'animate-on-scroll'}`}
          >
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/40">
                <TrendingUp className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Trusted by Businesses
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-sky-600 dark:text-sky-400">500+</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Companies</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-sky-600 dark:text-sky-400">10K+</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Invoices Created</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-sky-600 dark:text-sky-400">99.9%</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Uptime</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-sky-600 dark:text-sky-400">24/7</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Access</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          ref={ctaRef.ref}
          className={`landing-section-cta px-4 py-16 sm:py-24 transition-colors duration-300 ${ctaRef.isInView ? 'animate-on-scroll visible' : 'animate-on-scroll'}`}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Streamline Your Business?
            </h2>
            <p className="text-sky-100 dark:text-sky-200 mb-8">
              Join hundreds of companies managing their finances with our ERP system.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-sky-600 font-semibold hover:bg-sky-50 transition-colors cursor-pointer"
                >
                  {companyName}
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-sky-600 font-semibold hover:bg-sky-50 transition-colors"
                  >
                    Register Your Company
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer - full width, left and right aligned */}
      <footer className="landing-footer w-full py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="w-full flex flex-row items-center justify-between gap-4 min-w-0">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate min-w-0">
            © {new Date().getFullYear()} ERP System. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6 shrink-0">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap cursor-pointer"
              >
                {companyName}
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap">
                  Sign in
                </Link>
                <Link to="/register" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
