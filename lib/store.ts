import { Order, Visitor, StoreSettings, DEFAULT_MESSAGES, SHIPPING_STATES } from './types';
import { Product, PRODUCTS } from './products';

// In-memory store (persists across hot reloads in dev via globalThis)
// For production: replace with Vercel KV, Supabase, or Postgres

interface Store {
  orders: Map<string, Order>;
  visitors: Visitor[];
  products: Product[];
  settings: StoreSettings;
}

const globalStore = globalThis as unknown as { __store?: Store };

function getStore(): Store {
  if (!globalStore.__store) {
    globalStore.__store = {
      orders: new Map(),
      visitors: [],
      products: [...PRODUCTS],
      settings: {
        paymentGateway: (process.env.MERCADOPAGO_ACCESS_TOKEN ? 'mercadopago' : 'stripe') as any,
        stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
        stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
        smsApiKey: process.env.SMS_API_KEY || '',
        smsFromNumber: process.env.SMS_FROM_NUMBER || '',
        shippingRates: [...SHIPPING_STATES],
        messages: { ...DEFAULT_MESSAGES },
      },
    };
  }
  return globalStore.__store;
}

// Products
export function getProducts(): Product[] {
  return getStore().products;
}

export function getProduct(id: string): Product | undefined {
  return getStore().products.find((p) => p.id === id);
}

export function addProduct(product: Product): Product {
  getStore().products.push(product);
  return product;
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const store = getStore();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  store.products[idx] = { ...store.products[idx], ...data };
  return store.products[idx];
}

export function deleteProduct(id: string): boolean {
  const store = getStore();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.products.splice(idx, 1);
  return true;
}

// Orders
export function getOrders(): Order[] {
  return Array.from(getStore().orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrder(id: string): Order | undefined {
  return getStore().orders.get(id);
}

export function createOrder(order: Order): Order {
  getStore().orders.set(order.id, order);
  return order;
}

export function updateOrder(id: string, data: Partial<Order>): Order | null {
  const store = getStore();
  const existing = store.orders.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  store.orders.set(id, updated);
  return updated;
}

// Visitors
export function trackVisitor(visitor: Visitor): void {
  const store = getStore();
  // Update existing session or add new one
  const existingIdx = store.visitors.findIndex((v) => v.id === visitor.id);
  if (existingIdx !== -1) {
    // Same session: just update timestamp and page (heartbeat)
    store.visitors[existingIdx].timestamp = visitor.timestamp;
    store.visitors[existingIdx].page = visitor.page;
  } else {
    // New unique session
    store.visitors.push(visitor);
  }
  // Keep last 500 unique sessions
  if (store.visitors.length > 500) {
    store.visitors = store.visitors.slice(-500);
  }
}

export function getRecentVisitors(minutes = 5): Visitor[] {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  return getStore().visitors.filter((v) => v.timestamp > cutoff);
}

export function getVisitorStats() {
  const store = getStore();
  const now = Date.now();
  // Each entry is a unique session, so count directly
  const realtime = store.visitors.filter(
    (v) => new Date(v.timestamp).getTime() > now - 5 * 60 * 1000
  ).length;
  const lastHour = store.visitors.filter(
    (v) => new Date(v.timestamp).getTime() > now - 60 * 60 * 1000
  ).length;
  const today = store.visitors.filter(
    (v) => new Date(v.timestamp).toDateString() === new Date().toDateString()
  ).length;
  return { realtime, lastHour, today };
}

// Settings
export function getSettings(): StoreSettings {
  return getStore().settings;
}

export function updateSettings(data: Partial<StoreSettings>): StoreSettings {
  const store = getStore();
  store.settings = { ...store.settings, ...data };
  return store.settings;
}
