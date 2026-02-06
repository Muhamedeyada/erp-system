import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="erp-card p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-erp-slate-500 dark:text-erp-slate-400">{title}</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold text-erp-slate-900 dark:text-erp-slate-100 truncate">{value}</p>
          {trend && (
            <p
              className={`mt-1 text-xs font-medium ${
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-erp-primary-100 dark:bg-erp-primary-900/30 shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-erp-primary-600 dark:text-erp-primary-400" />
        </div>
      </div>
    </div>
  );
}
