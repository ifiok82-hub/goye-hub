import React, { useState, useEffect } from 'react';
import { Bot, Send, Settings, Sparkles, AlertCircle, MessageSquare, Clock, UserCheck, Shield } from 'lucide-react';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

export default function AiReceptionistView({ currentUser, onNavigate }: Props) {
  // Knowledge Base State
  const [businessName, setBusinessName] = useState('GOYE Web3 Business Hub');
  const [openingHours, setOpeningHours] = useState('Monday - Friday, 8:00 AM - 6:00 PM (WAT)');
  const [faqSummary, setFaqSummary] = useState('We provide Business Identity, CAC Assistance, Website Development, AI Automation, and Non-Custodial Trade Assurance.');
  const [escalationContact, setEscalationContact] = useState('goyedagosmessenterprise@gmail.com');
  const [greeting, setGreeting] = useState('Hello! I am your AI Business Receptionist. How may I assist your business inquiry today?');

  // Chat State
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am the official GOYE AI Business Receptionist. I can assist you with business FAQ, services, opening hours, pricing inquiries, or route you to a specialist. How may I assist you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'config'>('chat');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { sender: 'user', text: userText, time: nowTime }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'receptionist',
          message: userText,
          context: {
            businessName,
            openingHours,
            faqSummary,
            escalationContact
          }
        })
      });

      const data = await res.json();
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (res.ok && data.text) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.text, time: replyTime }]);
      } else if (data.status === 'CONFIGURATION_REQUIRED') {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `[System Notice]: AI service configuration required. Server-side GEMINI_API_KEY must be configured in environment variables to enable generative dynamic answering. Knowledge context is currently loaded for: ${businessName} (${openingHours}). For human support, please contact ${escalationContact}.`,
            time: replyTime
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `Thank you for your question. I am the AI Receptionist. For detailed assistance on this query, our representative can be reached directly at ${escalationContact}.`,
            time: replyTime
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Network notice: Could not reach the AI gateway. Please contact our support desk directly at ${escalationContact}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    safeNotify('AI Receptionist Knowledge Base updated successfully!', 'success');
    setActiveTab('chat');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <Bot size={14} /> Product 04 • AI Business Automation
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          AI Business Receptionist
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Front-desk AI employee for your business. Greets visitors, answers corporate FAQ, presents your service packages, explains business hours, captures prospect leads, and smoothly escalates complex questions to human officers.
        </p>
        <div className="p-3 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400">
          <strong className="text-yellow-400">AI Safety Notice:</strong> The assistant clearly identifies itself as an AI system. If external model credentials are unconfigured, fallback configuration guidance is displayed truthfully.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-[#FFD700] text-black shadow-lg'
              : 'bg-neutral-900 text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare size={14} /> Interactive Receptionist Console
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'config'
              ? 'bg-[#FFD700] text-black shadow-lg'
              : 'bg-neutral-900 text-gray-400 hover:text-white'
          }`}
        >
          <Settings size={14} /> Knowledge Base & Settings
        </button>
      </div>

      {activeTab === 'chat' ? (
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Active Status Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl text-xs">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <p className="font-black text-white uppercase">{businessName} Front Desk</p>
                <p className="text-gray-400 text-[11px] font-mono">{openingHours}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <Shield size={14} className="text-[#FFD700]" />
              <span>Escalation: {escalationContact}</span>
            </div>
          </div>

          {/* Chat Window */}
          <div className="h-[420px] overflow-y-auto space-y-4 p-4 bg-black/60 border border-neutral-800 rounded-2xl scrollbar-thin">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-neutral-800 text-white rounded-br-none border border-neutral-700'
                      : 'bg-neutral-900/90 text-gray-200 rounded-bl-none border border-neutral-800 shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <p className="text-[9px] text-gray-500 font-mono text-right">{m.time}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 items-center text-xs text-yellow-400">
                <Bot size={16} className="animate-spin" />
                <span className="font-mono">AI Receptionist is drafting a response...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about opening hours, pricing, services, or request an appointment..."
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-2xl px-5 py-4 text-xs text-white focus:border-yellow-500 outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-4 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSaveConfig} className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <h2 className="text-lg font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <Settings size={20} /> Configure Business Reception Knowledge
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold uppercase tracking-wider">
            <div>
              <label className="block text-gray-400 mb-1">Company / Display Name</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Official Opening Hours</label>
              <input
                type="text"
                value={openingHours}
                onChange={e => setOpeningHours(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Human Escalation Contact (Email / Phone)</label>
              <input
                type="text"
                value={escalationContact}
                onChange={e => setEscalationContact(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Initial Reception Greeting</label>
              <input
                type="text"
                value={greeting}
                onChange={e => setGreeting(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 mb-1">Business Services & FAQ Knowledge Summary</label>
              <textarea
                value={faqSummary}
                onChange={e => setFaqSummary(e.target.value)}
                rows={4}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-4 px-8 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
          >
            Save Knowledge Base Settings
          </button>
        </form>
      )}
    </div>
  );
}
