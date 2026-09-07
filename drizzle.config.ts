import './scripts/load-env.mjs';
import { defineConfig } from 'drizzle-kit';
import { env } from './env';

export default defineConfig({
  schema: './db/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
