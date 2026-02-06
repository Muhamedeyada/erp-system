import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
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

/* ERP-style chart colors: primary blue, emerald, amber, red */
const PIE_COLORS = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#64748b'];

const CHART_DARK = {
  gridStroke: '#475569',
  tickFill: '#94a3b8',
  tooltipBg: '#1e293b',
  tooltipBorder: '#334155',
  tooltipColor: '#f8fafc',
};
const CHART_LIGHT = {
  gridStroke: '#e2e8f0',
  tickFill: '#64748b',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipColor: '#0f172a',
};

export function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useDarkMode();
  const chartTheme = isDark ? CHART_DARK : CHART_LIGHT;

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
      { name: 'Revenue', value: revenue, fill: '#0284c7' },
      { name: 'Expenses', value: expenses, fill: '#dc2626' },
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-erp-slate-900 dark:text-erp-slate-100 tracking-tight">
          Welcome back, {user?.name || user?.email}
        </h1>
        <p className="text-erp-slate-500 dark:text-erp-slate-400 text-sm sm:text-base">{user?.tenant?.name}</p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="erp-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-erp-slate-900 dark:text-erp-slate-100 mb-4">
            Revenue vs Expenses (This Month)
          </h2>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis dataKey="name" tick={{ fill: chartTheme.tickFill, fontSize: 12 }} />
                <YAxis tick={{ fill: chartTheme.tickFill, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                    borderRadius: '0.5rem',
                    color: chartTheme.tooltipColor,
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

        <div className="erp-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-erp-slate-900 dark:text-erp-slate-100 mb-4">
            Invoice Status
          </h2>
          <div className="h-56 sm:h-64">
            {invoiceStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {invoiceStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      border: `1px solid ${chartTheme.tooltipBorder}`,
                      borderRadius: '0.5rem',
                      color: chartTheme.tooltipColor,
                    }}
                  />
                  <Legend wrapperStyle={{ color: chartTheme.tooltipColor }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-erp-slate-500 dark:text-erp-slate-400">
                No invoice data
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="erp-card p-4 sm:p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-erp-slate-900 dark:text-erp-slate-100">
              Recent Journal Entries
            </h2>
            <Link
              to="/accounting/journal-entries"
              className="text-sm text-erp-primary-600 dark:text-erp-primary-400 hover:underline font-medium shrink-0"
            >
              View all
            </Link>
          </div>
          <div className="erp-table-wrapper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-erp-slate-200 dark:border-erp-slate-600">
                  <th className="text-left py-2 font-medium text-erp-slate-700 dark:text-erp-slate-300">Number</th>
                  <th className="text-left py-2 font-medium text-erp-slate-700 dark:text-erp-slate-300">Date</th>
                  <th className="text-left py-2 font-medium text-erp-slate-700 dark:text-erp-slate-300">Description</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-erp-slate-500 dark:text-erp-slate-400">
                      No recent entries
                    </td>
                  </tr>
                ) : (
                  recentEntries.map((entry: { id: string; entryNumber: string; date: string; description?: string }) => (
                    <tr
                      key={entry.id}
                      className="border-b border-erp-slate-100 dark:border-erp-slate-700"
                    >
                      <td className="py-2 text-erp-slate-900 dark:text-erp-slate-100 font-medium">{entry.entryNumber}</td>
                      <td className="py-2 text-erp-slate-600 dark:text-erp-slate-400">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-erp-slate-600 dark:text-erp-slate-400 truncate max-w-[150px]">
                        {entry.description || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="erp-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-erp-slate-900 dark:text-erp-slate-100 mb-4">
            Quick Links
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Link
              to="/accounting/accounts"
              className="p-3 sm:p-4 rounded-lg bg-erp-slate-50 dark:bg-erp-slate-700/50 hover:bg-erp-slate-100 dark:hover:bg-erp-slate-700 text-erp-slate-900 dark:text-erp-slate-100 font-medium text-sm sm:text-base transition-colors"
            >
              Chart of Accounts
            </Link>
            <Link
              to="/accounting/journal-entries"
              className="p-3 sm:p-4 rounded-lg bg-erp-slate-50 dark:bg-erp-slate-700/50 hover:bg-erp-slate-100 dark:hover:bg-erp-slate-700 text-erp-slate-900 dark:text-erp-slate-100 font-medium text-sm sm:text-base transition-colors"
            >
              Journal Entries
            </Link>
            <Link
              to="/accounting/invoices"
              className="p-3 sm:p-4 rounded-lg bg-erp-slate-50 dark:bg-erp-slate-700/50 hover:bg-erp-slate-100 dark:hover:bg-erp-slate-700 text-erp-slate-900 dark:text-erp-slate-100 font-medium text-sm sm:text-base transition-colors"
            >
              Invoices
            </Link>
            <Link
              to="/accounting/reports/trial-balance"
              className="p-3 sm:p-4 rounded-lg bg-erp-slate-50 dark:bg-erp-slate-700/50 hover:bg-erp-slate-100 dark:hover:bg-erp-slate-700 text-erp-slate-900 dark:text-erp-slate-100 font-medium text-sm sm:text-base transition-colors"
            >
              Trial Balance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
