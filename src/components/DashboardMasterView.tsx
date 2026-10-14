import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Building, ShieldCheck, Bot, ShoppingBag, Receipt, 
  FileText, Calendar, Handshake, FolderLock, CreditCard, Activity, Settings, 
  Plus, ArrowRight, ExternalLink, User 
} from 'lucide-react';
import { safeNotify } from '../App';

interface Props {
  currentUser: any;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

export default function DashboardMasterView({ currentUser, onNavigate, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/businesses').then(r => r.ok ? r.json() : []),
      fetch('/api/invoices').then(r => r.ok ? r.json() : []),
      fetch('/api/contracts').then(r => r.ok ? r.json() : []),
      fetch('/api/bookings').then(r => r.ok ? r.json() : []),
      fetch('/api/trade_deals').then(r => r.ok ? r.json() : []),
      fetch('/api/documents').then(r => r.ok ? r.json() : []),
      fetch('/api/audit_logs').then(r => r.ok ? r.json() : [])
    ]).then(([biz, inv, ctr, bkg, trd, doc, aud]) => {
      setBusinesses(Array.isArray(biz) ? biz : []);
      setInvoices(Array.isArray(inv) ? inv : []);
      setContracts(Array.isArray(ctr) ? ctr : []);
      setBookings(Array.isArray(bkg) ? bkg : []);
      setDeals(Array.isArray(trd) ? trd : []);
      setDocuments(Array.isArray(doc) ? doc : []);
      setAuditLogs(Array.isArray(aud) ? aud : []);
      setLoading(false);
    }).catch(err => {
      console.warn('Dashboard data fetch error', err);
      setLoading(false);
    });
  }, []);

  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.total || 0), 0);
  const paidInvoices = invoices.filter(i => i.paymentStatus === 'PAID');
  const totalCollected = paidInvoices.reduce((acc, i) => acc + (i.total || 0), 0);

  const TABS = [
    { id: 'overview', label: 'Business Overview', icon: LayoutDashboard },
    { id: 'business-id', label: 'Business ID', icon: Building, action: () => onNavigate('business-id') },
    { id: 'verification', label: 'Verification', icon: ShieldCheck, action: () => onNavigate('business-verification') },
    { id: 'ai-assistants', label: 'AI Assistants', icon: Bot, action: () => onNavigate('ai-receptionist') },
    { id: 'contracts', label: 'Contracts', icon: FileText, count: contracts.length, action: () => onNavigate('contracts') },
    { id: 'invoices', label: 'Invoices', icon: Receipt, count: invoices.length, action: () => onNavigate('invoices') },
    { id: 'bookings', label: 'Bookings', icon: Calendar, count: bookings.length, action: () => onNavigate('bookings') },
    { id: 'trade-deals', label: 'Trade Deals', icon: Handshake, count: deals.length, action: () => onNavigate('trade-assurance') },
    { id: 'documents', label: 'Document Vault', icon: FolderLock, count: documents.length, action: () => onNavigate('document-vault') },
    { id: 'payments', label: 'Pi Payments', icon: CreditCard, action: () => onNavigate('pi-checkout') },
    { id: 'activity', label: 'Audit Trail', icon: Activity, count: auditLogs.length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-white font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-950 border border-neutral-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-[#FFD700] flex items-center justify-center font-black">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">
              {currentUser?.name || 'Authorized Client'}
            </h1>
            <p className="text-xs font-mono text-[#FFD700] font-bold">
              GOYE Web3 Business Hub CRM • ID: {currentUser?.id || 'CLIENT-001'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('products')}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#FFD700] border border-yellow-500/30 rounded-xl text-xs font-black uppercase cursor-pointer"
          >
            Explore 15 Utilities
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-neutral-900 hover:bg-red-950/40 text-red-400 border border-neutral-800 rounded-xl text-xs font-black uppercase cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Real Statistics Widget Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">Registered Profiles</span>
          <span className="text-2xl font-black text-white font-mono">{businesses.length}</span>
        </div>
        <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">Active Invoices</span>
          <span className="text-2xl font-black text-[#FFD700] font-mono">{invoices.length}</span>
        </div>
        <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">Digital Contracts</span>
          <span className="text-2xl font-black text-white font-mono">{contracts.length}</span>
        </div>
        <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">Trade Milestones</span>
          <span className="text-2xl font-black text-white font-mono">{deals.length}</span>
        </div>
      </div>

      {/* Quick Launchpad to 15 Utilities */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <h2 className="text-lg font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
          <LayoutDashboard size={20} /> Your Business Infrastructure Cockpit
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold uppercase">
          {TABS.filter(t => t.id !== 'overview' && t.id !== 'activity').map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                className="p-4 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-yellow-500/40 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-black border border-neutral-800 group-hover:border-yellow-500/40 text-yellow-400">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span className="text-white block group-hover:text-[#FFD700] transition-colors">{tab.label}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {tab.count !== undefined ? `${tab.count} Active Records` : 'Launch Module'}
                    </span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-500 group-hover:text-yellow-400 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Platform Activity & Audit Stream */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
          <h2 className="text-base font-black uppercase text-white flex items-center gap-2">
            <Activity className="text-[#FFD700]" size={18} /> Platform Activity & Audit Record
          </h2>
          <span className="text-xs font-mono text-gray-500">{auditLogs.length} Events Logged</span>
        </div>

        {loading ? (
          <p className="text-xs text-gray-400 text-center py-8">Loading activity feed...</p>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            No activity yet. Every sensitive action (contract created, invoice issued, verification filed) will be recorded here.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/80 flex justify-between items-center text-xs">
                <div>
                  <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-[9px] font-mono font-black uppercase mr-2">
                    {log.action}
                  </span>
                  <span className="text-gray-300">{log.details}</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
