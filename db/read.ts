import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '@/env';
import * as schema from './schema';

/**
 * Koneksi HTTP stateless untuk query baca di Vercel. Gunakan `db` dari `@/db`
 * untuk transaksi multi-langkah yang membutuhkan koneksi PostgreSQL persisten.
 */
const sql = neon(env.DATABASE_URL);

export const readDb = drizzle(sql, { schema });
export type ReadDatabase = typeof readDb;
