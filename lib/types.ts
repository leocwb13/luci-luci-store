export type ProductCategory = "vitae" | "fine" | "men" | "tea" | "performance" | "gift" | "oral-care";
export type PaymentStatus = "pendente" | "pago" | "cancelado";
export type OrderStatus = "pedido_recebido" | "em_preparacao" | "enviado" | "entregue" | "cancelado";
export type SellableType = "product" | "kit";
export type PaymentMethod = "mercado_pago" | "pix" | "dinheiro" | "transferencia";
export type OrderSource = "site" | "manual";
export type UserRole = "admin" | "financeiro" | "operacao" | "vendedor" | "familiar_viewer";
export type FinanceEntryKind = "income" | "expense";
export type FinanceEntryStatus = "pending" | "paid";

export type ProductFaq = {
  question: string;
  answer: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  benefits: string[];
  recommendedFor: string;
  usage: string;
  highlights: string[];
  ingredients: string[];
  faq: ProductFaq[];
  commercialPitch?: string;
  category: ProductCategory;
  categoryLabel: string;
  priceInCents: number | null;
  packageLabel: string;
  badge?: string;
  badgeVariant?: "default" | "new";
  accent: string;
  background: string;
  imageLabel: string[];
  imageUrl?: string | null;
  stock: number;
  minStock: number;
  notes?: string;
  active: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type KitItem = {
  productId: string;
  name: string;
  quantity: number;
  benefit: string;
};

export type Kit = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryLabel: string;
  priceInCents: number;
  compareAtInCents: number;
  savingsInCents: number;
  savingsPercent: number;
  targetAudience: string;
  salesTip: string;
  ctaText: string;
  accent: string;
  background: string;
  imageLabel: string[];
  imageUrl?: string | null;
  notes?: string;
  featured: boolean;
  active: boolean;
  items: KitItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type Customer = {
  id?: string;
  name: string;
  whatsapp: string;
  phone?: string;
  email?: string;
  address: string;
  neighborhood: string;
  deliveryMethod: "delivery" | "pickup";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerSummary = Customer & {
  totalOrders: number;
  totalSpentInCents: number;
  lastOrderAt?: string | null;
};

export type CartItem = {
  kind: SellableType;
  itemId: string;
  productId?: string;
  slug: string;
  name: string;
  categoryLabel: string;
  unitPriceInCents: number;
  quantity: number;
  packageLabel?: string;
  summary?: string;
};

export type OrderItem = {
  id?: string;
  kind: SellableType;
  itemId: string;
  slug: string;
  name: string;
  quantity: number;
  unitPriceInCents: number;
  categoryLabel: string;
  packageLabel?: string;
  summary?: string;
  kitItems?: KitItem[];
};

export type Order = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  customerId?: string | null;
  customer: Customer;
  items: OrderItem[];
  subtotalInCents: number;
  deliveryFeeInCents: number;
  totalInCents: number;
  source: OrderSource;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  mercadoPagoReference?: string | null;
  notes?: string;
  assignedUserId?: string | null;
};

export type StoreSettings = {
  brandName: string;
  whatsapp: string;
  instagram: string;
  city: string;
  heroTitle: string;
  heroDescription: string;
  freeShippingThresholdInCents: number;
  neighborhoods: Array<{
    name: string;
    city: string;
    feeInCents: number;
  }>;
  socialProof: Array<{
    name: string;
    city: string;
    quote: string;
  }>;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

export type FinanceEntry = {
  id: string;
  kind: FinanceEntryKind;
  category: string;
  description: string;
  amountInCents: number;
  status: FinanceEntryStatus;
  dueDate?: string | null;
  paidAt?: string | null;
  relatedOrderId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdByUserId?: string | null;
};

export type Receivable = {
  id: string;
  orderId: string;
  amountInCents: number;
  status: "pending" | "paid" | "cancelled";
  dueDate?: string | null;
  settledAt?: string | null;
  createdAt: string;
};

export type DashboardMetrics = {
  salesTodayInCents: number;
  openOrdersCount: number;
  lowStockProducts: Product[];
  topProducts: Array<{
    name: string;
    quantity: number;
    revenueInCents: number;
  }>;
  receivablesInCents: number;
};

export type FinanceSummary = {
  revenueInCents: number;
  expensesInCents: number;
  paidRevenueInCents: number;
  pendingRevenueInCents: number;
  paidExpensesInCents: number;
  pendingExpensesInCents: number;
  profitEstimateInCents: number;
  cashFlowInCents: number;
};

export type AuditLog = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  actorUserId?: string | null;
  beforeJson?: string | null;
  afterJson?: string | null;
  createdAt: string;
};
