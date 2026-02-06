import { useState, useEffect } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { paymentsApi, invoicesApi } from '../../services/api';
import { PaymentForm } from '../../components/accounting/PaymentForm';
import type { Payment, Invoice } from '../../types';
import type { PaymentMethod } from '../../types';

const METHOD_OPTIONS: { value: '' | PaymentMethod; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK', label: 'Bank' },
  { value: 'CHEQUE', label: 'Cheque' },
];

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterInvoiceId, setFilterInvoiceId] = useState('');
  const [filterMethod, setFilterMethod] = useState<'' | PaymentMethod>('');
  const [showForm, setShowForm] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.list({
        invoiceId: filterInvoiceId || undefined,
        method: filterMethod || undefined,
      });
      const data = res.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const res = await invoicesApi.list({ limit: 200 });
      const body = res.data as { data?: Invoice[] } | Invoice[];
      const data = Array.isArray(body) ? body : body?.data ?? [];
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filterInvoiceId, filterMethod]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const handlePaymentSuccess = () => {
    loadPayments();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/40 shadow-sm">
            <CreditCard className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-erp-slate-900 dark:text-erp-slate-100 tracking-tight">Payments</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="erp-btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Payment
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={filterInvoiceId}
          onChange={(e) => setFilterInvoiceId(e.target.value)}
          className="erp-input py-2 text-sm max-w-[200px] sm:max-w-none"
        >
          <option value="">All invoices</option>
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              #{inv.invoiceNumber} - {inv.customerName}
            </option>
          ))}
        </select>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value as '' | PaymentMethod)}
          className="erp-input py-2 text-sm max-w-[140px] sm:max-w-none"
        >
          {METHOD_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-erp-slate-500 dark:text-erp-slate-400">Loading...</div>
      ) : (
        <div className="erp-card overflow-hidden shadow-erp-lg dark:shadow-erp-dark-lg">
          <div className="erp-table-wrapper">
            <table className="w-full text-sm">
              <thead className="bg-erp-slate-50 dark:bg-erp-slate-700/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Invoice</th>
                  <th className="text-right py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-erp-slate-700 dark:text-erp-slate-300">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-erp-slate-500 dark:text-erp-slate-400">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-erp-slate-200 dark:border-erp-slate-600 hover:bg-erp-slate-50 dark:hover:bg-erp-slate-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-erp-slate-700 dark:text-erp-slate-300">
                        {p.paymentDate
                          ? new Date(p.paymentDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-erp-slate-700 dark:text-erp-slate-300 font-medium">
                        {p.invoice?.invoiceNumber ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-erp-slate-900 dark:text-erp-slate-100">
                        {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-erp-slate-700 dark:text-erp-slate-300">{p.method}</td>
                      <td className="py-3 px-4 text-erp-slate-600 dark:text-erp-slate-400">{p.reference || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <PaymentForm
          onClose={() => setShowForm(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
