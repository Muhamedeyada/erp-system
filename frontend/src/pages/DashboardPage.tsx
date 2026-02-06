import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Receipt, CreditCard, BarChart3 } from 'lucide-react';

const cards = [
  { to: '/accounting/accounts', icon: BookOpen, label: 'Chart of Accounts' },
  { to: '/accounting/journal-entries', icon: FileText, label: 'Journal Entries' },
  { to: '/accounting/invoices', icon: Receipt, label: 'Invoices' },
  { to: '/accounting/payments', icon: CreditCard, label: 'Payments' },
  { to: '/accounting/reports/trial-balance', icon: BarChart3, label: 'Trial Balance' },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome back, {user?.name || user?.email}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {user?.tenant?.name}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
          >
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
