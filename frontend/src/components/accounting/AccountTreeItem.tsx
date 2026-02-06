import { useState } from 'react';
import { ChevronRight, ChevronDown, Edit, Trash } from 'lucide-react';
import type { Account } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'bg-erp-primary-100 text-erp-primary-800 dark:bg-erp-primary-900/30 dark:text-erp-primary-400',
  LIABILITY: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  EQUITY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  REVENUE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  EXPENSE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

interface AccountTreeItemProps {
  account: Account;
  depth?: number;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountTreeItem({ account, depth = 0, onEdit, onDelete }: AccountTreeItemProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = account.children && account.children.length > 0;
  const typeColor = TYPE_COLORS[account.type] ?? 'bg-erp-slate-100 text-erp-slate-800 dark:bg-erp-slate-700 dark:text-erp-slate-300';

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-erp-slate-100 dark:hover:bg-erp-slate-700/50 group transition-colors"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((e) => !e)}
          className="p-0.5 rounded hover:bg-erp-slate-200 dark:hover:bg-erp-slate-600"
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-4 h-4 text-erp-slate-500 dark:text-erp-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-erp-slate-500 dark:text-erp-slate-400" />
            )
          ) : (
            <span className="w-4 h-4 inline-block" />
          )}
        </button>
        <span className="flex-1 min-w-0 font-mono text-sm text-erp-slate-700 dark:text-erp-slate-300">
          {account.code}
        </span>
        <span className="flex-1 truncate text-erp-slate-900 dark:text-erp-slate-100">
          {account.name}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}
        >
          {account.type}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="p-1.5 rounded hover:bg-erp-slate-200 dark:hover:bg-erp-slate-600 text-erp-slate-600 dark:text-erp-slate-400"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(account)}
            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            title="Delete"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div>
          {account.children!.map((child) => (
            <AccountTreeItem
              key={child.id}
              account={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
