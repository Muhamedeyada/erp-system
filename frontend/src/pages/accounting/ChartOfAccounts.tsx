import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { accountsApi } from '../../services/api';
import { AccountTreeItem } from '../../components/accounting/AccountTreeItem';
import { AccountForm } from '../../components/accounting/AccountForm';
import type { Account } from '../../types';

const ACCOUNT_TYPES = ['', 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

export function ChartOfAccounts() {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts', typeFilter || undefined],
    queryFn: () =>
      accountsApi.list(typeFilter || undefined).then((r) => r.data as Account[]),
  });

  const createMutation = useMutation({
    mutationFn: (data: { code: string; name: string; type: string; parentId?: string }) =>
      accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isActive?: boolean } }) =>
      accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setEditingAccount(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setDeletingAccount(null);
    },
  });

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormOpen(false);
  };
  const handleDeleteClick = (account: Account) => setDeletingAccount(account);
  const handleDeleteConfirm = () => {
    if (deletingAccount) deleteMutation.mutate(deletingAccount.id);
  };

  const handleFormSubmit = async (data: { code: string; name: string; type: string; parentId?: string }) => {
    if (editingAccount) {
      await updateMutation.mutateAsync({
        id: editingAccount.id,
        data: { name: data.name },
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chart of Accounts</h1>
        <button
          type="button"
          onClick={() => {
            setFormOpen(true);
            setEditingAccount(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          Filter by type:
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Types</option>
            {ACCOUNT_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : Array.isArray(accounts) && accounts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No accounts found. Add your first account to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.isArray(accounts) &&
              accounts.map((account) => (
                <AccountTreeItem
                  key={account.id}
                  account={account}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
          </div>
        )}
      </div>

      {(formOpen || editingAccount) && (
        <AccountForm
          account={editingAccount}
          accounts={accounts}
          onClose={() => {
            setFormOpen(false);
            setEditingAccount(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {deletingAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setDeletingAccount(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Delete Account?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete <strong>{deletingAccount.code} - {deletingAccount.name}</strong>?
              This cannot be undone if the account has no children or journal entries.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
