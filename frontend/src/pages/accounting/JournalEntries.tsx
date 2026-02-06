import { useState, useEffect } from 'react';
import { Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Journal Entries</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Entry #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No journal entries yet. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => setViewEntry(entry)}
                      className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-gray-900 dark:text-gray-100">{entry.entryNumber}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{entry.description || '-'}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-gray-100">
                        {getEntryAmount(entry).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); setViewEntry(entry); }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-300"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Journal Entry {entry.entryNumber}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Date: </span>
              <span className="text-gray-900 dark:text-gray-100">
                {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
              </span>
            </div>
            {entry.reference && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Reference: </span>
                <span className="text-gray-900 dark:text-gray-100">{entry.reference}</span>
              </div>
            )}
          </div>
          {entry.description && (
            <p className="text-gray-700 dark:text-gray-300">{entry.description}</p>
          )}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Account</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300 w-28">Debit</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300 w-28">Credit</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Description</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={line.id ?? i} className="border-t border-gray-200 dark:border-gray-600">
                    <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                      {line.account?.code} - {line.account?.name ?? '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {(line.debit || 0) > 0 ? (line.debit as number).toLocaleString(undefined, { minimumFractionDigits: 2 }) : ''}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {(line.credit || 0) > 0 ? (line.credit as number).toLocaleString(undefined, { minimumFractionDigits: 2 }) : ''}
                    </td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{line.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-medium">
                <tr>
                  <td className="py-2 px-3">Total</td>
                  <td className="py-2 px-3 text-right font-mono">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3 text-right font-mono">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
