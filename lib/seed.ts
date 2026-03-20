import { sql } from './db';
import { PRODUCTS } from './products';
import { DEFAULT_MESSAGES, SHIPPING_STATES } from './types';

export async function seedDatabase() {
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT,
      name TEXT NOT NULL,
      code TEXT,
      price INTEGER NOT NULL,
      price_formatted TEXT,
      description TEXT,
      images TEXT[] DEFAULT '{}',
      category TEXT,
      in_stock BOOLEAN DEFAULT true
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      tracking_id TEXT UNIQUE,
      status TEXT DEFAULT 'novo',
      delivery_method TEXT,
      tracking_code TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      shipping_address TEXT,
      stripe_session_id TEXT,
      total INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT,
      name TEXT,
      code TEXT,
      price INTEGER,
      quantity INTEGER
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_status_history (
      id SERIAL PRIMARY KEY,
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      status TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      note TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      page TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      user_agent TEXT
    )
  `;

  // Seed products if empty
  const existingProducts = await sql`SELECT COUNT(*) as count FROM products`;
  if (parseInt(existingProducts[0].count) === 0) {
    for (const p of PRODUCTS) {
      await sql`
        INSERT INTO products (id, slug, name, code, price, price_formatted, description, images, category, in_stock)
        VALUES (${p.id}, ${p.slug}, ${p.name}, ${p.code}, ${p.price}, ${p.priceFormatted}, ${p.description}, ${p.images}, ${p.category}, ${p.inStock})
      `;
    }
    console.log(`[Seed] Inserted ${PRODUCTS.length} products`);
  }

  // Seed default settings if empty
  const existingSettings = await sql`SELECT COUNT(*) as count FROM settings`;
  if (parseInt(existingSettings[0].count) === 0) {
    const defaultSettings = {
      paymentGateway: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'mercadopago' : 'stripe',
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      mercadoPagoPublicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
      smsApiKey: process.env.SMS_API_KEY || '',
      smsFromNumber: process.env.SMS_FROM_NUMBER || '',
      shippingRates: SHIPPING_STATES,
      messages: DEFAULT_MESSAGES,
    };
    await sql`INSERT INTO settings (id, data) VALUES (1, ${JSON.stringify(defaultSettings)})`;
    console.log('[Seed] Inserted default settings');
  }

  console.log('[Seed] Database ready');
}
