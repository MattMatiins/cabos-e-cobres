import { Order, Visitor, StoreSettings, DEFAULT_MESSAGES, SHIPPING_STATES } from './types';
import { Product } from './products';
import { sql, ensureDb } from './db';

// ── Products ────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  await ensureDb();
  const rows = await sql`SELECT * FROM products ORDER BY name`;
  return rows.map(rowToProduct);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  await ensureDb();
  const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

export async function addProduct(product: Product): Promise<Product> {
  await ensureDb();
  await sql`
    INSERT INTO products (id, slug, name, code, price, price_formatted, description, images, category, in_stock)
    VALUES (${product.id}, ${product.slug}, ${product.name}, ${product.code}, ${product.price}, ${product.priceFormatted}, ${product.description}, ${product.images}, ${product.category}, ${product.inStock})
  `;
  return product;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  await ensureDb();
  const existing = await getProduct(id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  await sql`
    UPDATE products SET
      slug = ${updated.slug}, name = ${updated.name}, code = ${updated.code},
      price = ${updated.price}, price_formatted = ${updated.priceFormatted},
      description = ${updated.description}, images = ${updated.images},
      category = ${updated.category}, in_stock = ${updated.inStock}
    WHERE id = ${id}
  `;
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await ensureDb();
  const result = await sql`DELETE FROM products WHERE id = ${id}`;
  return result.length !== undefined;
}

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    code: row.code,
    price: row.price,
    priceFormatted: row.price_formatted,
    description: row.description,
    images: row.images || [],
    category: row.category,
    inStock: row.in_stock,
  };
}

// ── Orders ──────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  await ensureDb();
  const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
  const orders: Order[] = [];
  for (const row of rows) {
    orders.push(await rowToOrder(row));
  }
  return orders;
}

export async function getOrder(id: string): Promise<Order | undefined> {
  await ensureDb();
  const rows = await sql`SELECT * FROM orders WHERE id = ${id}`;
  if (!rows[0]) return undefined;
  return rowToOrder(rows[0]);
}

export async function createOrder(order: Order): Promise<Order> {
  await ensureDb();
  await sql`
    INSERT INTO orders (id, tracking_id, status, delivery_method, tracking_code, customer_name, customer_phone, customer_email, shipping_address, stripe_session_id, total, created_at, updated_at)
    VALUES (${order.id}, ${order.trackingId}, ${order.status}, ${order.deliveryMethod}, ${order.trackingCode || null}, ${order.customerName}, ${order.customerPhone}, ${order.customerEmail}, ${order.shippingAddress || null}, ${order.stripeSessionId || null}, ${order.total}, ${order.createdAt}, ${order.updatedAt})
  `;
  // Insert items
  for (const item of order.items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, name, code, price, quantity)
      VALUES (${order.id}, ${item.productId}, ${item.name}, ${item.code}, ${item.price}, ${item.quantity})
    `;
  }
  // Insert initial status history
  for (const h of order.statusHistory) {
    await sql`
      INSERT INTO order_status_history (order_id, status, timestamp, note)
      VALUES (${order.id}, ${h.status}, ${h.timestamp}, ${h.note || null})
    `;
  }
  return order;
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
  await ensureDb();
  const existing = await getOrder(id);
  if (!existing) return null;

  const updatedAt = new Date().toISOString();

  // Update main order fields
  await sql`
    UPDATE orders SET
      status = ${data.status || existing.status},
      tracking_code = ${data.trackingCode !== undefined ? data.trackingCode : existing.trackingCode || null},
      stripe_session_id = ${data.stripeSessionId || existing.stripeSessionId || null},
      updated_at = ${updatedAt}
    WHERE id = ${id}
  `;

  // If statusHistory provided, insert new entries
  if (data.statusHistory && data.statusHistory.length > existing.statusHistory.length) {
    const newEntries = data.statusHistory.slice(existing.statusHistory.length);
    for (const h of newEntries) {
      await sql`
        INSERT INTO order_status_history (order_id, status, timestamp, note)
        VALUES (${id}, ${h.status}, ${h.timestamp}, ${h.note || null})
      `;
    }
  }

  return getOrder(id) as Promise<Order>;
}

async function rowToOrder(row: any): Promise<Order> {
  const items = await sql`SELECT * FROM order_items WHERE order_id = ${row.id}`;
  const history = await sql`SELECT * FROM order_status_history WHERE order_id = ${row.id} ORDER BY timestamp`;

  return {
    id: row.id,
    trackingId: row.tracking_id,
    items: items.map((i: any) => ({
      productId: i.product_id,
      name: i.name,
      code: i.code,
      price: i.price,
      quantity: i.quantity,
    })),
    status: row.status,
    deliveryMethod: row.delivery_method,
    trackingCode: row.tracking_code || undefined,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    shippingAddress: row.shipping_address || undefined,
    stripeSessionId: row.stripe_session_id || undefined,
    total: row.total,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    statusHistory: history.map((h: any) => ({
      status: h.status,
      timestamp: h.timestamp instanceof Date ? h.timestamp.toISOString() : h.timestamp,
      note: h.note || undefined,
    })),
  };
}

// ── Visitors ────────────────────────────────────────────────────

export async function trackVisitor(visitor: Visitor): Promise<void> {
  await ensureDb();
  await sql`
    INSERT INTO visitors (id, page, timestamp, user_agent)
    VALUES (${visitor.id}, ${visitor.page}, ${visitor.timestamp}, ${visitor.userAgent || null})
    ON CONFLICT (id) DO UPDATE SET page = ${visitor.page}, timestamp = ${visitor.timestamp}
  `;
  // Cleanup: keep only last 500
  await sql`
    DELETE FROM visitors WHERE id NOT IN (
      SELECT id FROM visitors ORDER BY timestamp DESC LIMIT 500
    )
  `;
}

export async function getRecentVisitors(minutes = 5): Promise<Visitor[]> {
  await ensureDb();
  const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const rows = await sql`SELECT * FROM visitors WHERE timestamp > ${cutoff}`;
  return rows.map((r: any) => ({
    id: r.id,
    page: r.page,
    timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp,
    userAgent: r.user_agent || undefined,
  }));
}

export async function getVisitorStats(): Promise<{ realtime: number; lastHour: number; today: number }> {
  await ensureDb();
  const now = new Date();
  const fiveMin = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  const oneHour = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const result = await sql`
    SELECT
      COUNT(*) FILTER (WHERE timestamp > ${fiveMin}) as realtime,
      COUNT(*) FILTER (WHERE timestamp > ${oneHour}) as last_hour,
      COUNT(*) FILTER (WHERE timestamp > ${todayStart}) as today
    FROM visitors
  `;

  return {
    realtime: parseInt(result[0].realtime) || 0,
    lastHour: parseInt(result[0].last_hour) || 0,
    today: parseInt(result[0].today) || 0,
  };
}

// ── Settings ────────────────────────────────────────────────────

export async function getSettings(): Promise<StoreSettings> {
  await ensureDb();
  const rows = await sql`SELECT data FROM settings WHERE id = 1`;
  if (rows[0]) {
    return rows[0].data as StoreSettings;
  }
  // Fallback to defaults
  return {
    paymentGateway: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'mercadopago' : 'stripe',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    mercadoPagoPublicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
    smsApiKey: process.env.SMS_API_KEY || '',
    smsFromNumber: process.env.SMS_FROM_NUMBER || '',
    shippingRates: [...SHIPPING_STATES],
    messages: { ...DEFAULT_MESSAGES },
  };
}

export async function updateSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
  await ensureDb();
  const current = await getSettings();
  const updated = { ...current, ...data };
  await sql`
    INSERT INTO settings (id, data) VALUES (1, ${JSON.stringify(updated)})
    ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(updated)}
  `;
  return updated;
}
