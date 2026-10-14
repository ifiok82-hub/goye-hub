import React, { useState, useEffect } from 'react';
import { Handshake, Plus, CheckCircle2, AlertTriangle, ArrowRight, Shield, FileText, Receipt, Check, Lock } from 'lucide-react';
import { TradeDeal, TradeDealStatus } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

const TRADE_STEPS = [
  '1. Deal Created',
  '2. Parties Added',
  '3. Contract Attached',
  '4. Invoice Created',
  '5. Payment Status',
  '6. Delivery/Performance',
  '7. Confirmation',
  '8. Dispute if Necessary',
  '9. Resolution',
  '10. Completed'
];

export default function TradeAssuranceView({ currentUser, onNavigate }: Props) {
  const [deals, setDeals] = useState<TradeDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<TradeDeal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [sellerName, setSellerName] = useState(currentUser?.name || 'GOYE Certified Merchant');
  const [sellerEmail, setSellerEmail] = useState(currentUser?.email || 'merchant@goye-hub.com');
  const [dealValue, setDealValue] = useState(250000);
  const [currency, setCurrency] = useState('NGN');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/trade_deals');
      if (res.ok) {
        const data = await res.json();
        setDeals(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Error fetching trade deals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !buyerName.trim()) {
      safeNotify('Deal title and counterparty name are required', 'error');
      return;
    }
    setSubmitting(true);

    const dealNumber = `GOYE-TRD-${Date.now().toString().slice(-6)}`;
    const id = `trd_${Date.now()}`;

    const newDeal: TradeDeal = {
      id,
      dealNumber,
      title: title.trim(),
      creatorId: currentUser?.id || 'guest',
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim(),
      sellerName: sellerName.trim(),
      sellerEmail: sellerEmail.trim(),
      description: description.trim(),
      dealValue: Number(dealValue) || 0,
      currency,
      currentStep: 2, // Deal Created + Parties Added
      status: 'ACTIVE',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/trade_deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal)
      });
      if (res.ok) {
        setDeals(prev => [newDeal, ...prev]);
        setSelectedDeal(newDeal);
        safeNotify(`Trade Assurance Deal ${dealNumber} initialized!`, 'success');
        setShowModal(false);
        setTitle('');
        setBuyerName('');
      } else {
        safeNotify('Failed to create trade deal', 'error');
      }
    } catch (err: any) {
      safeNotify(err.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const advanceStep = async (dealId: string, nextStep: number, nextStatus?: TradeDealStatus) => {
    const existing = deals.find(d => d.id === dealId);
    if (!existing) return;

    const updated: TradeDeal = {
      ...existing,
      currentStep: Math.min(10, nextStep),
      status: nextStatus || (nextStep >= 10 ? 'COMPLETED' : existing.status),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/trade_deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setDeals(prev => prev.map(d => d.id === dealId ? updated : d));
        if (selectedDeal?.id === dealId) setSelectedDeal(updated);
        safeNotify(`Deal advanced to step ${nextStep}: ${TRADE_STEPS[nextStep - 1]}`, 'success');
      }
    } catch (e) {
      safeNotify('Error updating trade deal', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <Handshake size={14} /> Product 13 • Non-Custodial Trade Workflow
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          GOYE Trade Assurance
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Structured 10-stage commercial milestone tracking. Bridges contract agreement, verified invoice status, delivery inspection, and mutual sign-off for high-value business deals.
        </p>
        <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400 space-y-1 leading-relaxed">
          <strong className="text-yellow-400 block">Critical Non-Custodial Regulatory Statement:</strong>
          <p>
            GOYE Trade Assurance is a business workflow and documentation platform. It is not a bank, licensed financial institution, or custodial escrow service. GOYE does not hold customer funds unless a separately licensed and legally compliant service is actually integrated.
          </p>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-black uppercase text-white">
            Active Trade Milestone Deals ({deals.length})
          </h2>
          <p className="text-[11px] text-gray-400 font-mono">10 Sequential Verification Milestones</p>
        </div>
        <button
          onClick={() => setShowModal(!showModal)}
          className="px-5 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} /> Create Trade Deal
        </button>
      </div>

      {/* New Deal Modal */}
      {showModal && (
        <form onSubmit={handleCreateDeal} className="bg-neutral-950 border border-yellow-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="text-lg font-black uppercase text-[#FFD700] flex items-center gap-2">
              <Handshake size={20} /> Initialize New Trade Deal
            </h3>
            <span className="text-xs font-mono text-gray-400">Non-Custodial Milestone Record</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
            <div className="md:col-span-2">
              <label className="block text-gray-400 mb-1">Commercial Deal Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Bulk Computer Hardware Supply & Setup Agreement"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                required
              />
            </div>

            <div className="p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800 space-y-3">
              <p className="text-yellow-400 text-[10px] font-black">Seller / Contractor</p>
              <input
                type="text"
                value={sellerName}
                onChange={e => setSellerName(e.target.value)}
                placeholder="Seller Name"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white"
                required
              />
              <input
                type="email"
                value={sellerEmail}
                onChange={e => setSellerEmail(e.target.value)}
                placeholder="Seller Email"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800 space-y-3">
              <p className="text-yellow-400 text-[10px] font-black">Buyer / Client</p>
              <input
                type="text"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                placeholder="Buyer Name *"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white"
                required
              />
              <input
                type="email"
                value={buyerEmail}
                onChange={e => setBuyerEmail(e.target.value)}
                placeholder="Buyer Email"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Deal Consideration</label>
              <input
                type="number"
                value={dealValue}
                onChange={e => setDealValue(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              >
                <option value="NGN">NGN (₦)</option>
                <option value="Pi">Pi (Testnet / Mainnet)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 mb-1">Scope & Delivery Terms</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Specify delivery conditions, acceptance inspection window, and warranty..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-3 bg-neutral-900 text-gray-400 rounded-xl uppercase font-black text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase text-xs rounded-xl shadow-lg cursor-pointer"
            >
              {submitting ? 'Initializing Deal...' : 'Initialize Trade Deal'}
            </button>
          </div>
        </form>
      )}

      {/* Selected Deal Interactive 10-Step Visualizer */}
      {selectedDeal && (
        <div className="bg-neutral-950 border border-yellow-500/40 rounded-3xl p-6 md:p-10 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-xs font-mono text-yellow-400 font-bold">{selectedDeal.dealNumber}</span>
              <h3 className="text-2xl font-black uppercase text-white">{selectedDeal.title}</h3>
              <p className="text-xs text-gray-400">
                Buyer: <span className="text-white font-bold">{selectedDeal.buyerName}</span> • Seller: <span className="text-white font-bold">{selectedDeal.sellerName}</span> • Value: <span className="text-yellow-400 font-mono font-black">{selectedDeal.currency} {selectedDeal.dealValue.toLocaleString()}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full text-xs font-black uppercase">
                {selectedDeal.status}
              </span>
              <button
                onClick={() => setSelectedDeal(null)}
                className="px-3 py-1.5 bg-neutral-800 text-gray-400 hover:text-white rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>

          {/* 10 Step Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold uppercase">Milestone Progression</span>
              <span className="font-mono text-[#FFD700] font-black">Step {selectedDeal.currentStep} of 10</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TRADE_STEPS.map((st, idx) => {
                const stepNum = idx + 1;
                const isPassed = stepNum < selectedDeal.currentStep;
                const isCurrent = stepNum === selectedDeal.currentStep;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-[11px] font-bold uppercase transition-all ${
                      isPassed
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                        : isCurrent
                        ? 'bg-yellow-500/20 border-yellow-500 text-[#FFD700] shadow'
                        : 'bg-neutral-900 border-neutral-800 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {isPassed ? <Check size={12} /> : <span className="font-mono text-[10px]">{stepNum}.</span>}
                      <span className="truncate">{st.split('. ')[1]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls to Advance Milestone */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
            <div>
              <p className="text-xs font-bold text-gray-300">Current Milestone Requirement:</p>
              <p className="text-xs text-yellow-400 font-mono font-black">{TRADE_STEPS[selectedDeal.currentStep - 1]}</p>
            </div>

            <div className="flex gap-2">
              {selectedDeal.currentStep < 10 && (
                <button
                  onClick={() => advanceStep(selectedDeal.id, selectedDeal.currentStep + 1)}
                  className="px-5 py-2.5 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow"
                >
                  Confirm & Advance to Step {selectedDeal.currentStep + 1} <ArrowRight size={14} />
                </button>
              )}
              {selectedDeal.currentStep >= 10 && (
                <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Deal Fully Executed & Completed
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deals Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-8">Loading trade deals...</p>
        ) : deals.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xs">
            No active trade milestone deals. Click "Create Trade Deal" to record a commercial transaction agreement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-4">Deal Ref</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Counterparty</th>
                  <th className="p-4">Consideration</th>
                  <th className="p-4">Current Step</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-gray-300 font-medium">
                {deals.map(deal => (
                  <tr key={deal.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-4 font-mono font-black text-[#FFD700]">{deal.dealNumber}</td>
                    <td className="p-4 font-bold text-white">{deal.title}</td>
                    <td className="p-4">{deal.buyerName}</td>
                    <td className="p-4 font-mono font-bold text-white">{deal.currency} {deal.dealValue.toLocaleString()}</td>
                    <td className="p-4 font-mono text-yellow-400 font-bold">Step {deal.currentStep}/10</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-[10px] font-black uppercase text-yellow-400">
                        {deal.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedDeal(deal)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase cursor-pointer border border-neutral-700"
                      >
                        Inspect Deal
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
