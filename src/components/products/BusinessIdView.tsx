import React, { useState, useEffect } from 'react';
import { BadgeCheck, Copy, Check, QrCode, Globe, Mail, Phone, MapPin, Building, ExternalLink, ArrowRight } from 'lucide-react';
import { BusinessProfile } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

export default function BusinessIdView({ currentUser, onNavigate }: Props) {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology & Digital Services');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('Ikeja');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [servicesInput, setServicesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadBusinesses = async () => {
    try {
      const res = await fetch('/api/businesses');
      if (res.ok) {
        const data = await res.json();
        setBusinesses(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Could not load businesses', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      safeNotify('Business name is required', 'error');
      return;
    }
    setSubmitting(true);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const businessNumber = `GOYE-BIZ-2026-${randomSuffix}`;
    const id = `biz_${Date.now()}`;

    const newBiz: BusinessProfile = {
      id,
      businessNumber,
      userId: currentUser?.id || 'guest',
      name: name.trim(),
      description: description.trim(),
      category,
      country,
      state,
      city,
      website: website.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      services: servicesInput.split(',').map(s => s.trim()).filter(Boolean),
      status: 'Registered Profile',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBiz)
      });
      if (res.ok) {
        setBusinesses(prev => [newBiz, ...prev]);
        safeNotify(`Business ID Created: ${businessNumber}`, 'success');
        setName('');
        setDescription('');
        setServicesInput('');
      } else {
        safeNotify('Failed to save business profile', 'error');
      }
    } catch (err: any) {
      safeNotify(err.message || 'Connection error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyShareLink = (bizNumber: string) => {
    const url = `${window.location.origin}/verify/business/${bizNumber}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    safeNotify('Verification link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
              <BadgeCheck size={14} /> Product 01 • Business Identity
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
              GOYE Business ID
            </h1>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Create your standardized digital business identity. Generate a unique corporate ID (<span className="text-[#FFD700] font-mono">GOYE-BIZ-2026-XXXXXX</span>), public verification profile, and QR access credential for clients and partners.
            </p>
            <div className="p-3 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400">
              <strong className="text-yellow-400">Disclaimer:</strong> GOYE Business ID is a private platform business profile system and does NOT claim statutory government registration or CAC employee authority.
            </div>
          </div>
          <div className="p-6 bg-black border border-yellow-500/30 rounded-2xl text-center shrink-0 w-full md:w-auto">
            <QrCode size={64} className="mx-auto text-[#FFD700] mb-2 animate-pulse" />
            <p className="text-[10px] font-mono uppercase text-gray-400 font-bold">Standard Format</p>
            <p className="text-xs font-mono font-black text-[#FFD700]">GOYE-BIZ-2026-XXXXXX</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Creation Form */}
        <div className="lg:col-span-1 bg-neutral-950 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h2 className="text-lg font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <Building size={18} /> Register Business Profile
          </h2>
          <form onSubmit={handleCreateBusiness} className="space-y-4 text-xs font-bold uppercase tracking-wider">
            <div>
              <label className="block text-gray-400 mb-1">Business Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Apex Digital Innovations"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Industry Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              >
                <option value="Technology & Digital Services">Technology & Digital Services</option>
                <option value="CAC & Business Setup Assistance">CAC & Business Setup Assistance</option>
                <option value="AI & Automation Solutions">AI & Automation Solutions</option>
                <option value="Website & App Development">Website & App Development</option>
                <option value="Commerce & Retail">Commerce & Retail</option>
                <option value="Financial & Digital Trade">Financial & Digital Trade</option>
                <option value="Consulting & Professional Services">Consulting & Professional Services</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">State / City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Corporate Contact (Email / Phone)</label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="info@yourcompany.com"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none mb-2"
              />
              <input
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+234 812 345 6789"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Services Offered (comma separated)</label>
              <input
                type="text"
                value={servicesInput}
                onChange={e => setServicesInput(e.target.value)}
                placeholder="Web Design, AI Bots, Registration"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Executive Summary / Bio</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Short description of your business scope..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
            >
              {submitting ? 'Generating Business ID...' : 'Generate GOYE Business ID'}
            </button>
          </form>
        </div>

        {/* Existing Registered Business Profiles Directory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
              <BadgeCheck className="text-[#FFD700]" /> Registered Business Directory ({businesses.length})
            </h2>
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Standardized Format</span>
          </div>

          {loading ? (
            <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-3xl">
              <div className="animate-spin text-[#FFD700] text-2xl mb-2">⚡</div>
              <p className="text-xs text-gray-400 uppercase font-bold">Loading registered profiles...</p>
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-3xl p-8 space-y-4">
              <Building size={48} className="mx-auto text-gray-600" />
              <h3 className="text-base font-black uppercase text-gray-300">No Business Profiles Created Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Fill the form on the left to register your official GOYE digital business profile and receive your unique GOYE-BIZ identifier.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {businesses.map(biz => (
                <div
                  key={biz.id}
                  className="bg-neutral-950 border border-neutral-800 hover:border-yellow-500/30 rounded-2xl p-6 transition-all space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black uppercase text-white">{biz.name}</h3>
                        <span className="px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-[#FFD700] rounded-full text-[9px] font-black uppercase">
                          {biz.status}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#FFD700] font-black tracking-wider mt-1">
                        {biz.businessNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyShareLink(biz.businessNumber)}
                        className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-gray-300 hover:text-white rounded-xl border border-neutral-700 text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Copy Public Verification Link"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        Share Link
                      </button>
                      <button
                        onClick={() => onNavigate?.('business-verification')}
                        className="px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-[#FFD700] border border-yellow-500/30 rounded-xl text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer"
                      >
                        Verify <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {biz.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-gray-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Building size={14} className="text-yellow-500/70" />
                      <span className="truncate">{biz.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-yellow-500/70" />
                      <span>{biz.city}, {biz.country}</span>
                    </div>
                    {biz.contactEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} className="text-yellow-500/70" />
                        <span className="truncate">{biz.contactEmail}</span>
                      </div>
                    )}
                  </div>

                  {biz.services && biz.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-900">
                      {biz.services.map((svc, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-gray-300 rounded">
                          {svc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
