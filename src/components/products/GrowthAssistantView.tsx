import React, { useState } from 'react';
import { Lightbulb, Sparkles, Send, Bot, CheckCircle, ArrowRight, BarChart2, ShieldAlert } from 'lucide-react';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

export default function GrowthAssistantView({ currentUser, onNavigate }: Props) {
  const [businessType, setBusinessType] = useState('Digital Agency & Tech Services');
  const [targetAudience, setTargetAudience] = useState('SMEs, Startups & Professional Entrepreneurs');
  const [currentChallenge, setCurrentChallenge] = useState('Converting website visitors into paid clients and setting up automated payment checkout.');
  const [focusArea, setFocusArea] = useState<'marketing' | 'website' | 'seo' | 'workflow' | 'conversion'>('conversion');
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<string | null>(null);

  const handleGenerateGrowth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setRecommendations(null);

    const prompt = `Business Type: ${businessType}\nTarget Market: ${targetAudience}\nPrimary Challenge: ${currentChallenge}\nFocus Area: ${focusArea.toUpperCase()}\nProvide 4 specific, actionable growth recommendations tailored to this digital business.`;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'growth',
          message: prompt,
          context: { businessType, focusArea }
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setRecommendations(data.text);
        safeNotify('Growth audit generated successfully!', 'success');
      } else {
        setRecommendations(`[Standard Advisory Matrix]:\n1. Conversion Optimization: Implement clear, single-goal CTAs above the mobile fold with transparent pricing.\n2. Technical SEO: Ensure schema.org structured data matches your corporate registration number and location coordinates.\n3. Automation: Deploy the GOYE AI Receptionist to qualify prospect budget and timeline within the first 60 seconds of site arrival.\n4. Trust Signals: Activate Product 03 (QR Business Verification) to present verified corporate credibility directly on all outgoing quotes.\n\n(Notice: To unlock dynamic real-time generative growth modeling, configure GEMINI_API_KEY on the server).`);
        safeNotify('Standard diagnostic recommendations generated', 'info');
      }
    } catch (err: any) {
      setRecommendations('Network error: Unable to contact the AI growth engine. Please try again shortly.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <Lightbulb size={14} /> Product 15 • AI Business Intelligence
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          AI Business Growth Assistant
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          AI diagnostic dashboard analyzing your business positioning, website conversion rate, customer engagement, and sales workflow to deliver actionable growth steps.
        </p>
        <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400 space-y-1 leading-relaxed">
          <strong className="text-yellow-400 block">Truthful Advisory Disclaimer:</strong>
          <p>
            AI-generated business recommendations. Review before implementation. GOYE does not guarantee specific revenue, customer acquisition numbers, or financial returns.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Diagnostic Input Form */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <Sparkles size={20} /> Diagnostic Parameters
          </h2>

          <form onSubmit={handleGenerateGrowth} className="space-y-4 text-xs font-bold uppercase tracking-wider">
            <div>
              <label className="block text-gray-400 mb-1">Business Category / Model *</label>
              <input
                type="text"
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Target Customer Demographic *</label>
              <input
                type="text"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Primary Growth Bottleneck / Challenge *</label>
              <textarea
                value={currentChallenge}
                onChange={e => setCurrentChallenge(e.target.value)}
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Priority Focus Area</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'conversion', label: 'Conversion' },
                  { id: 'website', label: 'Website UX' },
                  { id: 'marketing', label: 'Marketing' },
                  { id: 'seo', label: 'SEO & Search' },
                  { id: 'workflow', label: 'Automation' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFocusArea(opt.id as any)}
                    className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      focusArea === opt.id
                        ? 'bg-[#FFD700] text-black shadow'
                        : 'bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-4 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg cursor-pointer mt-4"
            >
              {analyzing ? 'Analyzing Strategic Options...' : 'Generate Actionable Growth Plan'}
            </button>
          </form>
        </div>

        {/* Growth Recommendations Output */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
              <BarChart2 size={20} /> Actionable Growth Blueprint
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Synthesized recommendations tailored strictly to your provided business inputs.
            </p>
          </div>

          <div className="flex-1 bg-black/60 border border-neutral-800 rounded-2xl p-6 overflow-y-auto max-h-[380px] scrollbar-thin text-xs text-gray-200 leading-relaxed font-sans space-y-4">
            {recommendations ? (
              <div className="space-y-4">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {recommendations}
                </div>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-[10px] text-gray-400 font-mono">
                  AI-generated business recommendations. Review before implementation.
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                Configure your business parameters on the left and click "Generate Actionable Growth Plan" to run the diagnostic audit.
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onNavigate?.('marketplace')}
              className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase transition-all"
            >
              Browse Services
            </button>
            <button
              onClick={() => onNavigate?.('business-id')}
              className="flex-1 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black rounded-xl text-xs font-black uppercase transition-all shadow"
            >
              Update Business ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
