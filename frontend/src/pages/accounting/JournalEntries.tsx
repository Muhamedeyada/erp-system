import { useState, useEffect } from 'react';
import { Plus, Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { journalEntriesApi, accountsApi } from '../../services/api';
import { JournalEntryForm } from '../../components/accounting/JournalEntryForm';
import type { JournalEntry, Account } from '../../types';

const LIMIT = 10;

export function JournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await journalEntriesApi.list({ page, limit: LIMIT });
      const body = res.data as { data?: JournalEntry[]; total?: number } | JournalEntry[];
      const data = Array.isArray(body) ? body : body?.data ?? [];
      const meta = Array.isArray(body) ? body.length : (body as { total?: number })?.total ?? 0;
      setEntries(Array.isArray(data) ? data : []);
      setTotal(typeof meta === 'number' ? meta : 0);
    } catch {
      setEntries([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const res = await accountsApi.list();
      const data = Array.isArray(res.data) ? res.data : res.data ?? [];
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      setAccounts([]);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [page]);

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreate = async (payload: {
    date: string;
    description?: string;
    reference?: string;
    lines: Array<{ accountId: string; debit?: number; credit?: number; description?: string }>;
  }) => {
    await journalEntriesApi.create(payload);
    loadEntries();
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;
  const getEntryAmount = (e: JournalEntry) => {
    const lines = e.lines ?? [];
    return lines.reduce((s, l) => s + (l.debit || 0) + (l.credit || 0), 0) / 2;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 shadow-sm">
            <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-erp-slate-900 dark:text-erp-slate-100 tracking-tight">Journal Entries</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="erp-btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-erp-slate-500 dark:text-erp-slate-400">Loading...</div>
      ) : (
        <>
          <div className="erp-card overflow-hidden shadow-erp-lg">
            <div className="erp-table-wrapper">
              <table className="w-full text-sm">
                <thead className="bg-erp-slate-50 dark:bg-erp-slate-700/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Entry #</th>
                    <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Description</th>
                    <th className="text-right py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Amount</th>
                    <th className="w-20" />
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-erp-slate-500 dark:text-erp-slate-400">
                        No journal entries yet. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => setViewEntry(entry)}
                        className="border-t border-erp-slate-200 dark:border-erp-slate-600 hover:bg-erp-slate-50 dark:hover:bg-erp-slate-700/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-erp-slate-900 dark:text-erp-slate-100 font-medium">{entry.entryNumber}</td>
                        <td className="py-3 px-4 text-erp-slate-700 dark:text-erp-slate-300">
                          {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-erp-slate-700 dark:text-erp-slate-300">{entry.description || '-'}</td>
                        <td className="py-3 px-4 text-right font-mono text-erp-slate-900 dark:text-erp-slate-100">
                          {getEntryAmount(entry).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); setViewEntry(entry); }}
                            className="p-1.5 text-erp-slate-500 hover:text-erp-primary-600 dark:hover:text-erp-primary-400 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <span className="text-sm text-erp-slate-600 dark:text-erp-slate-400">
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="erp-btn-secondary py-1.5 px-3 text-sm disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="erp-btn-secondary py-1.5 px-3 text-sm disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <JournalEntryForm
          accounts={accounts}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}

      {viewEntry && (
        <DetailsModal entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}
    </div>
  );
}

function DetailsModal({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  const lines = entry.lines ?? [];
  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div
        className="erp-card w-full max-w-2xl my-8 shadow-erp-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-erp-slate-200 dark:border-erp-slate-700 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-erp-slate-900 dark:text-erp-slate-100">
            Journal Entry {entry.entryNumber}
          </h2>
          <button onClick={onClose} className="p-2 text-erp-slate-500 hover:text-erp-slate-700 dark:hover:text-erp-slate-300 rounded-lg hover:bg-erp-slate-100 dark:hover:bg-erp-slate-700 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
            <div>
              <span className="text-erp-slate-500 dark:text-erp-slate-400">Date: </span>
              <span className="text-erp-slate-900 dark:text-erp-slate-100 font-medium">
                {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
              </span>
            </div>
            {entry.reference && (
              <div>
                <span className="text-erp-slate-500 dark:text-erp-slate-400">Reference: </span>
                <span className="text-erp-slate-900 dark:text-erp-slate-100 font-medium">{entry.reference}</span>
              </div>
            )}
          </div>
          {entry.description && (
            <p className="text-erp-slate-700 dark:text-erp-slate-300">{entry.description}</p>
          )}
          <div className="erp-table-wrapper overflow-hidden rounded-lg border border-erp-slate-200 dark:border-erp-slate-600">
            <table className="w-full text-sm">
              <thead className="bg-erp-slate-50 dark:bg-erp-slate-700/50">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Account</th>
                  <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-28">Debit</th>
                  <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-28">Credit</th>
                  <th className="text-left py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Description</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={line.id ?? i} className="border-t border-erp-slate-200 dark:border-erp-slate-600">
                    <td className="py-2 px-3 text-erp-slate-900 dark:text-erp-slate-100 font-medium">
                      {line.account?.code} - {line.account?.name ?? '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {(line.debit || 0) > 0 ? (line.debit as number).toLocaleString(undefined, { minimumFractionDigits: 2 }) : ''}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {(line.credit || 0) > 0 ? (line.credit as number).toLocaleString(undefined, { minimumFractionDigits: 2 }) : ''}
                    </td>
                    <td className="py-2 px-3 text-erp-slate-600 dark:text-erp-slate-400">{line.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-erp-slate-50 dark:bg-erp-slate-700/50 font-medium">
                <tr>
                  <td className="py-2 px-3 text-erp-slate-900 dark:text-erp-slate-100">Total</td>
                  <td className="py-2 px-3 text-right font-mono">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right font-mono">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={onClose} className="erp-btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
