import { useState, useEffect } from 'react';
import type { Account } from '../../types';

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

function flattenAccounts(accounts: Account[], excludeId?: string): Array<{ id: string; code: string; name: string; type: string; depth: number }> {
  const result: Array<{ id: string; code: string; name: string; type: string; depth: number }> = [];
  function walk(accs: Account[], depth: number) {
    for (const a of accs) {
      if (a.id === excludeId) continue;
      result.push({ id: a.id, code: a.code, name: a.name, type: a.type, depth });
      if (a.children?.length) walk(a.children, depth + 1);
    }
  }
  walk(accounts, 0);
  return result;
}

interface AccountFormProps {
  account?: Account | null;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (data: { code: string; name: string; type: string; parentId?: string }) => Promise<void>;
}

export function AccountForm({ account, accounts, onClose, onSubmit }: AccountFormProps) {
  const isEdit = !!account;
  const [code, setCode] = useState(account?.code ?? '');
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState<(typeof ACCOUNT_TYPES)[number]>(account?.type ?? 'ASSET');
  const [parentId, setParentId] = useState(account?.parentId ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setCode(account.code);
      setName(account.name);
      setType(account.type);
      setParentId(account.parentId ?? '');
    }
  }, [account]);

  const parentOptions = flattenAccounts(accounts, account?.id).filter((p) => p.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Code is required');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        code: code.trim(),
        name: name.trim(),
        type,
        parentId: parentId || undefined,
      });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEdit ? 'Edit Account' : 'Add Account'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isEdit}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="1101"
            />
            {isEdit && <p className="mt-1 text-xs text-gray-500">Code cannot be changed</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="Cash"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as (typeof ACCOUNT_TYPES)[number]);
                setParentId('');
              }}
              disabled={isEdit}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {isEdit && <p className="mt-1 text-xs text-gray-500">Type cannot be changed</p>}
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Account</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (top level)</option>
                {parentOptions
                  .filter((p) => p.type === type)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {'—'.repeat(p.depth)} {p.code} - {p.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
