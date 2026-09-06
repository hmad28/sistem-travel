import './load-env.mjs';

import { sql } from 'drizzle-orm';
import { createNodeDb } from '../db/node';

const { db, pool } = createNodeDb();

try {
  const result = await db.execute(sql`
    select
      (select count(*)::int from travel_packages) as packages,
      (select count(*)::int from departures) as departures,
      (select count(*)::int from pilgrims) as pilgrims,
      (select count(*)::int from invoices) as invoices
  `);

  console.log(result.rows[0]);
} finally {
  await pool.end();
}
