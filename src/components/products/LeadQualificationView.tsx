import React, { useState } from 'react';
import { TrendingUp, CheckCircle, ArrowRight, RotateCcw, AlertCircle, Sparkles, Target } from 'lucide-react';
import { LeadQualificationResult } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

export default function LeadQualificationView({ currentUser, onNavigate }: Props) {
  const [serviceNeeded, setServiceNeeded] = useState('CAC Registration Assistance');
  const [budgetRange, setBudgetRange] = useState('₦50,000 - ₦150,000');
  const [timeline, setTimeline] = useState('Immediately (Within 3 Days)');
  const [readiness, setReadiness] = useState('Ready with all documents and payment');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<LeadQualificationResult | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);

    let score = 50;

    // Timeline weighting
    if (timeline.includes('Immediately')) score += 20;
    else if (timeline.includes('1-2 Weeks')) score += 12;
    else score += 5;

    // Readiness weighting
    if (readiness.includes('Ready with all')) score += 25;
    else if (readiness.includes('Partial')) score += 15;
    else score += 5;

    // Budget weighting
    if (budgetRange.includes('₦250,000') || budgetRange.includes('500 Pi') || budgetRange.includes('₦150,000')) score += 15;
    else score += 10;

    score = Math.min(100, Math.max(25, score));

    let qualificationStatus: 'High Priority' | 'Standard Qualified' | 'Nurture Required' = 'Standard Qualified';
    let recommendedAction = 'Schedule technical discovery consultation and prepare standard quotation.';

    if (score >= 85) {
      qualificationStatus = 'High Priority';
      recommendedAction = 'Immediate dispatch to Senior Account Executive for contract scoping and accelerated onboarding.';
    } else if (score < 60) {
      qualificationStatus = 'Nurture Required';
      recommendedAction = 'Send GOYE educational service guide and follow up in 10 business days with milestone checklist.';
    }

    // Attempt AI-enhanced synthesis if server available
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'qualification',
          message: `Assess lead with Service: ${serviceNeeded}, Budget: ${budgetRange}, Timeline: ${timeline}, Readiness: ${readiness}. Calculated Score: ${score}/100.`,
          context: { score, qualificationStatus }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          recommendedAction = data.text;
        }
      }
    } catch (e) {
      // Graceful fallback to deterministic logic
    }

    const resObj: LeadQualificationResult = {
      serviceNeeded,
      budgetRange,
      timeline,
      readiness,
      score,
      qualificationStatus,
      recommendedAction,
      generatedAt: Date.now()
    };

    setResult(resObj);
    setEvaluating(false);
    safeNotify(`Lead Qualification complete: Score ${score}/100`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <TrendingUp size={14} /> Product 07 • Lead Qualification
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          AI Lead Qualification Agent
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Assess client readiness, scope viability, and commercial fit. Calculates an analytical lead score (0-100), assigns qualification tiers (<span className="text-[#FFD700] font-bold">High Priority, Standard Qualified, Nurture</span>), and provides structured next steps.
        </p>
        <div className="p-3 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400">
          <strong className="text-yellow-400">Disclaimer:</strong> AI lead qualification scoring is an internal decision support tool and is NOT a certified financial credit assessment or professional legal audit.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Qualification Questionnaire */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <Target size={20} /> Qualification Questions
          </h2>

          <form onSubmit={handleEvaluate} className="space-y-5 text-xs font-bold uppercase tracking-wider">
            <div>
              <label className="block text-gray-400 mb-2">1. What service does the client need? *</label>
              <select
                value={serviceNeeded}
                onChange={e => setServiceNeeded(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              >
                <option value="CAC Business Name Registration Assistance">CAC Business Name Registration Assistance</option>
                <option value="CAC Company (LLC) Incorporation Assistance">CAC Company (LLC) Incorporation Assistance</option>
                <option value="Bespoke Corporate Website Development">Bespoke Corporate Website Development</option>
                <option value="AI Chatbot & Receptionist Deployment">AI Chatbot & Receptionist Deployment</option>
                <option value="Trade Assurance Deal Setup">Trade Assurance Deal Setup</option>
                <option value="Full Web3 & Digital Business Suite">Full Web3 & Digital Business Suite</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">2. What is the client's allocated budget? *</label>
              <select
                value={budgetRange}
                onChange={e => setBudgetRange(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              >
                <option value="Under ₦50,000 (Low / Starter)">Under ₦50,000 (Low / Starter)</option>
                <option value="₦50,000 - ₦150,000 (Standard Tier)">₦50,000 - ₦150,000 (Standard Tier)</option>
                <option value="₦150,000 - ₦350,000 (Growth Tier)">₦150,000 - ₦350,000 (Growth Tier)</option>
                <option value="₦350,000+ / 350+ Pi (Enterprise Tier)">₦350,000+ / 350+ Pi (Enterprise Tier)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">3. What is the required delivery timeline? *</label>
              <select
                value={timeline}
                onChange={e => setTimeline(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              >
                <option value="Immediately (Within 3 Days)">Immediately (Within 3 Days)</option>
                <option value="1-2 Weeks (Standard Schedule)">1-2 Weeks (Standard Schedule)</option>
                <option value="Within 30 Days (Flexible)">Within 30 Days (Flexible)</option>
                <option value="Exploratory / Unscheduled">Exploratory / Unscheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">4. Client Readiness Status *</label>
              <select
                value={readiness}
                onChange={e => setReadiness(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              >
                <option value="Ready with all documents and payment">Ready with all documents and payment</option>
                <option value="Partial documents prepared; funding allocated">Partial documents prepared; funding allocated</option>
                <option value="Requirements gathering in progress">Requirements gathering in progress</option>
                <option value="Just researching available platform options">Just researching available platform options</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={evaluating}
              className="w-full py-4 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
            >
              {evaluating ? 'Analyzing Lead Readiness...' : 'Compute Lead Qualification Score'}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
              <Sparkles size={20} /> Qualification Evaluation Result
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Deterministic weighting matrix coupled with AI strategic recommendation.
            </p>
          </div>

          {result ? (
            <div className="space-y-6 bg-neutral-900/60 border border-yellow-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Qualification Score</p>
                  <p className="text-4xl font-black text-[#FFD700] font-mono">{result.score}/100</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Priority Tier</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                    result.qualificationStatus === 'High Priority' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                    result.qualificationStatus === 'Standard Qualified' ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' :
                    'bg-neutral-800 text-gray-400'
                  }`}>
                    {result.qualificationStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Recommended Next Action</p>
                <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl text-gray-200 leading-relaxed font-sans text-xs">
                  {result.recommendedAction}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400 border-t border-neutral-800 pt-3">
                <div>
                  <span className="font-bold text-gray-300">Service:</span> {result.serviceNeeded}
                </div>
                <div>
                  <span className="font-bold text-gray-300">Budget:</span> {result.budgetRange}
                </div>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-[10px] text-gray-500 font-mono">
                AI-generated business recommendations. Review before implementation.
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-neutral-900/30 border border-neutral-800 rounded-2xl text-gray-500 text-xs">
              Complete the questionnaire on the left and click "Compute Lead Qualification Score" to evaluate lead priority.
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate?.('contracts')}
              className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase transition-all"
            >
              Draft Contract
            </button>
            <button
              onClick={() => onNavigate?.('invoices')}
              className="flex-1 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black rounded-xl text-xs font-black uppercase transition-all shadow"
            >
              Issue Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
