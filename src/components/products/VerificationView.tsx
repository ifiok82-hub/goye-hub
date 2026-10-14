import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileCheck, AlertCircle, Clock, CheckCircle2, XCircle, ArrowUpRight, Upload } from 'lucide-react';
import { BusinessVerification, VerificationLevel, VerificationStatus } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

const VERIFICATION_LEVELS: { level: VerificationLevel; desc: string }[] = [
  { level: '1. Registered Profile', desc: 'Baseline business profile registered on GOYE platform with business identifier.' },
  { level: '2. Documents Submitted', desc: 'Proof of corporate registration or founder identification submitted for review.' },
  { level: '3. GOYE Review', desc: 'Internal compliance desk examining business coordinates and document validity.' },
  { level: '4. Identity Confirmed', desc: 'Founder and business operational credentials cross-verified with platform records.' },
  { level: '5. Payment Enabled', desc: 'Full commercial settlement capability unlocked for marketplace and trade deals.' }
];

export default function VerificationView({ currentUser, onNavigate }: Props) {
  const [verifications, setVerifications] = useState<BusinessVerification[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [selectedBizId, setSelectedBizId] = useState('');
  const [documentType, setDocumentType] = useState('CAC Registration Document');
  const [documentName, setDocumentName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [vRes, bRes] = await Promise.all([
        fetch('/api/business_verifications'),
        fetch('/api/businesses')
      ]);
      if (vRes.ok) {
        const vData = await vRes.json();
        setVerifications(Array.isArray(vData) ? vData : []);
      }
      if (bRes.ok) {
        const bData = await bRes.json();
        setBusinesses(Array.isArray(bData) ? bData : []);
        if (Array.isArray(bData) && bData.length > 0 && !selectedBizId) {
          setSelectedBizId(bData[0].id);
        }
      }
    } catch (e) {
      console.warn('Error fetching verification records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId) {
      safeNotify('Please select or register a business first', 'error');
      return;
    }
    if (!documentName.trim()) {
      safeNotify('Please provide the document name or reference number', 'error');
      return;
    }
    setSubmitting(true);

    const id = `ver_${Date.now()}`;
    const newVer: BusinessVerification = {
      id,
      businessId: selectedBizId,
      userId: currentUser?.id || 'guest',
      level: '2. Documents Submitted',
      status: 'SUBMITTED',
      documentType,
      documentName: documentName.trim(),
      notes: notes.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/business_verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVer)
      });
      if (res.ok) {
        setVerifications(prev => [newVer, ...prev.filter(v => v.businessId !== selectedBizId)]);
        safeNotify('Verification proof submitted for GOYE Compliance Review!', 'success');
        setDocumentName('');
        setNotes('');
      } else {
        safeNotify('Failed to submit verification request', 'error');
      }
    } catch (err: any) {
      safeNotify(err.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-full text-xs font-black uppercase flex items-center gap-1.5"><CheckCircle2 size={13} /> Verified on GOYE</span>;
      case 'SUBMITTED':
      case 'UNDER REVIEW':
        return <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-full text-xs font-black uppercase flex items-center gap-1.5"><Clock size={13} /> Under Review</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-500/10 border border-red-500/40 text-red-400 rounded-full text-xs font-black uppercase flex items-center gap-1.5"><XCircle size={13} /> Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-neutral-800 text-gray-400 rounded-full text-xs font-black uppercase">Not Verified</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Header */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <ShieldCheck size={14} /> Product 02 • Credential Verification
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          Structured Business Verification
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Five-tier review framework to establish genuine credibility. Submit corporate credentials for review by the GOYE verification desk. Truthful, auditable, and transparent.
        </p>
        <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400 leading-relaxed">
          <strong className="text-yellow-400">Important Legal Truth:</strong> GOYE Business Verification is an internal platform integrity workflow. It does NOT claim statutory government accreditation, Corporate Affairs Commission (CAC) employee standing, or official Pi Core Team endorsement.
        </div>
      </div>

      {/* 5-Level Visual Pathway */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
        <h2 className="text-base font-black uppercase tracking-wider text-[#FFD700]">
          The 5 Verification Levels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {VERIFICATION_LEVELS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-2 relative"
            >
              <div className="w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-[#FFD700] text-xs font-black flex items-center justify-center font-mono">
                {idx + 1}
              </div>
              <h3 className="text-xs font-black uppercase text-white leading-tight">
                {item.level.split('. ')[1]}
              </h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submission Form */}
        <div className="lg:col-span-1 bg-neutral-950 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h2 className="text-base font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <Upload size={18} /> Submit Verification Proof
          </h2>

          {businesses.length === 0 ? (
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-center space-y-3">
              <AlertCircle className="mx-auto text-yellow-500" size={32} />
              <p className="text-xs text-gray-300 font-bold uppercase">No Registered Business Found</p>
              <p className="text-[11px] text-gray-500">Please register a business under Product 01 (Business ID) first.</p>
              <button
                onClick={() => onNavigate?.('business-id')}
                className="w-full py-2.5 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-xl transition-all"
              >
                Go to Business ID
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs font-bold uppercase tracking-wider">
              <div>
                <label className="block text-gray-400 mb-1">Select Business Profile *</label>
                <select
                  value={selectedBizId}
                  onChange={e => setSelectedBizId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.businessNumber || b.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Document Type *</label>
                <select
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                >
                  <option value="CAC Registration Document">CAC Registration Document</option>
                  <option value="National ID / Driver License">National ID / Driver's License (Founder)</option>
                  <option value="Utility Bill / Address Proof">Utility Bill / Address Proof</option>
                  <option value="Tax Identification Number (TIN)">Tax Identification Number (TIN)</option>
                  <option value="Official Business Domain Proof">Official Business Domain Proof</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Document Reference / Registration No. *</label>
                <input
                  type="text"
                  value={documentName}
                  onChange={e => setDocumentName(e.target.value)}
                  placeholder="e.g. RC-1849204 or BN-3829104"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Verification Notes / Clarifications</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional notes for the GOYE compliance desk..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
              >
                {submitting ? 'Submitting Documents...' : 'Submit for Verification'}
              </button>
            </form>
          )}
        </div>

        {/* Verification History & Status */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <FileCheck className="text-[#FFD700]" /> Verification Submissions & Status ({verifications.length})
          </h2>

          {loading ? (
            <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-3xl">
              <div className="animate-spin text-[#FFD700] text-2xl mb-2">⚡</div>
              <p className="text-xs text-gray-400 uppercase font-bold">Loading verification records...</p>
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-3xl p-8 space-y-4">
              <ShieldCheck size={48} className="mx-auto text-gray-600" />
              <h3 className="text-base font-black uppercase text-gray-300">No Verifications Filed Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Select your business and submit verification documents to advance from Registered Profile to Identity Confirmed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map(ver => {
                const associatedBiz = businesses.find(b => b.id === ver.businessId);
                return (
                  <div
                    key={ver.id}
                    className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-800 pb-4">
                      <div>
                        <h3 className="text-base font-black uppercase text-white">
                          {associatedBiz?.name || 'Registered Business'}
                        </h3>
                        <p className="text-xs font-mono text-[#FFD700]">
                          {associatedBiz?.businessNumber || ver.businessId}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(ver.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Verification Level</p>
                        <p className="font-black text-white">{ver.level}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Document Submitted</p>
                        <p className="font-bold text-gray-200">{ver.documentType}: <span className="font-mono text-yellow-400">{ver.documentName}</span></p>
                      </div>
                    </div>

                    {ver.notes && (
                      <p className="text-xs text-gray-400 bg-neutral-900 p-3 rounded-xl">
                        <strong className="text-gray-300">Notes:</strong> {ver.notes}
                      </p>
                    )}

                    {ver.rejectionReason && (
                      <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
                        <strong>Rejection Reason:</strong> {ver.rejectionReason}
                      </div>
                    )}

                    <div className="text-[10px] text-gray-500 font-mono pt-2 border-t border-neutral-900 flex justify-between">
                      <span>Submitted: {new Date(ver.createdAt).toLocaleDateString()}</span>
                      <span>Review Desk: GOYE Verification Office</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
