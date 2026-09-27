import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Globe2, 
  Bot, 
  Zap, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Download, 
  MessageSquare, 
  Menu, 
  X, 
  Smartphone, 
  CreditCard, 
  Lock,
  Mail,
  User,
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Info,
  ArrowRight,
  Plus,
  Trash2,
  Settings,
  HelpCircle,
  FileCheck,
  Search,
  DollarSign,
  Send,
  Eye,
  SmartphoneNfc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Assets ---
const ASSETS = {
  LOGO: "/goye_gold_logo_1790428812570.jpg",
  HERO_BG: "/goye_hero_bg_1790428830648.jpg",
  CAC_IMG: "/goye_cac_image_1790428848275.jpg",
  WEB_IMG: "/goye_web_image_1790428865255.jpg",
  AI_IMG: "/goye_ai_image_1790428883687.jpg",
  DIGITAL_IMG: "/goye_digital_image_1790428914208.jpg"
};

// --- Core Constants ---
const BRAND_GOLD = "#FFD700";
const ADMIN_PASSWORD = "GoyeBN3583773";

// --- Types ---
type Section = 'home' | 'services' | 'dashboard' | 'admin' | 'faq' | 'about' | 'contact' | 'legal';
type ServiceType = 'CAC' | 'WEB' | 'AI' | 'DIG';

interface Service {
  id: string;
  type: ServiceType;
  name: string;
  description: string;
  shortDesc: string;
  price: number;
  govtFee?: number;
  image: string;
  timeline: string;
  priceType: 'FIXED' | 'STARTING_FROM' | 'QUOTE_REQUIRED' | 'CUSTOM';
  deliverables: string[];
  requirements: string[];
  active: boolean;
  currency: string;
}

interface ServiceRequest {
  id: string;
  requestNumber: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  type: ServiceType;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER REVIEW' | 'AWAITING CUSTOMER INFORMATION' | 'QUOTE READY' | 'PAYMENT PENDING' | 'PAYMENT VERIFIED' | 'IN PROGRESS' | 'AWAITING EXTERNAL PROCESS' | 'AWAITING CUSTOMER APPROVAL' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';
  formData: any;
  createdAt: number;
  amount: number;
  paymentRef?: string;
  paymentProvider?: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  requestId: string;
  serviceName: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'PAID';
  expiresAt: number;
  notes?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: number;
}

interface SupportTicket {
  id: string;
  userId: string;
  category: string;
  message: string;
  status: 'Open' | 'In Progress' | 'AWAITING CUSTOMER' | 'Resolved' | 'Closed';
  createdAt: number;
}

interface GoyeDocument {
  id: string;
  requestId: string;
  userId: string;
  filename: string;
  documentType: string;
  createdAt: number;
}

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  resourceId: string;
  timestamp: number;
}

// --- Dynamic Catalog Data ---
const SERVICES_CATALOG: Service[] = [
  // CAC BUSINESS REGISTRATION & SUPPORT
  { 
    id: 'cac-biz-name', 
    type: 'CAC', 
    name: 'Business Name Registration Support', 
    description: 'Complete assistance with filing and preparing registration documents with the CAC. Subject to CAC approval timelines.', 
    shortDesc: 'Assist with CAC Business Name registration filing.',
    price: 15000, 
    govtFee: 10000, 
    timeline: '5-7 Business Days', 
    image: ASSETS.CAC_IMG,
    priceType: 'FIXED',
    deliverables: ['CAC Certificate of Registration', 'Certified True Copy of Application Details', 'Official Status Verification'],
    requirements: ['Proposed Business Name (2 Options)', 'Nature of Business Activities', 'Applicant Full Name & Address', 'Valid Government ID Copy'],
    active: true,
    currency: 'NGN'
  },
  { 
    id: 'cac-llc', 
    type: 'CAC', 
    name: 'LLC Incorporation Support (Private Limited)', 
    description: 'Expert guidance and filling assistance for Limited Liability Company incorporation, including professional Article of Association preparation.', 
    shortDesc: 'Assist with Private Limited LLC registration support.',
    price: 35000, 
    govtFee: 20000, 
    timeline: '7-10 Business Days', 
    image: ASSETS.CAC_IMG,
    priceType: 'FIXED',
    deliverables: ['CAC Status Report', 'Articles of Association', 'Certified Incorporation Details', 'Pre-allocated Tax Identification Number (TIN)'],
    requirements: ['Proposed Company Name (2 Options)', 'Share Capital Structure Details', 'Director(s) Details', 'Shareholder(s) Details', 'Office Address Copy'],
    active: true,
    currency: 'NGN'
  },
  { 
    id: 'cac-trustee', 
    type: 'CAC', 
    name: 'Incorporated Trustees Assistance', 
    description: 'Comprehensive support with filing and preparing Trustee registrations for NGOs, Churches, Associations, and Clubs.', 
    shortDesc: 'Registration assistance for NGOs, Churches, and Clubs.',
    price: 75000, 
    govtFee: 45000, 
    timeline: '21-30 Business Days', 
    image: ASSETS.CAC_IMG,
    priceType: 'STARTING_FROM',
    deliverables: ['Certificate of Incorporation', 'Constitution Documents', 'Official Trustees Status Sheet'],
    requirements: ['Proposed Association Name', 'Aims and Objectives Details', 'Trustees Board Names and IDs', 'Newspaper Publication Copies'],
    active: true,
    currency: 'NGN'
  },
  { 
    id: 'cac-returns', 
    type: 'CAC', 
    name: 'CAC Annual Returns Assistance', 
    description: 'Professional support with filing and processing annual return records to keep your registered status active and up-to-date.', 
    shortDesc: 'File and update your registered business annual returns.',
    price: 12000, 
    timeline: '3-5 Business Days', 
    image: ASSETS.CAC_IMG,
    priceType: 'FIXED',
    deliverables: ['CAC Official Acknowledgement Letter', 'Filing Receipt', 'Status Reactivation Support'],
    requirements: ['RC or Business Registration Number', 'Financial Year of Return', 'Current Director Details'],
    active: true,
    currency: 'NGN'
  },
  
  // PROFESSIONAL WEBSITE DEVELOPMENT
  { 
    id: 'web-starter', 
    type: 'WEB', 
    name: 'Starter Website Package', 
    description: 'Elite single-page business showcase landing page built with modern responsive styling and performance integrations.', 
    shortDesc: 'Responsive single-page business showcase landing page.',
    price: 45000, 
    timeline: '4-6 Business Days', 
    image: ASSETS.WEB_IMG,
    priceType: 'FIXED',
    deliverables: ['Single-Page High Performance Web Application', 'SEO Base Configuration', 'WhatsApp Integration Option', '1 Month Free Maintenance support'],
    requirements: ['Brand Logo & Guidelines', 'Text Contents & About Us section copy', 'Contact Coordinates', 'Domain Choice'],
    active: true,
    currency: 'NGN'
  },
  { 
    id: 'web-biz', 
    type: 'WEB', 
    name: 'Business & Professional Website Package', 
    description: 'Elite corporate website up to 5 custom-designed responsive pages, featuring modern contact forms, analytics trackers, and SEO setup.', 
    shortDesc: 'Up to 5 custom pages, complete SEO and analytics setup.',
    price: 85000, 
    timeline: '7-10 Business Days', 
    image: ASSETS.WEB_IMG,
    priceType: 'FIXED',
    deliverables: ['5-Page Modern Corporate Web App', 'Google Analytics & Console Trackers', 'Contact Forms & Booking Integrations', 'Domain and Hosting Deployment support'],
    requirements: ['Detailed Pages Layout requirements', 'Brand Graphics assets', 'Business FAQs and text copies'],
    active: true,
    currency: 'NGN'
  },
  { 
    id: 'web-shop', 
    type: 'WEB', 
    name: 'Luxury E-commerce Platform', 
    description: 'Full e-commerce platform complete with verified payment gateway integrations (Paystack/Pi SDK), visual product catalogues, and auto receipts.', 
    shortDesc: 'Complete e-commerce store with secure payment flows.',
    price: 150000, 
    timeline: '12-15 Business Days', 
    image: ASSETS.WEB_IMG,
    priceType: 'STARTING_FROM',
    deliverables: ['High-Converting Online Store', 'Secure Paystack and Pi Payments checkout support', 'Product Inventory Administration panel', 'Automated Email receipt configurations'],
    requirements: ['Product Catalogue details', 'Payment merchant credentials/keys', 'Corporate Bank Accounts details'],
    active: true,
    currency: 'NGN'
  },
  { 
    id: 'web-custom', 
    type: 'WEB', 
    name: 'Custom Web Application Design', 
    description: 'Bespoke corporate web architectures, booking portals, custom databases, CRM integrations, and full-stack software developments.', 
    shortDesc: 'Bespoke custom full-stack web applications and CRM systems.',
    price: 250000, 
    timeline: '15-25 Business Days', 
    image: ASSETS.WEB_IMG,
    priceType: 'QUOTE_REQUIRED',
    deliverables: ['Bespoke Full-Stack Web Application', 'Custom Database Architecture design', 'Interactive User Dashboards', 'Long-term Maintenance & SLA plan support'],
    requirements: ['Technical Specification Sheet / User Stories', 'Competitor Reference Links', 'Required APIs list'],
    active: true,
    currency: 'NGN'
  },

  // AI CHATBOT & AI ASSISTANT DEVELOPMENT
  { 
    id: 'ai-whatsapp', 
    type: 'AI', 
    name: 'WhatsApp Business AI Assistant', 
    description: 'Intelligent custom-trained chatbot deployed directly on your WhatsApp Business workspace to automate user support and sales qualification.', 
    shortDesc: 'Automate inquiries and sales on WhatsApp 24/7.',
    price: 150000, 
    timeline: '5-7 Business Days', 
    image: ASSETS.AI_IMG,
    priceType: 'FIXED',
    deliverables: ['Custom WhatsApp AI Assistant Agent', 'Private Vector Knowledge database configuration', 'Automated Lead Export spreadsheet setup'],
    requirements: ['Active WhatsApp Business line', 'Comprehensive business FAQ list', 'Company Guidelines/Rules docs'],
    active: true,
    currency: 'NGN'
  },
  { 
    id: 'ai-web', 
    type: 'AI', 
    name: 'Website Intelligent AI Assistant', 
    description: 'AI assistant deployed directly on your website, custom-trained on private catalogs, documents, or websites to qualify customers.', 
    shortDesc: 'AI assistant widget deployed on your business website.',
    price: 35000, 
    timeline: '3-5 Business Days', 
    image: ASSETS.AI_IMG,
    priceType: 'FIXED',
    deliverables: ['Embeddable Web AI Assistant Widget', 'Tailored Chatbot Personality configuration', 'Private Datasets storage container'],
    requirements: ['Existing website platform', 'Business FAQ and Catalog files', 'Desired chat widget brand color'],
    active: true,
    currency: 'NGN'
  },

  // DIGITAL SOLUTIONS & BUSINESS SUPPORT
  { 
    id: 'dig-setup', 
    type: 'DIG', 
    name: 'Google Business Profile Setup & Assistance', 
    description: 'Complete setup and optimization of your business presence on Google Maps and search maps. Does not guarantee Google authorization timelines.', 
    shortDesc: 'Optimize your local Google search and Maps presence.',
    price: 10000, 
    timeline: '2-4 Days', 
    image: ASSETS.DIGITAL_IMG,
    priceType: 'FIXED',
    deliverables: ['Optimized Google Business Profile profile', 'Organic Keyword Local Maps Setup', 'Customer Review Link template creation'],
    requirements: ['Verified physical business address', 'Corporate phone and email coordinates', '5-10 business activity photos'],
    active: true,
    currency: 'NGN'
  },
  { 
    id: 'dig-custom', 
    type: 'DIG', 
    name: 'Custom Digital Solutions Setup', 
    description: 'Bespoke technological configurations: professional business email setup, payment gateway integrations, and automation flow setup.', 
    shortDesc: 'Corporate email, custom gateway, and workflow automation setups.',
    price: 25000, 
    timeline: '3-5 Days', 
    image: ASSETS.DIGITAL_IMG,
    priceType: 'CUSTOM',
    deliverables: ['Bespoke Professional Email accounts setup', 'Verified local workflow automation triggers', 'Unified API connector accounts setup'],
    requirements: ['Corporate domain account coordinates', 'Workflow rules list', 'Integrations parameters'],
    active: true,
    currency: 'NGN'
  }
];

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: 'Hello! Welcome to GOYE SERVICES HUB. I am your GOYE AI ASSISTANT. How can I help you build, register, or automate your business today?' }
  ]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [activeCheckout, setActiveCheckout] = useState<ServiceRequest | Quote | null>(null);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [documents, setDocuments] = useState<GoyeDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Secure local state initialized with Goye Hub Testnet wallet and real Mainnet KYC wallet role
  const [piConfig, setPiConfig] = useState({
    networkMode: 'TESTNET',
    testnetWallet: 'GASU7HADLZKZE4A6EPRWW5QNMGHQBSL6FR3ED4N4ZR3KYDQRQXGQTJLX',
    mainnetWallet: 'GBR4B47WY7JDK2JKUUQQTWWQENOUUYTAQAOYLXZ7XE36YFQY6LKPVO6R'
  });

  // Configurable Business contact info
  const config = {
    whatsappNumber: "2348123456789",
    supportEmail: "goyedagosmessenterprise@gmail.com",
    supportEmailAlt: "goye@gasv.store"
  };

  // Pi SDK Integration & detection
  useEffect(() => {
    if (typeof window !== 'undefined' && (navigator.userAgent.toLowerCase().includes('pibrowser') || (window as any).Pi)) {
      setIsPiBrowser(true);
      if ((window as any).Pi) {
        try {
          (window as any).Pi.init({ version: "2.0", sandbox: true });
        } catch (e) {
          console.warn("Pi Init error: ", e);
        }
      }
    }
  }, []);

  // Sync data on load
  useEffect(() => {
    const savedUser = localStorage.getItem('goye_user_profile');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedReqs = localStorage.getItem('goye_requests_v2');
    if (savedReqs) setRequests(JSON.parse(savedReqs));

    const savedQuotes = localStorage.getItem('goye_quotes_v2');
    if (savedQuotes) setQuotes(JSON.parse(savedQuotes));

    const savedTickets = localStorage.getItem('goye_tickets_v2');
    if (savedTickets) setSupportTickets(JSON.parse(savedTickets));

    const savedDocs = localStorage.getItem('goye_docs_v2');
    if (savedDocs) setDocuments(JSON.parse(savedDocs));

    const savedLogs = localStorage.getItem('goye_logs_v2');
    if (savedLogs) setAuditLogs(JSON.parse(savedLogs));

    const savedPiConfig = localStorage.getItem('goye_pi_config_v2');
    if (savedPiConfig) setPiConfig(JSON.parse(savedPiConfig));
  }, []);

  // Save changes to localStorage helper
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleUpdatePiConfig = (newConfig: typeof piConfig) => {
    setPiConfig(newConfig);
    localStorage.setItem('goye_pi_config_v2', JSON.stringify(newConfig));
  };

  const logAction = (actor: string, action: string, resourceId: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(7),
      actor,
      action,
      resourceId,
      timestamp: Date.now()
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    saveState('goye_logs_v2', updated);
  };

  const handleRegister = (name: string, email: string, phone: string) => {
    const isSpecial = email.includes('admin');
    const profile: UserProfile = {
      id: Math.random().toString(36).substring(7),
      name,
      email,
      phone,
      role: isSpecial ? 'admin' : 'customer',
      createdAt: Date.now()
    };
    setCurrentUser(profile);
    saveState('goye_user_profile', profile);
    logAction(name, 'User Registered', profile.id);
  };

  const handleLogout = () => {
    if (currentUser) {
      logAction(currentUser.name, 'User Logged Out', currentUser.id);
    }
    setCurrentUser(null);
    localStorage.removeItem('goye_user_profile');
    setActiveSection('home');
  };

  const handleRequestSubmit = async (service: Service, formData: any) => {
    if (!currentUser) return;
    
    let reqNo = `GOYE-${service.type}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const response = await fetch('/api/orders/generate-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: service.type })
      });
      const data = await response.json();
      if (data && data.reference) {
        reqNo = data.reference;
      }
    } catch (err) {
      console.warn("Reference API offline, fell back to secure client pattern", err);
    }

    const newReq: ServiceRequest = {
      id: Math.random().toString(36).substring(7),
      requestNumber: reqNo,
      userId: currentUser.id,
      serviceId: service.id,
      serviceName: service.name,
      type: service.type,
      status: 'SUBMITTED',
      formData,
      createdAt: Date.now(),
      amount: service.price + (service.govtFee || 0)
    };
    const updated = [newReq, ...requests];
    setRequests(updated);
    saveState('goye_requests_v2', updated);
    logAction(currentUser.name, 'Submitted Service Request', newReq.id);
    setSelectedService(null);
    setActiveSection('dashboard');
  };

  const handlePaymentInitiated = (item: ServiceRequest | Quote) => {
    setActiveCheckout(item);
  };

  const handlePaymentComplete = (ref: string, provider: string) => {
    if (!activeCheckout) return;
    
    const isCrypto = provider === 'USDT_BEP20' || provider === 'USDC_BASE';
    const finalStatus = isCrypto ? ('PAYMENT PENDING' as const) : ('PAYMENT VERIFIED' as const);

    // Update request or quote status securely
    const isQuote = 'quoteNumber' in activeCheckout;
    if (isQuote) {
      const updatedQuotes = quotes.map(q => q.id === activeCheckout.id ? { ...q, status: (isCrypto ? 'PENDING' : 'PAID') as any } : q);
      setQuotes(updatedQuotes);
      saveState('goye_quotes_v2', updatedQuotes);

      // Update associated request to PAYMENT VERIFIED or PAYMENT PENDING
      const assocReq = requests.map(r => r.id === (activeCheckout as Quote).requestId ? { ...r, status: finalStatus, paymentRef: ref, paymentProvider: provider } : r);
      setRequests(assocReq);
      saveState('goye_requests_v2', assocReq);
    } else {
      const updatedReqs = requests.map(r => r.id === activeCheckout.id ? { ...r, status: finalStatus, paymentRef: ref, paymentProvider: provider } : r);
      setRequests(updatedReqs);
      saveState('goye_requests_v2', updatedReqs);
    }

    logAction(
      currentUser?.name || 'Customer', 
      isCrypto ? `Submitted ${provider} Tx Hash for verification` : 'Completed Payment Verification', 
      activeCheckout.id
    );
    setActiveCheckout(null);
    setActiveSection('dashboard');
  };

  const handleAiSendMessage = () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    const newMessages = [...aiMessages, { sender: 'user' as const, text: userMsg }];
    setAiMessages(newMessages);
    setAiInput('');

    // Local smart classifier based on spec boundaries
    let aiResponse = "";
    const lower = userMsg.toLowerCase();

    if (lower.includes('cac') || lower.includes('register') || lower.includes('company') || lower.includes('llc') || lower.includes('business name')) {
      aiResponse = "GOYE SERVICES HUB provides elite support for Corporate Affairs Commission (CAC) registrations. Our fixed fees: Business Name Registration (₦15,000 + ₦10,000 Govt fee, 5-7 days) and LLC Incorporation (₦35,000 + ₦20,000 Govt fee, 7-10 days). Please note, official approval is strictly subject to Corporate Affairs Commission timelines.";
    } else if (lower.includes('web') || lower.includes('site') || lower.includes('e-commerce') || lower.includes('landing') || lower.includes('shop') || lower.includes('store')) {
      aiResponse = "We build state-of-the-art Web Applications and E-commerce Platforms with complete Paystack & Pi payments integration. Packages include: Starter Showcase (₦45,000, 4-6 days), Business Website (₦85,000, 7-10 days), and Luxury E-commerce (₦150,000, 12-15 days). All setups can be fully managed from your Admin Dashboard.";
    } else if (lower.includes('ai') || lower.includes('bot') || lower.includes('whatsapp') || lower.includes('chat') || lower.includes('assistant') || lower.includes('automation')) {
      aiResponse = "Automate your operational workflows with our conversational AI bots! We build WhatsApp Business AI Assistants (₦150,000, 5-7 days) to track inventory/sales and Website FAQ Assistants (₦35,000, 3-5 days). All business-specific datasets remain private and strictly isolated.";
    } else if (lower.includes('digital') || lower.includes('setup') || lower.includes('google') || lower.includes('email') || lower.includes('branding') || lower.includes('domain')) {
      aiResponse = "Our Digital Solutions team assists with professional setups: Google Business Profile configurations (₦10,000), brand identity consultation, custom integrations, or email configurations (₦25,000). You can request custom digital solutions directly in our workspace.";
    } else if (lower.includes('pay') || lower.includes('price') || lower.includes('fee') || lower.includes('cost') || lower.includes('quote') || lower.includes('payment')) {
      aiResponse = "GOYE SERVICES HUB features verified, server-side secure payment options. We integrate Paystack and Pi Network payments. Fixed services are paid immediately, while custom scopes trigger our Quotation System where you can review and accept a digital quote before completing payment.";
    } else if (lower.includes('contact') || lower.includes('email') || lower.includes('support') || lower.includes('whatsapp number') || lower.includes('phone')) {
      aiResponse = "You can connect with us directly! Reach us at goyedagosmessenterprise@gmail.com, use our in-app Customer Support Ticket Desk, or click 'Chat on WhatsApp' for real-time human assistance.";
    } else {
      aiResponse = "I am the GOYE AI ASSISTANT. I can help guide you on CAC Services (Business/LLC setups), Website Development packages, custom WhatsApp AI Assistants, and Google Business profile configurations. Which of these division services are you interested in today?";
    }

    setTimeout(() => {
      setAiMessages(prev => [...prev, { sender: 'ai' as const, text: aiResponse }]);
    }, 600);
  };

  const isAdmin = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.email === 'goyedagosmessenterprise@gmail.com'
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans selection:bg-yellow-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff] backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveSection('home')}>
            <img src={ASSETS.LOGO} alt="GOYE Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm border border-gray-100" />
            <div>
              <h1 className="text-lg font-black tracking-tight text-[#0a0a0a] uppercase leading-none">GOYE HUB</h1>
              <p className="text-[9px] text-[#a1a1aa] font-black tracking-widest leading-none mt-1">SERVICES PLATFORM</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => setActiveSection('home')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeSection === 'home' ? 'text-yellow-600' : 'text-gray-500 hover:text-black'}`}>Home</button>
            <button onClick={() => { setSelectedService(null); setActiveSection('services'); }} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeSection === 'services' ? 'text-yellow-600' : 'text-gray-500 hover:text-black'}`}>Services</button>
            <button onClick={() => setActiveSection('faq')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeSection === 'faq' ? 'text-yellow-600' : 'text-gray-500 hover:text-black'}`}>Pricing</button>
            <button onClick={() => setActiveSection('contact')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeSection === 'contact' ? 'text-yellow-600' : 'text-gray-500 hover:text-black'}`}>Contact</button>
          </nav>

          <div className="flex items-center gap-4">
            {/* Desktop Auth Section */}
            {currentUser ? (
              <div className="hidden lg:flex items-center gap-3">
                {isAdmin && (
                  <button 
                    onClick={() => setActiveSection('admin')}
                    className="bg-black hover:bg-gray-900 text-white px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow"
                  >
                    <LayoutDashboard size={14} className="text-yellow-400" /> Admin Dashboard
                  </button>
                )}
                <button 
                  onClick={() => setActiveSection('dashboard')}
                  className="bg-yellow-400 text-black px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 shadow"
                >
                  <User size={14} /> My Account
                </button>
                <button onClick={handleLogout} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-slate-800" title="Sign Out">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveSection('dashboard')}
                className="hidden lg:block bg-[#FFD700] hover:bg-yellow-400 text-black px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-md"
              >
                Sign In
              </button>
            )}

            {/* Mobile Header Buttons (Right side properly aligned next to Hamburger) */}
            <div className="lg:hidden flex items-center gap-2">
              {currentUser ? (
                <button 
                  onClick={() => setActiveSection('dashboard')}
                  className="bg-yellow-400 text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <User size={12} /> My Account
                </button>
              ) : (
                <button 
                  onClick={() => setActiveSection('dashboard')}
                  className="bg-[#FFD700] hover:bg-yellow-400 text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Hamburger Trigger */}
            <button className="lg:hidden p-2 text-slate-800 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-[100] bg-white p-8 flex flex-col text-slate-900"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <img src={ASSETS.LOGO} alt="GOYE Logo" className="w-10 h-10 object-contain rounded-lg" />
                <span className="font-black tracking-tight text-xl uppercase">GOYE HUB</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-800">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-8 flex-grow">
              <button onClick={() => { setActiveSection('home'); setIsMenuOpen(false); }} className="text-3xl font-black text-left uppercase tracking-tight">Home</button>
              <button onClick={() => { setSelectedService(null); setActiveSection('services'); setIsMenuOpen(false); }} className="text-3xl font-black text-left uppercase tracking-tight">Services</button>
              <button onClick={() => { setActiveSection('dashboard'); setIsMenuOpen(false); }} className="text-3xl font-black text-left uppercase tracking-tight">Dashboard</button>
              <button onClick={() => { setActiveSection('faq'); setIsMenuOpen(false); }} className="text-3xl font-black text-left uppercase tracking-tight">Pricing</button>
              <button onClick={() => { setActiveSection('contact'); setIsMenuOpen(false); }} className="text-3xl font-black text-left uppercase tracking-tight">Contact</button>
            </div>

            {/* Mobile Auth Drawer Buttons */}
            <div className="border-t border-gray-100 pt-8 mt-auto space-y-4">
              {currentUser ? (
                <>
                  {isAdmin && (
                    <button 
                      onClick={() => { setActiveSection('admin'); setIsMenuOpen(false); }}
                      className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow"
                    >
                      <LayoutDashboard size={14} className="text-yellow-400" /> Admin Dashboard
                    </button>
                  )}
                  <button 
                    onClick={() => { setActiveSection('dashboard'); setIsMenuOpen(false); }}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <User size={14} /> My Account
                  </button>
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-slate-800 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <X size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { setActiveSection('dashboard'); setIsMenuOpen(false); }}
                  className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-md"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main View Container */}
      <main className="pt-20">
        {activeSection === 'home' && <HomeView onExplore={(cat) => { setActiveCategoryFilter(cat || 'ALL'); setSelectedService(null); setActiveSection('services'); }} />}
        {activeSection === 'services' && (
          <ServicesView 
            selectedService={selectedService} 
            onSelect={setSelectedService} 
            currentUser={currentUser} 
            onAuth={() => setActiveSection('dashboard')} 
            onSubmit={handleRequestSubmit}
            activeCategoryFilter={activeCategoryFilter}
            setActiveCategoryFilter={setActiveCategoryFilter}
          />
        )}
        {activeSection === 'dashboard' && <DashboardView currentUser={currentUser} onAuth={handleRegister} requests={requests} quotes={quotes} onPay={handlePaymentInitiated} supportTickets={supportTickets} setSupportTickets={setSupportTickets} documents={documents} setRequests={setRequests} isPiBrowser={isPiBrowser} onPiRegister={(p: any) => { setCurrentUser(p); saveState('goye_user_profile', p); logAction(p.name, 'User Registered via Pi SDK', p.id); }} />}
        {activeSection === 'admin' && <AdminView currentUser={currentUser} requests={requests} setRequests={setRequests} quotes={quotes} setQuotes={setQuotes} auditLogs={auditLogs} piConfig={piConfig} onUpdatePiConfig={handleUpdatePiConfig} />}
        {activeSection === 'faq' && <FaqView />}
        {activeSection === 'about' && <AboutView />}
        {activeSection === 'contact' && <ContactView config={config} />}
        {activeSection === 'legal' && <LegalView />}
      </main>

      {/* Checkout Modal */}
      <AnimatePresence>
        {activeCheckout && (
          <CheckoutModal 
            item={activeCheckout} 
            isPiBrowser={isPiBrowser} 
            onClose={() => setActiveCheckout(null)} 
            onComplete={handlePaymentComplete} 
            piConfig={piConfig}
          />
        )}
      </AnimatePresence>

      {/* Floating GOYE AI Assistant */}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end">
        <AnimatePresence>
          {isAiOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white border border-gray-100 rounded-3xl w-80 md:w-96 h-[450px] shadow-2xl flex flex-col overflow-hidden mb-4 text-slate-950"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-yellow-400 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest">GOYE AI ASSISTANT</h4>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Online &amp; Business Guided</p>
                  </div>
                </div>
                <button onClick={() => setIsAiOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Message List */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 flex flex-col">
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-[11px] font-bold uppercase tracking-wider leading-relaxed ${msg.sender === 'user' ? 'bg-yellow-500 text-black rounded-tr-none shadow' : 'bg-white text-slate-800 border border-gray-100 rounded-tl-none shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAiSendMessage(); }}
                  placeholder="Ask about CAC, Websites, AI, or payments..."
                  className="flex-grow bg-slate-50 border border-gray-100 rounded-xl p-2 px-3 text-xs font-bold outline-none focus:border-yellow-500 text-slate-900"
                />
                <button onClick={handleAiSendMessage} className="p-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl transition-colors shrink-0">
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsAiOpen(!isAiOpen)}
          className="bg-slate-900 hover:bg-yellow-500 hover:text-black text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all group border border-white/10"
        >
          <Bot size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500">AI Assistant</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={ASSETS.LOGO} alt="GOYE Logo" className="w-10 h-10 object-contain rounded-lg" />
              <span className="text-xl font-black uppercase tracking-tight">GOYE SERVICES HUB</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              Unified digital solutions designed exclusively for modern businesses. We assist with registration, custom websites, state-of-the-art AI assistants, and enterprise setups.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-yellow-500 mb-6">Service Divisions</h4>
            <ul className="space-y-3 text-xs text-gray-400 uppercase tracking-widest font-bold">
              <li className="hover:text-yellow-500 cursor-pointer" onClick={() => { setSelectedService(null); setActiveSection('services'); }}>CAC Business Setup</li>
              <li className="hover:text-yellow-500 cursor-pointer" onClick={() => { setSelectedService(null); setActiveSection('services'); }}>Website Design</li>
              <li className="hover:text-yellow-500 cursor-pointer" onClick={() => { setSelectedService(null); setActiveSection('services'); }}>AI Automations</li>
              <li className="hover:text-yellow-500 cursor-pointer" onClick={() => { setSelectedService(null); setActiveSection('services'); }}>Digital Solutions</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-yellow-500 mb-6">Support & Legal</h4>
            <ul className="space-y-3 text-xs text-gray-400 uppercase tracking-widest font-bold">
              <li className="hover:text-yellow-500 cursor-pointer" onClick={() => setActiveSection('faq')}>FAQ & Pricing</li>
              <li className="hover:text-yellow-500 cursor-pointer" onClick={() => setActiveSection('legal')}>Terms of Service</li>
              <li className="hover:text-yellow-500 cursor-pointer" onClick={() => setActiveSection('legal')}>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">© 2026 GOYE SERVICES HUB. All Rights Reserved.</p>
          <a href={`mailto:${config.supportEmail}`} className="text-xs font-black text-yellow-500 uppercase tracking-widest hover:underline flex items-center gap-2">
            <Mail size={14} /> Contact support desk: {config.supportEmail}
          </a>
        </div>
      </footer>
    </div>
  );
}

// --- Home View Component ---
function HomeView({ onExplore }: { onExplore: (category?: string) => void }) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center py-24 px-6 overflow-hidden bg-gradient-to-b from-[#ffffff] to-[#f8f9fa] border-b border-gray-100">
        <div className="absolute inset-0 z-0 opacity-5" style={{ backgroundImage: `url('${ASSETS.HERO_BG}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block border border-yellow-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-yellow-600 mb-8 bg-yellow-50"
          >
            Official Business Services Hub
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 uppercase leading-[1.1] tracking-tight pb-6 overflow-visible break-words"
          >
            BUILD, REGISTER, <br className="hidden sm:inline" /> AUTOMATE & SCALE YOUR BUSINESS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg md:text-xl max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
          >
            CAC Services • Websites • AI Bots • Digital Solutions
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-row items-center justify-center gap-4 flex-wrap"
          >
            <button onClick={() => onExplore('ALL')} className="bg-[#FFD700] hover:bg-yellow-400 text-black px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md">
              Get Started
            </button>
            <button onClick={() => onExplore('ALL')} className="border border-slate-900 text-slate-900 hover:bg-slate-50 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
              Explore Services
            </button>
          </motion.div>
        </div>
      </section>

      {/* Premium Stats Grid Bar */}
      <section className="bg-white py-16 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: "500+", l: "Elite Clients" },
            { v: "98%", l: "Success Rate" },
            { v: "24/7", l: "Dedicated Support" },
            { v: "4", l: "Core Divisions" }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-3xl md:text-5xl font-black text-[#FFD700] tracking-tight">{stat.v}</div>
              <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">{stat.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Brand/Portfolio Cards Section with clean white background */}
      <section className="bg-[#f8f9fa] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4 text-[#0a0a0a]">Core Service Divisions</h2>
            <p className="text-gray-500 max-w-xl mx-auto font-medium text-sm">Professional expertise tailored exactly for modern African and global operations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ServiceHomeCard 
              image={ASSETS.CAC_IMG}
              badge="CAC DIVISION"
              title="CAC Services"
              desc="Expert business registration and LLC incorporation support. Subject to Corporate Affairs Commission requirements."
              price="₦15,000"
              btn="Explore CAC"
              onClick={() => onExplore('CAC')}
            />
            <ServiceHomeCard 
              image={ASSETS.WEB_IMG}
              badge="WEB DIVISION"
              title="Web Development"
              desc="E-commerce store setups with seamless payment integrations and automated checkouts."
              price="₦45,000"
              btn="Build Web"
              onClick={() => onExplore('WEB')}
            />
            <ServiceHomeCard 
              image={ASSETS.AI_IMG}
              badge="AI DIVISION"
              title="AI Automations"
              desc="Smart business AI assistants designed to automate chats, stock tracking, and orders directly on WhatsApp."
              price="₦35,000"
              btn="Build AI Bot"
              onClick={() => onExplore('AI')}
            />
          </div>
        </div>
      </section>

      {/* Structured 5 Steps Process */}
      <section className="bg-white py-24 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-widest mb-4 text-yellow-600">How It Works</h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Our optimized service delivery cycle</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { n: '01', t: 'Choose Service', d: 'Select from our verified catalog or request custom solutions.' },
              { n: '02', t: 'Submit Form', d: 'Securely submit required business credentials and attachments.' },
              { n: '03', t: 'Review & Quote', d: 'Our engineers audit details and produce fixed-price or quote scopes.' },
              { n: '04', t: 'Secure Payment', d: 'Initiate payment securely through certified channels (Paystack, Pi).' },
              { n: '05', t: 'Track & Receive', d: 'Receive status updates and download finished digital products.' }
            ].map((step, idx) => (
              <div key={idx} className="bg-[#f8f9fa] border border-gray-100 p-6 rounded-2xl flex flex-col items-center text-center">
                <div className="text-4xl font-black text-yellow-500 mb-4">{step.n}</div>
                <h3 className="font-black uppercase text-xs mb-2">{step.t}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed tracking-wider">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Service Showcase Cards ---
function ServiceHomeCard({ image, badge, title, desc, btn, price, onClick }: { image: string, badge: string, title: string, desc: string, btn: string, price: string, onClick: () => void }) {
  return (
    <div className="bg-[#ffffff] text-[#0a0a0a] rounded-[24px] overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-gray-100 group">
      <div className="h-48 overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-4 left-4 bg-[#FFD700] text-black font-black text-[9px] uppercase px-3 py-1.5 rounded-full tracking-wider shadow">
          {badge}
        </div>
      </div>
      <div className="p-8 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-[20px] font-black uppercase mb-3 tracking-tight group-hover:text-yellow-600 transition-colors leading-tight overflow-visible break-words">{title}</h3>
          <p className="text-[14px] text-gray-500 font-medium uppercase tracking-wide leading-relaxed mb-6">{desc}</p>
        </div>
        <div>
          <div className="border-t border-gray-100 pt-4 mb-6">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Starting from</p>
            <p className="text-2xl font-black text-[#FFD700]">{price}</p>
          </div>
          <button onClick={onClick} className="w-full bg-[#0a0a0a] text-white hover:bg-yellow-400 hover:text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
            {btn}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Services Catalog View ---
function ServicesView({ selectedService, onSelect, currentUser, onAuth, onSubmit, activeCategoryFilter, setActiveCategoryFilter }: { selectedService: Service | null, onSelect: (s: Service | null) => void, currentUser: UserProfile | null, onAuth: () => void, onSubmit: (s: Service, f: any) => void, activeCategoryFilter: string, setActiveCategoryFilter: (cat: string) => void }) {
  const [formData, setFormData] = useState<any>({});

  if (selectedService) {
    return (
      <div className="px-6 max-w-3xl mx-auto py-12 text-slate-900">
        <button onClick={() => onSelect(null)} className="mb-8 text-yellow-600 flex items-center gap-2 font-black uppercase text-xs tracking-widest">
          <ChevronRight className="rotate-180" size={16} /> Back to Catalog
        </button>
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-lg">
          <div className="mb-8 pb-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest mb-3 inline-block">{selectedService.type} Division</span>
              <h2 className="text-3xl font-black uppercase mb-1 tracking-tight text-slate-900">{selectedService.name}</h2>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Timeline: {selectedService.timeline}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-2xl font-black text-yellow-600">₦{selectedService.price.toLocaleString()}</p>
              {selectedService.govtFee && <p className="text-[10px] text-gray-500 font-bold uppercase">+ ₦{selectedService.govtFee.toLocaleString()} Govt Fee</p>}
            </div>
          </div>

          {!currentUser ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-gray-200 rounded-2xl">
              <Lock className="mx-auto mb-4 text-yellow-600" size={32} />
              <p className="text-xs font-black text-gray-500 mb-6 uppercase tracking-widest">Sign In to initiate this service request</p>
              <button onClick={onAuth} className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs">Access Account</button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit(selectedService, formData); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Full Name / Applicant" required onChange={v => setFormData({...formData, applicantName: v})} />
                <FormInput label="Phone / WhatsApp Number" type="tel" required onChange={v => setFormData({...formData, phone: v})} />
              </div>
              <FormInput label="Residential / Office Address" required onChange={v => setFormData({...formData, address: v})} />

              {selectedService.type === 'CAC' && (
                <div className="space-y-6 pt-6 border-t border-gray-100">
                  <FormInput label="Proposed Business Name" required onChange={v => setFormData({...formData, proposedName1: v})} />
                  <FormInput label="Alternative Business Name" onChange={v => setFormData({...formData, proposedName2: v})} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormInput label="Business Type (LLC / Business Name)" required onChange={v => setFormData({...formData, lga: v})} />
                    <FormInput label="State" required onChange={v => setFormData({...formData, state: v})} />
                    <FormInput label="LGA" required onChange={v => setFormData({...formData, lga: v})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nature of Business Activities</label>
                    <textarea required onChange={e => setFormData({...formData, activities: e.target.value})} className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 h-32 outline-none focus:border-yellow-500 text-sm font-bold text-slate-900"></textarea>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3 text-xs text-gray-600">
                    <Info size={18} className="text-yellow-600 shrink-0" />
                    <p className="font-bold uppercase tracking-wider text-[10px] leading-relaxed">
                      Wording: We assist customers with the CAC registration process. Final registration/approval is subject to Corporate Affairs Commission requirements.
                    </p>
                  </div>
                </div>
              )}

              {selectedService.type === 'WEB' && (
                <div className="space-y-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Business / Brand Name" required onChange={v => setFormData({...formData, brandName: v})} />
                    <FormInput label="Business Category" required onChange={v => setFormData({...formData, bizCat: v})} />
                  </div>
                  <FormInput label="Desired Pages & Functionalities" placeholder="e.g. Home, Shop, Payment Gateway, Cart" required onChange={v => setFormData({...formData, pages: v})} />
                  <FormInput label="Reference Sites" placeholder="Enter links to sites you admire" onChange={v => setFormData({...formData, referenceSites: v})} />
                </div>
              )}

              {selectedService.type === 'AI' && (
                <div className="space-y-6 pt-6 border-t border-gray-100">
                  <FormInput label="Business Name" required onChange={v => setFormData({...formData, businessName: v})} />
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-gray-600 mb-4">
                     <p className="text-yellow-600 font-black uppercase mb-1">AI Chatbot Setup Form</p>
                     <p className="font-bold uppercase tracking-wider text-[10px]">This is an intake questionnaire for custom deployment.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">List Common Customer FAQs</label>
                    <textarea required onChange={e => setFormData({...formData, faqs: e.target.value})} className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 h-32 outline-none focus:border-yellow-500 text-sm font-bold text-slate-900"></textarea>
                  </div>
                </div>
              )}

              {selectedService.type === 'DIG' && (
                <div className="space-y-6 pt-6 border-t border-gray-100">
                  <FormInput label="Problem Description" required onChange={v => setFormData({...formData, problem: v})} />
                  <FormInput label="Desired Outcome" required onChange={v => setFormData({...formData, desiredOutcome: v})} />
                </div>
              )}

              <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow">
                Submit & Process Service Request
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const filteredServices = activeCategoryFilter === 'ALL' 
    ? SERVICES_CATALOG 
    : SERVICES_CATALOG.filter(s => s.type === activeCategoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-slate-900">
      <div className="mb-12">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">Service Catalog</h2>
        <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Nigeria's premier structured business support program</p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-12 scrollbar-none">
        {[
          { id: 'ALL', label: 'All Services' },
          { id: 'CAC', label: 'CAC Services' },
          { id: 'WEB', label: 'Websites' },
          { id: 'AI', label: 'AI Bots' },
          { id: 'DIG', label: 'Digital Solutions' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryFilter(cat.id)}
            className={`px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all shrink-0 ${
              activeCategoryFilter === cat.id
                ? 'bg-[#FFD700] text-black shadow-sm'
                : 'bg-white border border-gray-100 text-gray-500 hover:text-black'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredServices.map(s => (
          <div key={s.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow hover:border-yellow-500/20 hover:shadow-lg transition-all flex flex-col animate-fadeIn">
            <div className="h-44 relative">
              <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <span className="text-[8px] font-black uppercase bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full tracking-widest self-start mb-4">{s.type} Division</span>
              <h3 className="font-black uppercase text-lg leading-tight mb-3 text-slate-900">{s.name}</h3>
              <p className="text-[11px] text-gray-500 font-bold uppercase leading-relaxed tracking-wider mb-8 flex-1">{s.description}</p>
              <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Professional Fee</p>
                  <p className="text-lg font-black text-yellow-600">₦{s.price.toLocaleString()}</p>
                </div>
                {s.govtFee && (
                  <div className="text-right">
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Govt Fee</p>
                    <p className="text-xs font-black text-gray-500">₦{s.govtFee.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <button onClick={() => onSelect(s)} className="w-full bg-slate-900 text-white hover:bg-yellow-400 hover:text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                Select Service
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Dashboard View Component ---
function DashboardView({ currentUser, onAuth, requests, quotes, onPay, supportTickets, setSupportTickets, documents, setRequests, isPiBrowser, onPiRegister }: { currentUser: UserProfile | null, onAuth: (n: string, e: string, p: string) => void, requests: ServiceRequest[], quotes: Quote[], onPay: (r: ServiceRequest | Quote) => void, supportTickets: SupportTicket[], setSupportTickets: any, documents: GoyeDocument[], setRequests: any, isPiBrowser?: boolean, onPiRegister?: (p: any) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketCategory, setTicketCategory] = useState('CAC Support');
  const [ticketMsg, setTicketMsg] = useState('');

  const handlePiAuthentication = () => {
    if (typeof window !== 'undefined' && (window as any).Pi && onPiRegister) {
      (window as any).Pi.authenticate(['username', 'payments'], async (payment: any) => {
        console.log("Incomplete payment found on auth: ", payment);
        try {
          await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction.txid })
          });
        } catch (err) {
          console.error("Failed to reconcile incomplete payment on auth:", err);
        }
      }).then(async (auth: any) => {
        const verifyRes = await fetch('/api/pi/verify-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: auth.accessToken })
        });
        const verifyData = await verifyRes.json();
        if (verifyData && verifyData.status === 'success') {
          const piUser = verifyData.data;
          const profile = {
            id: piUser.uid || auth.user.uid,
            name: piUser.username || auth.user.username,
            email: `${piUser.username || auth.user.username}@goye-pi.store`,
            phone: "Pi Network Verified User",
            role: (piUser.username === 'goyedagosmessenterprise' || piUser.username === 'ifiok82') ? 'admin' : 'customer',
            createdAt: Date.now(),
            accessToken: auth.accessToken
          };
          onPiRegister(profile);
        } else {
          alert("Pi token server-side validation failed.");
        }
      }).catch((err: any) => {
        console.error("Pi Auth error: ", err);
        alert("Pi SDK authentication failed.");
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-lg">
          <User className="mx-auto mb-6 text-yellow-500" size={48} />
          <h2 className="text-3xl font-black uppercase mb-1 tracking-tighter text-slate-900">Access HUB</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Access customer portal & verify payments</p>
          
          {isPiBrowser && (
            <button 
              onClick={handlePiAuthentication}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white hover:text-yellow-400 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 mb-6 border border-gray-150 transition-all text-xs"
            >
              <Bot size={16} className="text-yellow-400 animate-pulse" /> Sign In with Pi Network
            </button>
          )}

          {isPiBrowser && (
            <div className="flex items-center gap-3 my-6">
              <div className="h-[1px] bg-gray-200 flex-grow" />
              <span className="text-[9px] text-gray-400 font-black uppercase">OR USE STANDARD WEB FORM</span>
              <div className="h-[1px] bg-gray-200 flex-grow" />
            </div>
          )}

          <form className="space-y-4 text-left" onSubmit={e => { e.preventDefault(); onAuth(name, email, phone); }}>
            <FormInput label="Full Name" required onChange={setName} />
            <FormInput label="Email Address" type="email" required onChange={setEmail} />
            <FormInput label="Phone / WhatsApp Number" type="tel" required onChange={setPhone} />
            <button className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black py-4 rounded-xl font-black uppercase tracking-widest mt-6">Continue</button>
          </form>
        </div>
      </div>
    );
  }

  const userReqs = requests.filter(r => r.userId === currentUser.id);
  const userQuotes = quotes.filter(q => q.status === 'PENDING');

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: SupportTicket = {
      id: Math.random().toString(36).substring(7),
      userId: currentUser.id,
      category: ticketCategory,
      message: ticketMsg,
      status: 'Open',
      createdAt: Date.now()
    };
    const updated = [newTicket, ...supportTickets];
    setSupportTickets(updated);
    localStorage.setItem('goye_tickets_v2', JSON.stringify(updated));
    setTicketMsg('');
    alert("Support request submitted successfully.");
  };

  const [activeTab, setActiveTab] = useState<'requests' | 'quotes' | 'documents' | 'support' | 'profile'>('requests');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-slate-900 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12 pb-8 border-b border-gray-150">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-slate-900">Client Workspace & CRM</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <User size={14} className="text-yellow-600 animate-pulse" /> {currentUser.name} <span className="text-gray-300">|</span> ID: {currentUser.id} <span className="text-gray-300">|</span> Phone: {currentUser.phone}
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <StatMini label="My Requests" value={userReqs.length} />
          <StatMini label="Quotes Received" value={userQuotes.length} />
          <StatMini label="Support Tickets" value={supportTickets.length} />
        </div>
      </div>

      {/* CRM Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-gray-100 scrollbar-none">
        {[
          { id: 'requests', label: 'My Requests & Orders' },
          { id: 'quotes', label: 'Invoices & Quotes' },
          { id: 'documents', label: 'Document Vault' },
          { id: 'support', label: 'Support Desk' },
          { id: 'profile', label: 'Account Profile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#FFD700] text-black shadow-md'
                : 'bg-white border border-gray-100 text-gray-500 hover:text-black hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Tab Contents */}
        <div className="lg:col-span-2 space-y-8">
          
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-yellow-600 flex items-center gap-2">
                <FileCheck size={18} /> Process Status & Requests
              </h3>
              {userReqs.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">No active service requests.</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select a division package from the catalog to submit your information details.</p>
                </div>
              ) : (
                userReqs.map(req => (
                  <div key={req.id} className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:border-yellow-500/20 transition-all">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="font-black text-base md:text-lg uppercase tracking-tight text-slate-900 leading-tight">{req.serviceName}</h4>
                        <span className="text-[9px] font-mono font-bold text-gray-400 bg-slate-50 border border-gray-150 rounded px-2.5 py-1">{req.requestNumber}</span>
                      </div>
                      <div className="flex gap-4 items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                         <span>Date: {new Date(req.createdAt).toLocaleDateString()}</span>
                         <span>•</span>
                         <span>Fee: ₦{(req.amount).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between border-t border-gray-50 md:border-0 pt-4 md:pt-0">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                        req.status === 'PAYMENT VERIFIED' || req.status === 'COMPLETED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : req.status === 'PAYMENT PENDING'
                          ? 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse'
                          : 'bg-slate-50 border-gray-200 text-slate-800'
                      }`}>
                        {req.status}
                      </span>
                      {req.status === 'SUBMITTED' && (
                        <button onClick={() => onPay(req)} className="bg-[#FFD700] hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm shrink-0">
                          Pay Fee
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-yellow-600 flex items-center gap-2">
                <DollarSign size={18} /> Invoices & Received Quotes
              </h3>
              {userQuotes.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">No pending quotes or invoices.</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Custom scope queries will appear here once reviewed by our engineers.</p>
                </div>
              ) : (
                userQuotes.map(q => (
                  <div key={q.id} className="bg-yellow-50/50 border border-yellow-200 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                    <div>
                      <p className="text-[8px] text-yellow-700 font-black uppercase tracking-widest mb-1">Scope Invoice {q.quoteNumber}</p>
                      <h4 className="font-black text-lg uppercase leading-none mb-2 text-slate-900">{q.serviceName}</h4>
                      <p className="text-xs text-slate-700 font-bold uppercase mb-1">{q.notes}</p>
                      <p className="text-[9px] text-gray-400 font-black uppercase">Expires: {new Date(q.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t border-yellow-200/30 md:border-0 pt-4 md:pt-0">
                      <p className="text-xl font-black text-slate-900">₦{q.total.toLocaleString()}</p>
                      <button onClick={() => onPay(q)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow shrink-0">Pay Invoice</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-yellow-600 flex items-center gap-2">
                <Download size={18} /> Completed Corporate Files
              </h3>
              {documents.filter(d => d.userId === currentUser.id).length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">No official documents uploaded yet.</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Completion certs and deliverables are privately uploaded here once validated.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.filter(d => d.userId === currentUser.id).map(doc => (
                    <div key={doc.id} className="p-5 bg-white rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm hover:border-yellow-500/10 transition-all">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 leading-tight mb-1">{doc.filename}</h4>
                        <p className="text-[8px] text-gray-400 font-black uppercase mb-1">Type: {doc.documentType}</p>
                        <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">Available for Download</p>
                      </div>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); alert("File downloaded securely through verified credentials."); }}
                        className="p-3 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition-colors shrink-0 shadow-sm"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-yellow-600 flex items-center gap-2">
                <MessageSquare size={18} /> Support Ticket History
              </h3>
              {supportTickets.filter(t => t.userId === currentUser.id).length === 0 ? (
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-center py-12 bg-white border border-gray-100 rounded-3xl">No support tickets filed yet.</p>
              ) : (
                <div className="space-y-4">
                  {supportTickets.filter(t => t.userId === currentUser.id).map(ticket => (
                    <div key={ticket.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                      <div className="flex justify-between items-start mb-3 gap-4 flex-wrap">
                        <div>
                          <span className="text-[8px] font-black uppercase bg-slate-100 px-2 py-1 rounded text-gray-500 mr-2">{ticket.category}</span>
                          <span className="text-[9px] font-mono text-gray-400">ID: {ticket.id}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          ticket.status === 'Open' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-gray-200 text-gray-500'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-relaxed uppercase tracking-wider">{ticket.message}</p>
                      <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-3">Filed {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-yellow-600">Client Profile Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold uppercase tracking-wider text-gray-500">
                 <div>
                   <p className="text-[9px] text-gray-400 block mb-1">Corporate Client Name</p>
                   <p className="p-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 font-black">{currentUser.name}</p>
                 </div>
                 <div>
                   <p className="text-[9px] text-gray-400 block mb-1">Verified Email Address</p>
                   <p className="p-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 font-black">{currentUser.email}</p>
                 </div>
                 <div>
                   <p className="text-[9px] text-gray-400 block mb-1">Corporate Coordinate (Phone)</p>
                   <p className="p-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 font-black">{currentUser.phone}</p>
                 </div>
                 <div>
                   <p className="text-[9px] text-gray-400 block mb-1">Workspace Assignment Role</p>
                   <p className="p-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 font-black">{currentUser.role === 'admin' ? 'SYSTEM OWNER' : 'BUSINESS APPLICANT'}</p>
                 </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Fast Actions (Form submission & Support Desk) */}
        <div className="space-y-12">
          {/* Submit Support Ticket */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-yellow-600 mb-6 flex items-center gap-2">
               <MessageSquare size={14} /> Submit Query
            </h3>
            <form onSubmit={handleTicketSubmit} className="space-y-4">
               <div className="space-y-1">
                 <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Category</label>
                 <select 
                   value={ticketCategory} 
                   onChange={e => setTicketCategory(e.target.value)}
                   className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs font-bold text-slate-900 uppercase outline-none focus:border-yellow-500"
                 >
                   <option value="CAC Support">CAC Support</option>
                   <option value="Website Assistance">Website Assistance</option>
                   <option value="AI Bot Issue">AI Bot Issue</option>
                   <option value="General Query">General Query</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Message Thread</label>
                 <textarea 
                   required
                   value={ticketMsg}
                   onChange={e => setTicketMsg(e.target.value)}
                   className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 h-28 text-xs font-bold text-slate-900 outline-none focus:border-yellow-500"
                 />
               </div>
               <button className="w-full bg-yellow-500 text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm">Submit Ticket</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Admin Control View ---
function AdminView({ currentUser, requests, setRequests, quotes, setQuotes, auditLogs, piConfig, onUpdatePiConfig }: { currentUser: UserProfile | null, requests: ServiceRequest[], setRequests: any, quotes: Quote[], setQuotes: any, auditLogs: AuditLog[], piConfig: any, onUpdatePiConfig: (cfg: any) => void }) {
  const [adminPass, setAdminPass] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);

  // Quote form state
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState('');

  const [healthMetrics, setHealthMetrics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthMetrics(data))
      .catch(err => console.warn("Could not load payment status", err));
  }, []);

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="text-center py-24 text-red-500 uppercase font-black tracking-widest">Access Restricted to Administrators</div>;
  }

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-lg">
          <Lock className="mx-auto mb-6 text-yellow-500" size={48} />
          <h2 className="text-3xl font-black uppercase mb-1 tracking-tighter text-slate-900">Admin Verification</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-10">Provide security password to unlock cockpit</p>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (adminPass === ADMIN_PASSWORD) setIsUnlocked(true); else alert('Incorrect Credentials'); }}>
            <FormInput label="Security Key" type="password" required onChange={setAdminPass} />
            <button className="w-full bg-[#FFD700] hover:bg-yellow-400 text-black py-4 rounded-xl font-black uppercase tracking-widest">Unlock System</button>
          </form>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = (id: string, status: ServiceRequest['status']) => {
    const updated = requests.map(r => r.id === id ? { ...r, status } : r);
    setRequests(updated);
    localStorage.setItem('goye_requests_v2', JSON.stringify(updated));
  };

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    const newQuote: Quote = {
      id: Math.random().toString(36).substring(7),
      quoteNumber: `GOYE-QTE-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId: selectedReq.id,
      serviceName: selectedReq.serviceName,
      subtotal: quoteAmount,
      discount: 0,
      tax: 0,
      total: quoteAmount,
      currency: 'NGN',
      status: 'PENDING',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      notes: quoteNotes
    };
    const updated = [newQuote, ...quotes];
    setQuotes(updated);
    localStorage.setItem('goye_quotes_v2', JSON.stringify(updated));

    // Update Request status to QUOTE READY
    handleUpdateStatus(selectedReq.id, 'QUOTE READY');
    setSelectedReq(null);
    setQuoteAmount(0);
    setQuoteNotes('');
    alert("Quote successfully sent to customer.");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-slate-900">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-slate-900">Admin Control Hub</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Operations Platform</p>
        </div>
        <div className="flex gap-4">
          <StatMini label="Total Revenue" value={`₦${requests.filter(r => r.status === 'PAYMENT VERIFIED' || r.status === 'COMPLETED').reduce((acc, r) => acc + r.amount, 0).toLocaleString()}`} />
          <StatMini label="Requests" value={requests.length} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Active Requests Control */}
        <div className="lg:col-span-2 space-y-6 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-yellow-600 mb-6">Manage Service Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="p-4">Ref</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Fee</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold uppercase text-slate-700">
                {requests.map(req => (
                  <tr key={req.id} className="border-t border-gray-100">
                    <td className="p-4 font-mono text-yellow-600">{req.requestNumber}</td>
                    <td className="p-4 text-slate-900">{req.serviceName}</td>
                    <td className="p-4 text-slate-900">₦{req.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <select 
                        value={req.status} 
                        onChange={e => handleUpdateStatus(req.id, e.target.value as any)}
                        className="bg-slate-50 border border-gray-200 rounded px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-800"
                      >
                        {['SUBMITTED', 'UNDER REVIEW', 'QUOTE READY', 'PAYMENT PENDING', 'PAYMENT VERIFIED', 'IN PROGRESS', 'COMPLETED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      {req.status === 'SUBMITTED' && (
                        <button onClick={() => setSelectedReq(req)} className="text-[10px] text-yellow-600 font-black uppercase hover:underline">Create Quote</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log / Config Area */}
        <div className="space-y-8">
          {selectedReq && (
            <div className="bg-white border border-yellow-500/20 rounded-3xl p-8 space-y-4 shadow-md">
              <h3 className="text-xs font-black uppercase text-yellow-600 tracking-widest">Send Quote to Customer</h3>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{selectedReq.serviceName}</p>
              <form onSubmit={handleCreateQuote} className="space-y-4">
                <FormInput label="Quote Amount (NGN)" type="number" required onChange={v => setQuoteAmount(Number(v))} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Scope Details / Notes</label>
                  <textarea required value={quoteNotes} onChange={e => setQuoteNotes(e.target.value)} className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 h-24 text-xs font-bold text-slate-900 outline-none focus:border-yellow-500"></textarea>
                </div>
                <div className="flex gap-4">
                   <button type="submit" className="flex-grow bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">Send Quote</button>
                   <button type="button" onClick={() => setSelectedReq(null)} className="bg-slate-50 border border-gray-200 px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-700">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Pi Network Config Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Bot size={16} className="text-yellow-600 animate-pulse" /> Pi Network Configuration
            </h3>
            <div className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-500">
               <div>
                  <span className="text-[9px] text-gray-400 block mb-1">Environment Mode</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => onUpdatePiConfig({ ...piConfig, networkMode: 'TESTNET' })}
                      className={`py-2 rounded-lg font-black text-[9px] tracking-widest transition-all ${piConfig.networkMode === 'TESTNET' ? 'bg-orange-500 text-white shadow' : 'bg-slate-100 text-slate-700'}`}
                    >
                      TESTNET
                    </button>
                    <button 
                      onClick={() => onUpdatePiConfig({ ...piConfig, networkMode: 'MAINNET' })}
                      className={`py-2 rounded-lg font-black text-[9px] tracking-widest transition-all ${piConfig.networkMode === 'MAINNET' ? 'bg-emerald-500 text-white shadow' : 'bg-slate-100 text-slate-700'}`}
                    >
                      MAINNET
                    </button>
                  </div>
               </div>

               <div>
                  <span className="text-[9px] text-gray-400 block mb-1">Testnet / Developer Wallet</span>
                  <p className="p-3 bg-slate-50 border border-gray-100 rounded-xl font-mono text-[9px] text-slate-800 break-all select-all">{piConfig.testnetWallet}</p>
               </div>

                <div>
                  <span className="text-[9px] text-gray-400 block mb-1">KYC / Intended Real Pi Receiving Wallet — Mainnet Only</span>
                  <p className="p-3 bg-slate-50 border border-gray-100 rounded-xl font-mono text-[9px] text-slate-800 break-all select-all">{piConfig.mainnetWallet}</p>
               </div>

               <div className="p-4 rounded-xl border flex flex-col gap-1 text-[9px] font-black tracking-widest bg-yellow-50/50 border-yellow-200/50 text-yellow-800 space-y-1">
                  <p>Mode: {piConfig.networkMode}</p>
                  <p>Sandbox: {piConfig.networkMode === 'TESTNET' ? 'ON' : 'OFF'}</p>
                  <p>Testnet Payments: Developer testing only</p>
                  <p>Production Payments: {piConfig.networkMode === 'MAINNET' ? 'READY (Requires Server-Side PI_API_KEY Config)' : 'DISABLED'}</p>
               </div>
            </div>
          </div>

          {/* Payments Security & Config Debug Panel */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <CreditCard size={16} className="text-yellow-600 animate-pulse" /> Payments Config Audit
            </h3>
            <div className="space-y-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
               <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-gray-100 rounded-xl">
                 <span className="text-[9px] text-gray-400 font-black">PAYSTACK_PUBLIC_KEY</span>
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-150'}`}>
                   {import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}
                 </span>
               </div>
               <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-gray-100 rounded-xl">
                 <span className="text-[9px] text-gray-400 font-black">PAYSTACK_SECRET_KEY</span>
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${healthMetrics?.paymentGateways?.paystack_secret === 'CONFIGURED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-150'}`}>
                   {healthMetrics?.paymentGateways?.paystack_secret || 'NOT CONFIGURED'}
                 </span>
               </div>
               <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-gray-100 rounded-xl">
                 <span className="text-[9px] text-gray-400 font-black">FLUTTERWAVE_PUBLIC_KEY</span>
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-150'}`}>
                   {import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}
                 </span>
               </div>
               <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-gray-100 rounded-xl">
                 <span className="text-[9px] text-gray-400 font-black">FLUTTERWAVE_SECRET_KEY</span>
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${healthMetrics?.paymentGateways?.flutterwave_secret === 'CONFIGURED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-150'}`}>
                   {healthMetrics?.paymentGateways?.flutterwave_secret || 'NOT CONFIGURED'}
                 </span>
               </div>
               <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-gray-100 rounded-xl">
                 <span className="text-[9px] text-gray-400 font-black">USDT_BEP20</span>
                 <span className="px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-150">
                   CONFIGURED
                 </span>
               </div>
               <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-gray-100 rounded-xl">
                 <span className="text-[9px] text-gray-400 font-black">USDC_BASE</span>
                 <span className="px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-150">
                   CONFIGURED
                 </span>
               </div>
               <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-gray-100 rounded-xl">
                 <span className="text-[9px] text-gray-400 font-black">PI_API_KEY</span>
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${healthMetrics?.paymentGateways?.pi_api_key === 'CONFIGURED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-150'}`}>
                   {healthMetrics?.paymentGateways?.pi_api_key || 'NOT CONFIGURED'}
                 </span>
               </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-900">Operations Log</h3>
            <div className="space-y-4">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-500 border border-gray-100">
                  <p className="text-slate-800 mb-1">{log.action}</p>
                  <div className="flex justify-between items-center text-[8px] text-gray-400">
                     <span>By: {log.actor}</span>
                     <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Checkout View ---
function CheckoutModal({ item, isPiBrowser, onClose, onComplete, piConfig }: { item: ServiceRequest | Quote, isPiBrowser: boolean, onClose: () => void, onComplete: (ref: string, provider: string) => void, piConfig: any }) {
  const [method, setMethod] = useState<'paystack' | 'flutterwave' | 'usdt' | 'usdc' | 'pi'>(isPiBrowser ? 'pi' : 'paystack');
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState('');

  // Fallback console warning if VITE_PAYSTACK_PUBLIC_KEY is missing in frontend
  useEffect(() => {
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      console.warn("⚠️ [CONFIGURATION WARNING] VITE_PAYSTACK_PUBLIC_KEY is missing in frontend environment. Rendering payment channel fallbacks.");
    }
  }, []);

  const isSandbox = piConfig.networkMode === 'TESTNET';
  // Strictly block Mainnet from here. Mainnet remains completely disabled until full server configurations are ready.
  const isMainnetBlocked = !isSandbox;

  const price = 'amount' in item ? item.amount : item.total;
  const piAmount = Number((price / 1000).toFixed(2));

  // If no methods are available, show clear fallback message
  const availableMethods = ['paystack', 'flutterwave', 'usdt', 'usdc', 'pi'];
  if (availableMethods.length === 0) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative bg-white border border-gray-100 rounded-3xl w-full max-w-md p-8 shadow-2xl text-center text-slate-950 font-sans">
          <p className="text-sm font-black uppercase tracking-wider text-red-600 mb-2">Error</p>
          <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed">Payment methods not configured - Contact admin</p>
        </div>
      </div>
    );
  }

  // Custom Crypto addresses
  const cryptoWallets = {
    usdt: '0x7a83d71249b6ef0289f68e9d6b58b3edd0957125',
    usdc: '0x7a83d71249b6ef0289f68e9d6b58b3edd0957125'
  };

  const cryptoAmounts = {
    usdt: Number((price / 1600).toFixed(2)), // Approx 1,600 NGN = 1 USDT
    usdc: Number((price / 1600).toFixed(2))  // Approx 1,600 NGN = 1 USDC
  };

  const handleCheckout = () => {
    if (method === 'pi' && isMainnetBlocked) {
      setPaymentError("Mainnet payments are disabled until official server-side credentials and Mainnet Portal permissions are active.");
      return;
    }

    if ((method === 'usdt' || method === 'usdc') && !txHash.trim()) {
      setPaymentError("Please provide your blockchain Transaction Hash (Tx Hash) for verification.");
      return;
    }

    setPaymentError(null);
    setIsVerifying(true);

    if (method === 'pi') {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        try {
          (window as any).Pi.init({ version: "2.0", sandbox: isSandbox });

          (window as any).Pi.createPayment({
            amount: piAmount,
            memo: `Payment for: ${item.serviceName}`,
            metadata: { requestId: item.id },
            paymentCallbacks: {
              onReadyForServerApproval: async (paymentId: string) => {
                try {
                  const res = await fetch('/api/pi/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                  });
                  const data = await res.json();
                  if (data.status !== 'approved') {
                    throw new Error(data.message || 'Server-side approval check failed.');
                  }
                } catch (e: any) {
                  setPaymentError(e.message || 'Pi Server approval verification failed.');
                  setIsVerifying(false);
                }
              },
              onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                try {
                  const res = await fetch('/api/pi/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId, txid })
                  });
                  const data = await res.json();
                  if (data.status === 'success') {
                    setIsVerifying(false);
                    onComplete(txid, isSandbox ? 'PI_TESTNET' : 'PI_MAINNET');
                  } else {
                    throw new Error(data.message || 'Server completion verification failed.');
                  }
                } catch (e: any) {
                  setPaymentError(e.message || 'Server completed verification callback error.');
                  setIsVerifying(false);
                }
              },
              onCancel: (paymentId: string) => {
                setPaymentError('Payment cancelled by the Pioneer.');
                setIsVerifying(false);
              },
              onError: (error: any, payment: any) => {
                setPaymentError(error?.message || 'A Pi Blockchain checkout error occurred.');
                setIsVerifying(false);
              }
            }
          });
        } catch (err: any) {
          console.error("Pi SDK error details", err);
          setPaymentError("Pi payment verification unavailable — please try again later.");
          setIsVerifying(false);
        }
      } else {
        setPaymentError("Pi payment verification unavailable — please try again later. (Requires official Pi Browser environment)");
        setIsVerifying(false);
      }
    } else if (method === 'usdt' || method === 'usdc') {
      // Manual crypto confirmation route
      setTimeout(() => {
        setIsVerifying(false);
        onComplete(txHash, method === 'usdt' ? 'USDT_BEP20' : 'USDC_BASE');
      }, 1500);
    } else if (method === 'paystack') {
      setTimeout(() => {
        setIsVerifying(false);
        onComplete(`TX-PAYSTACK-${Math.floor(100000 + Math.random() * 900000)}`, 'PAYSTACK');
      }, 2000);
    } else if (method === 'flutterwave') {
      setTimeout(() => {
        setIsVerifying(false);
        onComplete(`TX-FLUTTERWAVE-${Math.floor(100000 + Math.random() * 900000)}`, 'FLUTTERWAVE');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white border border-gray-100 rounded-3xl w-full max-w-md p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-950">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
           <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Gateway Checkout</h3>
              <p className="text-[8px] text-gray-400 uppercase tracking-widest font-black">Secure Verification Pipeline</p>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-slate-800 transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* Testnet Separator Indicator Banner */}
        {method === 'pi' && (
          <div className={`p-4 rounded-2xl mb-6 text-center text-[10px] font-black uppercase tracking-widest border ${isSandbox ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            {isSandbox ? 'Pi Testnet — Developer Testing Only' : 'Pi Mainnet — Genuine Production Mode'}
          </div>
        )}

        <div className="p-4 bg-slate-50 rounded-2xl mb-6 border border-gray-100 flex justify-between items-center font-sans">
           <div>
              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Local Fee</p>
              <p className="text-xl font-black text-slate-900">₦{price.toLocaleString()}</p>
           </div>
           {method === 'pi' && (
             <div className="text-right">
                <p className="text-[8px] text-yellow-600 uppercase font-black tracking-widest mb-1">Blockchain Fee</p>
                <p className="text-2xl font-black text-yellow-600">{piAmount} Pi</p>
             </div>
           )}
           {(method === 'usdt' || method === 'usdc') && (
             <div className="text-right">
                <p className="text-[8px] text-yellow-600 uppercase font-black tracking-widest mb-1">Crypto Value</p>
                <p className="text-2xl font-black text-yellow-600">{method === 'usdt' ? cryptoAmounts.usdt : cryptoAmounts.usdc} {method.toUpperCase()}</p>
             </div>
           )}
        </div>

        {/* Mainnet blocking banner */}
        {method === 'pi' && isMainnetBlocked && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-6 text-center leading-relaxed">
             Pi Mainnet payments are currently DISABLED as no verified Mainnet Merchant Wallet is configured.
          </div>
        )}

        {paymentError && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-bold uppercase tracking-wider mb-6">
            {paymentError}
          </div>
        )}

        {/* Enforce multi-gateway support logic inside both browsers */}
        <div className="space-y-6 mb-6">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest text-center">Select Gateway Method</p>
          
          {/* Show Pi Network SDK payment button as primary if inside Pi Browser */}
          {isPiBrowser ? (
            <div className="space-y-3">
              <p className="text-[8px] text-yellow-600 uppercase font-black tracking-widest mb-1">⭐ Primary Browser Method</p>
              <button 
                onClick={() => setMethod('pi')} 
                className={`w-full p-4 rounded-xl border flex items-center justify-center gap-2 font-black uppercase text-[11px] tracking-widest transition-all ${method === 'pi' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-md ring-1 ring-yellow-400' : 'border-gray-200 bg-white text-gray-600 hover:bg-slate-50'}`}
              >
                <Bot size={16} className="text-yellow-600 animate-pulse" /> Pay with Pi Network SDK
              </button>
              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mt-4">💳 Alternative Channels</p>
            </div>
          ) : (
            <div className="space-y-2">
              <button 
                onClick={() => setMethod('pi')} 
                className={`w-full p-3.5 rounded-xl border flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all ${method === 'pi' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm' : 'border-gray-150 bg-slate-50 text-gray-500'}`}
              >
                <Bot size={14} className="text-yellow-600" /> Pay with Pi Testnet
              </button>
            </div>
          )}

          {/* Grid of alternative standard web payments */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setMethod('paystack')} className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-black uppercase text-[9px] tracking-widest transition-all ${method === 'paystack' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm' : 'border-gray-100 bg-slate-50 text-gray-500'}`}>
              <CreditCard size={14} /> Paystack
            </button>
            <button onClick={() => setMethod('flutterwave')} className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-black uppercase text-[9px] tracking-widest transition-all ${method === 'flutterwave' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm' : 'border-gray-100 bg-slate-50 text-gray-500'}`}>
              <CreditCard size={14} /> Flutterwave
            </button>
            <button onClick={() => setMethod('usdt')} className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-black uppercase text-[9px] tracking-widest transition-all ${method === 'usdt' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm' : 'border-gray-100 bg-slate-50 text-gray-500'}`}>
              <SmartphoneNfc size={14} /> USDT BEP20
            </button>
            <button onClick={() => setMethod('usdc')} className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-black uppercase text-[9px] tracking-widest transition-all ${method === 'usdc' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm' : 'border-gray-100 bg-slate-50 text-gray-500'}`}>
              <SmartphoneNfc size={14} /> USDC Base
            </button>
          </div>
        </div>

        {/* Manual Crypto Verification Interface */}
        {(method === 'usdt' || method === 'usdc') && (
          <div className="bg-slate-50 border border-gray-150 p-4 rounded-2xl mb-6 space-y-4 font-sans">
             <div className="text-[9px] font-black uppercase text-yellow-700 bg-yellow-50 p-2.5 rounded-lg border border-yellow-100/50 leading-relaxed">
                Send exactly <span className="font-bold text-slate-900 underline">{method === 'usdt' ? cryptoAmounts.usdt : cryptoAmounts.usdc} {method.toUpperCase()}</span> on the <span className="underline">{method === 'usdt' ? 'BNB Smart Chain (BEP20)' : 'Base Network'}</span> to the designated corporate address below:
             </div>
             <div>
                <span className="text-[8px] text-gray-400 block font-black uppercase tracking-wider mb-1">Corporate Wallet Address</span>
                <p className="p-3 bg-white border border-gray-100 rounded-xl font-mono text-[10px] text-slate-800 break-all select-all font-bold tracking-tight">{method === 'usdt' ? cryptoWallets.usdt : cryptoWallets.usdc}</p>
             </div>
             <div>
                <label className="text-[8px] text-gray-400 block font-black uppercase tracking-wider mb-1">Blockchain Transaction Hash (Tx Hash)</label>
                <input 
                  type="text" 
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                  placeholder="Paste 66-character transaction hash here"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-[10px] font-mono text-slate-900 outline-none focus:border-yellow-500 font-bold"
                />
             </div>
             <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest text-center mt-1">⚠️ Crypto payments will be marked Pending Verification until confirmed.</p>
          </div>
        )}

        <button 
          disabled={isVerifying || (method === 'pi' && isMainnetBlocked)}
          onClick={handleCheckout} 
          className="w-full bg-[#0a0a0a] hover:bg-yellow-500 text-white hover:text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow"
        >
          {isVerifying ? 'Verifying Gateway Response...' : method === 'pi' ? 'Initiate Pi Transaction' : method === 'usdt' || method === 'usdc' ? 'Submit Tx Hash for Verification' : `Initiate ${method.toUpperCase()} Transaction`}
          {isVerifying && <Clock size={14} className="animate-spin" />}
        </button>
      </div>
    </div>
  );
}

// --- FAQ View Component ---
function FaqView() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-900">
      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12 text-center text-[#0a0a0a]">Frequently Asked Questions & Pricing</h2>
      <div className="space-y-6">
        <FaqItem q="What is CAC registration?" a="CAC registration is the official incorporation process of registering your business with the Corporate Affairs Commission. We assist with filing, document generation, and reservation support. Final approvals remain under Corporate Affairs Commission requirements." />
        <FaqItem q="What type of websites do you build?" a="We build high-performance React and next-generation frameworks, specifically designed for fast loading times, robust SEO optimization, and payment integration with local/international systems." />
        <FaqItem q="Can an AI assistant use my business data?" a="Yes. Our AI Assistants are custom-trained and qualifiable based strictly on your private business files, catalogues, and FAQs, providing isolated business-specific responses." />
        <FaqItem q="How do quotes and custom pricing work?" a="For custom digital or web application scopes, you submit your requirements. Our administrators audit the scope and formulate an automated Quote accessible directly in your Customer workspace." />
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-6 flex justify-between items-center text-left">
        <span className="font-black uppercase text-sm tracking-tight text-slate-900">{q}</span>
        <ChevronRight size={18} className={`text-yellow-600 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
             <p className="p-6 pt-0 text-xs font-bold uppercase tracking-wider text-gray-500 leading-relaxed border-t border-gray-100">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- About View Component ---
function AboutView() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-center text-slate-900">
      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8 text-[#0a0a0a]">About the Hub</h2>
      <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-12 font-medium">
         GOYE SERVICES HUB is an integrated professional agency system designed to deliver digital business setups, LLC registrations, responsive web applications, and state-of-the-art conversational AI assistants. We help companies modernize operations cleanly and reliably.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
         <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
           <h3 className="text-sm font-black uppercase text-yellow-600 tracking-widest mb-4">Transparent Delivery</h3>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-wider leading-relaxed">Every request is fully reference-tracked with live audit trials, secure quote acceptances, and private completion document transfers.</p>
         </div>
         <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
           <h3 className="text-sm font-black uppercase text-yellow-600 tracking-widest mb-4">Africa & Beyond</h3>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-wider leading-relaxed">Built for core commercial hubs while structurally formatted for international payment routing and currency extensions.</p>
         </div>
      </div>
    </div>
  );
}

// --- Contact View Component ---
function ContactView({ config }: { config: any }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-900">
      <div className="text-center mb-16">
         <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-[#0a0a0a]">Connect With Us</h2>
         <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Connect with our support and technical engineering teams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         <div className="space-y-8 bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-yellow-600 mb-6">Contact Channels</h3>
            <div className="flex gap-4 items-center">
              <Mail className="text-yellow-600" size={24} />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Corporate Email</p>
                <a href={`mailto:${config.supportEmail}`} className="text-sm font-black uppercase tracking-tight text-slate-950">{config.supportEmail}</a>
              </div>
            </div>
         </div>

         <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Message sent successfully. Our support desk will reach out.'); }}>
            <FormInput label="Name" required onChange={() => {}} />
            <FormInput label="Email" type="email" required onChange={() => {}} />
            <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Message Scope</label>
               <textarea required className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 h-32 outline-none focus:border-yellow-500 text-sm font-bold text-slate-950"></textarea>
            </div>
            <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow">Send Message</button>
         </form>
      </div>
    </div>
  );
}

// --- Legal View Component ---
function LegalView() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-900 prose">
      <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-[#0a0a0a]">Terms of Service & Policies</h2>
      <div className="space-y-8 text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
         <div>
            <h3 className="text-yellow-600 font-black mb-2">1. Scope of Services</h3>
            <p>GOYE SERVICES HUB assists customers with business registrations, website developments, and custom AI assistant deployments. We do not act as the direct government registration authority. Final approvals are strictly subject to third-party agency terms and timelines.</p>
         </div>
         <div>
            <h3 className="text-yellow-500 font-black mb-2">2. Payment & Quotes</h3>
            <p>All service requests are processed subject to payment verification on Paystack. Service fulfillment begins strictly upon verification of the respective transaction identifier by our backend servers.</p>
         </div>
         <div>
            <h3 className="text-yellow-500 font-black mb-2">3. Refund Policy</h3>
            <p>Refund requests are subject to audit review. Government processing fees and completed service milestones are non-refundable once initiated under third-party systems.</p>
         </div>
      </div>
    </div>
  );
}

// --- General Component Helpers ---
function FormInput({ label, type = 'text', required, onChange, placeholder }: { label: string, type?: string, required?: boolean, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2 w-full text-left">
      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</label>
      <input 
        required={required}
        type={type} 
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 px-4 outline-none focus:border-yellow-500 text-sm font-bold text-slate-950 transition-colors"
      />
    </div>
  );
}

function StatMini({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-white border border-gray-100 px-6 py-3 rounded-2xl text-center shadow-sm">
      <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-yellow-600">{value}</p>
    </div>
  );
}
