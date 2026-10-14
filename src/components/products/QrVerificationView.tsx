import React, { useState, useEffect } from 'react';
import { QrCode, ExternalLink, Copy, Check, ShieldCheck, Building, Search, Download } from 'lucide-react';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

export default function QrVerificationView({ currentUser, onNavigate }: Props) {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<any | null>(null);
  const [lookupId, setLookupId] = useState('');
  const [publicData, setPublicData] = useState<any | null>(null);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/businesses')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBusinesses(data);
          setSelectedBiz(data[0]);
          setLookupId(data[0].businessNumber || data[0].id);
        }
      })
      .catch(err => console.warn('Businesses load error', err));
  }, []);

  const handleLookup = async (idToSearch?: string) => {
    const target = idToSearch || lookupId;
    if (!target.trim()) {
      safeNotify('Enter a Business ID or Number to verify', 'error');
      return;
    }
    setLoadingLookup(true);
    setPublicData(null);
    try {
      const res = await fetch(`/api/verify/business/${encodeURIComponent(target.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setPublicData(data);
        safeNotify('Public verification record retrieved!', 'success');
      } else {
        const err = await res.json();
        safeNotify(err.message || 'No verification record found for this identifier', 'error');
      }
    } catch (e: any) {
      safeNotify('Error reaching verification server', 'error');
    } finally {
      setLoadingLookup(false);
    }
  };

  const getQrUrl = (text: string) => {
    const encoded = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encoded}&color=000000&bgcolor=FFD700`;
  };

  const verifyUrl = selectedBiz
    ? `${window.location.origin}/verify/business/${selectedBiz.businessNumber || selectedBiz.id}`
    : `${window.location.origin}/verify/business/DEMO`;

  const copyVerifyUrl = () => {
    navigator.clipboard?.writeText(verifyUrl);
    setCopied(true);
    safeNotify('Verification URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <QrCode size={14} /> Product 03 • Public Transparency
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          QR Business Verification
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Generate an instant public QR code for invoices, contracts, shopfronts, and business cards. Anyone scanning the QR code accesses a read-only platform verification certificate proving your corporate credentials on GOYE.
        </p>
        <div className="p-3 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400">
          <strong className="text-yellow-400">Disclaimer:</strong> GOYE platform verification status — not a government certification.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Generator Box */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <QrCode size={20} /> Generate Business Verification QR
          </h2>

          {businesses.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Building size={40} className="mx-auto text-gray-600" />
              <p className="text-xs text-gray-400 uppercase font-bold">No Business Profile Registered</p>
              <button
                onClick={() => onNavigate?.('business-id')}
                className="px-4 py-2 bg-[#FFD700] text-black font-black uppercase text-xs rounded-xl"
              >
                Register Business First
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Select Active Business</label>
                <select
                  value={selectedBiz?.id || ''}
                  onChange={e => {
                    const found = businesses.find(b => b.id === e.target.value);
                    if (found) {
                      setSelectedBiz(found);
                      setLookupId(found.businessNumber || found.id);
                    }
                  }}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none text-xs font-bold uppercase"
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.businessNumber || b.id})
                    </option>
                  ))}
                </select>
              </div>

              {selectedBiz && (
                <div className="flex flex-col items-center justify-center p-8 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-4">
                  <div className="p-3 bg-[#FFD700] rounded-2xl shadow-xl">
                    <img
                      src={getQrUrl(verifyUrl)}
                      alt="Business QR Code"
                      className="w-48 h-48 rounded-lg"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black uppercase text-white">{selectedBiz.name}</p>
                    <p className="text-xs font-mono font-bold text-[#FFD700]">{selectedBiz.businessNumber}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Platform Verification Endpoint</p>
                  </div>

                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={copyVerifyUrl}
                      className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy Public URL'}
                    </button>
                    <button
                      onClick={() => handleLookup(selectedBiz.businessNumber || selectedBiz.id)}
                      className="flex-1 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Search size={14} /> Test Verification
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Public Verification Simulator & Lookup */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <ShieldCheck size={20} /> Public Certificate Inspector
          </h2>
          <p className="text-xs text-gray-400">
            Simulate what clients see when scanning your QR code or checking your Business ID.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={lookupId}
              onChange={e => setLookupId(e.target.value)}
              placeholder="Enter GOYE-BIZ-XXXXXX or ID..."
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white text-xs font-mono font-bold focus:border-yellow-500 outline-none"
            />
            <button
              onClick={() => handleLookup()}
              disabled={loadingLookup}
              className="px-5 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-xl cursor-pointer"
            >
              {loadingLookup ? 'Checking...' : 'Inspect'}
            </button>
          </div>

          {publicData ? (
            <div className="p-6 bg-gradient-to-b from-neutral-900 to-black border border-yellow-500/30 rounded-2xl space-y-4 shadow-xl">
              <div className="flex justify-between items-start gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-lg font-black uppercase text-white">{publicData.businessName}</h3>
                  <p className="text-xs font-mono text-[#FFD700] font-black">{publicData.businessNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                  publicData.verified
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}>
                  {publicData.verificationStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Category</p>
                  <p className="text-gray-200 font-bold">{publicData.category}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Jurisdiction</p>
                  <p className="text-gray-200 font-bold">{publicData.country}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Verification Tier</p>
                  <p className="text-[#FFD700] font-bold">{publicData.verificationLevel}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Record Timestamp</p>
                  <p className="text-gray-300 font-mono text-[11px]">{new Date(publicData.lastUpdated).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-[10px] text-gray-400 font-mono">
                {publicData.disclaimer}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl text-gray-500 text-xs">
              Search a Business ID above or click "Test Verification" on the left to inspect the live public certificate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
