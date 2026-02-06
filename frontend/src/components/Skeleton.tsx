export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-erp-slate-200 dark:bg-erp-slate-600 ${className}`}
      aria-hidden
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="erp-table-wrapper">
      <table className="w-full text-sm">
        <thead className="bg-erp-slate-50 dark:bg-erp-slate-700/50">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="text-left py-3 px-4">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-t border-erp-slate-200 dark:border-erp-slate-600">
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx} className="py-3 px-4">
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="erp-card p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="mt-3 h-8 w-16" />
    </div>
  );
}

export function ChartSkeleton({ height = 256 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2 min-h-[200px]" style={{ height }}>
      {[40, 65, 45, 80, 55].map((h, i) => (
        <div key={i} style={{ height: `${h}%` }} className="flex-1">
          <Skeleton className="h-full w-full rounded-t" />
        </div>
      ))}
    </div>
  );
}
