import { useState } from 'react';
import { ChevronRight, ChevronDown, Edit, Trash } from 'lucide-react';
import type { Account } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  LIABILITY: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  EQUITY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  REVENUE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  EXPENSE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
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
  const typeColor = TYPE_COLORS[account.type] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((e) => !e)}
          className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )
          ) : (
            <span className="w-4 h-4 inline-block" />
          )}
        </button>
        <span className="flex-1 min-w-0 font-mono text-sm text-gray-700 dark:text-gray-300">
          {account.code}
        </span>
        <span className="flex-1 truncate text-gray-900 dark:text-gray-100">
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
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
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
