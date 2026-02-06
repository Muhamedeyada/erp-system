import { useState } from 'react';
import { PaymentForm } from './PaymentForm';
import type { Invoice, Payment } from '../../types';

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
        className="erp-card w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto shadow-erp-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-erp-slate-200 dark:border-erp-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-erp-slate-800 z-10">
          <h2 className="text-base sm:text-lg font-semibold text-erp-slate-900 dark:text-erp-slate-100">
            Invoice #{invoice.invoiceNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-erp-slate-500 hover:text-erp-slate-700 dark:hover:text-erp-slate-300 text-xl rounded-lg hover:bg-erp-slate-100 dark:hover:bg-erp-slate-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-erp-slate-500 dark:text-erp-slate-400">Customer: </span>
              <span className="text-erp-slate-900 dark:text-erp-slate-100 font-medium">{invoice.customerName}</span>
            </div>
            <div>
              <span className="text-erp-slate-500 dark:text-erp-slate-400">Date: </span>
              <span className="text-erp-slate-900 dark:text-erp-slate-100">
                {invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}
              </span>
              <span className="text-erp-slate-500 dark:text-erp-slate-400 ml-4">Due: </span>
              <span className="text-erp-slate-900 dark:text-erp-slate-100">
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-2">Line Items</h3>
            <div className="border border-erp-slate-200 dark:border-erp-slate-600 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-erp-slate-50 dark:bg-erp-slate-700/50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Description</th>
                    <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-20">Qty</th>
                    <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-24">Unit Price</th>
                    <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={line.id ?? i} className="border-t border-erp-slate-200 dark:border-erp-slate-600">
                      <td className="py-2 px-3 text-erp-slate-900 dark:text-erp-slate-100">{line.description}</td>
                      <td className="py-2 px-3 text-right text-erp-slate-700 dark:text-erp-slate-300">{line.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono">
                        {Number(line.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {Number(line.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="py-3 px-4 rounded-lg bg-erp-slate-50 dark:bg-erp-slate-700/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-erp-slate-600 dark:text-erp-slate-400">Subtotal</span>
              <span className="font-mono">{Number(invoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-erp-slate-600 dark:text-erp-slate-400">Tax</span>
              <span className="font-mono">{Number(invoice.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-erp-slate-200 dark:border-erp-slate-600">
              <span>Total</span>
              <span className="font-mono">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600 dark:text-emerald-400">Paid</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-erp-slate-900 dark:text-erp-slate-100">Outstanding</span>
              <span className="font-mono text-erp-slate-900 dark:text-erp-slate-100">
                {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-2">Payment History</h3>
            {payments.length === 0 ? (
              <p className="text-erp-slate-500 dark:text-erp-slate-400 text-sm">No payments yet.</p>
            ) : (
              <div className="border border-erp-slate-200 dark:border-erp-slate-600 rounded-lg overflow-hidden">
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
                      <tr key={p.id} className="border-t border-erp-slate-200 dark:border-erp-slate-600">
                        <td className="py-2 px-3 text-erp-slate-900 dark:text-erp-slate-100">
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-erp-slate-700 dark:text-erp-slate-300">{p.method}</td>
                        <td className="py-2 px-3 text-erp-slate-600 dark:text-erp-slate-400">{p.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {outstanding > 0 && (
              <button
                type="button"
                onClick={() => setShowPaymentForm(true)}
                className="erp-btn-primary"
              >
                Add Payment
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-erp-slate-700 dark:text-erp-slate-300"
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
