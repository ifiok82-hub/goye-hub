import React, { useState, useEffect } from 'react';
import { Headphones, Send, Bot, AlertTriangle, PlusCircle, CheckCircle, Clock, ShieldAlert, MessageSquare } from 'lucide-react';
import { SupportTicketRecord, SupportTicketStatus, SupportTicketPriority } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

export default function AiSupportView({ currentUser, onNavigate }: Props) {
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New ticket state
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Service Delivery');
  const [priority, setPriority] = useState<SupportTicketPriority>('NORMAL');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI Troubleshooting Chat
  const [aiInput, setAiInput] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Customer Support Agent. State your issue, inquiry, or service ticket reference, and I will assist you with troubleshooting or file an escalated support ticket.'
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support_tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Error loading support tickets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      safeNotify('Please provide a subject and message for the support ticket', 'error');
      return;
    }
    setSubmitting(true);

    const id = `tkt_${Date.now()}`;
    const newTicket: SupportTicketRecord = {
      id,
      userId: currentUser?.id || 'guest',
      subject: subject.trim(),
      category,
      message: message.trim(),
      status: 'OPEN',
      priority,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/support_tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        setTickets(prev => [newTicket, ...prev]);
        safeNotify(`Support ticket created: ${id}`, 'success');
        setSubject('');
        setMessage('');
        setShowNewTicket(false);
      } else {
        safeNotify('Failed to submit ticket', 'error');
      }
    } catch (err: any) {
      safeNotify(err.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiTroubleshoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const query = aiInput.trim();
    setAiInput('');
    setAiChat(prev => [...prev, { sender: 'user', text: query }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'support',
          message: query,
          context: {
            userEmail: currentUser?.email,
            activeTickets: tickets.length
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setAiChat(prev => [...prev, { sender: 'ai', text: data.text }]);
      } else {
        setAiChat(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `[Support Triage]: ${data.message || 'AI support server configuration required. For immediate assistance with ongoing CAC, Website, or Pi services, please use the "File Official Support Ticket" form.'}`
          }
        ]);
      }
    } catch (e) {
      setAiChat(prev => [
        ...prev,
        { sender: 'ai', text: 'Network notice: Unable to contact support AI service.' }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <Headphones size={14} /> Product 06 • AI Customer Support
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          AI Customer Support Agent & Ticket Desk
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Automated customer service triage, instant troubleshooting for digital utilities, order tracking, and formalized ticket filing across <span className="text-[#FFD700] font-bold">LOW, NORMAL, HIGH, and URGENT</span> priority tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive AI Troubleshooting Chat */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl flex flex-col h-[520px]">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h2 className="text-base font-black uppercase text-[#FFD700] flex items-center gap-2">
              <Bot size={18} /> Live AI Support Assistant
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">● 24/7 ONLINE</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-black/60 rounded-2xl scrollbar-thin">
            {aiChat.map((m, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-md ${
                  m.sender === 'user'
                    ? 'bg-neutral-800 text-white ml-auto border border-neutral-700'
                    : 'bg-neutral-900 text-gray-300 mr-auto border border-neutral-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            ))}
            {aiLoading && (
              <p className="text-xs text-yellow-400 font-mono animate-pulse">
                AI Support Agent is preparing instructions...
              </p>
            )}
          </div>

          <form onSubmit={handleAiTroubleshoot} className="flex gap-2 pt-2">
            <input
              type="text"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              placeholder="Describe your issue or ask for troubleshooting..."
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-xs text-white focus:border-yellow-500 outline-none"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="px-5 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase text-xs rounded-xl cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Support Ticket Filing & List */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-black uppercase text-white flex items-center gap-2">
              <MessageSquare className="text-[#FFD700]" size={18} /> Official Support Tickets ({tickets.length})
            </h2>
            <button
              onClick={() => setShowNewTicket(!showNewTicket)}
              className="px-4 py-2 bg-[#FFD700] hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
            >
              <PlusCircle size={14} /> File Ticket
            </button>
          </div>

          {showNewTicket && (
            <form onSubmit={handleCreateTicket} className="p-5 bg-neutral-900 border border-yellow-500/30 rounded-2xl space-y-4 text-xs font-bold uppercase tracking-wider">
              <h3 className="text-xs font-black uppercase text-[#FFD700]">File Formal Support Inquiry</h3>
              <div>
                <label className="block text-gray-400 mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. CAC Documentation Review Question"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="CAC Services">CAC Services</option>
                    <option value="Website Development">Website Development</option>
                    <option value="AI Bots & Assistants">AI Bots & Assistants</option>
                    <option value="Pi Payment / Checkout">Pi Payment / Checkout</option>
                    <option value="Trade Assurance">Trade Assurance</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as SupportTicketPriority)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Detailed Message *</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Provide all relevant details and order references..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-white focus:border-yellow-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-gray-400 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#FFD700] text-black font-black uppercase rounded-xl cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          )}

          {/* Ticket Records */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto scrollbar-thin">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-8">Loading ticket records...</p>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                No support tickets filed yet. All systems functioning normally.
              </div>
            ) : (
              tickets.map(tkt => (
                <div key={tkt.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase text-white">{tkt.subject}</h4>
                      <p className="text-[10px] font-mono text-gray-400">{tkt.id} • {tkt.category}</p>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        tkt.priority === 'URGENT' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        tkt.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-neutral-800 text-gray-400'
                      }`}>
                        {tkt.priority}
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/30">
                        {tkt.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{tkt.message}</p>
                  <p className="text-[9px] text-gray-500 font-mono text-right">{new Date(tkt.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
