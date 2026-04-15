import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import kitsSeed from "@/data/kits.json";
import ordersSeed from "@/data/orders.json";
import productsSeed from "@/data/products.json";
import settingsSeed from "@/data/settings.json";
import { dbClient } from "@/lib/db/client";
import {
  AuditLog,
  CartItem,
  Customer,
  CustomerSummary,
  DashboardMetrics,
  FinanceEntry,
  FinanceSummary,
  Kit,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  Receivable,
  StoreSettings,
  User,
  UserRole
} from "@/lib/types";
import { createOrderId } from "@/lib/utils";

const db = drizzle(dbClient);

const rolesTable = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull()
});

const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

const settingsTable = sqliteTable("store_settings", {
  id: integer("id").primaryKey(),
  brandName: text("brand_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  instagram: text("instagram").notNull(),
  city: text("city").notNull(),
  heroTitle: text("hero_title").notNull(),
  heroDescription: text("hero_description").notNull(),
  neighborhoods: text("neighborhoods").notNull(),
  socialProof: text("social_proof").notNull(),
  updatedAt: text("updated_at").notNull()
});

const productsTable = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  benefits: text("benefits").notNull(),
  recommendedFor: text("recommended_for").notNull(),
  usage: text("usage").notNull(),
  highlights: text("highlights").notNull(),
  ingredients: text("ingredients").notNull(),
  faq: text("faq").notNull(),
  commercialPitch: text("commercial_pitch"),
  category: text("category").notNull(),
  categoryLabel: text("category_label").notNull(),
  priceInCents: integer("price_in_cents"),
  packageLabel: text("package_label").notNull(),
  badge: text("badge"),
  badgeVariant: text("badge_variant"),
  accent: text("accent").notNull(),
  background: text("background").notNull(),
  imageLabel: text("image_label").notNull(),
  imageUrl: text("image_url"),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(3),
  notes: text("notes"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

const kitsTable = sqliteTable("kits", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  categoryLabel: text("category_label").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  compareAtInCents: integer("compare_at_in_cents").notNull(),
  savingsInCents: integer("savings_in_cents").notNull(),
  savingsPercent: integer("savings_percent").notNull(),
  targetAudience: text("target_audience").notNull(),
  salesTip: text("sales_tip").notNull(),
  ctaText: text("cta_text").notNull(),
  accent: text("accent").notNull(),
  background: text("background").notNull(),
  imageLabel: text("image_label").notNull(),
  imageUrl: text("image_url"),
  notes: text("notes"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  items: text("items").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

const customersTable = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  neighborhood: text("neighborhood").notNull(),
  deliveryMethod: text("delivery_method").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

const ordersTable = sqliteTable("orders", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  customerId: text("customer_id"),
  customerSnapshot: text("customer_snapshot").notNull(),
  subtotalInCents: integer("subtotal_in_cents").notNull(),
  deliveryFeeInCents: integer("delivery_fee_in_cents").notNull(),
  totalInCents: integer("total_in_cents").notNull(),
  source: text("source").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull(),
  orderStatus: text("order_status").notNull(),
  mercadoPagoReference: text("mercado_pago_reference"),
  notes: text("notes"),
  assignedUserId: text("assigned_user_id")
});

const orderItemsTable = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  kind: text("kind").notNull(),
  itemId: text("item_id").notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceInCents: integer("unit_price_in_cents").notNull(),
  categoryLabel: text("category_label").notNull(),
  packageLabel: text("package_label"),
  summary: text("summary"),
  kitItems: text("kit_items")
});

const stockMovementsTable = sqliteTable("stock_movements", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  orderId: text("order_id"),
  type: text("type").notNull(),
  quantityDelta: integer("quantity_delta").notNull(),
  reason: text("reason").notNull(),
  createdByUserId: text("created_by_user_id"),
  createdAt: text("created_at").notNull()
});

const financeEntriesTable = sqliteTable("finance_entries", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amountInCents: integer("amount_in_cents").notNull(),
  status: text("status").notNull(),
  dueDate: text("due_date"),
  paidAt: text("paid_at"),
  relatedOrderId: text("related_order_id"),
  notes: text("notes"),
  createdByUserId: text("created_by_user_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

const receivablesTable = sqliteTable("receivables", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  amountInCents: integer("amount_in_cents").notNull(),
  status: text("status").notNull(),
  dueDate: text("due_date"),
  settledAt: text("settled_at"),
  createdAt: text("created_at").notNull()
});

const auditLogsTable = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  summary: text("summary").notNull(),
  actorUserId: text("actor_user_id"),
  beforeJson: text("before_json"),
  afterJson: text("after_json"),
  createdAt: text("created_at").notNull()
});

type UserRecord = User & { passwordHash: string };

let initializationPromise: Promise<void> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function asJson<T>(value: T) {
  return JSON.stringify(value);
}

function fromJson<T>(value: string | null | undefined, fallback: T) {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeSeedOrderStatus(status: string): OrderStatus {
  if (status === "novo") return "pedido_recebido";
  if (status === "em_separacao") return "em_preparacao";
  if (status === "enviado") return "enviado";
  if (status === "entregue") return "entregue";
  return "cancelado";
}

function mapProduct(row: typeof productsTable.$inferSelect): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    shortDescription: row.shortDescription,
    benefits: fromJson(row.benefits, [] as string[]),
    recommendedFor: row.recommendedFor,
    usage: row.usage,
    highlights: fromJson(row.highlights, [] as string[]),
    ingredients: fromJson(row.ingredients, [] as string[]),
    faq: fromJson(row.faq, []),
    commercialPitch: row.commercialPitch ?? undefined,
    category: row.category as Product["category"],
    categoryLabel: row.categoryLabel,
    priceInCents: row.priceInCents,
    packageLabel: row.packageLabel,
    badge: row.badge ?? undefined,
    badgeVariant: (row.badgeVariant as Product["badgeVariant"]) ?? undefined,
    accent: row.accent,
    background: row.background,
    imageLabel: fromJson(row.imageLabel, [row.name] as string[]),
    imageUrl: row.imageUrl ?? undefined,
    stock: row.stock,
    minStock: row.minStock,
    notes: row.notes ?? undefined,
    active: row.active,
    featured: row.featured,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function mapKit(row: typeof kitsTable.$inferSelect): Kit {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    categoryLabel: row.categoryLabel,
    priceInCents: row.priceInCents,
    compareAtInCents: row.compareAtInCents,
    savingsInCents: row.savingsInCents,
    savingsPercent: row.savingsPercent,
    targetAudience: row.targetAudience,
    salesTip: row.salesTip,
    ctaText: row.ctaText,
    accent: row.accent,
    background: row.background,
    imageLabel: fromJson(row.imageLabel, [row.name] as string[]),
    imageUrl: row.imageUrl ?? undefined,
    notes: row.notes ?? undefined,
    featured: row.featured,
    active: row.active,
    items: fromJson(row.items, []),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function mapCustomer(row: typeof customersTable.$inferSelect): Customer {
  return {
    id: row.id,
    name: row.name,
    whatsapp: row.whatsapp,
    phone: row.whatsapp,
    email: row.email ?? undefined,
    address: row.address,
    neighborhood: row.neighborhood,
    deliveryMethod: row.deliveryMethod as Customer["deliveryMethod"],
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function mapFinanceEntry(row: typeof financeEntriesTable.$inferSelect): FinanceEntry {
  return {
    id: row.id,
    kind: row.kind as FinanceEntry["kind"],
    category: row.category,
    description: row.description,
    amountInCents: row.amountInCents,
    status: row.status as FinanceEntry["status"],
    dueDate: row.dueDate ?? undefined,
    paidAt: row.paidAt ?? undefined,
    relatedOrderId: row.relatedOrderId ?? undefined,
    notes: row.notes ?? undefined,
    createdByUserId: row.createdByUserId ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

async function seedRoles() {
  const existing = await db.select().from(rolesTable);
  if (existing.length > 0) return;

  await db.insert(rolesTable).values([
    { id: "admin", name: "Administrador", description: "Acesso total ao sistema." },
    { id: "financeiro", name: "Financeiro", description: "Acesso ao financeiro e relatórios." },
    { id: "operacao", name: "Operação", description: "Acesso a pedidos, estoque e kits." },
    { id: "vendedor", name: "Vendedor", description: "Acesso comercial e pedidos." },
    { id: "familiar_viewer", name: "Familiar", description: "Acesso somente leitura." }
  ]);
}

async function seedAdminUser() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@luciluci.com.br").toLowerCase();
  const passwordHash = await hash(process.env.ADMIN_PASSWORD ?? "troque-esta-senha", 10);
  const existing = await db.select().from(usersTable);
  if (existing.some((entry) => entry.email === email)) return;

  const timestamp = nowIso();
  await db.insert(usersTable).values({
    id: randomUUID(),
    name: "Administrador Luci Luci",
    email,
    passwordHash,
    role: "admin",
    active: true,
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

async function seedSettings() {
  const existing = await db.select().from(settingsTable);
  if (existing.length > 0) return;
  await db.insert(settingsTable).values({
    id: 1,
    brandName: settingsSeed.brandName,
    whatsapp: settingsSeed.whatsapp,
    instagram: settingsSeed.instagram,
    city: settingsSeed.city,
    heroTitle: settingsSeed.heroTitle,
    heroDescription: settingsSeed.heroDescription,
    neighborhoods: asJson(settingsSeed.neighborhoods),
    socialProof: asJson(settingsSeed.socialProof),
    updatedAt: nowIso()
  });
}

async function seedProducts() {
  const existing = await db.select().from(productsTable);
  if (existing.length > 0) return;

  const timestamp = nowIso();
  await db.insert(productsTable).values(
    productsSeed.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      benefits: asJson(product.benefits),
      recommendedFor: product.recommendedFor,
      usage: product.usage,
      highlights: asJson(product.highlights),
      ingredients: asJson(product.ingredients),
      faq: asJson(product.faq),
      commercialPitch: product.commercialPitch ?? null,
      category: product.category,
      categoryLabel: product.categoryLabel,
      priceInCents: product.priceInCents,
      packageLabel: product.packageLabel,
      badge: product.badge ?? null,
      badgeVariant: product.badgeVariant ?? null,
      accent: product.accent,
      background: product.background,
      imageLabel: asJson(product.imageLabel),
      imageUrl: null,
      stock: product.stock,
      minStock: 3,
      notes: null,
      active: product.active,
      featured: product.featured,
      createdAt: timestamp,
      updatedAt: timestamp
    }))
  );
}

async function seedKits() {
  const existing = await db.select().from(kitsTable);
  if (existing.length > 0) return;

  const timestamp = nowIso();
  await db.insert(kitsTable).values(
    kitsSeed.map((kit) => ({
      ...kit,
      imageLabel: asJson(kit.imageLabel),
      imageUrl: null,
      notes: null,
      items: asJson(kit.items),
      createdAt: timestamp,
      updatedAt: timestamp
    }))
  );
}

async function ensureCustomerFromSeed(customer: Customer) {
  const existing = await db.select().from(customersTable);
  const found = existing.find((entry) => entry.whatsapp === customer.whatsapp);
  if (found) return found.id;

  const id = randomUUID();
  const timestamp = nowIso();
  await db.insert(customersTable).values({
    id,
    name: customer.name,
    whatsapp: customer.whatsapp,
    email: customer.email ?? null,
    address: customer.address,
    neighborhood: customer.neighborhood,
    deliveryMethod: customer.deliveryMethod,
    notes: null,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  return id;
}

async function seedOrders() {
  const existing = await db.select().from(ordersTable);
  if (existing.length > 0) return;

  for (const order of ordersSeed as Array<Order & { paymentMethod?: string }>) {
    const customerId = await ensureCustomerFromSeed(order.customer);
    const createdAt = order.createdAt ?? nowIso();
    await db.insert(ordersTable).values({
      id: order.id,
      createdAt,
      updatedAt: createdAt,
      customerId,
      customerSnapshot: asJson(order.customer),
      subtotalInCents: order.subtotalInCents,
      deliveryFeeInCents: order.deliveryFeeInCents,
      totalInCents: order.totalInCents,
      source: "site",
      paymentMethod: (order.paymentMethod as PaymentMethod) ?? "mercado_pago",
      paymentStatus: order.paymentStatus,
      orderStatus: normalizeSeedOrderStatus(order.orderStatus),
      mercadoPagoReference: order.mercadoPagoReference ?? null,
      notes: null,
      assignedUserId: null
    });

    await db.insert(orderItemsTable).values(
      order.items.map((item) => ({
        id: randomUUID(),
        orderId: order.id,
        kind: item.kind,
        itemId: item.itemId,
        slug: item.slug,
        name: item.name,
        quantity: item.quantity,
        unitPriceInCents: item.unitPriceInCents,
        categoryLabel: item.categoryLabel,
        packageLabel: item.packageLabel ?? null,
        summary: item.summary ?? null,
        kitItems: item.kitItems ? asJson(item.kitItems) : null
      }))
    );

    await syncReceivableForOrder({
      ...order,
      source: "site",
      customerId,
      paymentMethod: (order.paymentMethod as PaymentMethod) ?? "mercado_pago",
      orderStatus: normalizeSeedOrderStatus(order.orderStatus)
    });
  }
}

async function createTables() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS roles (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS store_settings (id INTEGER PRIMARY KEY, brand_name TEXT NOT NULL, whatsapp TEXT NOT NULL, instagram TEXT NOT NULL, city TEXT NOT NULL, hero_title TEXT NOT NULL, hero_description TEXT NOT NULL, neighborhoods TEXT NOT NULL, social_proof TEXT NOT NULL, updated_at TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT NOT NULL, short_description TEXT NOT NULL, benefits TEXT NOT NULL, recommended_for TEXT NOT NULL, usage TEXT NOT NULL, highlights TEXT NOT NULL, ingredients TEXT NOT NULL, faq TEXT NOT NULL, commercial_pitch TEXT, category TEXT NOT NULL, category_label TEXT NOT NULL, price_in_cents INTEGER, package_label TEXT NOT NULL, badge TEXT, badge_variant TEXT, accent TEXT NOT NULL, background TEXT NOT NULL, image_label TEXT NOT NULL, image_url TEXT, stock INTEGER NOT NULL DEFAULT 0, min_stock INTEGER NOT NULL DEFAULT 3, notes TEXT, active INTEGER NOT NULL DEFAULT 1, featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS kits (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, short_description TEXT NOT NULL, description TEXT NOT NULL, category_label TEXT NOT NULL, price_in_cents INTEGER NOT NULL, compare_at_in_cents INTEGER NOT NULL, savings_in_cents INTEGER NOT NULL, savings_percent INTEGER NOT NULL, target_audience TEXT NOT NULL, sales_tip TEXT NOT NULL, cta_text TEXT NOT NULL, accent TEXT NOT NULL, background TEXT NOT NULL, image_label TEXT NOT NULL, image_url TEXT, notes TEXT, featured INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, items TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, name TEXT NOT NULL, whatsapp TEXT NOT NULL, email TEXT, address TEXT NOT NULL, neighborhood TEXT NOT NULL, delivery_method TEXT NOT NULL, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, customer_id TEXT, customer_snapshot TEXT NOT NULL, subtotal_in_cents INTEGER NOT NULL, delivery_fee_in_cents INTEGER NOT NULL, total_in_cents INTEGER NOT NULL, source TEXT NOT NULL, payment_method TEXT NOT NULL, payment_status TEXT NOT NULL, order_status TEXT NOT NULL, mercado_pago_reference TEXT, notes TEXT, assigned_user_id TEXT);`,
    `CREATE TABLE IF NOT EXISTS order_items (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, kind TEXT NOT NULL, item_id TEXT NOT NULL, slug TEXT NOT NULL, name TEXT NOT NULL, quantity INTEGER NOT NULL, unit_price_in_cents INTEGER NOT NULL, category_label TEXT NOT NULL, package_label TEXT, summary TEXT, kit_items TEXT);`,
    `CREATE TABLE IF NOT EXISTS stock_movements (id TEXT PRIMARY KEY, product_id TEXT NOT NULL, order_id TEXT, type TEXT NOT NULL, quantity_delta INTEGER NOT NULL, reason TEXT NOT NULL, created_by_user_id TEXT, created_at TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS finance_entries (id TEXT PRIMARY KEY, kind TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL, amount_in_cents INTEGER NOT NULL, status TEXT NOT NULL, due_date TEXT, paid_at TEXT, related_order_id TEXT, notes TEXT, created_by_user_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS receivables (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, amount_in_cents INTEGER NOT NULL, status TEXT NOT NULL, due_date TEXT, settled_at TEXT, created_at TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, action TEXT NOT NULL, summary TEXT NOT NULL, actor_user_id TEXT, before_json TEXT, after_json TEXT, created_at TEXT NOT NULL);`
  ];

  for (const statement of statements) {
    await dbClient.execute(statement);
  }
}

export async function ensureDatabase() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await createTables();
      await seedRoles();
      await seedAdminUser();
      await seedSettings();
      await seedProducts();
      await seedKits();
      await seedOrders();
    })();
  }

  await initializationPromise;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  await ensureDatabase();
  const found = await db.select().from(usersTable);
  const user = found.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    active: user.active,
    createdAt: user.createdAt,
    passwordHash: user.passwordHash
  };
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  await ensureDatabase();
  const found = await db.select().from(usersTable);
  const user = found.find((entry) => entry.id === id);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    active: user.active,
    createdAt: user.createdAt,
    passwordHash: user.passwordHash
  };
}

export async function getUsers() {
  await ensureDatabase();
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    active: user.active,
    createdAt: user.createdAt
  }));
}

export async function getProducts() {
  await ensureDatabase();
  const rows = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
  return rows.map(mapProduct);
}

export async function getActiveProducts() {
  const products = await getProducts();
  return products.filter((product) => product.active);
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string) {
  const products = await getProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function saveProducts(products: Product[]) {
  await ensureDatabase();
  await db.delete(productsTable);
  const timestamp = nowIso();
  if (products.length === 0) return;
  await db.insert(productsTable).values(
    products.map((product) => ({
      ...product,
      benefits: asJson(product.benefits),
      highlights: asJson(product.highlights),
      ingredients: asJson(product.ingredients),
      faq: asJson(product.faq),
      imageLabel: asJson(product.imageLabel),
      imageUrl: product.imageUrl ?? null,
      notes: product.notes ?? null,
      minStock: product.minStock ?? 3,
      commercialPitch: product.commercialPitch ?? null,
      badge: product.badge ?? null,
      badgeVariant: product.badgeVariant ?? null,
      createdAt: product.createdAt ?? timestamp,
      updatedAt: timestamp
    }))
  );
}

export async function createProduct(product: Product, actorUserId?: string | null) {
  const products = await getProducts();
  await saveProducts([product, ...products]);
  await recordAuditLog({
    entityType: "product",
    entityId: product.id,
    action: "create",
    summary: `Produto ${product.name} criado.`,
    actorUserId,
    after: product
  });
  return product;
}

export async function updateProduct(id: string, updates: Partial<Product>, actorUserId?: string | null) {
  const current = await getProductById(id);
  if (!current) return null;

  const nextProduct = {
    ...current,
    ...updates,
    id
  };

  if (updates.stock !== undefined && updates.stock !== current.stock) {
    await createStockMovement({
      productId: id,
      quantityDelta: updates.stock - current.stock,
      reason: "Ajuste manual de estoque",
      type: "adjustment",
      createdByUserId: actorUserId ?? null
    });
  }

  const products = await getProducts();
  await saveProducts(products.map((product) => (product.id === id ? nextProduct : product)));
  await recordAuditLog({
    entityType: "product",
    entityId: id,
    action: "update",
    summary: `Produto ${nextProduct.name} atualizado.`,
    actorUserId,
    before: current,
    after: nextProduct
  });
  return nextProduct;
}

export async function deleteProduct(id: string, actorUserId?: string | null) {
  const current = await getProductById(id);
  if (!current) return;
  const products = await getProducts();
  await saveProducts(products.filter((product) => product.id !== id));
  await recordAuditLog({
    entityType: "product",
    entityId: id,
    action: "delete",
    summary: `Produto ${current.name} removido.`,
    actorUserId,
    before: current
  });
}

export async function getKits() {
  await ensureDatabase();
  const rows = await db.select().from(kitsTable).orderBy(desc(kitsTable.createdAt));
  return rows.map(mapKit);
}

export async function getActiveKits() {
  const kits = await getKits();
  return kits.filter((kit) => kit.active);
}

export async function getKitBySlug(slug: string) {
  const kits = await getKits();
  return kits.find((kit) => kit.slug === slug) ?? null;
}

export async function getKitById(id: string) {
  const kits = await getKits();
  return kits.find((kit) => kit.id === id) ?? null;
}

export async function saveKits(kits: Kit[]) {
  await ensureDatabase();
  await db.delete(kitsTable);
  const timestamp = nowIso();
  if (kits.length === 0) return;
  await db.insert(kitsTable).values(
    kits.map((kit) => ({
      ...kit,
      items: asJson(kit.items),
      imageLabel: asJson(kit.imageLabel),
      imageUrl: kit.imageUrl ?? null,
      notes: kit.notes ?? null,
      createdAt: kit.createdAt ?? timestamp,
      updatedAt: timestamp
    }))
  );
}

export async function createKit(kit: Kit, actorUserId?: string | null) {
  const kits = await getKits();
  await saveKits([kit, ...kits]);
  await recordAuditLog({
    entityType: "kit",
    entityId: kit.id,
    action: "create",
    summary: `Kit ${kit.name} criado.`,
    actorUserId,
    after: kit
  });
  return kit;
}

export async function updateKit(id: string, updates: Partial<Kit>, actorUserId?: string | null) {
  const current = await getKitById(id);
  if (!current) return null;
  const nextKit = { ...current, ...updates, id };
  const kits = await getKits();
  await saveKits(kits.map((kit) => (kit.id === id ? nextKit : kit)));
  await recordAuditLog({
    entityType: "kit",
    entityId: id,
    action: "update",
    summary: `Kit ${nextKit.name} atualizado.`,
    actorUserId,
    before: current,
    after: nextKit
  });
  return nextKit;
}

export async function deleteKit(id: string, actorUserId?: string | null) {
  const current = await getKitById(id);
  if (!current) return;
  const kits = await getKits();
  await saveKits(kits.filter((kit) => kit.id !== id));
  await recordAuditLog({
    entityType: "kit",
    entityId: id,
    action: "delete",
    summary: `Kit ${current.name} removido.`,
    actorUserId,
    before: current
  });
}

export async function getSettings(): Promise<StoreSettings> {
  await ensureDatabase();
  const rows = await db.select().from(settingsTable);
  const row = rows[0];
  if (!row) {
    return settingsSeed as unknown as StoreSettings;
  }
  return {
    brandName: row.brandName,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    city: row.city,
    heroTitle: row.heroTitle,
    heroDescription: row.heroDescription,
    freeShippingThresholdInCents: (row as any).freeShippingThresholdInCents ?? 0,
    neighborhoods: fromJson(row.neighborhoods, []) as StoreSettings["neighborhoods"],
    socialProof: fromJson(row.socialProof, []) as StoreSettings["socialProof"]
  };
}

export async function saveSettings(settings: StoreSettings) {
  await ensureDatabase();
  await db.delete(settingsTable);
  await db.insert(settingsTable).values({
    id: 1,
    brandName: settings.brandName,
    whatsapp: settings.whatsapp,
    instagram: settings.instagram,
    city: settings.city,
    heroTitle: settings.heroTitle,
    heroDescription: settings.heroDescription,
    neighborhoods: asJson(settings.neighborhoods),
    socialProof: asJson(settings.socialProof),
    updatedAt: nowIso()
  });
}

export async function getCustomers() {
  await ensureDatabase();
  const [customers, orders] = await Promise.all([
    db.select().from(customersTable).orderBy(desc(customersTable.createdAt)),
    getOrders()
  ]);

  return customers.map((customerRow) => {
    const customerOrders = orders.filter((order) => order.customerId === customerRow.id);
    return {
      ...mapCustomer(customerRow),
      totalOrders: customerOrders.length,
      totalSpentInCents: customerOrders.reduce((total, order) => total + order.totalInCents, 0),
      lastOrderAt: customerOrders[0]?.createdAt ?? null
    } satisfies CustomerSummary;
  });
}

export async function getCustomerById(id: string) {
  const customers = await getCustomers();
  return customers.find((customer) => customer.id === id) ?? null;
}

export async function upsertCustomer(customer: Customer, actorUserId?: string | null) {
  await ensureDatabase();
  const rows = await db.select().from(customersTable);
  const found = rows.find((entry) => entry.whatsapp === customer.whatsapp);
  const timestamp = nowIso();

  if (found) {
    await db
      .update(customersTable)
      .set({
        name: customer.name,
        whatsapp: customer.whatsapp,
        email: customer.email ?? null,
        address: customer.address,
        neighborhood: customer.neighborhood,
        deliveryMethod: customer.deliveryMethod,
        notes: customer.notes ?? null,
        updatedAt: timestamp
      })
      .where(eq(customersTable.id, found.id));

    const updatedCustomer = { ...customer, id: found.id, updatedAt: timestamp };
    await recordAuditLog({
      entityType: "customer",
      entityId: found.id,
      action: "update",
      summary: `Cliente ${customer.name} atualizado.`,
      actorUserId,
      after: updatedCustomer
    });
    return updatedCustomer;
  }

  const id = randomUUID();
  await db.insert(customersTable).values({
    id,
    name: customer.name,
    whatsapp: customer.whatsapp,
    email: customer.email ?? null,
    address: customer.address,
    neighborhood: customer.neighborhood,
    deliveryMethod: customer.deliveryMethod,
    notes: customer.notes ?? null,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  const createdCustomer = { ...customer, id, createdAt: timestamp, updatedAt: timestamp };
  await recordAuditLog({
    entityType: "customer",
    entityId: id,
    action: "create",
    summary: `Cliente ${customer.name} criado.`,
    actorUserId,
    after: createdCustomer
  });
  return createdCustomer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>, actorUserId?: string | null) {
  const current = await getCustomerById(id);
  if (!current) return null;
  const nextCustomer = { ...current, ...updates, id };
  await upsertCustomer(nextCustomer, actorUserId);
  return nextCustomer;
}

async function getOrderItemsByOrderIds(orderIds: string[]) {
  await ensureDatabase();
  const allItems = await db.select().from(orderItemsTable);
  return allItems.filter((item) => orderIds.includes(item.orderId));
}

function buildOrderFromRows(
  orderRow: typeof ordersTable.$inferSelect,
  orderItems: Array<typeof orderItemsTable.$inferSelect>
): Order {
  return {
    id: orderRow.id,
    createdAt: orderRow.createdAt,
    updatedAt: orderRow.updatedAt,
    customerId: orderRow.customerId ?? undefined,
    customer: fromJson(orderRow.customerSnapshot, {
      name: "",
      whatsapp: "",
      address: "",
      neighborhood: "",
      deliveryMethod: "delivery"
    } as Customer),
    items: orderItems
      .filter((item) => item.orderId === orderRow.id)
      .map(
        (item): OrderItem => ({
          id: item.id,
          kind: item.kind as OrderItem["kind"],
          itemId: item.itemId,
          slug: item.slug,
          name: item.name,
          quantity: item.quantity,
          unitPriceInCents: item.unitPriceInCents,
          categoryLabel: item.categoryLabel,
          packageLabel: item.packageLabel ?? undefined,
          summary: item.summary ?? undefined,
          kitItems: item.kitItems ? fromJson(item.kitItems, []) : undefined
        })
      ),
    subtotalInCents: orderRow.subtotalInCents,
    deliveryFeeInCents: orderRow.deliveryFeeInCents,
    totalInCents: orderRow.totalInCents,
    source: orderRow.source as Order["source"],
    paymentMethod: orderRow.paymentMethod as PaymentMethod,
    paymentStatus: orderRow.paymentStatus as PaymentStatus,
    orderStatus: orderRow.orderStatus as OrderStatus,
    mercadoPagoReference: orderRow.mercadoPagoReference ?? undefined,
    notes: orderRow.notes ?? undefined,
    assignedUserId: orderRow.assignedUserId ?? undefined
  };
}

export async function getOrders() {
  await ensureDatabase();
  const [orderRows, itemRows] = await Promise.all([
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)),
    db.select().from(orderItemsTable)
  ]);
  return orderRows.map((row) => buildOrderFromRows(row, itemRows));
}

export async function getOrderById(id: string) {
  const orders = await getOrders();
  return orders.find((order) => order.id === id) ?? null;
}

export async function saveOrders(orders: Order[]) {
  await ensureDatabase();
  await db.delete(orderItemsTable);
  await db.delete(ordersTable);

  for (const order of orders) {
    await persistOrder(order);
  }
}

async function persistOrder(order: Order) {
  await db.insert(ordersTable).values({
    id: order.id,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt ?? order.createdAt,
    customerId: order.customerId ?? null,
    customerSnapshot: asJson(order.customer),
    subtotalInCents: order.subtotalInCents,
    deliveryFeeInCents: order.deliveryFeeInCents,
    totalInCents: order.totalInCents,
    source: order.source,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    mercadoPagoReference: order.mercadoPagoReference ?? null,
    notes: order.notes ?? null,
    assignedUserId: order.assignedUserId ?? null
  });

  if (order.items.length > 0) {
    await db.insert(orderItemsTable).values(
      order.items.map((item) => ({
        id: item.id ?? randomUUID(),
        orderId: order.id,
        kind: item.kind,
        itemId: item.itemId,
        slug: item.slug,
        name: item.name,
        quantity: item.quantity,
        unitPriceInCents: item.unitPriceInCents,
        categoryLabel: item.categoryLabel,
        packageLabel: item.packageLabel ?? null,
        summary: item.summary ?? null,
        kitItems: item.kitItems ? asJson(item.kitItems) : null
      }))
    );
  }
}

async function createStockMovement({
  productId,
  quantityDelta,
  reason,
  type,
  createdByUserId,
  orderId
}: {
  productId: string;
  quantityDelta: number;
  reason: string;
  type: string;
  createdByUserId?: string | null;
  orderId?: string | null;
}) {
  await ensureDatabase();
  if (!quantityDelta) return;
  await db.insert(stockMovementsTable).values({
    id: randomUUID(),
    productId,
    orderId: orderId ?? null,
    type,
    quantityDelta,
    reason,
    createdByUserId: createdByUserId ?? null,
    createdAt: nowIso()
  });
}

async function applyOrderStockReduction(order: Order, actorUserId?: string | null) {
  const products = await getProducts();
  const nextProducts = products.map((product) => {
    let reduction = 0;
    order.items.forEach((item) => {
      if (item.kind === "product" && item.itemId === product.id) {
        reduction += item.quantity;
      }
      if (item.kind === "kit" && item.kitItems) {
        item.kitItems.forEach((kitItem) => {
          if (kitItem.productId === product.id) {
            reduction += kitItem.quantity * item.quantity;
          }
        });
      }
    });

    if (!reduction) return product;
    void createStockMovement({
      productId: product.id,
      quantityDelta: reduction * -1,
      reason: `Baixa por pedido ${order.id}`,
      type: "sale",
      createdByUserId: actorUserId ?? null,
      orderId: order.id
    });
    return { ...product, stock: Math.max(0, product.stock - reduction) };
  });

  await saveProducts(nextProducts);
}

async function syncReceivableForOrder(order: Order) {
  const existing = await db.select().from(receivablesTable);
  const current = existing.find((entry) => entry.orderId === order.id);
  const status = order.paymentStatus === "pago" ? "paid" : order.orderStatus === "cancelado" ? "cancelled" : "pending";

  if (current) {
    await db
      .update(receivablesTable)
      .set({
        amountInCents: order.totalInCents,
        status,
        settledAt: order.paymentStatus === "pago" ? nowIso() : null,
        dueDate: null
      })
      .where(eq(receivablesTable.id, current.id));
    return;
  }

  await db.insert(receivablesTable).values({
    id: randomUUID(),
    orderId: order.id,
    amountInCents: order.totalInCents,
    status,
    dueDate: null,
    settledAt: order.paymentStatus === "pago" ? nowIso() : null,
    createdAt: nowIso()
  });
}

async function createReceivableIncomeEntry(order: Order, actorUserId?: string | null) {
  const entries = await getFinanceEntries();
  if (entries.some((entry) => entry.relatedOrderId === order.id && entry.kind === "income")) return;

  await createFinanceEntry(
    {
      id: randomUUID(),
      kind: "income",
      category: "Vendas",
      description: `Pedido ${order.id} - ${order.customer.name}`,
      amountInCents: order.totalInCents,
      status: order.paymentStatus === "pago" ? "paid" : "pending",
      dueDate: order.createdAt.slice(0, 10),
      paidAt: order.paymentStatus === "pago" ? order.updatedAt ?? order.createdAt : null,
      relatedOrderId: order.id,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt ?? order.createdAt,
      createdByUserId: actorUserId ?? null
    },
    actorUserId,
    false
  );
}

export async function createOrder(
  input: {
    customer: Customer;
    items: OrderItem[];
    deliveryFeeInCents?: number;
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    orderStatus?: OrderStatus;
    source: Order["source"];
    notes?: string;
    assignedUserId?: string | null;
  },
  actorUserId?: string | null
) {
  await ensureDatabase();
  const customer = await upsertCustomer(input.customer, actorUserId);
  const createdAt = nowIso();
  const subtotalInCents = input.items.reduce((total, item) => total + item.unitPriceInCents * item.quantity, 0);
  const order: Order = {
    id: createOrderId(),
    createdAt,
    updatedAt: createdAt,
    customerId: customer.id,
    customer: {
      ...customer,
      whatsapp: customer.whatsapp,
      deliveryMethod: input.customer.deliveryMethod
    },
    items: input.items.map((item) => ({ ...item, id: randomUUID() })),
    subtotalInCents,
    deliveryFeeInCents: input.deliveryFeeInCents ?? 0,
    totalInCents: subtotalInCents + (input.deliveryFeeInCents ?? 0),
    source: input.source,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus ?? "pendente",
    orderStatus: input.orderStatus ?? "pedido_recebido",
    notes: input.notes,
    assignedUserId: input.assignedUserId ?? null
  };

  await persistOrder(order);
  await createReceivableIncomeEntry(order, actorUserId);
  await syncReceivableForOrder(order);
  if (order.paymentStatus === "pago") {
    await applyOrderStockReduction(order, actorUserId);
  }
  await recordAuditLog({
    entityType: "order",
    entityId: order.id,
    action: "create",
    summary: `Pedido ${order.id} criado.`,
    actorUserId,
    after: order
  });
  return order;
}

export async function updateOrder(id: string, updates: Partial<Order>, actorUserId?: string | null) {
  const current = await getOrderById(id);
  if (!current) return null;
  const nextOrder: Order = {
    ...current,
    ...updates,
    id,
    updatedAt: nowIso()
  };

  const wasPaid = current.paymentStatus === "pago";
  const becamePaid = !wasPaid && nextOrder.paymentStatus === "pago";

  const orders = await getOrders();
  await saveOrders(orders.map((order) => (order.id === id ? nextOrder : order)));
  await syncReceivableForOrder(nextOrder);

  const financeEntries = await getFinanceEntries();
  const orderIncomeEntry = financeEntries.find((entry) => entry.relatedOrderId === id && entry.kind === "income");
  if (orderIncomeEntry) {
    await updateFinanceEntry(
      orderIncomeEntry.id,
      {
        status: nextOrder.paymentStatus === "pago" ? "paid" : "pending",
        paidAt: nextOrder.paymentStatus === "pago" ? nowIso() : null
      },
      actorUserId,
      false
    );
  }

  if (becamePaid) {
    await applyOrderStockReduction(nextOrder, actorUserId);
  }

  await recordAuditLog({
    entityType: "order",
    entityId: id,
    action: "update",
    summary: `Pedido ${id} atualizado.`,
    actorUserId,
    before: current,
    after: nextOrder
  });
  return nextOrder;
}

export async function getFinanceEntries() {
  await ensureDatabase();
  const rows = await db.select().from(financeEntriesTable).orderBy(desc(financeEntriesTable.createdAt));
  return rows.map(mapFinanceEntry);
}

export async function createFinanceEntry(entry: FinanceEntry, actorUserId?: string | null, logAudit = true) {
  await ensureDatabase();
  await db.insert(financeEntriesTable).values({
    id: entry.id,
    kind: entry.kind,
    category: entry.category,
    description: entry.description,
    amountInCents: entry.amountInCents,
    status: entry.status,
    dueDate: entry.dueDate ?? null,
    paidAt: entry.paidAt ?? null,
    relatedOrderId: entry.relatedOrderId ?? null,
    notes: entry.notes ?? null,
    createdByUserId: actorUserId ?? entry.createdByUserId ?? null,
    createdAt: entry.createdAt ?? nowIso(),
    updatedAt: entry.updatedAt ?? nowIso()
  });

  if (logAudit) {
    await recordAuditLog({
      entityType: "finance_entry",
      entityId: entry.id,
      action: "create",
      summary: `Lançamento financeiro ${entry.description} criado.`,
      actorUserId,
      after: entry
    });
  }
}

export async function updateFinanceEntry(id: string, updates: Partial<FinanceEntry>, actorUserId?: string | null, logAudit = true) {
  const entries = await getFinanceEntries();
  const current = entries.find((entry) => entry.id === id);
  if (!current) return null;
  const nextEntry = { ...current, ...updates, id, updatedAt: nowIso() };

  await db
    .update(financeEntriesTable)
    .set({
      kind: nextEntry.kind,
      category: nextEntry.category,
      description: nextEntry.description,
      amountInCents: nextEntry.amountInCents,
      status: nextEntry.status,
      dueDate: nextEntry.dueDate ?? null,
      paidAt: nextEntry.paidAt ?? null,
      relatedOrderId: nextEntry.relatedOrderId ?? null,
      notes: nextEntry.notes ?? null,
      updatedAt: nextEntry.updatedAt,
      createdByUserId: actorUserId ?? current.createdByUserId ?? null
    })
    .where(eq(financeEntriesTable.id, id));

  if (logAudit) {
    await recordAuditLog({
      entityType: "finance_entry",
      entityId: id,
      action: "update",
      summary: `Lançamento financeiro ${nextEntry.description} atualizado.`,
      actorUserId,
      before: current,
      after: nextEntry
    });
  }
  return nextEntry;
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const entries = await getFinanceEntries();
  const revenueInCents = entries.filter((entry) => entry.kind === "income").reduce((total, entry) => total + entry.amountInCents, 0);
  const expensesInCents = entries.filter((entry) => entry.kind === "expense").reduce((total, entry) => total + entry.amountInCents, 0);
  const paidRevenueInCents = entries
    .filter((entry) => entry.kind === "income" && entry.status === "paid")
    .reduce((total, entry) => total + entry.amountInCents, 0);
  const pendingRevenueInCents = entries
    .filter((entry) => entry.kind === "income" && entry.status === "pending")
    .reduce((total, entry) => total + entry.amountInCents, 0);
  const paidExpensesInCents = entries
    .filter((entry) => entry.kind === "expense" && entry.status === "paid")
    .reduce((total, entry) => total + entry.amountInCents, 0);
  const pendingExpensesInCents = entries
    .filter((entry) => entry.kind === "expense" && entry.status === "pending")
    .reduce((total, entry) => total + entry.amountInCents, 0);

  return {
    revenueInCents,
    expensesInCents,
    paidRevenueInCents,
    pendingRevenueInCents,
    paidExpensesInCents,
    pendingExpensesInCents,
    profitEstimateInCents: revenueInCents - expensesInCents,
    cashFlowInCents: paidRevenueInCents - paidExpensesInCents
  };
}

export async function getReceivables() {
  await ensureDatabase();
  const rows = await db.select().from(receivablesTable).orderBy(desc(receivablesTable.createdAt));
  return rows.map(
    (row): Receivable => ({
      id: row.id,
      orderId: row.orderId,
      amountInCents: row.amountInCents,
      status: row.status as Receivable["status"],
      dueDate: row.dueDate ?? undefined,
      settledAt: row.settledAt ?? undefined,
      createdAt: row.createdAt
    })
  );
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [orders, products, receivables] = await Promise.all([getOrders(), getProducts(), getReceivables()]);
  const today = new Date().toISOString().slice(0, 10);
  const salesTodayInCents = orders
    .filter((order) => order.createdAt.slice(0, 10) === today && order.paymentStatus === "pago")
    .reduce((total, order) => total + order.totalInCents, 0);
  const openOrdersCount = orders.filter((order) => !["entregue", "cancelado"].includes(order.orderStatus)).length;
  const lowStockProducts = products.filter((product) => product.stock <= product.minStock);

  const topProductsMap = new Map<string, { name: string; quantity: number; revenueInCents: number }>();
  orders
    .filter((order) => order.paymentStatus === "pago")
    .forEach((order) => {
      order.items.forEach((item) => {
        const current = topProductsMap.get(item.name) ?? { name: item.name, quantity: 0, revenueInCents: 0 };
        current.quantity += item.quantity;
        current.revenueInCents += item.quantity * item.unitPriceInCents;
        topProductsMap.set(item.name, current);
      });
    });

  return {
    salesTodayInCents,
    openOrdersCount,
    lowStockProducts,
    topProducts: Array.from(topProductsMap.values()).sort((left, right) => right.quantity - left.quantity).slice(0, 5),
    receivablesInCents: receivables
      .filter((receivable) => receivable.status === "pending")
      .reduce((total, receivable) => total + receivable.amountInCents, 0)
  };
}

export async function getAuditLogs() {
  await ensureDatabase();
  const rows = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt));
  return rows.map(
    (row): AuditLog => ({
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      action: row.action,
      summary: row.summary,
      actorUserId: row.actorUserId ?? undefined,
      beforeJson: row.beforeJson ?? undefined,
      afterJson: row.afterJson ?? undefined,
      createdAt: row.createdAt
    })
  );
}

export async function recordAuditLog({
  entityType,
  entityId,
  action,
  summary,
  actorUserId,
  before,
  after
}: {
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  actorUserId?: string | null;
  before?: unknown;
  after?: unknown;
}) {
  await ensureDatabase();
  await db.insert(auditLogsTable).values({
    id: randomUUID(),
    entityType,
    entityId,
    action,
    summary,
    actorUserId: actorUserId ?? null,
    beforeJson: before ? asJson(before) : null,
    afterJson: after ? asJson(after) : null,
    createdAt: nowIso()
  });
}

export async function sanitizeCartItems(items: CartItem[]) {
  const products = await getProducts();
  const kits = await getKits();

  return items.filter((item) => {
    if (!item.kind || !item.itemId || !item.name || !Number.isFinite(item.unitPriceInCents) || item.quantity < 1) {
      return false;
    }
    if (item.kind === "product") {
      return products.some((product) => product.id === item.itemId && product.active);
    }
    return kits.some((kit) => kit.id === item.itemId && kit.active);
  });
}
