import { useState, useEffect } from 'react';
import { Plus, Receipt, Filter, ChevronLeft, ChevronRight, Calendar, Eye } from 'lucide-react';
import { invoicesApi } from '../../services/api';
import { InvoiceForm } from '../../components/accounting/InvoiceForm';
import { InvoiceDetails } from '../../components/accounting/InvoiceDetails';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import type { Invoice } from '../../types';
import type { InvoiceStatus } from '../../types';

const STATUS_OPTIONS: { value: '' | InvoiceStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const styles: Record<InvoiceStatus, string> = {
    PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 ring-1 ring-emerald-200/50 dark:ring-emerald-700/50',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 ring-1 ring-amber-200/50 dark:ring-amber-700/50',
    SENT: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-400 ring-1 ring-sky-200/50 dark:ring-sky-700/50',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 ring-1 ring-red-200/50 dark:ring-red-700/50',
    DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300 ring-1 ring-slate-200/50 dark:ring-slate-600/50',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 line-through ring-1 ring-red-200/50 dark:ring-red-700/50',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${styles[status] ?? 'bg-gray-100'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

const LIMIT = 10;

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<'' | InvoiceStatus>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoicesApi.list({
        page,
        limit: LIMIT,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const body = res.data as { data?: Invoice[]; total?: number } | Invoice[];
      const data = Array.isArray(body) ? body : body?.data ?? [];
      const meta = Array.isArray(body) ? body.length : (body as { total?: number })?.total ?? 0;
      setInvoices(Array.isArray(data) ? data : []);
      setTotal(typeof meta === 'number' ? meta : 0);
    } catch {
      setInvoices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [page, status, startDate, endDate]);

  const handleFilter = () => {
    setPage(1);
    loadInvoices();
  };

  const handleCreate = async (payload: {
    customerName: string;
    customerId?: number;
    date: string;
    dueDate: string;
    lines: Array<{ description: string; quantity: number; unitPrice: number }>;
  }) => {
    await invoicesApi.create(payload);
    loadInvoices();
  };

  const fetchInvoiceForView = async (id: string) => {
    try {
      const res = await invoicesApi.get(id);
      setViewInvoice(res.data as Invoice);
    } catch {
      setViewInvoice(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 shadow-sm">
            <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Invoices</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="erp-btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="mb-6 erp-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as '' | InvoiceStatus)}
              className="erp-select py-2 text-sm max-w-[160px] sm:max-w-none"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From"
              className="erp-input py-2 text-sm"
            />
            <span className="text-slate-400 dark:text-slate-500">–</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To"
              className="erp-input py-2 text-sm"
            />
          </div>
          <button onClick={handleFilter} className="erp-btn-secondary">
            <Filter className="w-4 h-4" /> Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="erp-card overflow-hidden shadow-erp-lg dark:shadow-erp-dark-lg">
          <TableSkeleton rows={8} cols={6} />
        </div>
      ) : (
        <>
          <div className="erp-card overflow-hidden shadow-erp-lg dark:shadow-erp-dark-lg">
            <div className="erp-table-wrapper">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/60">
                    <th className="text-left py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">#</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Customer</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                    <th className="text-right py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="w-12 py-3.5 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <EmptyState
                          icon={Receipt}
                          title="No invoices yet"
                          description="Create your first invoice to get started."
                        />
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv, idx) => (
                      <tr
                        key={inv.id}
                        onClick={() => fetchInvoiceForView(inv.id)}
                        className={`border-t border-slate-200 dark:border-slate-600 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 cursor-pointer transition-colors group ${
                          idx % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-800/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{inv.customerName}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {inv.date ? new Date(inv.date).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900 dark:text-slate-100">
                          {Number(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="inline-flex p-1.5 rounded-lg text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors">
                            <Eye className="w-4 h-4" />
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {page} of {totalPages} <span className="text-slate-400 dark:text-slate-500">({total} invoices)</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="erp-btn-secondary py-2 px-4 text-sm disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="erp-btn-secondary py-2 px-4 text-sm disabled:opacity-50 inline-flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <InvoiceForm onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      )}

      {viewInvoice && (
        <InvoiceDetails
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onPaymentAdded={() => {
            loadInvoices();
            fetchInvoiceForView(viewInvoice.id);
          }}
        />
      )}
    </div>
  );
}
