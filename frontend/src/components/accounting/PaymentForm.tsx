import { useState, useEffect } from 'react';
import { invoicesApi, paymentsApi } from '../../services/api';
import type { Invoice } from '../../types';

const METHODS = ['CASH', 'BANK', 'CHEQUE'] as const;

interface PaymentFormProps {
  invoice?: Invoice | null;
  outstanding?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentForm({ invoice: propInvoice, outstanding: propOutstanding, onClose, onSuccess }: PaymentFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceId, setInvoiceId] = useState(propInvoice?.id ?? '');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(today);
  const [method, setMethod] = useState<(typeof METHODS)[number]>('CASH');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const isFromDetails = !!propInvoice;
  const selectedInvoice = isFromDetails ? propInvoice : invoices.find((i) => i.id === invoiceId);
  const total = selectedInvoice ? Number(selectedInvoice.total) : 0;
  const paid = selectedInvoice ? Number(selectedInvoice.paidAmount) : 0;
  const outstanding = isFromDetails ? (propOutstanding ?? total - paid) : total - paid;

  useEffect(() => {
    if (!isFromDetails) {
      setLoadingInvoices(true);
      invoicesApi
        .list({ limit: 100 })
        .then((res) => {
          const body = res.data as { data?: Invoice[] } | Invoice[];
          const data = Array.isArray(body) ? body : body?.data ?? [];
          const list = Array.isArray(data) ? data : [];
          const withOutstanding = list.filter((inv) => {
            const t = Number(inv.total);
            const p = Number(inv.paidAmount);
            return t - p > 0.01 && inv.status !== 'CANCELLED';
          });
          setInvoices(withOutstanding);
          if (withOutstanding.length > 0 && !invoiceId) {
            setInvoiceId(withOutstanding[0].id);
          }
        })
        .catch(() => setInvoices([]))
        .finally(() => setLoadingInvoices(false));
    }
  }, [isFromDetails]);

  useEffect(() => {
    if (isFromDetails && propOutstanding !== undefined) {
      setAmount(propOutstanding.toFixed(2));
    }
  }, [isFromDetails, propOutstanding]);

  useEffect(() => {
    if (!isFromDetails && invoiceId) {
      const inv = invoices.find((i) => i.id === invoiceId);
      if (inv) {
        const out = Number(inv.total) - Number(inv.paidAmount);
        setAmount(out > 0 ? out.toFixed(2) : '');
      }
    }
  }, [isFromDetails, invoiceId, invoices]);

  const amt = parseFloat(amount) || 0;
  const valid = amt > 0 && amt <= outstanding && (isFromDetails || invoiceId);
  const canSubmit = valid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const targetInvoiceId = isFromDetails ? propInvoice!.id : invoiceId;
    if (!targetInvoiceId || !canSubmit) return;
    setLoading(true);
    try {
      await paymentsApi.create({
        invoiceId: targetInvoiceId,
        amount: amt,
        paymentDate,
        method,
        reference: reference.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to record payment';
      setError(typeof msg === 'string' ? msg : 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="erp-card w-full max-w-md shadow-erp-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-erp-slate-200 dark:border-erp-slate-700">
          <h2 className="text-lg font-semibold text-erp-slate-900 dark:text-erp-slate-100">Add Payment</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {!isFromDetails && (
            <div>
              <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">
                Invoice *
              </label>
              <select
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                required
                disabled={loadingInvoices}
                className="w-full px-4 py-2 erp-input"
              >
                <option value="">Select invoice</option>
                {invoices.map((inv) => {
                  const out = Number(inv.total) - Number(inv.paidAmount);
                  return (
                    <option key={inv.id} value={inv.id}>
                      #{inv.invoiceNumber} - {inv.customerName} (Outstanding: {out.toFixed(2)})
                    </option>
                  );
                })}
              </select>
              {selectedInvoice && (
                <p className="mt-1 text-xs text-erp-slate-500 dark:text-erp-slate-400">
                  Outstanding: {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          )}

          {isFromDetails && (
            <div className="p-3 rounded-lg bg-erp-slate-50 dark:bg-erp-slate-700/50 text-sm">
              <span className="text-erp-slate-600 dark:text-erp-slate-400">Invoice #{propInvoice?.invoiceNumber}</span>
              <span className="mx-2">·</span>
              <span className="font-mono">Outstanding: {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">
              Amount * (max: {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })})
            </label>
            <input
              type="number"
              min={0}
              max={outstanding}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-4 py-2 erp-input"
            />
            {amt > outstanding && outstanding > 0 && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Amount exceeds outstanding balance
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="w-full px-4 py-2 erp-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">
              Method *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as (typeof METHODS)[number])}
              className="w-full px-4 py-2 erp-input"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">
              Reference / Notes
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-2 erp-input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="erp-btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="erp-btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
