import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Building, Receipt, FileText, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { safeNotify } from '../App';

interface Props {
  initialType?: 'business' | 'invoice' | 'contract';
  initialId?: string;
  onNavigate?: (section: string) => void;
}

export default function PublicVerifyView({ initialType = 'business', initialId = '', onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<'business' | 'invoice' | 'contract'>(initialType);
  const [lookupId, setLookupId] = useState(initialId);
  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialType, initialId);
    }
  }, [initialId, initialType]);

  const handleSearch = async (type = activeTab, idToQuery = lookupId) => {
    if (!idToQuery.trim()) {
      safeNotify('Enter an ID or reference number to verify', 'error');
      return;
    }
    setLoading(true);
    setRecord(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/verify/${type}/${encodeURIComponent(idToQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setRecord(data);
        safeNotify('Public verification record retrieved!', 'success');
      } else {
        const err = await res.json();
        safeNotify(err.message || `No record found in ${type} registry`, 'error');
      }
    } catch (e) {
      safeNotify('Error connecting to verification server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 text-white font-sans">
      {/* Verification Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-yellow-500/10 border border-yellow-500/30 text-[#FFD700] rounded-2xl flex items-center justify-center mx-auto mb-2">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          GOYE Public Verification Portal
        </h1>
        <p className="text-xs md:text-sm text-gray-400 max-w-xl mx-auto">
          Verify corporate digital profiles, invoice settlement states, and executed agreements directly against the authoritative GOYE platform registry.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        {[
          { id: 'business', label: 'Business Profile', icon: Building },
          { id: 'invoice', label: 'Invoice Status', icon: Receipt },
          { id: 'contract', label: 'Contract Agreement', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setRecord(null);
                setSearched(false);
              }}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FFD700] text-black shadow-lg'
                  : 'bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input Box */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
            <input
              type="text"
              value={lookupId}
              onChange={e => setLookupId(e.target.value)}
              placeholder={
                activeTab === 'business' ? 'Enter GOYE-BIZ-XXXXXX or business ID...' :
                activeTab === 'invoice' ? 'Enter Invoice Number (e.g. INV-XXXXXX)...' :
                'Enter Contract Reference (e.g. GOYE-CTR-XXXXXX)...'
              }
              className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:border-yellow-500 outline-none uppercase font-mono font-bold"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-8 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-2xl transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Record'}
          </button>
        </div>
      </div>

      {/* Verification Result Display */}
      {record && (
        <div className="bg-gradient-to-b from-neutral-950 to-black border border-yellow-500/40 rounded-3xl p-8 md:p-10 space-y-6 shadow-2xl animate-fadeIn">
          {/* Business Result */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-5">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white">{record.businessName}</h3>
                  <p className="text-xs font-mono text-[#FFD700] font-black">{record.businessNumber}</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {record.verificationStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-neutral-900 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Industry Category</span>
                  <span className="font-bold text-gray-200">{record.category}</span>
                </div>
                <div className="p-4 bg-neutral-900 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Operating Jurisdiction</span>
                  <span className="font-bold text-gray-200">{record.country}</span>
                </div>
                <div className="p-4 bg-neutral-900 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Verification Level</span>
                  <span className="font-bold text-[#FFD700]">{record.verificationLevel}</span>
                </div>
                <div className="p-4 bg-neutral-900 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Last Verified Date</span>
                  <span className="font-mono text-gray-300">{new Date(record.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>

              {record.description && (
                <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 text-xs text-gray-300 leading-relaxed">
                  {record.description}
                </div>
              )}

              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-xs text-gray-400 font-mono">
                {record.disclaimer}
              </div>
            </div>
          )}

          {/* Invoice Result */}
          {activeTab === 'invoice' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-5">
                <div>
                  <h3 className="text-xl font-black uppercase text-white">Invoice {record.invoiceNumber}</h3>
                  <p className="text-xs text-gray-400">Issued: {new Date(record.issuedDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase border ${
                  record.paymentStatus === 'PAID'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}>
                  {record.paymentStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-neutral-900 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Seller</span>
                  <span className="font-bold text-white">{record.sellerName}</span>
                </div>
                <div className="p-4 bg-neutral-900 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Buyer</span>
                  <span className="font-bold text-white">{record.buyerName}</span>
                </div>
                <div className="p-4 bg-neutral-900 rounded-xl col-span-2">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Amount</span>
                  <span className="text-xl font-mono font-black text-[#FFD700]">{record.currency} {record.total?.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-xs text-gray-400 font-mono">
                {record.disclaimer}
              </div>
            </div>
          )}

          {/* Contract Result */}
          {activeTab === 'contract' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-5">
                <div>
                  <h3 className="text-xl font-black uppercase text-white">{record.title}</h3>
                  <p className="text-xs font-mono text-[#FFD700]">{record.contractId}</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                  {record.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-neutral-900 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Party A</span>
                  <span className="font-bold text-white">{record.partyA}</span>
                </div>
                <div className="p-4 bg-neutral-900 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Party B</span>
                  <span className="font-bold text-white">{record.partyB}</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-xs text-gray-400 font-mono">
                {record.disclaimer}
              </div>
            </div>
          )}
        </div>
      )}

      {searched && !record && !loading && (
        <div className="text-center py-16 bg-neutral-950 border border-neutral-800 rounded-3xl p-8 space-y-3">
          <AlertCircle size={40} className="mx-auto text-amber-500" />
          <h3 className="text-base font-black uppercase text-white">Record Not Found</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            No official record exists with identifier "{lookupId}" in the {activeTab} registry. Verify that the reference was copied accurately.
          </p>
        </div>
      )}
    </div>
  );
}
