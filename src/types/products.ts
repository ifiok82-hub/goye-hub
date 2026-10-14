// GOYE Web3 Business Hub - Master 15-Product Type Definitions

export type ProductStatus = 'AVAILABLE' | 'CONFIGURATION REQUIRED' | 'COMING SOON';

export type ProductCategory = 
  | 'Business Identity' 
  | 'AI Business Automation' 
  | 'Business Documents' 
  | 'Commerce' 
  | 'Trade' 
  | 'Growth';

export interface GoyeProductMeta {
  id: string; // e.g. 'business-id', 'ai-receptionist'
  numericId: string; // '01', '02', ... '15'
  name: string;
  shortDescription: string;
  category: ProductCategory;
  status: ProductStatus;
  statusReason?: string;
  iconName: string;
  route: string;
  pricingType: 'FREE' | 'PRICE_CONFIGURED' | 'CONTACT_FOR_QUOTE' | 'COMING_SOON';
  price?: number;
  currency?: string;
  disclaimer?: string;
}

// 01 - Business ID
export interface BusinessProfile {
  id: string; // internal id
  businessNumber: string; // e.g. GOYE-BIZ-2026-000123
  userId: string;
  name: string;
  description: string;
  category: string;
  country: string;
  state: string;
  city: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
  services: string[];
  logoUrl?: string;
  status: 'Registered Profile';
  createdAt: number;
  updatedAt: number;
}

// 02 - Business Verification
export type VerificationLevel = 
  | '1. Registered Profile' 
  | '2. Documents Submitted' 
  | '3. GOYE Review' 
  | '4. Identity Confirmed' 
  | '5. Payment Enabled';

export type VerificationStatus = 
  | 'NOT VERIFIED' 
  | 'SUBMITTED' 
  | 'UNDER REVIEW' 
  | 'VERIFIED' 
  | 'REJECTED';

export interface BusinessVerification {
  id: string;
  businessId: string;
  userId: string;
  level: VerificationLevel;
  status: VerificationStatus;
  documentType: string;
  documentName: string;
  documentDataUrl?: string;
  notes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// 05 - Sales Lead
export type SalesLeadStatus = 'NEW' | 'QUALIFIED' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';

export interface SalesLead {
  id: string;
  businessId?: string;
  name: string;
  contact: string;
  interest: string;
  budget: string;
  intent: 'High' | 'Medium' | 'Low';
  source: string;
  status: SalesLeadStatus;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

// 06 - Support Ticket
export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
export type SupportTicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface SupportTicketRecord {
  id: string;
  userId: string;
  businessId?: string;
  subject: string;
  category: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdAt: number;
  updatedAt: number;
}

// 07 - Lead Qualification
export interface LeadQualificationResult {
  serviceNeeded: string;
  budgetRange: string;
  timeline: string;
  readiness: string;
  score: number; // 0 - 100
  qualificationStatus: 'High Priority' | 'Standard Qualified' | 'Nurture Required';
  recommendedAction: string;
  generatedAt: number;
}

// 08 - Digital Contract
export type ContractStatus = 'DRAFT' | 'SENT' | 'SIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ContractDocument {
  id: string;
  contractNumber: string;
  title: string;
  templateType: 
    | 'Service Agreement' 
    | 'Website Development Agreement' 
    | 'AI Development Agreement' 
    | 'Digital Marketing Agreement' 
    | 'Consultancy Agreement' 
    | 'General Business Agreement';
  creatorId: string;
  partyA: {
    name: string;
    email: string;
    role: string;
    signed?: boolean;
    signedAt?: number;
  };
  partyB: {
    name: string;
    email: string;
    role: string;
    signed?: boolean;
    signedAt?: number;
  };
  scopeOfWork: string;
  deliverables: string;
  timeline: string;
  price: number;
  currency: string;
  paymentTerms: string;
  terminationClause: string;
  status: ContractStatus;
  createdAt: number;
  updatedAt: number;
}

// 09 - Digital Invoice
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'UNDER REVIEW' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceDocument {
  id: string;
  invoiceNumber: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  dueDate: number;
  notes?: string;
  paymentStatus: InvoiceStatus;
  paymentMethod?: string;
  paymentTxid?: string;
  createdAt: number;
  updatedAt: number;
}

// 11 - Marketplace Listing
export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  businessId: string;
  businessName: string;
  sellerStatus: 'REGISTERED' | 'VERIFICATION_PENDING' | 'VERIFIED_ON_GOYE';
  serviceTitle: string;
  category: 
    | 'Websites' 
    | 'AI Services' 
    | 'Business Registration Assistance' 
    | 'Digital Marketing' 
    | 'Business Support' 
    | 'Design' 
    | 'Automation' 
    | 'Consulting' 
    | 'Digital Products' 
    | 'Professional Services';
  description: string;
  price: number;
  currency: string;
  deliveryTime: string;
  status: 'ACTIVE' | 'PAUSED' | 'SOLD_OUT';
  createdAt: number;
  updatedAt: number;
}

// 12 - Service Booking
export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface ServiceBooking {
  id: string;
  bookingNumber: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  providerId: string;
  providerName: string;
  serviceTitle: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 11:00 AM"
  notes?: string;
  status: BookingStatus;
  createdAt: number;
  updatedAt: number;
}

// 13 - Trade Assurance
export type TradeDealStatus = 
  | 'DRAFT' 
  | 'ACTIVE' 
  | 'AWAITING_PAYMENT' 
  | 'IN_PROGRESS' 
  | 'DELIVERED' 
  | 'CONFIRMATION_PENDING' 
  | 'DISPUTED' 
  | 'RESOLVED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface TradeDeal {
  id: string;
  dealNumber: string;
  title: string;
  creatorId: string;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  sellerEmail: string;
  description: string;
  dealValue: number;
  currency: string;
  contractId?: string;
  invoiceId?: string;
  currentStep: number; // 1 to 10
  status: TradeDealStatus;
  disputeNotes?: string;
  createdAt: number;
  updatedAt: number;
}

// 14 - Business Document Vault
export type VaultCategory = 
  | 'Business Registration' 
  | 'Contracts' 
  | 'Invoices' 
  | 'Receipts' 
  | 'Identity Documents' 
  | 'Business Certificates' 
  | 'Agreements' 
  | 'Other Business Documents';

export type VaultStatus = 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export interface VaultDocument {
  id: string;
  userId: string;
  businessId?: string;
  title: string;
  category: VaultCategory;
  fileName: string;
  fileSize: string;
  status: VaultStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Universal Order Model (Section 27)
export type UniversalPaymentStatus = 
  | 'CREATED' 
  | 'PENDING' 
  | 'APPROVAL_PENDING' 
  | 'APPROVED' 
  | 'COMPLETION_PENDING' 
  | 'PAID' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type UniversalFulfillmentStatus = 
  | 'NOT_STARTED' 
  | 'PROCESSING' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface UniversalOrder {
  orderId: string;
  userId: string;
  businessId?: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: UniversalPaymentStatus;
  fulfillmentStatus: UniversalFulfillmentStatus;
  txid?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Audit Log (Section 12)
export interface AuditLogItem {
  id: string;
  action: string;
  actorId: string;
  details: string;
  metadata?: any;
  timestamp: number;
}
