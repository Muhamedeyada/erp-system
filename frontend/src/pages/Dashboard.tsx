import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/StatCard';
import { accountsApi, journalEntriesApi, invoicesApi, reportsApi } from '../services/api';
import { BookOpen, FileText, Receipt, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

function countAccounts(tree: Array<{ children?: unknown[] }>): number {
  return tree.reduce((sum, node) => {
    return sum + 1 + (node.children?.length ? countAccounts(node.children as Array<{ children?: unknown[] }>) : 0);
  }, 0);
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export function Dashboard() {
  const { user } = useAuth();

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list().then((r) => r.data),
  });

  const { data: journalData } = useQuery({
    queryKey: ['journal-entries', 1],
    queryFn: () => journalEntriesApi.list({ page: 1, limit: 10 }).then((r) => r.data),
  });

  const { data: invoiceData } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.list({ limit: 100 }).then((r) => r.data),
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data: trialBalance } = useQuery({
    queryKey: ['trial-balance', startOfMonth, endOfMonth],
    queryFn: () => reportsApi.trialBalance({ startDate: startOfMonth, endDate: endOfMonth }).then((r) => r.data),
  });

  const stats = useMemo(() => {
    const totalAccounts = accounts ? countAccounts(Array.isArray(accounts) ? accounts : []) : 0;
    const totalJournalEntries = journalData?.total ?? 0;
    const totalInvoices = invoiceData?.total ?? 0;
    const invoices = invoiceData?.data ?? [];
    const outstanding = invoices.reduce((sum: number, inv: { total: number; paidAmount: number; status: string }) => {
      if (['CANCELLED', 'PAID'].includes(inv.status)) return sum;
      return sum + (Number(inv.total) - Number(inv.paidAmount));
    }, 0);

    return { totalAccounts, totalJournalEntries, totalInvoices, outstanding };
  }, [accounts, journalData, invoiceData]);

  const revenueExpenseData = useMemo(() => {
    const accountsList = trialBalance?.accounts ?? [];
    let revenue = 0;
    let expenses = 0;
    for (const acc of accountsList) {
      const bal = Number(acc.balance) || 0;
      if (acc.accountType === 'REVENUE') revenue += Math.abs(bal);
      if (acc.accountType === 'EXPENSE') expenses += Math.abs(bal);
    }
    return [
      { name: 'Revenue', value: revenue, fill: '#3b82f6' },
      { name: 'Expenses', value: expenses, fill: '#ef4444' },
    ];
  }, [trialBalance]);

  const invoiceStatusData = useMemo(() => {
    const invoices = invoiceData?.data ?? [];
    const byStatus: Record<string, number> = {};
    for (const inv of invoices) {
      const s = inv.status || 'DRAFT';
      byStatus[s] = (byStatus[s] ?? 0) + 1;
    }
    return Object.entries(byStatus).map(([name, value], i) => ({
      name,
      value,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [invoiceData]);

  const recentEntries = journalData?.data?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.name || user?.email}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{user?.tenant?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Accounts"
          value={stats.totalAccounts}
          icon={BookOpen}
        />
        <StatCard
          title="Journal Entries"
          value={stats.totalJournalEntries}
          icon={FileText}
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={Receipt}
        />
        <StatCard
          title="Outstanding"
          value={stats.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Revenue vs Expenses (This Month)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueExpenseData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tw-bg-opacity, 1)',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
                  {revenueExpenseData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Invoice Status
          </h2>
          <div className="h-64">
            {invoiceStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {invoiceStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                No invoice data
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Journal Entries
            </h2>
            <Link
              to="/accounting/journal-entries"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Number</th>
                  <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Description</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500 dark:text-gray-400">
                      No recent entries
                    </td>
                  </tr>
                ) : (
                  recentEntries.map((entry: { id: string; entryNumber: string; date: string; description?: string }) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="py-2 text-gray-900 dark:text-gray-100">{entry.entryNumber}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                        {entry.description || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Quick Links
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/accounting/accounts"
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium transition-colors"
            >
              Chart of Accounts
            </Link>
            <Link
              to="/accounting/journal-entries"
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium transition-colors"
            >
              Journal Entries
            </Link>
            <Link
              to="/accounting/invoices"
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium transition-colors"
            >
              Invoices
            </Link>
            <Link
              to="/accounting/reports/trial-balance"
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium transition-colors"
            >
              Trial Balance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
