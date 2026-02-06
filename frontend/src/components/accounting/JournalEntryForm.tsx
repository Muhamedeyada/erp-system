import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Account } from '../../types';

function flattenAccounts(accounts: Account[]): Array<{ id: string; code: string; name: string }> {
  const result: Array<{ id: string; code: string; name: string }> = [];
  function walk(accs: Account[]) {
    for (const a of accs) {
      result.push({ id: a.id, code: a.code, name: a.name });
      if (a.children?.length) walk(a.children);
    }
  }
  walk(accounts);
  return result.sort((a, b) => a.code.localeCompare(b.code));
}

interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

interface JournalEntryFormProps {
  accounts: Account[];
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    description?: string;
    reference?: string;
    lines: Array<{ accountId: string; debit?: number; credit?: number; description?: string }>;
  }) => Promise<void>;
}

export function JournalEntryForm({ accounts, onClose, onSubmit }: JournalEntryFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: '', debit: 0, credit: 0, description: '' },
    { accountId: '', debit: 0, credit: 0, description: '' },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const flatAccounts = flattenAccounts(accounts);

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const diff = Math.round((totalDebit - totalCredit) * 100) / 100;
  const isBalanced = diff === 0 && totalDebit > 0;

  const canSubmit = isBalanced && lines.every((l) => {
    const d = Number(l.debit) || 0;
    const c = Number(l.credit) || 0;
    return l.accountId && ((d > 0 && c === 0) || (c > 0 && d === 0));
  }) && lines.filter((l) => (Number(l.debit) || 0) > 0 || (Number(l.credit) || 0) > 0).length >= 2;

  const updateLine = (index: number, field: keyof JournalLine, value: string | number) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'debit' && Number(value) > 0) next[index].credit = 0;
      if (field === 'credit' && Number(value) > 0) next[index].debit = 0;
      return next;
    });
  };

  const addLine = () => {
    setLines((prev) => [...prev, { accountId: '', debit: 0, credit: 0, description: '' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;
    setLoading(true);
    try {
      const payload = {
        date,
        description: description.trim() || undefined,
        reference: reference.trim() || undefined,
        lines: lines
          .filter((l) => (Number(l.debit) || 0) > 0 || (Number(l.credit) || 0) > 0)
          .map((l) => ({
            accountId: l.accountId,
            debit: Number(l.debit) || 0,
            credit: Number(l.credit) || 0,
            description: l.description.trim() || undefined,
          })),
      };
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to save';
      setError(typeof msg === 'string' ? msg : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div
        className="erp-card w-full max-w-3xl my-8 shadow-erp-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-erp-slate-200 dark:border-erp-slate-700">
          <h2 className="text-lg font-semibold text-erp-slate-900 dark:text-erp-slate-100">Create Journal Entry</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 erp-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">Reference</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="INV-001"
                className="w-full px-4 py-2 erp-input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Purchase inventory"
              className="w-full px-4 py-2 erp-input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300">Lines</label>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1 text-sm text-erp-primary-600 dark:text-erp-primary-400 hover:underline"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="border border-erp-slate-200 dark:border-erp-slate-600 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-erp-slate-50 dark:bg-erp-slate-700/50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Account</th>
                    <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-28">Debit</th>
                    <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-28">Credit</th>
                    <th className="text-left py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Description</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="border-t border-erp-slate-200 dark:border-erp-slate-600">
                      <td className="py-1 px-3">
                        <select
                          value={line.accountId}
                          onChange={(e) => updateLine(i, 'accountId', e.target.value)}
                          required
                          className="w-full py-1.5 px-2 erp-input text-sm py-1.5 px-2"
                        >
                          <option value="">Select account</option>
                          {flatAccounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 px-3">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={line.debit || ''}
                          onChange={(e) => updateLine(i, 'debit', e.target.value ? parseFloat(e.target.value) : 0)}
                          placeholder="0"
                          className="w-full py-1.5 px-2 erp-input text-sm py-1.5 px-2 text-right"
                        />
                      </td>
                      <td className="py-1 px-3">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={line.credit || ''}
                          onChange={(e) => updateLine(i, 'credit', e.target.value ? parseFloat(e.target.value) : 0)}
                          placeholder="0"
                          className="w-full py-1.5 px-2 erp-input text-sm py-1.5 px-2 text-right"
                        />
                      </td>
                      <td className="py-1 px-3">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(i, 'description', e.target.value)}
                          placeholder=""
                          className="w-full py-1.5 px-2 erp-input text-sm py-1.5 px-2"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
                          disabled={lines.length <= 2}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-erp-slate-50 dark:bg-erp-slate-700/50">
            <div>
              <span className="text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300">Total: </span>
              <span className="font-mono text-erp-slate-900 dark:text-erp-slate-100">
                {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })} / {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className={`text-sm font-medium ${isBalanced ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isBalanced ? '✅ Balanced' : `❌ Unbalanced (diff: ${diff})`}
            </span>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="erp-btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="erp-btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
