import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center text-erp-slate-500 dark:text-erp-slate-400 ${className}`}
    >
      <Icon className="w-12 h-12 mb-3 opacity-60" strokeWidth={1.2} />
      <p className="text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300">{title}</p>
      {description && <p className="mt-1 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
