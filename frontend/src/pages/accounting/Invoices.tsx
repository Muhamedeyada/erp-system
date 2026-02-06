import { useState, useEffect } from 'react';
import { Plus, Receipt, Filter } from 'lucide-react';
import { invoicesApi } from '../../services/api';
import { InvoiceForm } from '../../components/accounting/InvoiceForm';
import { InvoiceDetails } from '../../components/accounting/InvoiceDetails';
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
    PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    SENT: 'bg-erp-primary-100 text-erp-primary-800 dark:bg-erp-primary-900/30 dark:text-erp-primary-400',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    DRAFT: 'bg-erp-slate-100 text-erp-slate-800 dark:bg-erp-slate-700 dark:text-erp-slate-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 line-through',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? 'bg-gray-100'}`}>
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
          <h1 className="text-xl sm:text-2xl font-bold text-erp-slate-900 dark:text-white tracking-tight">Invoices</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="erp-btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | InvoiceStatus)}
          className="erp-input py-2 text-sm max-w-[140px] sm:max-w-none"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="From"
          className="erp-input py-2 text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="To"
          className="erp-input py-2 text-sm"
        />
        <button onClick={handleFilter} className="erp-btn-secondary">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-erp-slate-500 dark:text-erp-slate-400">Loading...</div>
      ) : (
        <>
          <div className="erp-card overflow-hidden shadow-erp-lg dark:shadow-erp-dark-lg">
            <div className="erp-table-wrapper">
              <table className="w-full text-sm">
                <thead className="bg-erp-slate-50 dark:bg-erp-slate-700/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">#</th>
                    <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-erp-slate-500 dark:text-erp-slate-400">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => fetchInvoiceForView(inv.id)}
                        className="border-t border-erp-slate-200 dark:border-erp-slate-600 hover:bg-erp-slate-50 dark:hover:bg-erp-slate-700/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-erp-slate-900 dark:text-erp-slate-100 font-medium">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-erp-slate-700 dark:text-erp-slate-300">{inv.customerName}</td>
                        <td className="py-3 px-4 text-erp-slate-700 dark:text-erp-slate-300">
                          {inv.date ? new Date(inv.date).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-erp-slate-900 dark:text-erp-slate-100">
                          {Number(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={inv.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <span className="text-sm text-erp-slate-600 dark:text-erp-slate-400">
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="erp-btn-secondary py-1.5 px-3 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="erp-btn-secondary py-1.5 px-3 text-sm disabled:opacity-50"
                >
                  Next
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
