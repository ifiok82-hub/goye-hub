import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, Filter, ShieldCheck, CheckCircle2, Clock, ArrowRight, Tag } from 'lucide-react';
import { MarketplaceListing } from '../../types/products';
import { safeNotify } from '../../App';

interface Props {
  currentUser: any;
  onNavigate?: (section: string) => void;
}

const CATEGORIES = [
  'ALL',
  'Websites',
  'AI Services',
  'Business Registration Assistance',
  'Digital Marketing',
  'Business Support',
  'Design',
  'Automation',
  'Consulting',
  'Digital Products',
  'Professional Services'
] as const;

export default function MarketplaceView({ currentUser, onNavigate }: Props) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New Listing Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedBizId, setSelectedBizId] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('Websites');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(75000);
  const [currency, setCurrency] = useState('NGN');
  const [deliveryTime, setDeliveryTime] = useState('5 Business Days');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [lRes, bRes] = await Promise.all([
        fetch('/api/marketplace_listings'),
        fetch('/api/businesses')
      ]);
      if (lRes.ok) {
        const data = await lRes.json();
        setListings(Array.isArray(data) ? data : []);
      }
      if (bRes.ok) {
        const bData = await bRes.json();
        setBusinesses(Array.isArray(bData) ? bData : []);
        if (Array.isArray(bData) && bData.length > 0 && !selectedBizId) {
          setSelectedBizId(bData[0].id);
        }
      }
    } catch (e) {
      console.warn('Error fetching marketplace data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle.trim() || !description.trim()) {
      safeNotify('Service title and description are required', 'error');
      return;
    }
    setSubmitting(true);

    const associatedBiz = businesses.find(b => b.id === selectedBizId);
    const sellerStatus = associatedBiz?.status === 'VERIFIED' ? 'VERIFIED_ON_GOYE' : 'REGISTERED';
    const id = `lst_${Date.now()}`;

    const newListing: MarketplaceListing = {
      id,
      sellerId: currentUser?.id || 'guest',
      sellerName: currentUser?.name || associatedBiz?.name || 'Seller',
      businessId: selectedBizId || 'biz_direct',
      businessName: associatedBiz?.name || 'Direct Business',
      sellerStatus,
      serviceTitle: serviceTitle.trim(),
      category: category === 'ALL' ? 'Websites' : category,
      description: description.trim(),
      price: Number(price) || 0,
      currency,
      deliveryTime,
      status: 'ACTIVE',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/marketplace_listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing)
      });
      if (res.ok) {
        setListings(prev => [newListing, ...prev]);
        safeNotify('Service published to Business Marketplace!', 'success');
        setShowModal(false);
        setServiceTitle('');
        setDescription('');
      } else {
        safeNotify('Failed to publish listing', 'error');
      }
    } catch (e: any) {
      safeNotify(e.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredListings = listings.filter(l => {
    const matchesCat = activeCategory === 'ALL' || l.category === activeCategory;
    const matchesSearch = !searchQuery.trim() ||
      l.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Product Hero */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
          <Store size={14} /> Product 11 • Commercial Marketplace
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
          Business Marketplace
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
          Discover verified business packages across 10 specialized categories. Each listing displays real seller credentials, transparent delivery windows, and verifiable milestones.
        </p>
        <div className="p-3 bg-black/60 border border-neutral-800 rounded-xl text-xs text-gray-400">
          <strong className="text-yellow-400">Policy:</strong> No fabricated review counts, no artificial 5-star ratings. Verified badges are strictly awarded to accounts completing the official GOYE verification workflow.
        </div>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="space-y-4 bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search services, businesses, technical scopes..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-yellow-500 outline-none"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-[#FFD700] hover:bg-yellow-400 text-black rounded-xl text-xs font-black uppercase flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
          >
            <Plus size={16} /> Publish Service Listing
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#FFD700] text-black shadow'
                  : 'bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* New Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-yellow-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <h3 className="text-lg font-black uppercase text-white flex items-center gap-2">
              <Store className="text-[#FFD700]" /> Publish Service Package
            </h3>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs font-bold uppercase tracking-wider">
              {businesses.length > 0 && (
                <div>
                  <label className="block text-gray-400 mb-1">Associated Business Profile</label>
                  <select
                    value={selectedBizId}
                    onChange={e => setSelectedBizId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white"
                  >
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.businessNumber || b.id})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-400 mb-1">Service Title *</label>
                <input
                  type="text"
                  value={serviceTitle}
                  onChange={e => setServiceTitle(e.target.value)}
                  placeholder="e.g. Enterprise WhatsApp AI Assistant Integration"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white"
                  >
                    {CATEGORIES.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Estimated Delivery</label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={e => setDeliveryTime(e.target.value)}
                    placeholder="e.g. 5 Business Days"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Price</label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="Pi">Pi</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Detailed Service Scope & Deliverables *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Outline exactly what is included in this package..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-neutral-900 text-gray-400 rounded-xl uppercase font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase rounded-xl shadow-lg cursor-pointer"
                >
                  {submitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-3xl">
          <div className="animate-spin text-[#FFD700] text-2xl mb-2">⚡</div>
          <p className="text-xs text-gray-400 uppercase font-bold">Loading marketplace catalog...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-3xl p-8 space-y-4">
          <Store size={48} className="mx-auto text-gray-600" />
          <h3 className="text-base font-black uppercase text-gray-300">No Listings in this Category</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Be the first business to publish a verified service listing in this category.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-[#FFD700] text-black rounded-xl text-xs font-black uppercase"
          >
            Publish New Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <div
              key={listing.id}
              className="bg-neutral-950 border border-neutral-800 hover:border-yellow-500/30 rounded-3xl p-6 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 text-[#FFD700] rounded-full text-[9px] font-black uppercase tracking-wider">
                    {listing.category}
                  </span>
                  {listing.sellerStatus === 'VERIFIED_ON_GOYE' ? (
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                      <CheckCircle2 size={10} /> Verified on GOYE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-neutral-900 text-gray-500 rounded text-[9px] font-bold uppercase">
                      Registered
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black uppercase text-white leading-tight">
                  {listing.serviceTitle}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {listing.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-900 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Standard Pricing</p>
                    <p className="text-lg font-black text-[#FFD700] font-mono">
                      {listing.currency} {listing.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Turnaround</p>
                    <p className="text-xs font-bold text-gray-300 flex items-center gap-1 justify-end">
                      <Clock size={12} className="text-yellow-400" /> {listing.deliveryTime}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 font-bold border-t border-neutral-900/60 pt-2">
                  Seller: <span className="text-white">{listing.businessName}</span>
                </div>

                <button
                  onClick={() => onNavigate?.('contracts')}
                  className="w-full py-3 bg-[#FFD700] hover:bg-yellow-400 text-black font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  Draft Contract / Order <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
