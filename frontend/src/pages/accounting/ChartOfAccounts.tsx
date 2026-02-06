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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-erp-slate-900 dark:text-erp-slate-100 tracking-tight">Chart of Accounts</h1>
        <button
          type="button"
          onClick={() => {
            setFormOpen(true);
            setEditingAccount(null);
          }}
          className="erp-btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center gap-2 text-sm text-erp-slate-700 dark:text-erp-slate-300">
          Filter by type:
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="erp-input py-2 max-w-[180px] sm:max-w-none"
          >
            <option value="">All Types</option>
            {ACCOUNT_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="erp-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-erp-slate-500 dark:text-erp-slate-400">Loading...</div>
        ) : Array.isArray(accounts) && accounts.length === 0 ? (
          <div className="p-12 text-center text-erp-slate-500 dark:text-erp-slate-400">
            No accounts found. Add your first account to get started.
          </div>
        ) : (
          <div className="divide-y divide-erp-slate-200 dark:divide-erp-slate-700">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setDeletingAccount(null)}
        >
          <div
            className="erp-card w-full max-w-sm p-6 shadow-erp-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-erp-slate-900 dark:text-erp-slate-100 mb-2">
              Delete Account?
            </h3>
            <p className="text-erp-slate-600 dark:text-erp-slate-400 mb-4 text-sm">
              Are you sure you want to delete <strong>{deletingAccount.code} - {deletingAccount.name}</strong>?
              This cannot be undone if the account has no children or journal entries.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="erp-btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium transition-colors"
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
