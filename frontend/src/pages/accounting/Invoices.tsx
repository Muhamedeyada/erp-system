import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | InvoiceStatus)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
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
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="To"
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        />
        <button
          onClick={handleFilter}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => fetchInvoiceForView(inv.id)}
                      className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-gray-900 dark:text-gray-100">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{inv.customerName}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {inv.date ? new Date(inv.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-gray-100">
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-300"
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
