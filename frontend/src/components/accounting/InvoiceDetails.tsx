import { useState } from 'react';
import { Receipt, X, CreditCard, DollarSign } from 'lucide-react';
import { PaymentForm } from './PaymentForm';
import type { Invoice, Payment } from '../../types';
import type { InvoiceStatus } from '../../types';

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const styles: Record<InvoiceStatus, string> = {
    PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
    SENT: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-400',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
    DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 line-through',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${styles[status] ?? ''}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentAdded?: () => void;
}

export function InvoiceDetails({ invoice, onClose, onPaymentAdded }: InvoiceDetailsProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const total = Number(invoice.total);
  const paid = Number(invoice.paidAmount);
  const outstanding = total - paid;
  const payments = invoice.payments ?? [];
  const lines = invoice.lines ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="erp-card w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto shadow-erp-lg dark:shadow-erp-dark-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Invoice #{invoice.invoiceNumber}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Customer</span>
              <p className="text-slate-900 dark:text-slate-100 font-medium mt-0.5">{invoice.customerName}</p>
            </div>
            <div className="space-y-1">
              <div className="flex gap-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</span>
                <span className="text-slate-900 dark:text-slate-100">
                  {invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Due Date</span>
                <span className="text-slate-900 dark:text-slate-100">
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-emerald-500" /> Line Items
            </h3>
            <div className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Description</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300 w-20">Qty</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300 w-24">Unit Price</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300 w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={line.id ?? i} className="border-t border-slate-200 dark:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                      <td className="py-2.5 px-4 text-slate-900 dark:text-slate-100">{line.description}</td>
                      <td className="py-2.5 px-4 text-right text-slate-700 dark:text-slate-300">{line.quantity}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                        {Number(line.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-900 dark:text-slate-100">
                        {Number(line.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200 dark:border-slate-600 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">{Number(invoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Tax</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">{Number(invoice.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-semibold pt-3 border-t border-slate-200 dark:border-slate-600">
              <span className="text-slate-900 dark:text-slate-100">Total</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Paid
              </span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <CreditCard className="w-4 h-4" /> Outstanding
              </span>
              <span className="font-mono text-slate-900 dark:text-slate-100">
                {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-sky-500" /> Payment History
            </h3>
            {payments.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm py-4 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-600">
                No payments recorded yet.
              </p>
            ) : (
              <div className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-erp-slate-50 dark:bg-erp-slate-700/50">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Date</th>
                      <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Amount</th>
                      <th className="text-left py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Method</th>
                      <th className="text-left py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p: Payment) => (
                      <tr key={p.id} className="border-t border-slate-200 dark:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                        <td className="py-2.5 px-4 text-slate-900 dark:text-slate-100">
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{p.method}</td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{p.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            {outstanding > 0 && (
              <button
                type="button"
                onClick={() => setShowPaymentForm(true)}
                className="erp-btn-primary inline-flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Add Payment
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="erp-btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showPaymentForm && (
        <PaymentForm
          invoice={invoice}
          outstanding={outstanding}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={() => {
            setShowPaymentForm(false);
            onPaymentAdded?.();
          }}
        />
      )}
    </div>
  );
}
