import React, { useState, useEffect } from 'react';
import { FileText, Plus, Check, Printer, Download, Eye, Shield, Send, ArrowRight } from 'lucide-react';
import { ContractDocument, ContractStatus } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

const TEMPLATES = [
  'Service Agreement',
  'Website Development Agreement',
  'AI Development Agreement',
  'Digital Marketing Agreement',
  'Consultancy Agreement',
  'General Business Agreement'
] as const;

export default function ContractBuilderView({ currentUser, onNavigate }: Props) {
  const [contracts, setContracts] = useState<ContractDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractDocument | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [templateType, setTemplateType] = useState<typeof TEMPLATES[number]>('Service Agreement');
  const [partyAName, setPartyAName] = useState(currentUser?.name || 'GOYE Business Partner');
  const [partyAEmail, setPartyAEmail] = useState(currentUser?.email || 'partner@business.com');
  const [partyBName, setPartyBName] = useState('');
  const [partyBEmail, setPartyBEmail] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [timeline, setTimeline] = useState('14 Business Days');
  const [price, setPrice] = useState(150000);
  const [currency, setCurrency] = useState('NGN');
  const [paymentTerms, setPaymentTerms] = useState('50% mobilization upfront, 50% upon verified milestone completion.');
  const [submitting, setSubmitting] = useState(false);

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/contracts');
      if (res.ok) {
        const data = await res.json();
        setContracts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Error fetching contracts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !partyBName.trim()) {
      safeNotify('Contract title and client/party B name are required', 'error');
      return;
    }
    setSubmitting(true);

    const contractNumber = `GOYE-CTR-${Date.now().toString().slice(-6)}`;
    const id = `ctr_${Date.now()}`;

    const newDoc: ContractDocument = {
      id,
      contractNumber,
      title: title.trim(),
      templateType,
      creatorId: currentUser?.id || 'guest',
      partyA: {
        name: partyAName.trim(),
        email: partyAEmail.trim(),
        role: 'Service Provider / Contractor',
        signed: true,
        signedAt: Date.now()
      },
      partyB: {
        name: partyBName.trim(),
        email: partyBEmail.trim(),
        role: 'Client / Beneficiary',
        signed: false
      },
      scopeOfWork: scopeOfWork.trim(),
      deliverables: deliverables.trim(),
      timeline,
      price: Number(price) || 0,
      currency,
      paymentTerms,
      terminationClause: 'Either party may terminate this agreement with 7 calendar days written notice upon settlement of accrued milestone obligations.',
      status: 'DRAFT',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
      if (res.ok) {
        setContracts(prev => [newDoc, ...prev]);
        setSelectedContract(newDoc);
        safeNotify(`Contract ${contractNumber} drafted successfully!`, 'success');
        setShowBuilder(false);
        setTitle('');
        setPartyBName('');
        setScopeOfWork('');
      } else {
        safeNotify('Failed to save contract document', 'error');
      }
    } catch (err: any) {
      safeNotify(err.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ctrId: string, status: ContractStatus) => {
    const existing = contracts.find(c => c.id === ctrId);
    if (!existing) return;
    const updated = { ...existing, status, updatedAt: Date.now() };

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setContracts(prev => prev.map(c => c.id === ctrId ? updated : c));
        if (selectedContract?.id === ctrId) setSelectedContract(updated);
        safeNotify(`Contract status updated to ${status}`, 'success');
      }
    } catch (e) {
      safeNotify('Error updating status', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <FileText size={14} /> Product 08 • Business Documents
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          Digital Contract Builder
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Standardized legal templates for digital agreements. Draft, track, review, and print Service Agreements, Software Development Contracts, AI Agreements, and Consultancies with structured execution milestones.
        </p>
        <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400 leading-relaxed">
          <strong className="text-yellow-400">Statutory Legal Notice:</strong> GOYE provides document templates and business workflow tools. This is not legal advice. Users should obtain professional legal advice where appropriate.
        </div>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-black uppercase text-white">
            Contracts Repository ({contracts.length})
          </h2>
          <p className="text-[11px] text-gray-400 font-mono">Status Lifecycle: DRAFT → SENT → SIGNED → ACTIVE → COMPLETED</p>
        </div>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="px-5 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} /> Draft New Contract
        </button>
      </div>

      {/* Contract Builder Form */}
      {showBuilder && (
        <div className="bg-neutral-950 border border-yellow-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="text-lg font-black uppercase text-[#FFD700] flex items-center gap-2">
              <FileText size={20} /> Contract Generation Studio
            </h3>
            <span className="text-xs font-mono text-gray-400">Template Engine</span>
          </div>

          <form onSubmit={handleCreateContract} className="space-y-5 text-xs font-bold uppercase tracking-wider">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Contract Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Enterprise Website & AI Assistant Agreement"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Agreement Template Type</label>
                <select
                  value={templateType}
                  onChange={e => setTemplateType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                >
                  {TEMPLATES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              <div className="space-y-3">
                <p className="text-yellow-400 text-[10px] font-black">Party A (Service Provider / You)</p>
                <input
                  type="text"
                  value={partyAName}
                  onChange={e => setPartyAName(e.target.value)}
                  placeholder="Company / Provider Name"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white"
                  required
                />
                <input
                  type="email"
                  value={partyAEmail}
                  onChange={e => setPartyAEmail(e.target.value)}
                  placeholder="Provider Email"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-3">
                <p className="text-yellow-400 text-[10px] font-black">Party B (Client / Counterparty)</p>
                <input
                  type="text"
                  value={partyBName}
                  onChange={e => setPartyBName(e.target.value)}
                  placeholder="Client Business / Individual Name *"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white"
                  required
                />
                <input
                  type="email"
                  value={partyBEmail}
                  onChange={e => setPartyBEmail(e.target.value)}
                  placeholder="Client Email Address"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Scope of Work & Technical Specifications *</label>
              <textarea
                value={scopeOfWork}
                onChange={e => setScopeOfWork(e.target.value)}
                rows={3}
                placeholder="Detailed scope: e.g. Development of responsive multi-page web application, integration of AI WhatsApp bot, deployment to Vercel."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Contract Fee</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
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

              <div>
                <label className="block text-gray-400 mb-1">Delivery Timeline</label>
                <input
                  type="text"
                  value={timeline}
                  onChange={e => setTimeline(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Payment & Milestone Terms</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="flex-1 py-3.5 bg-neutral-900 text-gray-400 rounded-xl uppercase font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 bg-[#FFD700] hover:bg-yellow-400 text-black rounded-xl uppercase font-black shadow-lg cursor-pointer"
              >
                {submitting ? 'Generating Contract...' : 'Create Contract Document'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contract Viewer Modal / Section */}
      {selectedContract && (
        <div className="bg-neutral-950 border border-yellow-500/40 rounded-3xl p-6 md:p-10 space-y-6 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-yellow-400 uppercase font-black">{selectedContract.contractNumber}</span>
              <h3 className="text-xl font-black uppercase text-white">{selectedContract.title}</h3>
              <p className="text-xs text-gray-400">{selectedContract.templateType}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-gray-300 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5"
              >
                <Printer size={14} /> Print / PDF
              </button>
              <button
                onClick={() => setSelectedContract(null)}
                className="px-3 py-2 bg-neutral-800 text-gray-400 hover:text-white rounded-xl text-xs"
              >
                Close View
              </button>
            </div>
          </div>

          {/* Legal Document Sheet */}
          <div className="p-8 bg-neutral-900/90 border border-neutral-800 rounded-2xl text-xs leading-relaxed space-y-5 text-gray-300 font-sans">
            <div className="text-center border-b border-neutral-800 pb-4">
              <h4 className="text-base font-black uppercase text-[#FFD700]">{selectedContract.templateType}</h4>
              <p className="text-[10px] font-mono text-gray-500">REF: {selectedContract.contractNumber} • EXECUTED VIA GOYE HUB</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Party A (Contractor)</p>
                <p className="font-bold text-white">{selectedContract.partyA.name}</p>
                <p className="text-[11px] text-gray-400">{selectedContract.partyA.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Party B (Client)</p>
                <p className="font-bold text-white">{selectedContract.partyB.name}</p>
                <p className="text-[11px] text-gray-400">{selectedContract.partyB.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-yellow-400 uppercase font-bold">1. Scope of Work</p>
              <p className="p-3 bg-black/60 rounded-xl border border-neutral-800 whitespace-pre-wrap">{selectedContract.scopeOfWork}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-yellow-400 uppercase font-bold">2. Consideration & Currency</p>
                <p className="font-bold text-white">{selectedContract.currency} {selectedContract.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-yellow-400 uppercase font-bold">3. Performance Schedule</p>
                <p className="font-bold text-white">{selectedContract.timeline}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-yellow-400 uppercase font-bold">4. Payment Terms</p>
              <p>{selectedContract.paymentTerms}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-yellow-400 uppercase font-bold">5. Termination & Dispute Resolution</p>
              <p>{selectedContract.terminationClause}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
              <div className="p-3 bg-neutral-950 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Party A Execution</p>
                <p className="text-emerald-400 font-bold flex items-center gap-1 mt-1"><Check size={12} /> Digitally Signed</p>
              </div>
              <div className="p-3 bg-neutral-950 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Party B Execution</p>
                {selectedContract.partyB.signed ? (
                  <p className="text-emerald-400 font-bold flex items-center gap-1 mt-1"><Check size={12} /> Signed</p>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedContract.id, 'SIGNED')}
                    className="mt-1 px-3 py-1 bg-yellow-500/20 text-[#FFD700] border border-yellow-500/40 rounded text-[10px] font-black uppercase cursor-pointer"
                  >
                    Counter-Sign as Client
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Listing Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-8">Loading agreements...</p>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xs">
            No digital contracts created yet. Click "Draft New Contract" to generate your first agreement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Client (Party B)</th>
                  <th className="p-4">Consideration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-gray-300 font-medium">
                {contracts.map(ctr => (
                  <tr key={ctr.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-4 font-mono text-[#FFD700] font-black">{ctr.contractNumber}</td>
                    <td className="p-4 font-bold text-white">{ctr.title}</td>
                    <td className="p-4">{ctr.partyB.name}</td>
                    <td className="p-4 font-mono font-bold">{ctr.currency} {ctr.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded text-[10px] font-black uppercase text-yellow-400">
                        {ctr.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedContract(ctr)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1 cursor-pointer border border-neutral-700"
                      >
                        <Eye size={12} /> Inspect
                      </button>
                      <select
                        value={ctr.status}
                        onChange={e => handleUpdateStatus(ctr.id, e.target.value as ContractStatus)}
                        className="bg-neutral-900 border border-neutral-700 text-white text-[10px] font-bold rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="SENT">SENT</option>
                        <option value="SIGNED">SIGNED</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
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
