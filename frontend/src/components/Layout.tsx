import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Receipt,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounting/accounts', icon: BookOpen, label: 'Chart of Accounts' },
  { to: '/accounting/journal-entries', icon: FileText, label: 'Journal Entries' },
  { to: '/accounting/invoices', icon: Receipt, label: 'Invoices' },
  { to: '/accounting/payments', icon: CreditCard, label: 'Payments' },
  { to: '/accounting/reports/trial-balance', icon: BarChart3, label: 'Trial Balance' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen erp-page-bg flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 sm:w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 space-y-1">
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="block text-xl font-bold text-slate-900 dark:text-white tracking-tight hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
            >
              ERP System
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="block text-sm text-slate-500 dark:text-slate-400 truncate hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
            >
              {user?.tenant?.name}
            </Link>
          </div>
          <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0 opacity-80" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 gap-4">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 shrink-0"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex-1 min-w-0" />
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <DarkModeToggle />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[140px]">
                {user?.name || user?.email}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">{user?.role}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
