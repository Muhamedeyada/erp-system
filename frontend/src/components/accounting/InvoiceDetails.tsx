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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Invoice #{invoice.invoiceNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Customer: </span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{invoice.customerName}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Date: </span>
              <span className="text-gray-900 dark:text-gray-100">
                {invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-4">Due: </span>
              <span className="text-gray-900 dark:text-gray-100">
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Line Items</h3>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Description</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300 w-20">Qty</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300 w-24">Unit Price</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300 w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={line.id ?? i} className="border-t border-gray-200 dark:border-gray-600">
                      <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{line.description}</td>
                      <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{line.quantity}</td>
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

          <div className="py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-mono">{Number(invoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="font-mono">{Number(invoice.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-600">
              <span>Total</span>
              <span className="font-mono">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600 dark:text-green-400">Paid</span>
              <span className="font-mono text-green-600 dark:text-green-400">
                {paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-900 dark:text-gray-100">Outstanding</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment History</h3>
            {payments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No payments yet.</p>
            ) : (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Method</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p: Payment) => (
                      <tr key={p.id} className="border-t border-gray-200 dark:border-gray-600">
                        <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{p.method}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{p.reference || '-'}</td>
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
                className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Add Payment
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
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
