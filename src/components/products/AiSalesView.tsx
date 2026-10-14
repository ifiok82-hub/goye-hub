import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, UserPlus, Filter, CheckCircle, Clock, Send, Bot, Phone, Mail, DollarSign } from 'lucide-react';
import { SalesLead, SalesLeadStatus } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

export default function AiSalesView({ currentUser, onNavigate }: Props) {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Lead Modal / Form
  const [showAddLead, setShowAddLead] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [interest, setInterest] = useState('Website Development');
  const [budget, setBudget] = useState('₦100,000 - ₦250,000');
  const [intent, setIntent] = useState<'High' | 'Medium' | 'Low'>('High');
  const [notes, setNotes] = useState('');

  // AI Assistant Chat
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Sales Assistant. Ask me to draft product pitches, qualify lead criteria, analyze budget tiers, or recommend follow-up strategies.'
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/sales_leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Error fetching sales leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      safeNotify('Name and contact details are required', 'error');
      return;
    }

    const id = `lead_${Date.now()}`;
    const newLead: SalesLead = {
      id,
      name: name.trim(),
      contact: contact.trim(),
      interest,
      budget,
      intent,
      source: 'Direct Capture',
      status: 'NEW',
      notes: notes.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/sales_leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      if (res.ok) {
        setLeads(prev => [newLead, ...prev]);
        safeNotify('Sales lead captured into pipeline!', 'success');
        setName('');
        setContact('');
        setNotes('');
        setShowAddLead(false);
      } else {
        safeNotify('Failed to save sales lead', 'error');
      }
    } catch (err: any) {
      safeNotify(err.message || 'Network error', 'error');
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: SalesLeadStatus) => {
    const existing = leads.find(l => l.id === leadId);
    if (!existing) return;

    const updated = { ...existing, status: newStatus, updatedAt: Date.now() };
    try {
      const res = await fetch('/api/sales_leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? updated : l));
        safeNotify(`Lead moved to ${newStatus}`, 'success');
      }
    } catch (e) {
      safeNotify('Error updating status', 'error');
    }
  };

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const prompt = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { sender: 'user', text: prompt }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'sales',
          message: prompt,
          context: { leadsCount: leads.length }
        })
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setAiMessages(prev => [...prev, { sender: 'ai', text: data.text }]);
      } else {
        setAiMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `[Sales Assistant Guidance]: ${data.message || 'Configure server-side GEMINI_API_KEY to unlock real-time generative sales intelligence. Current best practice: Focus on qualifying client timeline and budget upfront.'}`
          }
        ]);
      }
    } catch (err: any) {
      setAiMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Network notice: Unable to contact AI sales server.' }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredLeads = filterStatus === 'ALL'
    ? leads
    : leads.filter(l => l.status === filterStatus);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <Sparkles size={14} /> Product 05 • AI Sales Automation
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          AI Sales Assistant & CRM Pipeline
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Product discovery, budget questions, purchase intent assessment, and unified sales lead qualification. Track deals through <span className="text-[#FFD700] font-bold">NEW → QUALIFIED → CONTACTED → CONVERTED → CLOSED</span>.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={16} className="text-[#FFD700] mr-1" />
          {['ALL', 'NEW', 'QUALIFIED', 'CONTACTED', 'CONVERTED', 'CLOSED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#FFD700] text-black shadow'
                  : 'bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAiChatOpen(!aiChatOpen)}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-yellow-500/30 text-[#FFD700] rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer"
          >
            <Bot size={14} /> {aiChatOpen ? 'Close AI Sales Bot' : 'AI Sales Advisor'}
          </button>
          <button
            onClick={() => setShowAddLead(true)}
            className="px-4 py-2.5 bg-[#FFD700] hover:bg-yellow-400 text-black rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <UserPlus size={14} /> Capture Lead
          </button>
        </div>
      </div>

      {/* AI Sales Copilot Drawer if open */}
      {aiChatOpen && (
        <div className="bg-neutral-950 border border-yellow-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-black uppercase text-[#FFD700] flex items-center gap-2">
              <Bot size={16} /> AI Sales Copilot (Pitch & Conversion Advisor)
            </h3>
            <span className="text-[10px] text-gray-400 uppercase font-mono">Gemini Driven</span>
          </div>

          <div className="h-60 overflow-y-auto space-y-3 p-4 bg-black/60 rounded-xl scrollbar-thin">
            {aiMessages.map((m, i) => (
              <div key={i} className={`p-3 rounded-xl text-xs leading-relaxed ${m.sender === 'user' ? 'bg-neutral-800 text-white ml-12' : 'bg-neutral-900 text-gray-300 mr-12 border border-neutral-800'}`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            ))}
            {aiLoading && <p className="text-xs text-yellow-400 font-mono animate-pulse">Analyzing sales strategy...</p>}
          </div>

          <form onSubmit={handleAiAsk} className="flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              placeholder="Ask for high-conversion follow-up pitch, objection handling, or pricing strategies..."
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-yellow-500 outline-none"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="px-5 py-2.5 bg-[#FFD700] text-black font-black uppercase text-xs rounded-xl cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Capture Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-yellow-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <h3 className="text-lg font-black uppercase text-white flex items-center gap-2">
              <UserPlus className="text-[#FFD700]" /> Capture Sales Prospect
            </h3>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs font-bold uppercase tracking-wider">
              <div>
                <label className="block text-gray-400 mb-1">Prospect Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Chief Adebayo Johnson"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Contact (Email or Phone/WhatsApp) *</label>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="adebayo@company.ng / +234 803 000 0000"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Service Interest</label>
                  <select
                    value={interest}
                    onChange={e => setInterest(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="Website Development">Website Development</option>
                    <option value="AI Receptionist / Bot">AI Receptionist / Bot</option>
                    <option value="CAC Business Assistance">CAC Business Assistance</option>
                    <option value="Trade Assurance Setup">Trade Assurance Setup</option>
                    <option value="Digital Growth Package">Digital Growth Package</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Purchase Intent</label>
                  <select
                    value={intent}
                    onChange={e => setIntent(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="High">High (Immediate)</option>
                    <option value="Medium">Medium (1-2 Weeks)</option>
                    <option value="Low">Low (Exploratory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Budget Allocation</label>
                <input
                  type="text"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="e.g. ₦150,000 or 150 Pi"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Sales Notes / Customer Needs</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Specific requirements, pain points, or notes..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLead(false)}
                  className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-gray-400 font-black uppercase rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase rounded-xl cursor-pointer shadow-lg"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRM Pipeline Leads Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-wider text-white">
            Captured Leads & Pipeline ({filteredLeads.length})
          </h2>
          <span className="text-xs font-mono text-gray-400 font-bold">Model: SalesLead</span>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-[#FFD700] text-2xl mb-2">⚡</div>
            <p className="text-xs text-gray-400 uppercase font-bold">Loading pipeline leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xs">
            No sales leads in this pipeline stage yet. Click "Capture Lead" to log your first prospect.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-4">Prospect</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Service Interest</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Intent</th>
                  <th className="p-4">Pipeline Status</th>
                  <th className="p-4">Move Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-gray-300 font-medium">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {lead.name}
                      <p className="text-[10px] text-gray-500 font-mono">{new Date(lead.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 font-mono text-gray-300">{lead.contact}</td>
                    <td className="p-4 text-gray-200">{lead.interest}</td>
                    <td className="p-4 font-bold text-[#FFD700]">{lead.budget}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        lead.intent === 'High' ? 'bg-emerald-500/10 text-emerald-400' :
                        lead.intent === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {lead.intent}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-black uppercase text-yellow-400">
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead.id, e.target.value as SalesLeadStatus)}
                        className="bg-neutral-900 border border-neutral-700 text-white text-[11px] font-bold rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="NEW">NEW</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="CLOSED">CLOSED</option>
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
