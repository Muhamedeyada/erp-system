import { useState } from 'react';
import { reportsApi } from '../../../services/api';
import type { AccountType } from '../../../types';

interface TrialBalanceAccountRow {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  indentLevel: number;
  debit: number;
  credit: number;
  balance: number;
}

interface TrialBalanceResult {
  startDate: string;
  endDate: string;
  accounts: TrialBalanceAccountRow[];
  totals: {
    debit: number;
    credit: number;
    balanced: boolean;
  };
}

const ACCOUNT_TYPE_ORDER: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  ASSET: 'ASSETS',
  LIABILITY: 'LIABILITIES',
  EQUITY: 'EQUITY',
  REVENUE: 'REVENUE',
  EXPENSE: 'EXPENSES',
};

function formatNum(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeCsv(val: string | number): string {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function TrialBalance() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(lastOfMonth);
  const [data, setData] = useState<TrialBalanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupByType, setGroupByType] = useState(true);

  const runReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportsApi.trialBalance({ startDate, endDate });
      const result = res.data as TrialBalanceResult;
      setData(result);
    } catch {
      setError('Failed to load trial balance');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const rows: string[][] = [
      ['Code', 'Account', 'Debit', 'Credit'],
      ...data.accounts.map((a) => [
        a.accountCode,
        a.accountName,
        formatNum(a.debit),
        formatNum(a.credit),
      ]),
      ['', 'TOTAL', formatNum(data.totals.debit), formatNum(data.totals.credit)],
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Trial Balance Report
      </h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span>From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </label>
        <button
          onClick={runReport}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium"
        >
          {loading ? 'Loading...' : 'Run'}
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={groupByType}
            onChange={(e) => setGroupByType(e.target.checked)}
            className="rounded"
          />
          Group by type
        </label>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {data && (
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 w-24">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Account Name</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300 w-32">Debit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300 w-32">Credit</th>
              </tr>
            </thead>
            <tbody>
              {data.accounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No data for the selected date range.
                  </td>
                </tr>
              ) : groupByType ? (
                ACCOUNT_TYPE_ORDER.flatMap((type) => {
                  const items = data.accounts.filter((a) => a.accountType === type);
                  if (items.length === 0) return [];
                  return [
                    <tr key={`h-${type}`} className="border-t border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/70">
                      <td colSpan={4} className="py-2 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        {ACCOUNT_TYPE_LABELS[type]}
                      </td>
                    </tr>,
                    ...items.map((a, i) => (
                      <tr key={`${a.accountCode}-${i}`} className="border-t border-gray-200 dark:border-gray-600">
                        <td className="py-2 px-4 font-mono text-gray-900 dark:text-gray-100">
                          {a.accountCode}
                        </td>
                        <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                          {'\u00A0'.repeat(a.indentLevel * 2)}{a.accountName}
                        </td>
                        <td className="py-2 px-4 text-right font-mono text-gray-900 dark:text-gray-100">
                          {a.debit > 0 ? formatNum(a.debit) : ''}
                        </td>
                        <td className="py-2 px-4 text-right font-mono text-gray-900 dark:text-gray-100">
                          {a.credit > 0 ? formatNum(a.credit) : ''}
                        </td>
                      </tr>
                    )),
                  ];
                })
              ) : (
                data.accounts.map((a, i) => (
                  <tr key={`${a.accountCode}-${i}`} className="border-t border-gray-200 dark:border-gray-600">
                    <td className="py-2 px-4 font-mono text-gray-900 dark:text-gray-100">{a.accountCode}</td>
                    <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                      {'\u00A0'.repeat(a.indentLevel * 2)}{a.accountName}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-gray-900 dark:text-gray-100">
                      {a.debit > 0 ? formatNum(a.debit) : ''}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-gray-900 dark:text-gray-100">
                      {a.credit > 0 ? formatNum(a.credit) : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {data.accounts.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700/70 font-semibold">
                  <td className="py-3 px-4" colSpan={2}>
                    TOTAL
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-gray-100">
                    {formatNum(data.totals.debit)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-gray-100">
                    {formatNum(data.totals.credit)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex flex-wrap items-center justify-between gap-4">
            <span
              className={`text-sm font-medium ${
                data.totals.balanced ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {data.totals.balanced ? '✅ Balanced' : '❌ Unbalanced'}
            </span>
            <button
              onClick={exportCSV}
              disabled={data.accounts.length === 0}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-800 dark:text-gray-200 font-medium"
            >
              Export CSV
            </button>
          </div>
        </div>
      )}

      {!data && !loading && (
        <p className="text-gray-500 dark:text-gray-400">
          Select a date range and click Run to generate the trial balance.
        </p>
      )}
    </div>
  );
}
