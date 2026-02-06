import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <Plus className="w-4 h-4" /> Add Payment
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={filterInvoiceId}
          onChange={(e) => setFilterInvoiceId(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
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
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        >
          {METHOD_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Invoice</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Method</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {p.invoice?.invoiceNumber ?? '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-gray-100">
                      {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{p.method}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{p.reference || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
