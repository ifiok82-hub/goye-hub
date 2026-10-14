import { GoyeProductMeta } from '../types/products';

export const GOYE_15_PRODUCTS: GoyeProductMeta[] = [
  // 1. Business Identity
  {
    id: 'business-id',
    numericId: '01',
    name: 'GOYE Business ID',
    shortDescription: 'Generate a verifiable digital business profile with unique corporate identifier (GOYE-BIZ-2026-XXXXXX) and shareable public page.',
    category: 'Business Identity',
    status: 'AVAILABLE',
    statusReason: 'Core identity generation and public profile directory active.',
    iconName: 'BadgeCheck',
    route: '/products/business-id',
    pricingType: 'FREE',
    disclaimer: 'GOYE Business ID is a platform profile identification, not a statutory government registration.'
  },
  {
    id: 'business-verification',
    numericId: '02',
    name: 'Business Verification',
    shortDescription: 'Structured 5-tier business credential review from Registered Profile to Payment Enabled with document proof verification.',
    category: 'Business Identity',
    status: 'AVAILABLE',
    statusReason: 'Document submission and multi-stage verification workflow active.',
    iconName: 'ShieldCheck',
    route: '/products/business-verification',
    pricingType: 'FREE',
    disclaimer: 'GOYE platform verification status represents platform-level review and does not constitute government or regulatory licensing.'
  },
  {
    id: 'qr-verification',
    numericId: '03',
    name: 'QR Business Verification',
    shortDescription: 'Instant QR code generation linking to a public verification portal (/verify/business/:id) for transparency in client interactions.',
    category: 'Business Identity',
    status: 'AVAILABLE',
    statusReason: 'Dynamic QR generator and public verification lookup active.',
    iconName: 'QrCode',
    route: '/products/qr-verification',
    pricingType: 'FREE',
    disclaimer: 'GOYE platform verification status — not a government certification.'
  },

  // 2. AI Business Automation
  {
    id: 'ai-receptionist',
    numericId: '04',
    name: 'AI Business Receptionist',
    shortDescription: 'Configurable front-desk AI assistant handling FAQ, opening hours, pricing inquiries, lead capture, and smart human escalation.',
    category: 'AI Business Automation',
    status: 'AVAILABLE',
    statusReason: 'Conversational assistant and knowledge base settings active.',
    iconName: 'Bot',
    route: '/products/ai-receptionist',
    pricingType: 'PRICE_CONFIGURED',
    price: 35000,
    currency: 'NGN',
    disclaimer: 'This assistant clearly identifies itself as an AI system. Review conversation records before sensitive decisions.'
  },
  {
    id: 'ai-sales',
    numericId: '05',
    name: 'AI Sales Assistant',
    shortDescription: 'Automate product discovery, budget qualification, purchase intent analysis, and real-time CRM sales lead capture.',
    category: 'AI Business Automation',
    status: 'AVAILABLE',
    statusReason: 'Lead qualification logic and pipeline management active.',
    iconName: 'Sparkles',
    route: '/products/ai-sales',
    pricingType: 'PRICE_CONFIGURED',
    price: 45000,
    currency: 'NGN',
    disclaimer: 'AI sales recommendations provide decision support; sales conversions depend on product and market factors.'
  },
  {
    id: 'ai-support',
    numericId: '06',
    name: 'AI Customer Support Agent',
    shortDescription: '24/7 client troubleshooting, order status checks, and automated ticket filing for tier-1 customer inquiries.',
    category: 'AI Business Automation',
    status: 'AVAILABLE',
    statusReason: 'Ticket generation and intelligent issue triage active.',
    iconName: 'Headphones',
    route: '/products/ai-support',
    pricingType: 'PRICE_CONFIGURED',
    price: 40000,
    currency: 'NGN',
    disclaimer: 'Complex support requests are escalated to authorized human account representatives.'
  },
  {
    id: 'lead-qualification',
    numericId: '07',
    name: 'AI Lead Qualification Agent',
    shortDescription: 'Multi-step questionnaire to assess client readiness, compute real lead scores (0-100), and recommend immediate next steps.',
    category: 'AI Business Automation',
    status: 'AVAILABLE',
    statusReason: 'Scoring algorithm and qualification workflow active.',
    iconName: 'TrendingUp',
    route: '/products/lead-qualification',
    pricingType: 'FREE',
    disclaimer: 'AI lead scoring is an analytical tool and does not guarantee contractual outcomes.'
  },

  // 3. Business Documents
  {
    id: 'contracts',
    numericId: '08',
    name: 'Digital Contract Builder',
    shortDescription: 'Generate customized Service Agreements, Web & AI Development Contracts, and Consultancy Agreements with signature tracking.',
    category: 'Business Documents',
    status: 'AVAILABLE',
    statusReason: '6 production templates, scope builder, and signature workflows active.',
    iconName: 'FileText',
    route: '/products/contracts',
    pricingType: 'PRICE_CONFIGURED',
    price: 15000,
    currency: 'NGN',
    disclaimer: 'GOYE provides document templates and business workflow tools. This is not legal advice. Users should obtain professional legal counsel where appropriate.'
  },
  {
    id: 'invoices',
    numericId: '09',
    name: 'Digital Invoice Generator',
    shortDescription: 'Professional multi-currency invoices with line items, tax calculations, shareable verification links, and verified payment tracking.',
    category: 'Business Documents',
    status: 'AVAILABLE',
    statusReason: 'Itemized invoice builder and server-side payment reconciliation active.',
    iconName: 'Receipt',
    route: '/products/invoices',
    pricingType: 'FREE',
    disclaimer: 'Invoice payment status is strictly reconciled server-side through verified payment proofs.'
  },
  {
    id: 'document-vault',
    numericId: '14',
    name: 'Business Document Vault',
    shortDescription: 'Encrypted document management vault for registration certificates, contracts, receipts, and compliance files with audit trails.',
    category: 'Business Documents',
    status: 'AVAILABLE',
    statusReason: 'Category-indexed document storage and permission checks active.',
    iconName: 'FolderLock',
    route: '/products/document-vault',
    pricingType: 'FREE',
    disclaimer: 'Documents stored are private to the authorized account holder. Never upload private wallet passphrases or keys.'
  },

  // 4. Commerce
  {
    id: 'pi-checkout',
    numericId: '10',
    name: 'Pi Payment Checkout',
    shortDescription: 'Official Pi Network SDK payment gateway integrating server-side Pi.createPayment approval and completion pipelines.',
    category: 'Commerce',
    status: 'AVAILABLE',
    statusReason: 'Official Pi SDK callbacks, server approval (/api/pi/approve), and completion (/api/pi/complete) active.',
    iconName: 'Coins',
    route: '/products/pi-checkout',
    pricingType: 'FREE',
    disclaimer: 'Transactions are authenticated strictly via the official Pi Platform API. No mock or simulated balances are supported.'
  },
  {
    id: 'marketplace',
    numericId: '11',
    name: 'Business Marketplace',
    shortDescription: 'Discover and order verified services across 10 categories from Websites, AI Bots, and CAC Assistance to Business Consulting.',
    category: 'Commerce',
    status: 'AVAILABLE',
    statusReason: 'Multi-category directory, seller verification badges, and direct order actions active.',
    iconName: 'Store',
    route: '/products/marketplace',
    pricingType: 'CONTACT_FOR_QUOTE',
    disclaimer: 'Verified badges are only displayed for businesses that have completed the GOYE Verification workflow.'
  },
  {
    id: 'bookings',
    numericId: '12',
    name: 'Service Booking',
    shortDescription: 'Interactive appointment scheduling with double-booking prevention, calendar availability, and client confirmation receipts.',
    category: 'Commerce',
    status: 'AVAILABLE',
    statusReason: 'Real-time slot reservation and scheduling engine active.',
    iconName: 'Calendar',
    route: '/products/bookings',
    pricingType: 'FREE',
    disclaimer: 'Booking schedules are confirmed upon provider availability.'
  },

  // 5. Trade & Growth
  {
    id: 'trade-assurance',
    numericId: '13',
    name: 'Trade Assurance',
    shortDescription: '10-stage non-custodial milestone workflow for commercial trade: deal initiation, contract binding, delivery confirmation, and dispute triage.',
    category: 'Trade',
    status: 'AVAILABLE',
    statusReason: 'Milestone tracker, contract/invoice attachment, and status workflows active.',
    iconName: 'Handshake',
    route: '/products/trade-assurance',
    pricingType: 'CONTACT_FOR_QUOTE',
    disclaimer: 'GOYE Trade Assurance is a business workflow and documentation platform. It is not a bank, licensed financial institution, or custodial escrow service. GOYE does not hold customer funds unless a separately licensed service is integrated.'
  },
  {
    id: 'growth-assistant',
    numericId: '15',
    name: 'AI Business Growth Assistant',
    shortDescription: 'AI-powered business diagnostic dashboard generating tailored website improvements, marketing ideas, SEO suggestions, and workflow automation.',
    category: 'Growth',
    status: 'AVAILABLE',
    statusReason: 'Diagnostic engine and Gemini-powered recommendations active.',
    iconName: 'Lightbulb',
    route: '/products/growth-assistant',
    pricingType: 'PRICE_CONFIGURED',
    price: 25000,
    currency: 'NGN',
    disclaimer: 'AI-generated business recommendations. Review before implementation. No guarantees of financial returns.'
  }
];
