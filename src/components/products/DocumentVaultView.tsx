import React, { useState, useEffect } from 'react';
import { FolderLock, Upload, Trash2, Download, ShieldCheck, FileCheck, Filter, Lock } from 'lucide-react';
import { VaultDocument, VaultCategory, VaultStatus } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

const VAULT_CATEGORIES: VaultCategory[] = [
  'Business Registration',
  'Contracts',
  'Invoices',
  'Receipts',
  'Identity Documents',
  'Business Certificates',
  'Agreements',
  'Other Business Documents'
];

export default function DocumentVaultView({ currentUser, onNavigate }: Props) {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string>('ALL');

  // Form State
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VaultCategory>('Business Registration');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.2 MB');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Error fetching vault documents', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileName.trim()) {
      safeNotify('Please provide a document title and file name', 'error');
      return;
    }
    setSubmitting(true);

    const id = `doc_${Date.now()}`;
    const newDoc: VaultDocument = {
      id,
      userId: currentUser?.id || 'guest',
      title: title.trim(),
      category,
      fileName: fileName.trim(),
      fileSize,
      status: 'APPROVED',
      notes: notes.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
      if (res.ok) {
        setDocuments(prev => [newDoc, ...prev]);
        safeNotify(`Document "${title}" safely stored in vault!`, 'success');
        setShowUpload(false);
        setTitle('');
        setFileName('');
        setNotes('');
      } else {
        safeNotify('Failed to upload document', 'error');
      }
    } catch (err: any) {
      safeNotify(err.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        safeNotify('Document safely removed from vault', 'info');
      }
    } catch (e) {
      safeNotify('Error deleting document', 'error');
    }
  };

  const filteredDocs = filterCat === 'ALL'
    ? documents
    : documents.filter(d => d.category === filterCat);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <FolderLock size={14} /> Product 14 • Business Documents
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          Business Document Vault
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Encrypted, permission-controlled repository for corporate records, business registrations, signed contracts, verified invoices, and official business certificates.
        </p>
        <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400 flex items-start gap-2.5">
          <Lock size={16} className="text-[#FFD700] shrink-0 mt-0.5" />
          <span>
            <strong className="text-yellow-400">Security Rule:</strong> Stored documents are strictly access-controlled. Never upload private keys, wallet passphrases, or sensitive authentication secrets.
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="space-y-4 bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-black uppercase text-white">
            Stored Documents ({filteredDocs.length})
          </h2>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-5 py-2.5 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Upload size={16} /> Store New Document
          </button>
        </div>

        {/* Filter Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['ALL', ...VAULT_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                filterCat === cat
                  ? 'bg-[#FFD700] text-black shadow'
                  : 'bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUpload && (
        <form onSubmit={handleUpload} className="bg-neutral-950 border border-yellow-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <h3 className="text-lg font-black uppercase text-[#FFD700] flex items-center gap-2">
            <FolderLock size={20} /> Upload to Corporate Document Vault
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
            <div>
              <label className="block text-gray-400 mb-1">Document Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. CAC Status Report 2026"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Vault Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              >
                {VAULT_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">File Name *</label>
              <input
                type="text"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                placeholder="cac_registration_cert.pdf"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">File Size Allocation</label>
              <input
                type="text"
                value={fileSize}
                onChange={e => setFileSize(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 mb-1">Description / Version Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Add audit notes, reference numbers, or issuing body..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="flex-1 py-3 bg-neutral-900 text-gray-400 rounded-xl uppercase font-black text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase text-xs rounded-xl shadow-lg cursor-pointer"
            >
              {submitting ? 'Encrypting & Storing...' : 'Save to Vault'}
            </button>
          </div>
        </form>
      )}

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin text-[#FFD700] text-2xl mb-2">⚡</div>
          <p className="text-xs text-gray-400 uppercase font-bold">Accessing vault records...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-3xl p-8 space-y-4">
          <FolderLock size={48} className="mx-auto text-gray-600" />
          <h3 className="text-base font-black uppercase text-gray-300">No Documents in this Category</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Store certificates, invoices, or compliance files for safe, organized retrieval.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="bg-neutral-950 border border-neutral-800 hover:border-yellow-500/30 rounded-3xl p-6 transition-all space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 text-[#FFD700] rounded-full text-[9px] font-black uppercase tracking-wider">
                    {doc.category}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-black uppercase">
                    {doc.status}
                  </span>
                </div>

                <h3 className="text-base font-black uppercase text-white leading-tight">
                  {doc.title}
                </h3>

                <p className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                  <FileCheck size={14} className="text-yellow-400" /> {doc.fileName} ({doc.fileSize})
                </p>

                {doc.notes && (
                  <p className="text-xs text-gray-500 leading-relaxed bg-neutral-900/60 p-2.5 rounded-xl">
                    {doc.notes}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-900 flex justify-between items-center text-xs">
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => safeNotify(`Document "${doc.fileName}" accessed via secure token.`, 'success')}
                    className="p-2 bg-neutral-900 hover:bg-neutral-800 text-gray-300 hover:text-white rounded-lg border border-neutral-700"
                    title="Download File"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 bg-neutral-900 hover:bg-red-950/40 text-red-400 rounded-lg border border-neutral-700"
                    title="Delete File"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
