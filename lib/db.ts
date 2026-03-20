import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('[DB] DATABASE_URL not set — database features will not work');
}

export const sql = neon(DATABASE_URL || '');

let _seeded = false;
export async function ensureDb() {
  if (_seeded) return;
  _seeded = true;
  const { seedDatabase } = await import('./seed');
  await seedDatabase();
}
