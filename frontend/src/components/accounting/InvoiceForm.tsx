import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceFormProps {
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    customerId?: number;
    date: string;
    dueDate: string;
    lines: Array<{ description: string; quantity: number; unitPrice: number }>;
  }) => Promise<void>;
}

export function InvoiceForm({ onClose, onSubmit }: InvoiceFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(today);
  const [due, setDue] = useState(dueDate);
  const [lines, setLines] = useState<InvoiceLine[]>([
    { description: '', quantity: 0, unitPrice: 0 },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateLine = (index: number, field: keyof InvoiceLine, value: string | number) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addLine = () => {
    setLines((prev) => [...prev, { description: '', quantity: 0, unitPrice: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const tax = 0;
  const total = subtotal + tax;

  const validLines = lines.filter((l) => (l.description?.trim() && (Number(l.quantity) || 0) > 0 && (Number(l.unitPrice) || 0) >= 0));
  const canSubmit = customerName.trim().length > 0 && validLines.length >= 1 && total > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;
    setLoading(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerId: customerId.trim() ? parseInt(customerId, 10) : undefined,
        date,
        dueDate: due,
        lines: validLines.map((l) => ({
          description: l.description.trim(),
          quantity: Math.max(0, Math.floor(Number(l.quantity) || 0)),
          unitPrice: Math.max(0, Number(l.unitPrice) || 0),
        })),
      };
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to create invoice';
      setError(typeof msg === 'string' ? msg : 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="erp-card shadow-erp-lg w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-erp-slate-200 dark:border-erp-slate-700">
          <h2 className="text-lg font-semibold text-erp-slate-900 dark:text-erp-slate-100">Create Invoice</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="ABC Company"
              className="w-full px-4 py-2 erp-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">
              Customer ID (optional)
            </label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value.replace(/\D/g, ''))}
              placeholder="123"
              className="w-full px-4 py-2 erp-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 erp-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300 mb-1">Due Date *</label>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                required
                className="w-full px-4 py-2 erp-input"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-erp-slate-700 dark:text-erp-slate-300">Line Items</label>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1 text-sm text-erp-primary-600 dark:text-erp-primary-400 hover:underline"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="border border-erp-slate-200 dark:border-erp-slate-600 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-erp-slate-50 dark:bg-erp-slate-700/50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300">Description</th>
                    <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-24">Qty</th>
                    <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-28">Unit Price</th>
                    <th className="text-right py-2 px-3 font-medium text-erp-slate-700 dark:text-erp-slate-300 w-24">Total</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => {
                    const qty = Number(line.quantity) || 0;
                    const up = Number(line.unitPrice) || 0;
                    const lineTotal = qty * up;
                    return (
                      <tr key={i} className="border-t border-erp-slate-200 dark:border-erp-slate-600">
                        <td className="py-1 px-3">
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => updateLine(i, 'description', e.target.value)}
                            placeholder="Product or service"
                            className="w-full py-1.5 px-2 erp-input text-sm py-1.5 px-2"
                          />
                        </td>
                        <td className="py-1 px-3">
                          <input
                            type="number"
                            min={0}
                            value={line.quantity || ''}
                            onChange={(e) => updateLine(i, 'quantity', e.target.value ? parseInt(e.target.value, 10) : 0)}
                            className="w-full py-1.5 px-2 erp-input text-sm py-1.5 px-2 text-right"
                          />
                        </td>
                        <td className="py-1 px-3">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.unitPrice || ''}
                            onChange={(e) =>
                              updateLine(i, 'unitPrice', e.target.value ? parseFloat(e.target.value) : 0)
                            }
                            className="w-full py-1.5 px-2 erp-input text-sm py-1.5 px-2 text-right"
                          />
                        </td>
                        <td className="py-1 px-3 text-right font-mono text-erp-slate-700 dark:text-erp-slate-300">
                          {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeLine(i)}
                            disabled={lines.length <= 1}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="py-3 px-4 rounded-lg bg-erp-slate-50 dark:bg-erp-slate-700/50 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-erp-slate-600 dark:text-erp-slate-400">Subtotal</span>
              <span className="font-mono text-erp-slate-900 dark:text-erp-slate-100">
                {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-erp-slate-600 dark:text-erp-slate-400">Tax</span>
              <span className="font-mono text-erp-slate-900 dark:text-erp-slate-100">
                {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-erp-slate-200 dark:border-erp-slate-600">
              <span className="text-erp-slate-900 dark:text-erp-slate-100">Total</span>
              <span className="font-mono text-erp-slate-900 dark:text-erp-slate-100">
                {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg erp-btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="flex-1 py-2 px-4 erp-btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
