import React, { useState } from 'react';
import { 
  BadgeCheck, ShieldCheck, QrCode, Bot, Sparkles, Headphones, 
  TrendingUp, FileText, Receipt, Coins, Store, Calendar, 
  Handshake, FolderLock, Lightbulb, Search, ArrowRight, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { GOYE_15_PRODUCTS } from '../data/productsList';
import { ProductCategory, ProductStatus } from '../types/products';

interface Props {
  onSelectProduct: (productId: string) => void;
}

const CATEGORIES: ('ALL' | ProductCategory)[] = [
  'ALL',
  'Business Identity',
  'AI Business Automation',
  'Business Documents',
  'Commerce',
  'Trade',
  'Growth'
];

export default function ProductCatalog({ onSelectProduct }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ProductCategory>('ALL');
  const [search, setSearch] = useState('');

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'BadgeCheck': return <BadgeCheck className="text-[#FFD700]" size={24} />;
      case 'ShieldCheck': return <ShieldCheck className="text-[#FFD700]" size={24} />;
      case 'QrCode': return <QrCode className="text-[#FFD700]" size={24} />;
      case 'Bot': return <Bot className="text-[#FFD700]" size={24} />;
      case 'Sparkles': return <Sparkles className="text-[#FFD700]" size={24} />;
      case 'Headphones': return <Headphones className="text-[#FFD700]" size={24} />;
      case 'TrendingUp': return <TrendingUp className="text-[#FFD700]" size={24} />;
      case 'FileText': return <FileText className="text-[#FFD700]" size={24} />;
      case 'Receipt': return <Receipt className="text-[#FFD700]" size={24} />;
      case 'Coins': return <Coins className="text-[#FFD700]" size={24} />;
      case 'Store': return <Store className="text-[#FFD700]" size={24} />;
      case 'Calendar': return <Calendar className="text-[#FFD700]" size={24} />;
      case 'Handshake': return <Handshake className="text-[#FFD700]" size={24} />;
      case 'FolderLock': return <FolderLock className="text-[#FFD700]" size={24} />;
      case 'Lightbulb': return <Lightbulb className="text-[#FFD700]" size={24} />;
      default: return <Sparkles className="text-[#FFD700]" size={24} />;
    }
  };

  const filteredProducts = GOYE_15_PRODUCTS.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      {/* Catalog Banner */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-black uppercase text-[#FFD700] tracking-widest">
            15 GOYE Business Utilities • Production Suite
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            AI + Web3 Business Infrastructure
          </h1>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed">
            A comprehensive suite of 15 authentic business utilities. Explore verifiable business identities, AI automation agents, digital legal documents, commercial marketplace listings, and native Pi payment checkout.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Navigation */}
      <div className="space-y-4 bg-neutral-950 border border-neutral-800 p-6 rounded-3xl">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search across all 15 business utilities (e.g. Invoices, Pi Checkout, AI Receptionist, Verification)..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:border-yellow-500 outline-none uppercase font-bold tracking-wider"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FFD700] text-black shadow-lg'
                  : 'bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 15 Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(prod => (
          <div
            key={prod.id}
            className="bg-neutral-950 border border-neutral-800 hover:border-yellow-500/40 rounded-3xl p-6 transition-all flex flex-col justify-between space-y-6 shadow-xl group hover:shadow-2xl hover:shadow-yellow-500/5"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-2">
                <div className="w-12 h-12 rounded-2xl bg-black border border-yellow-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getProductIcon(prod.iconName)}
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-gray-500 font-black block">#{prod.numericId}</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {prod.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-yellow-500/80 tracking-widest">
                  {prod.category}
                </span>
                <h3 className="text-lg font-black uppercase text-white mt-0.5 group-hover:text-[#FFD700] transition-colors">
                  {prod.name}
                </h3>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                {prod.shortDescription}
              </p>

              {prod.disclaimer && (
                <p className="text-[10px] text-gray-500 font-mono italic border-l-2 border-neutral-800 pl-2">
                  {prod.disclaimer}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-900 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Pricing</span>
                <span className="font-mono font-bold text-[#FFD700]">
                  {prod.pricingType === 'FREE' && 'Included / Free'}
                  {prod.pricingType === 'PRICE_CONFIGURED' && `${prod.currency} ${prod.price?.toLocaleString()}`}
                  {prod.pricingType === 'CONTACT_FOR_QUOTE' && 'Quote / Flexible'}
                  {prod.pricingType === 'COMING_SOON' && 'Coming Soon'}
                </span>
              </div>

              <button
                onClick={() => onSelectProduct(prod.id)}
                className="w-full py-3.5 bg-neutral-900 hover:bg-[#FFD700] text-gray-300 hover:text-black font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-800 hover:border-yellow-500 shadow-md"
              >
                Launch Utility <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
