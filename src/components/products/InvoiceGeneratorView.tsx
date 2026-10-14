import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, Printer, Eye, Lock, CheckCircle2, AlertCircle, Share2 } from 'lucide-react';
import { InvoiceDocument, InvoiceLineItem, InvoiceStatus } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

export default function InvoiceGeneratorView({ currentUser, onNavigate }: Props) {
  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDocument | null>(null);

  // Form State
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [sellerName, setSellerName] = useState(currentUser?.name || 'GOYE Business Enterprise');
  const [sellerEmail, setSellerEmail] = useState(currentUser?.email || 'billing@goye-hub.com');
  const [currency, setCurrency] = useState('NGN');
  const [dueDays, setDueDays] = useState(7);
  const [notes, setNotes] = useState('Payment instructions: Settle via verified GOYE Pi Payment Checkout or corporate bank transfer.');
  const [items, setItems] = useState<InvoiceLineItem[]>([
    { id: '1', description: 'Professional Corporate Website Setup', quantity: 1, unitPrice: 120000, amount: 120000 }
  ]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Error fetching invoices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const addItem = () => {
    const newItem: InvoiceLineItem = {
      id: Math.random().toString(36).substring(7),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceLineItem, val: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
      }
      return updated;
    }));
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const subtotal = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const tax = (subtotal * (Number(taxPercent) || 0)) / 100;
  const total = Math.max(0, subtotal + tax - (Number(discountAmount) || 0));

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      safeNotify('Client / Buyer name is required', 'error');
      return;
    }
    if (items.some(i => !i.description.trim() || i.amount <= 0)) {
      safeNotify('Please complete all line items with description and price', 'error');
      return;
    }

    setSubmitting(true);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const id = `inv_${Date.now()}`;

    const newInvoice: InvoiceDocument = {
      id,
      invoiceNumber,
      sellerId: currentUser?.id || 'guest',
      sellerName,
      sellerEmail,
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim(),
      items,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      currency,
      dueDate: Date.now() + (dueDays * 24 * 60 * 60 * 1000),
      notes,
      paymentStatus: 'PENDING', // Status strictly managed server-side
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      if (res.ok) {
        setInvoices(prev => [newInvoice, ...prev]);
        setSelectedInvoice(newInvoice);
        safeNotify(`Invoice ${invoiceNumber} created with status PENDING`, 'success');
        setShowCreator(false);
        setBuyerName('');
      } else {
        safeNotify('Failed to create invoice', 'error');
      }
    } catch (err: any) {
      safeNotify(err.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <Receipt size={14} /> Product 09 • Billing Infrastructure
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          Digital Invoice Generator
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Create professional itemized digital invoices with automated tax, discounts, line items, and verifiable public payment links.
        </p>
        <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400 flex items-start gap-2.5">
          <Lock size={16} className="text-[#FFD700] shrink-0 mt-0.5" />
          <span>
            <strong className="text-yellow-400">Strict Server-Side Payment Rule:</strong> Payment status CANNOT be manually set to "PAID" from the frontend. Invoices are marked PAID only upon verified Pi Network completion or official authorized gateway reconciliation.
          </span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-black uppercase text-white">
            Invoices Management ({invoices.length})
          </h2>
          <p className="text-[11px] text-gray-400 font-mono">Statuses: DRAFT • PENDING • UNDER REVIEW • PAID • OVERDUE</p>
        </div>
        <button
          onClick={() => setShowCreator(!showCreator)}
          className="px-5 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Invoice Creator Form */}
      {showCreator && (
        <form onSubmit={handleCreateInvoice} className="bg-neutral-950 border border-yellow-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="text-lg font-black uppercase text-[#FFD700] flex items-center gap-2">
              <Receipt size={20} /> New Digital Invoice
            </h3>
            <span className="text-xs font-mono text-gray-400">Status will be initialized as PENDING</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold uppercase tracking-wider">
            {/* Seller */}
            <div className="space-y-3 p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              <p className="text-yellow-400 text-[10px] font-black">Issuer / Seller Info</p>
              <input
                type="text"
                value={sellerName}
                onChange={e => setSellerName(e.target.value)}
                placeholder="Seller Corporate Name"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white"
                required
              />
              <input
                type="email"
                value={sellerEmail}
                onChange={e => setSellerEmail(e.target.value)}
                placeholder="Seller Email"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white"
              />
            </div>

            {/* Buyer */}
            <div className="space-y-3 p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              <p className="text-yellow-400 text-[10px] font-black">Recipient / Client Info</p>
              <input
                type="text"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                placeholder="Client Name or Business *"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white"
                required
              />
              <input
                type="email"
                value={buyerEmail}
                onChange={e => setBuyerEmail(e.target.value)}
                placeholder="Client Email Address"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase text-yellow-400 tracking-wider">Itemized Services & Goods</h4>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1 border border-neutral-700"
              >
                <Plus size={12} /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs font-bold uppercase">
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item / Scope Description"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white text-center"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                      placeholder="Unit Price"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white text-right"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
            <div className="space-y-3 text-xs font-bold uppercase">
              <div>
                <label className="block text-gray-400 mb-1">Invoice Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-white"
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="Pi">Pi (Testnet / Mainnet)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Payment Due In (Days)</label>
                <input
                  type="number"
                  value={dueDays}
                  onChange={e => setDueDays(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Payment Instructions / Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-white resize-none"
                />
              </div>
            </div>

            {/* Totals Summary */}
            <div className="p-5 bg-neutral-900 rounded-2xl space-y-3 text-xs font-mono">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>{currency} {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Tax (%):</span>
                <input
                  type="number"
                  value={taxPercent}
                  onChange={e => setTaxPercent(Number(e.target.value))}
                  className="w-20 bg-neutral-950 border border-neutral-700 rounded p-1 text-right text-white"
                />
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Discount ({currency}):</span>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(Number(e.target.value))}
                  className="w-24 bg-neutral-950 border border-neutral-700 rounded p-1 text-right text-white"
                />
              </div>
              <div className="flex justify-between text-base font-black text-[#FFD700] pt-3 border-t border-neutral-800">
                <span>Total Due:</span>
                <span>{currency} {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreator(false)}
              className="flex-1 py-3 bg-neutral-900 text-gray-400 rounded-xl uppercase font-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black rounded-xl uppercase font-black shadow-lg cursor-pointer"
            >
              {submitting ? 'Creating Invoice...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      )}

      {/* Invoice Detail Sheet if Selected */}
      {selectedInvoice && (
        <div className="bg-neutral-950 border border-yellow-500/40 rounded-3xl p-6 md:p-10 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-xs font-mono text-yellow-400 font-bold">{selectedInvoice.invoiceNumber}</span>
              <h3 className="text-2xl font-black uppercase text-white">Commercial Invoice</h3>
              <p className="text-xs text-gray-400">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                selectedInvoice.paymentStatus === 'PAID'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              }`}>
                {selectedInvoice.paymentStatus}
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-gray-300 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5"
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-3 py-2 bg-neutral-800 text-gray-400 hover:text-white rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>

          {/* Printable Invoice Body */}
          <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-6 text-xs text-gray-300 font-sans">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-800">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Issued By (Seller)</p>
                <p className="font-black text-white text-sm">{selectedInvoice.sellerName}</p>
                <p className="text-gray-400">{selectedInvoice.sellerEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Billed To (Buyer)</p>
                <p className="font-black text-white text-sm">{selectedInvoice.buyerName}</p>
                <p className="text-gray-400">{selectedInvoice.buyerEmail}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-gray-500 border-b border-neutral-800 pb-2">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Unit Price</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>
              {selectedInvoice.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 py-2 border-b border-neutral-800/40 text-xs">
                  <span className="col-span-6 text-white font-bold">{it.description}</span>
                  <span className="col-span-2 text-center text-gray-400">{it.quantity}</span>
                  <span className="col-span-2 text-right text-gray-400">{selectedInvoice.currency} {it.unitPrice.toLocaleString()}</span>
                  <span className="col-span-2 text-right font-mono font-bold text-[#FFD700]">{selectedInvoice.currency} {it.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals Box */}
            <div className="flex justify-end pt-4">
              <div className="w-64 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal:</span>
                  <span>{selectedInvoice.currency} {selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                {selectedInvoice.tax > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Tax:</span>
                    <span>{selectedInvoice.currency} {selectedInvoice.tax.toLocaleString()}</span>
                  </div>
                )}
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Discount:</span>
                    <span>-{selectedInvoice.currency} {selectedInvoice.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#FFD700] pt-2 border-t border-neutral-800">
                  <span>Total Due:</span>
                  <span>{selectedInvoice.currency} {selectedInvoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {selectedInvoice.notes && (
              <p className="p-4 bg-black/60 rounded-xl text-xs text-gray-400 border border-neutral-800">
                <strong className="text-gray-300">Notes:</strong> {selectedInvoice.notes}
              </p>
            )}

            <div className="p-3 bg-neutral-950 rounded-xl text-[10px] text-gray-500 font-mono text-center">
              Public verification link: {window.location.origin}/verify/invoice/{selectedInvoice.id}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Records Listing */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-8">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xs">
            No digital invoices created yet. Click "Create Invoice" to issue an itemized billing record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Buyer / Client</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-gray-300 font-medium">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-4 font-mono font-black text-[#FFD700]">{inv.invoiceNumber}</td>
                    <td className="p-4 font-bold text-white">{inv.buyerName}</td>
                    <td className="p-4 text-gray-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="p-4 font-mono font-bold text-white">{inv.currency} {inv.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        inv.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1 cursor-pointer border border-neutral-700"
                      >
                        <Eye size={12} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
