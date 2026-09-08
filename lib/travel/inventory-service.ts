import { and, eq, sql } from 'drizzle-orm';
import type { Database } from '@/db';
import { auditLogs, stockItems, stockMovements } from '@/db/schema';
import { stockMovementSchema, type StockMovementInput } from '@/lib/validation/inventory';
import { InventoryError, stockChange } from './inventory-rules';
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

/** Caller must authenticate and authorize; transaction enforces organization and stock integrity. */
export async function recordStockMovement(
  tx: Transaction,
  org: string,
  actorId: string,
  input: StockMovementInput
) {
  const data = stockMovementSchema.parse(input);
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  if (data.movedDate > today) throw new InventoryError('future');
  const [item] = await tx
    .select()
    .from(stockItems)
    .where(and(eq(stockItems.id, data.itemId), eq(stockItems.organizationId, org)))
    .for('update');
  if (!item) throw new InventoryError('notFound');
  const [duplicate] = await tx
    .select()
    .from(stockMovements)
    .where(and(eq(stockMovements.id, data.requestId), eq(stockMovements.organizationId, org)));
  if (duplicate) {
    const requested =
      data.kind === 'ADJUST' ? duplicate.balanceAfter : Math.abs(duplicate.quantity);
    if (
      duplicate.itemId !== item.id ||
      duplicate.kind !== data.kind ||
      requested !== data.quantity ||
      duplicate.movedDate !== data.movedDate ||
      duplicate.note !== data.note
    )
      throw new InventoryError('duplicate');
    return duplicate;
  }
  if (item.archivedAt) throw new InventoryError('archived');
  // Absolute stock counts must not overwrite changes made since the form was loaded.
  if (data.kind === 'ADJUST' && item.revision !== data.revision) throw new InventoryError('stale');
  const change = stockChange(item.quantity, data.kind, data.quantity);
  const [movement] = await tx
    .insert(stockMovements)
    .values({
      id: data.requestId,
      organizationId: org,
      itemId: item.id,
      kind: data.kind,
      quantity: change.delta,
      balanceBefore: change.before,
      balanceAfter: change.after,
      movedDate: data.movedDate,
      note: data.note,
      createdBy: actorId,
      createdAt: sql`clock_timestamp()`,
    })
    .returning();
  await tx
    .update(stockItems)
    .set({ quantity: change.after, revision: item.revision + 1, updatedAt: new Date() })
    .where(and(eq(stockItems.id, item.id), eq(stockItems.organizationId, org)));
  await tx
    .insert(auditLogs)
    .values({
      actorId,
      resource: 'inventory',
      action: 'inventory.movement',
      resourceId: movement.id,
      message: 'Stock movement recorded',
      metadata: { organizationId: org, itemId: item.id, ...change, kind: data.kind },
    });
  return movement;
}
