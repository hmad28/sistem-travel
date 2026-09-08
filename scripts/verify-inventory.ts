import './load-env.mjs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { and, asc, eq } from 'drizzle-orm';
import { createNodeDb } from '../db/node';
import { organizations, stockItems, stockMovements } from '../db/schema';
import { recordStockMovement } from '../lib/travel/inventory-service';
const { db, pool } = createNodeDb();
const itemId = randomUUID();
let orgId = '';
try {
  const [org] = await db.select().from(organizations).where(eq(organizations.slug, 'hammad-tour'));
  assert(org?.ownerId);
  orgId = org.id;
  await db
    .insert(stockItems)
    .values({
      id: itemId,
      organizationId: org.id,
      code: `TEST-${itemId}`,
      name: 'TEST inventory concurrency',
      unit: 'unit',
    });
  const movedDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const movement = (
    kind: 'IN' | 'OUT' | 'ADJUST',
    quantity: number,
    revision = 0,
    requestId = randomUUID()
  ) => ({
    itemId,
    kind,
    quantity,
    revision,
    requestId,
    movedDate,
    note: 'TEST inventory concurrency',
  });
  const receive = movement('IN', 5);
  const same = await Promise.all(
    [0, 1].map(() => db.transaction((tx) => recordStockMovement(tx, org.id, org.ownerId!, receive)))
  );
  assert.equal(same[0].id, same[1].id, 'Idempotent requests should return the same movement');
  const outs = await Promise.allSettled(
    [0, 1].map(() =>
      db.transaction((tx) => recordStockMovement(tx, org.id, org.ownerId!, movement('OUT', 4)))
    )
  );
  assert.equal(
    outs.filter((r) => r.status === 'fulfilled').length,
    1,
    'Concurrent withdrawals cannot overdraw'
  );
  assert.equal(outs.filter((r) => r.status === 'rejected').length, 1);
  await assert.rejects(
    db.transaction((tx) =>
      recordStockMovement(tx, org.id, org.ownerId!, movement('ADJUST', 10, 0))
    ),
    /stale/
  );
  await assert.rejects(
    db.transaction((tx) => recordStockMovement(tx, randomUUID(), org.ownerId!, movement('IN', 1))),
    /notFound/
  );
  await assert.rejects(
    db.transaction((tx) =>
      recordStockMovement(tx, org.id, org.ownerId!, { ...receive, quantity: 6 })
    ),
    /duplicate/
  );
  const [item] = await db.select().from(stockItems).where(eq(stockItems.id, itemId));
  assert.equal(item.quantity, 1);
  await db.transaction((tx) =>
    recordStockMovement(tx, org.id, org.ownerId!, movement('ADJUST', 0, item.revision))
  );
  const history = await db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.itemId, itemId))
    .orderBy(asc(stockMovements.createdAt));
  assert.equal(history.length, 3);
  assert.deepEqual(
    history.map((m) => m.balanceAfter),
    [5, 1, 0]
  );
  assert.equal(
    history.reduce((sum, m) => sum + m.quantity, 0),
    0
  );
  await db.update(stockItems).set({ archivedAt: new Date() }).where(eq(stockItems.id, itemId));
  await assert.rejects(
    db.transaction((tx) => recordStockMovement(tx, org.id, org.ownerId!, movement('IN', 1))),
    /archived/
  );
  console.log(
    'PASS: tenant isolation, idempotency, concurrent withdrawals, stale count rejection, history reconciliation, archived item protection.'
  );
} finally {
  if (orgId)
    await db.transaction(async (tx) => {
      await tx
        .delete(stockMovements)
        .where(and(eq(stockMovements.itemId, itemId), eq(stockMovements.organizationId, orgId)));
      await tx
        .delete(stockItems)
        .where(
          and(
            eq(stockItems.id, itemId),
            eq(stockItems.organizationId, orgId),
            eq(stockItems.code, `TEST-${itemId}`)
          )
        );
    });
  await pool.end();
}
