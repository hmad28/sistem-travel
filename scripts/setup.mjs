#!/usr/bin/env node
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const envPath = resolve(projectRoot, '.env.local');
const examplePath = resolve(projectRoot, '.env.example');

const force = process.argv.includes('--force');

if (!existsSync(examplePath)) {
  console.error('[setup] .env.example not found at', examplePath);
  process.exit(1);
}

if (existsSync(envPath) && !force) {
  console.log('[setup] .env.local already exists. Pass --force to regenerate.');
  console.log('[setup] Tip: run `pnpm doctor` to verify your configuration.');
  process.exit(0);
}

copyFileSync(examplePath, envPath);

const authSecret = randomBytes(48).toString('base64url');
const adminPassword = randomBytes(12).toString('base64url').slice(0, 16);

let contents = readFileSync(envPath, 'utf8');

contents = contents.replace(
  /^AUTH_SECRET=.*/m,
  `AUTH_SECRET=${authSecret}`
);
contents = contents.replace(
  /^SUPER_ADMIN_PASSWORD=.*/m,
  `SUPER_ADMIN_PASSWORD=${adminPassword}`
);

writeFileSync(envPath, contents, 'utf8');

const banner = '='.repeat(60);
console.log(banner);
console.log('  Hammad Tour OS setup complete');
console.log(banner);
console.log('');
console.log('  .env.local created at:', envPath);
console.log('');
console.log('  Generated AUTH_SECRET (server-only, do not share).');
console.log('  Generated super admin credentials:');
console.log('');
console.log(`    Email:    admin@hammadtour.id`);
console.log(`    Password: ${adminPassword}`);
console.log('');
console.log('  Save the password now — it is only shown here.');
console.log('  You can change SUPER_ADMIN_EMAIL/PASSWORD in .env before first run.');
console.log('');
console.log('  Next steps:');
console.log('    1. pnpm doctor          # verify environment + DB');
console.log('    2. pnpm db:migrate      # apply migrations to Neon/Postgres');
console.log('    3. pnpm db:seed         # create demo organization and admin');
console.log('    4. pnpm dev             # start Next.js locally');
console.log('');
console.log(banner);
